/**
 * useBeautyFilter — Bigo/TikTok-style beauty pipeline.
 *
 * Two operating modes:
 *   • "pro"  — MediaPipe FaceLandmarker (478 landmarks). Skin smoothing,
 *              brighten, face slim (4 feathered cheek slices), eye enlarge,
 *              lip enhance, nose slim. All face-masked with feathered edges.
 *   • "lite" — Fallback when MediaPipe fails or while loading. Strong
 *              center-oval beauty pass: bilateral-style smoothing, brighten +
 *              warmth, soft outer vignette.
 *
 * Self-hosts the WASM + model under /public/mediapipe to avoid CDN failures,
 * tries GPU delegate first then auto-retries on CPU, and times out after 6s
 * so the UI never gets stuck on "Loading…".
 *
 * v3 fixes:
 *   - Eye enlarge no longer paints square patches (uses dedicated eyeCanvas
 *     with feathered radial alpha mask).
 *   - Lip mask isolated on its own fxCanvas — no more chin blob bleed.
 *   - Brighten dialed back (0.8 -> 0.35) so faces aren't blown out.
 *   - Face mask edge feathered with blur(8px) — no hard oval seam.
 *   - lastLandmarks held for 500ms to stop mask flicker on dropped frames.
 */
import { useEffect, useRef, useState } from "react";

export type BeautyStatus = "loading" | "pro" | "lite";
export type BeautyTone = "natural" | "warm" | "cool" | "film" | "pink";

export interface BeautySettings {
  enabled: boolean;
  smooth: number;   // 0-100 skin smoothing
  brighten: number; // 0-100 brighten + warmth
  slim: number;     // 0-100 face slim
  eyes: number;     // 0-100 eye enlarge
  lips: number;     // 0-100 lip enhance
  nose: number;     // 0-100 nose slim
  tone?: BeautyTone;     // color tone LUT
  blurBg?: boolean;      // soft background blur
}

export const DEFAULT_BEAUTY: BeautySettings = {
  enabled: true,
  smooth: 70,
  brighten: 35,
  slim: 25,
  eyes: 18,
  lips: 30,
  nose: 12,
  tone: "natural",
  blurBg: false,
};

export const BEAUTY_PRESETS: Record<"natural" | "sweet" | "glam" | "auto" | "off", BeautySettings> = {
  natural: { enabled: true, smooth: 60, brighten: 30, slim: 20, eyes: 15, lips: 25, nose: 10 },
  sweet:   { enabled: true, smooth: 82, brighten: 50, slim: 22, eyes: 25, lips: 45, nose: 12 },
  glam:    { enabled: true, smooth: 85, brighten: 55, slim: 45, eyes: 35, lips: 55, nose: 28 },
  // Auto = balanced starting point; the hook auto-tunes brighten/smooth from luma.
  auto:    { enabled: true, smooth: 72, brighten: 40, slim: 25, eyes: 22, lips: 35, nose: 14 },
  off:     { enabled: false, smooth: 0, brighten: 0, slim: 0, eyes: 0, lips: 0, nose: 0 },
};

// MediaPipe FaceLandmarker contour indices
const FACE_OVAL = [
  10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365,
  379, 378, 400, 377, 152, 148, 176, 149, 150, 136, 172, 58, 132, 93,
  234, 127, 162, 21, 54, 103, 67, 109,
];
const LEFT_EYE = [33, 7, 163, 144, 145, 153, 154, 155, 133, 173, 157, 158, 159, 160, 161, 246];
const RIGHT_EYE = [263, 249, 390, 373, 374, 380, 381, 382, 362, 398, 384, 385, 386, 387, 388, 466];
const LIPS_OUTER = [61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291, 409, 270, 269, 267, 0, 37, 39, 40, 185];

const LM_LEFT_EYE_CENTER = 468;
const LM_RIGHT_EYE_CENTER = 473;
const LM_LEFT_EYE_FALLBACK = 33;
const LM_RIGHT_EYE_FALLBACK = 263;
const LM_LEFT_CHEEK = 234;
const LM_RIGHT_CHEEK = 454;
const LM_CHIN = 152;
const LM_FOREHEAD = 10;
const LM_NOSE_TIP = 4;
const LM_NOSE_LEFT = 129;
const LM_NOSE_RIGHT = 358;

type Point = { x: number; y: number };
type Landmark = { x: number; y: number; z?: number };

const WASM_PATH = "/mediapipe";
const MODEL_PATH = "/mediapipe/face_landmarker.task";

let landmarkerPromise: Promise<any> | null = null;
async function loadLandmarker(): Promise<any> {
  if (landmarkerPromise) return landmarkerPromise;
  landmarkerPromise = (async () => {
    const vision = await import("@mediapipe/tasks-vision");
    const fileset = await vision.FilesetResolver.forVisionTasks(WASM_PATH);
    const opts = (delegate: "GPU" | "CPU") => ({
      baseOptions: { modelAssetPath: MODEL_PATH, delegate },
      runningMode: "VIDEO" as const,
      numFaces: 1,
      outputFaceBlendshapes: false,
      outputFacialTransformationMatrixes: false,
    });
    try {
      return await vision.FaceLandmarker.createFromOptions(fileset, opts("GPU"));
    } catch (gpuErr) {
      console.warn("[useBeautyFilter] GPU delegate failed, retrying on CPU", gpuErr);
      return await vision.FaceLandmarker.createFromOptions(fileset, opts("CPU"));
    }
  })().catch((e) => {
    console.warn("[useBeautyFilter] FaceLandmarker load failed", e);
    landmarkerPromise = null;
    throw e;
  });
  return landmarkerPromise;
}

function pathFromIndices(
  ctx: CanvasRenderingContext2D,
  lms: Landmark[],
  indices: number[],
  W: number,
  H: number,
) {
  ctx.beginPath();
  for (let i = 0; i < indices.length; i++) {
    const p = lms[indices[i]];
    if (!p) continue;
    const x = p.x * W;
    const y = p.y * H;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
}

export function useBeautyFilter(rawStream: MediaStream | null, settings: BeautySettings) {
  const [outputStream, setOutputStream] = useState<MediaStream | null>(null);
  const [status, setStatus] = useState<BeautyStatus>("loading");
  const [luma, setLuma] = useState<number>(0.5); // 0-1, smoothed face luma
  const settingsRef = useRef(settings);
  settingsRef.current = settings;

  useEffect(() => {
    if (!rawStream) {
      setOutputStream(null);
      return;
    }
    const videoTrack = rawStream.getVideoTracks()[0];
    if (!videoTrack) {
      setOutputStream(rawStream);
      return;
    }

    const trackSettings = videoTrack.getSettings();
    const W = trackSettings.width || 720;
    const H = trackSettings.height || 1280;

    const video = document.createElement("video");
    video.playsInline = true;
    video.muted = true;
    video.autoplay = true;
    video.srcObject = new MediaStream([videoTrack]);
    video.play().catch(() => {});

    const canvas = document.createElement("canvas");
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) {
      setOutputStream(rawStream);
      return;
    }

    const blurCanvas = document.createElement("canvas");
    blurCanvas.width = W;
    blurCanvas.height = H;
    const blurCtx = blurCanvas.getContext("2d", { alpha: false })!;

    // Main face mask (oval minus eyes/lips). Built once per frame.
    const maskCanvas = document.createElement("canvas");
    maskCanvas.width = W;
    maskCanvas.height = H;
    const maskCtx = maskCanvas.getContext("2d")!;

    // Feathered (blurred) copy of the face mask — eliminates hard oval edges.
    const featherCanvas = document.createElement("canvas");
    featherCanvas.width = W;
    featherCanvas.height = H;
    const featherCtx = featherCanvas.getContext("2d")!;

    // Per-feature mask scratch (lips, etc) — never stomps on main mask.
    const fxCanvas = document.createElement("canvas");
    fxCanvas.width = W;
    fxCanvas.height = H;
    const fxCtx = fxCanvas.getContext("2d")!;

    // Dedicated tiny canvas for eye enlarge — sized per-frame.
    const eyeCanvas = document.createElement("canvas");
    const eyeCtx = eyeCanvas.getContext("2d")!;

    // Persistent feather canvas for lip mask (avoids per-frame allocation).
    const featherLipsCanvas = document.createElement("canvas");
    featherLipsCanvas.width = W;
    featherLipsCanvas.height = H;
    const featherLipsCtx = featherLipsCanvas.getContext("2d")!;

    // Persistent canvas for warped slim/nose composite (pre-smoothing).
    const warpCanvas = document.createElement("canvas");
    warpCanvas.width = W;
    warpCanvas.height = H;
    const warpCtx = warpCanvas.getContext("2d")!;

    let landmarker: any = null;
    let lastLandmarks: Landmark[] | null = null;
    let lastLandmarksAt = 0;
    let frameCounter = 0;
    let cancelled = false;
    let rafId: number | null = null;
    let lastFrameTime = performance.now();
    let avgFrameMs = 16;
    let mode: BeautyStatus = "loading";

    const timeoutId = window.setTimeout(() => {
      if (mode === "loading" && !cancelled) {
        mode = "lite";
        setStatus("lite");
        console.warn("[useBeautyFilter] FaceLandmarker timeout — using lite fallback");
      }
    }, 6000);

    loadLandmarker()
      .then((lm) => {
        if (cancelled) return;
        landmarker = lm;
        mode = "pro";
        setStatus("pro");
        window.clearTimeout(timeoutId);
      })
      .catch(() => {
        if (cancelled) return;
        mode = "lite";
        setStatus("lite");
        window.clearTimeout(timeoutId);
      });

    // Build face mask (oval minus eyes & lips) AND a feathered copy of it.
    const buildFaceMask = (lms: Landmark[]) => {
      maskCtx.clearRect(0, 0, W, H);
      maskCtx.globalCompositeOperation = "source-over";
      maskCtx.fillStyle = "#fff";
      pathFromIndices(maskCtx, lms, FACE_OVAL, W, H);
      maskCtx.fill();
      maskCtx.globalCompositeOperation = "destination-out";
      pathFromIndices(maskCtx, lms, LEFT_EYE, W, H);
      maskCtx.fill();
      pathFromIndices(maskCtx, lms, RIGHT_EYE, W, H);
      maskCtx.fill();
      pathFromIndices(maskCtx, lms, LIPS_OUTER, W, H);
      maskCtx.fill();
      maskCtx.globalCompositeOperation = "source-over";

      // Feathered copy: blur the mask so composites have soft edges.
      featherCtx.clearRect(0, 0, W, H);
      featherCtx.filter = "blur(10px)";
      featherCtx.drawImage(maskCanvas, 0, 0);
      featherCtx.filter = "none";
    };

    // ── Lite fallback ──
    const drawLite = (s: BeautySettings) => {
      const cx = W / 2;
      const cy = H * 0.42;
      const rx = W * 0.32;
      const ry = H * 0.36;

      const smoothPct = s.smooth / 100;
      const brightPct = s.brighten / 100;

      if (s.smooth > 0) {
        const blurPx = 6 + smoothPct * 12;
        blurCtx.filter = `blur(${blurPx.toFixed(1)}px) saturate(1.08)`;
        blurCtx.drawImage(video, 0, 0, W, H);
        blurCtx.filter = "none";
        blurCtx.globalCompositeOperation = "destination-in";
        const grad = blurCtx.createRadialGradient(cx, cy, Math.min(rx, ry) * 0.4, cx, cy, Math.max(rx, ry));
        grad.addColorStop(0, "rgba(255,255,255,1)");
        grad.addColorStop(0.7, "rgba(255,255,255,0.85)");
        grad.addColorStop(1, "rgba(255,255,255,0)");
        blurCtx.fillStyle = grad;
        blurCtx.save();
        blurCtx.beginPath();
        blurCtx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
        blurCtx.fill();
        blurCtx.restore();
        blurCtx.globalCompositeOperation = "source-over";

        ctx.globalAlpha = 0.45 + smoothPct * 0.35;
        ctx.drawImage(blurCanvas, 0, 0);
        ctx.globalAlpha = 1;
      }

      if (s.brighten > 0) {
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(rx, ry));
        const a = 0.08 + brightPct * 0.14;
        grad.addColorStop(0, `rgba(255, 230, 210, ${a})`);
        grad.addColorStop(0.7, `rgba(255, 230, 210, ${a * 0.6})`);
        grad.addColorStop(1, "rgba(255, 230, 210, 0)");
        ctx.globalCompositeOperation = "screen";
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, W, H);
        ctx.globalCompositeOperation = "source-over";
      }

      if (s.brighten > 0 || s.smooth > 0) {
        const v = ctx.createRadialGradient(cx, cy, Math.min(W, H) * 0.35, cx, cy, Math.max(W, H) * 0.7);
        v.addColorStop(0, "rgba(0,0,0,0)");
        v.addColorStop(1, `rgba(0,0,0,${0.16 + brightPct * 0.10})`);
        ctx.fillStyle = v;
        ctx.fillRect(0, 0, W, H);
      }
    };

    // ── Pro mode ──
    const drawPro = (s: BeautySettings, lms: Landmark[]) => {
      buildFaceMask(lms);

      const smoothPct = s.smooth / 100;
      const brightPct = s.brighten / 100;
      const slimPct = s.slim / 100;
      const eyesPct = s.eyes / 100;
      const lipsPct = s.lips / 100;
      const nosePct = s.nose / 100;

      // ── PRE-SMOOTH WARPS: slim + nose drawn into warpCanvas with feathered
      // crossfaded slices, then composited onto ctx. Smoothing pass blends
      // any residual seams away.
      const hasWarp = s.slim > 0 || s.nose > 0;
      if (hasWarp) {
        warpCtx.globalCompositeOperation = "source-over";
        warpCtx.globalAlpha = 1;
        warpCtx.filter = "none";
        warpCtx.clearRect(0, 0, W, H);

        // ── D. Face slim — 6 overlapping crossfaded cheek slices per side.
        // Slim band starts at NOSE TIP (not forehead) so the upper face is
        // never touched.
        if (s.slim > 0) {
          const lc = lms[LM_LEFT_CHEEK];
          const rc = lms[LM_RIGHT_CHEEK];
          const chin = lms[LM_CHIN];
          const noseTip = lms[LM_NOSE_TIP];
          if (lc && rc && chin && noseTip) {
            const top = Math.max(0, noseTip.y * H);
            const bot = Math.min(H, chin.y * H + 8);
            const bandH = Math.max(20, bot - top);
            const lcX = lc.x * W;
            const rcX = rc.x * W;
            const faceW = rcX - lcX;
            const totalSliceW = Math.max(40, faceW * 0.22);
            const slices = 6;
            const overlap = 0.3; // 30% overlap between adjacent slices
            const slicePieceH = bandH / (slices * (1 - overlap) + overlap);
            const maxPinch = Math.min(40, faceW * 0.055) * slimPct;

            for (let i = 0; i < slices; i++) {
              const t = (i + 0.5) / slices;
              const feather = Math.sin(Math.PI * t);
              const pinch = maxPinch * feather;
              const sy = top + i * slicePieceH * (1 - overlap);
              const sh = slicePieceH;
              // Per-slice vertical alpha crossfade
              warpCtx.globalAlpha = Math.max(0.15, Math.sin(Math.PI * t));
              warpCtx.drawImage(
                video,
                lcX - totalSliceW * 0.5, sy, totalSliceW, sh,
                lcX - totalSliceW * 0.5 + pinch, sy, totalSliceW, sh,
              );
              warpCtx.drawImage(
                video,
                rcX - totalSliceW * 0.5, sy, totalSliceW, sh,
                rcX - totalSliceW * 0.5 - pinch, sy, totalSliceW, sh,
              );
            }
            warpCtx.globalAlpha = 1;
          }
        }

        // ── E. Nose slim — capped pinch on small faces ──
        if (s.nose > 0) {
          const nt = lms[LM_NOSE_TIP];
          const nl = lms[LM_NOSE_LEFT];
          const nr = lms[LM_NOSE_RIGHT];
          if (nt && nl && nr) {
            const ntX = nt.x * W;
            const ntY = nt.y * H;
            const noseW = Math.abs(nr.x - nl.x) * W;
            const noseH = noseW * 1.1;
            const slices = 4;
            const sliceH = noseH / slices;
            const pinch = Math.min(noseW * 0.06, 6) * nosePct;
            for (let i = 0; i < slices; i++) {
              const t = (i + 0.5) / slices;
              warpCtx.globalAlpha = Math.max(0.15, Math.sin(Math.PI * t));
              const sy = ntY - noseH * 0.4 + i * sliceH;
              const sliceW = noseW * 0.55;
              warpCtx.drawImage(
                video,
                ntX - sliceW, sy, sliceW, sliceH,
                ntX - sliceW + pinch, sy, sliceW, sliceH,
              );
              warpCtx.drawImage(
                video,
                ntX, sy, sliceW, sliceH,
                ntX - pinch, sy, sliceW, sliceH,
              );
            }
            warpCtx.globalAlpha = 1;
          }
        }

        // Composite warp onto ctx (already has raw video). Source-over with
        // full opacity — but we masked through feathered face mask first to
        // avoid hard edges where slices end.
        warpCtx.globalCompositeOperation = "destination-in";
        warpCtx.drawImage(featherCanvas, 0, 0);
        warpCtx.globalCompositeOperation = "source-over";
        ctx.drawImage(warpCanvas, 0, 0);
      }

      // ── A. Skin smoothing — masked blur with feathered edge.
      // (Runs AFTER slim/nose so any slice seams are blended away.)
      if (s.smooth > 0) {
        const blurPx = 5 + smoothPct * 11;
        blurCtx.globalCompositeOperation = "source-over";
        blurCtx.globalAlpha = 1;
        blurCtx.filter = `blur(${blurPx.toFixed(1)}px) saturate(1.08) contrast(1.03)`;
        // Smooth the WARPED face (read from ctx, not raw video) so slim/nose
        // edits get smoothed too.
        blurCtx.drawImage(canvas, 0, 0);
        blurCtx.filter = "none";
        blurCtx.globalCompositeOperation = "destination-in";
        blurCtx.drawImage(featherCanvas, 0, 0);
        blurCtx.globalCompositeOperation = "source-over";

        ctx.globalAlpha = 0.65 + smoothPct * 0.27; // 0.65-0.92
        ctx.drawImage(blurCanvas, 0, 0);
        ctx.globalAlpha = 1;
      }

      // ── B. Brighten + warmth — gentler ──
      if (s.brighten > 0) {
        const a = 0.08 + brightPct * 0.14;
        blurCtx.globalCompositeOperation = "source-over";
        blurCtx.filter = "none";
        blurCtx.clearRect(0, 0, W, H);
        blurCtx.fillStyle = `rgba(255, 232, 210, ${a})`;
        blurCtx.fillRect(0, 0, W, H);
        blurCtx.globalCompositeOperation = "destination-in";
        blurCtx.drawImage(featherCanvas, 0, 0);
        blurCtx.globalCompositeOperation = "source-over";
        ctx.globalCompositeOperation = "screen";
        ctx.globalAlpha = 0.35;
        ctx.drawImage(blurCanvas, 0, 0);
        ctx.globalCompositeOperation = "source-over";
        ctx.globalAlpha = 1;
      }

      // ── C. Lip enhance — subtle tint, isolated mask, persistent canvas ──
      if (s.lips > 0) {
        const sat = 1 + lipsPct * 0.35;
        const con = 1 + lipsPct * 0.10;
        blurCtx.globalCompositeOperation = "source-over";
        blurCtx.filter = `saturate(${sat}) contrast(${con}) brightness(${1 + lipsPct * 0.04})`;
        blurCtx.clearRect(0, 0, W, H);
        blurCtx.drawImage(video, 0, 0, W, H);
        blurCtx.filter = "none";
        // Lip-only mask on dedicated fxCanvas
        fxCtx.clearRect(0, 0, W, H);
        fxCtx.fillStyle = "#fff";
        pathFromIndices(fxCtx, lms, LIPS_OUTER, W, H);
        fxCtx.fill();
        // Feather using PERSISTENT canvas — no per-frame alloc
        featherLipsCtx.clearRect(0, 0, W, H);
        featherLipsCtx.filter = "blur(3px)";
        featherLipsCtx.drawImage(fxCanvas, 0, 0);
        featherLipsCtx.filter = "none";
        blurCtx.globalCompositeOperation = "destination-in";
        blurCtx.drawImage(featherLipsCanvas, 0, 0);
        blurCtx.globalCompositeOperation = "source-over";
        ctx.globalAlpha = 0.55;
        ctx.drawImage(blurCanvas, 0, 0);
        ctx.globalAlpha = 1;
      }

      // ── F. Eye enlarge + sparkle (iris brighten + catchlight) ──
      if (s.eyes > 0) {
        const scale = 1 + eyesPct * 0.22;
        const eyes: Point[] = [];
        const le = lms[LM_LEFT_EYE_CENTER] || lms[LM_LEFT_EYE_FALLBACK];
        const re = lms[LM_RIGHT_EYE_CENTER] || lms[LM_RIGHT_EYE_FALLBACK];
        if (le) eyes.push({ x: le.x * W, y: le.y * H });
        if (re) eyes.push({ x: re.x * W, y: re.y * H });

        const lc = lms[LM_LEFT_CHEEK];
        const rc = lms[LM_RIGHT_CHEEK];
        const faceW = lc && rc ? Math.abs(rc.x - lc.x) * W : W * 0.4;
        const radius = Math.max(20, faceW * 0.13);

        for (const eye of eyes) {
          const r = radius;
          const sr = r * scale;
          const size = Math.ceil(r * 2);
          eyeCanvas.width = size;
          eyeCanvas.height = size;

          eyeCtx.globalCompositeOperation = "source-over";
          eyeCtx.globalAlpha = 1;
          eyeCtx.filter = `brightness(${(1 + eyesPct * 0.10).toFixed(3)}) saturate(${(1 + eyesPct * 0.12).toFixed(3)})`;
          eyeCtx.clearRect(0, 0, size, size);
          eyeCtx.drawImage(
            video,
            eye.x - r, eye.y - r, r * 2, r * 2,
            r - sr, r - sr, sr * 2, sr * 2,
          );
          eyeCtx.filter = "none";

          eyeCtx.globalCompositeOperation = "destination-in";
          const grad = eyeCtx.createRadialGradient(r, r, r * 0.45, r, r, r);
          grad.addColorStop(0, "rgba(0,0,0,1)");
          grad.addColorStop(0.75, "rgba(0,0,0,0.85)");
          grad.addColorStop(1, "rgba(0,0,0,0)");
          eyeCtx.fillStyle = grad;
          eyeCtx.fillRect(0, 0, size, size);
          eyeCtx.globalCompositeOperation = "source-over";

          ctx.drawImage(eyeCanvas, eye.x - r, eye.y - r);

          // Catchlight — soft white dot at upper-inner iris
          const cxDot = eye.x - r * 0.18;
          const cyDot = eye.y - r * 0.22;
          const dotR = Math.max(1.2, r * 0.10);
          const cg = ctx.createRadialGradient(cxDot, cyDot, 0, cxDot, cyDot, dotR);
          cg.addColorStop(0, `rgba(255,255,255,${0.20 + eyesPct * 0.18})`);
          cg.addColorStop(1, "rgba(255,255,255,0)");
          ctx.fillStyle = cg;
          ctx.beginPath();
          ctx.arc(cxDot, cyDot, dotR, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // ── F2. Subtle contour — restore cheekbone shadow flattened by smoothing.
      // Hair-safe: clipped through feathered face mask via fxCanvas.
      if (s.smooth > 0 && slimPct > 0) {
        const lc = lms[LM_LEFT_CHEEK];
        const rc = lms[LM_RIGHT_CHEEK];
        const chin = lms[LM_CHIN];
        const noseTip = lms[LM_NOSE_TIP];
        if (lc && rc && chin && noseTip) {
          const lcX = lc.x * W;
          const lcY = lc.y * H;
          const rcX = rc.x * W;
          const chY = chin.y * H;
          const ntY = noseTip.y * H;
          const faceW = rcX - lcX;
          const stripeW = Math.max(8, faceW * 0.05);
          const cTop = (ntY + lcY) * 0.5;
          const cBot = (chY + lcY) * 0.5;
          const a = 0.06 + slimPct * 0.08;
          // Paint stripes into fxCanvas, clip to face mask, then multiply onto ctx.
          fxCtx.globalCompositeOperation = "source-over";
          fxCtx.filter = "none";
          fxCtx.clearRect(0, 0, W, H);
          const drawStripe = (cx: number, top: number, bot: number) => {
            const g = fxCtx.createLinearGradient(cx - stripeW, 0, cx + stripeW, 0);
            g.addColorStop(0, "rgba(0,0,0,0)");
            g.addColorStop(0.5, `rgba(40,25,20,${a})`);
            g.addColorStop(1, "rgba(0,0,0,0)");
            fxCtx.fillStyle = g;
            fxCtx.fillRect(cx - stripeW, top, stripeW * 2, bot - top);
          };
          drawStripe(lcX + stripeW * 0.6, cTop, cBot);
          drawStripe(rcX - stripeW * 0.6, cTop, cBot);
          fxCtx.globalCompositeOperation = "destination-in";
          fxCtx.drawImage(featherCanvas, 0, 0);
          fxCtx.globalCompositeOperation = "source-over";
          ctx.globalCompositeOperation = "multiply";
          ctx.drawImage(fxCanvas, 0, 0);
          ctx.globalCompositeOperation = "source-over";
        }
      }

      // ── F3. Highlight pass — soft 3D glow on nose bridge / cheekbones / chin.
      if (s.brighten > 0) {
        const noseTip = lms[LM_NOSE_TIP];
        const forehead = lms[LM_FOREHEAD];
        const lc = lms[LM_LEFT_CHEEK];
        const rc = lms[LM_RIGHT_CHEEK];
        const chin = lms[LM_CHIN];
        if (noseTip && forehead && lc && rc && chin) {
          const faceW = (rc.x - lc.x) * W;
          const a = 0.05 + brightPct * 0.10;
          const paintGlow = (x: number, y: number, r: number, alpha: number) => {
            const g = fxCtx.createRadialGradient(x, y, 0, x, y, r);
            g.addColorStop(0, `rgba(255,250,240,${alpha})`);
            g.addColorStop(1, "rgba(255,250,240,0)");
            fxCtx.fillStyle = g;
            fxCtx.beginPath();
            fxCtx.arc(x, y, r, 0, Math.PI * 2);
            fxCtx.fill();
          };
          fxCtx.globalCompositeOperation = "source-over";
          fxCtx.filter = "none";
          fxCtx.clearRect(0, 0, W, H);
          // Nose bridge
          const nbx = noseTip.x * W;
          const nby = (noseTip.y + forehead.y) * 0.5 * H;
          paintGlow(nbx, nby, faceW * 0.07, a);
          // Cheekbone tops (above contour stripe)
          const chTop = (lc.y * H + noseTip.y * H) * 0.5;
          paintGlow(lc.x * W + faceW * 0.08, chTop, faceW * 0.10, a * 0.85);
          paintGlow(rc.x * W - faceW * 0.08, chTop, faceW * 0.10, a * 0.85);
          // Chin tip
          paintGlow(chin.x * W, chin.y * H - faceW * 0.04, faceW * 0.06, a * 0.7);
          // Clip to face oval (no glow on hair)
          fxCtx.globalCompositeOperation = "destination-in";
          fxCtx.drawImage(featherCanvas, 0, 0);
          fxCtx.globalCompositeOperation = "source-over";
          ctx.globalCompositeOperation = "screen";
          ctx.drawImage(fxCanvas, 0, 0);
          ctx.globalCompositeOperation = "source-over";
        }
      }

      // ── F4. Teeth whitening — when mouth open, brighten light pixels in inner-lip region.
      if (s.lips > 0) {
        // Inner-lip vertical gap (upper lip 13, lower lip 14)
        const upper = lms[13];
        const lower = lms[14];
        const lc = lms[LM_LEFT_CHEEK];
        const rc = lms[LM_RIGHT_CHEEK];
        if (upper && lower && lc && rc) {
          const gap = (lower.y - upper.y) * H;
          const faceW = (rc.x - lc.x) * W;
          const open = gap > faceW * 0.04;
          if (open) {
            const cx = (upper.x + lower.x) * 0.5 * W;
            const cy = (upper.y + lower.y) * 0.5 * H;
            const w = Math.max(20, faceW * 0.18);
            const h = Math.max(10, gap * 1.1);
            const sx = Math.max(0, Math.floor(cx - w / 2));
            const sy = Math.max(0, Math.floor(cy - h / 2));
            const sw = Math.min(W - sx, Math.floor(w));
            const sh = Math.min(H - sy, Math.floor(h));
            try {
              const img = ctx.getImageData(sx, sy, sw, sh);
              const d = img.data;
              const a = 0.4 + lipsPct * 0.5;
              for (let i = 0; i < d.length; i += 4) {
                const r = d[i], g = d[i + 1], b = d[i + 2];
                const luma = 0.299 * r + 0.587 * g + 0.114 * b;
                if (luma < 110) continue;
                const mx = Math.max(r, g, b);
                const mn = Math.min(r, g, b);
                if (mx - mn > 55) continue; // skip saturated (lip) pixels
                // Desaturate yellow + brighten
                const avg = (r + g + b) / 3;
                const dr = r + (avg - r) * 0.45;
                const dg = g + (avg - g) * 0.45;
                const db = b + (avg - b) * 0.25;
                const boost = 1.12;
                d[i]     = Math.min(255, d[i]     * (1 - a) + dr * boost * a);
                d[i + 1] = Math.min(255, d[i + 1] * (1 - a) + dg * boost * a);
                d[i + 2] = Math.min(255, d[i + 2] * (1 - a) + db * boost * a);
              }
              ctx.putImageData(img, sx, sy);
            } catch {
              // ignore (security/cross-origin)
            }
          }
        }
      }

      // ── G. Finishing pass: warm mid-tone lift inside face.
      // Skip on slow devices to keep ≥24fps.
      if ((s.brighten > 0 || s.smooth > 0) && avgFrameMs <= 33) {
        blurCtx.globalCompositeOperation = "source-over";
        blurCtx.filter = "none";
        blurCtx.clearRect(0, 0, W, H);
        blurCtx.fillStyle = "rgba(255, 235, 225, 0.08)";
        blurCtx.fillRect(0, 0, W, H);
        blurCtx.globalCompositeOperation = "destination-in";
        blurCtx.drawImage(featherCanvas, 0, 0);
        blurCtx.globalCompositeOperation = "source-over";
        ctx.globalCompositeOperation = "multiply";
        ctx.drawImage(blurCanvas, 0, 0);
        ctx.globalCompositeOperation = "source-over";
      }

      // ── H. Background blur — blur everything OUTSIDE the face mask.
      if (s.blurBg) {
        blurCtx.globalCompositeOperation = "source-over";
        blurCtx.globalAlpha = 1;
        blurCtx.filter = "blur(6px)";
        blurCtx.drawImage(canvas, 0, 0);
        blurCtx.filter = "none";
        // Punch a hole where the face is (keep face sharp)
        blurCtx.globalCompositeOperation = "destination-out";
        blurCtx.drawImage(featherCanvas, 0, 0);
        blurCtx.globalCompositeOperation = "source-over";
        ctx.drawImage(blurCanvas, 0, 0);
      }

      // ── I. Tone LUT — full-frame color overlay.
      const tone = s.tone ?? "natural";
      if (tone !== "natural") {
        const tones: Record<string, { color: string; sat: number; con: number }> = {
          warm: { color: "rgba(255, 200, 150, 0.10)", sat: 1.08, con: 1.0 },
          cool: { color: "rgba(180, 210, 255, 0.10)", sat: 1.05, con: 1.0 },
          film: { color: "rgba(255, 220, 180, 0.14)", sat: 0.95, con: 1.05 },
          pink: { color: "rgba(255, 200, 210, 0.12)", sat: 1.12, con: 1.0 },
        };
        const t = tones[tone];
        if (t) {
          // Saturation/contrast: re-render canvas through filter
          if (t.sat !== 1 || t.con !== 1) {
            blurCtx.globalCompositeOperation = "source-over";
            blurCtx.globalAlpha = 1;
            blurCtx.filter = `saturate(${t.sat}) contrast(${t.con})`;
            blurCtx.clearRect(0, 0, W, H);
            blurCtx.drawImage(canvas, 0, 0);
            blurCtx.filter = "none";
            ctx.drawImage(blurCanvas, 0, 0);
          }
          // Color overlay
          ctx.fillStyle = t.color;
          ctx.fillRect(0, 0, W, H);
        }
      }
    };

    let lumaAcc = 0.5;
    let lastLumaEmit = 0;

    const sampleLuma = (lms: Landmark[] | null, now: number) => {
      // Sample center of forehead/cheek region every 30 frames (~0.5s)
      if (frameCounter % 30 !== 0) return;
      const cx = lms?.[LM_NOSE_TIP] ? lms[LM_NOSE_TIP].x * W : W / 2;
      const cy = lms?.[LM_NOSE_TIP] ? lms[LM_NOSE_TIP].y * H : H * 0.45;
      const sw = Math.max(20, Math.floor(W * 0.08));
      const sx = Math.max(0, Math.floor(cx - sw / 2));
      const sy = Math.max(0, Math.floor(cy - sw / 2));
      try {
        const data = ctx.getImageData(sx, sy, sw, sw).data;
        let sum = 0;
        const step = 4 * 4; // every 4th pixel
        let n = 0;
        for (let i = 0; i < data.length; i += step) {
          sum += (0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
          n++;
        }
        const l = sum / (n * 255);
        lumaAcc = lumaAcc * 0.7 + l * 0.3;
        if (now - lastLumaEmit > 1500) {
          lastLumaEmit = now;
          setLuma(lumaAcc);
        }
      } catch {
        // cross-origin/security; ignore
      }
    };

    const draw = () => {
      if (cancelled) return;
      const now = performance.now();
      const dt = now - lastFrameTime;
      lastFrameTime = now;
      avgFrameMs = avgFrameMs * 0.9 + dt * 0.1;
      frameCounter++;

      const s = settingsRef.current;

      ctx.filter = "none";
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";
      ctx.drawImage(video, 0, 0, W, H);

      if (!s.enabled) {
        sampleLuma(lastLandmarks, now);
        rafId = requestAnimationFrame(draw);
        return;
      }

      if (mode === "pro" && landmarker) {
        const slowMode = avgFrameMs > 40;
        const shouldDetect =
          video.readyState >= 2 && (!slowMode || frameCounter % 2 === 0);
        if (shouldDetect) {
          try {
            const result = landmarker.detectForVideo(video, now);
            if (result?.faceLandmarks?.[0]) {
              lastLandmarks = result.faceLandmarks[0];
              lastLandmarksAt = now;
            }
          } catch {
            // ignore single-frame failure
          }
        }
        // Hold last landmarks for 500ms to prevent mask flicker.
        const stale = now - lastLandmarksAt > 500;
        if (lastLandmarks && !stale) {
          drawPro(s, lastLandmarks);
        } else {
          drawLite(s);
        }
      } else if (mode === "lite") {
        drawLite(s);
      } else {
        if (s.brighten > 0 || s.smooth > 0) {
          ctx.filter = `brightness(${1 + (s.brighten / 100) * 0.06})`;
          ctx.drawImage(video, 0, 0, W, H);
          ctx.filter = "none";
        }
      }

      sampleLuma(lastLandmarks, now);
      rafId = requestAnimationFrame(draw);
    };

    const start = () => {
      if (rafId == null) draw();
    };
    video.onloadedmetadata = () => {
      canvas.width = video.videoWidth || W;
      canvas.height = video.videoHeight || H;
      blurCanvas.width = canvas.width;
      blurCanvas.height = canvas.height;
      maskCanvas.width = canvas.width;
      maskCanvas.height = canvas.height;
      featherCanvas.width = canvas.width;
      featherCanvas.height = canvas.height;
      fxCanvas.width = canvas.width;
      fxCanvas.height = canvas.height;
      featherLipsCanvas.width = canvas.width;
      featherLipsCanvas.height = canvas.height;
      warpCanvas.width = canvas.width;
      warpCanvas.height = canvas.height;
      start();
    };

    const processed = (canvas as any).captureStream(30) as MediaStream;
    const audio = rawStream.getAudioTracks()[0];
    if (audio) processed.addTrack(audio);
    setOutputStream(processed);

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
      if (rafId != null) cancelAnimationFrame(rafId);
      try { video.srcObject = null; } catch {}
      processed.getVideoTracks().forEach((t) => t.stop());
      setOutputStream(null);
    };
  }, [rawStream]);

  return { stream: outputStream, status, ready: status !== "loading", luma };
}
