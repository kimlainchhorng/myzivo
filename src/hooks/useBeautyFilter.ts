/**
 * useBeautyFilter — Bigo/TikTok-style beauty pipeline.
 *
 * Two operating modes:
 *   • "pro"  — MediaPipe FaceLandmarker (478 landmarks). Skin smoothing,
 *              brighten, face slim (4 feathered cheek slices), eye enlarge,
 *              lip enhance, nose slim. All face-masked.
 *   • "lite" — Fallback when MediaPipe fails or while loading. Strong
 *              center-oval beauty pass: bilateral-style smoothing, brighten +
 *              warmth, soft outer vignette. Always looks good even with no
 *              landmarks.
 *
 * Self-hosts the WASM + model under /public/mediapipe to avoid CDN failures,
 * tries GPU delegate first then auto-retries on CPU, and times out after 6s
 * so the UI never gets stuck on "Loading…".
 */
import { useEffect, useRef, useState } from "react";

export type BeautyStatus = "loading" | "pro" | "lite";

export interface BeautySettings {
  enabled: boolean;
  smooth: number;   // 0-100 skin smoothing
  brighten: number; // 0-100 brighten + warmth
  slim: number;     // 0-100 face slim
  eyes: number;     // 0-100 eye enlarge
  lips: number;     // 0-100 lip enhance
  nose: number;     // 0-100 nose slim
}

export const DEFAULT_BEAUTY: BeautySettings = {
  enabled: true,
  smooth: 80,
  brighten: 55,
  slim: 35,
  eyes: 25,
  lips: 40,
  nose: 20,
};

export const BEAUTY_PRESETS: Record<"natural" | "sweet" | "glam" | "off", BeautySettings> = {
  natural: { enabled: true, smooth: 65, brighten: 40, slim: 25, eyes: 18, lips: 30, nose: 12 },
  sweet:   { enabled: true, smooth: 92, brighten: 70, slim: 22, eyes: 32, lips: 55, nose: 15 },
  glam:    { enabled: true, smooth: 95, brighten: 75, slim: 55, eyes: 45, lips: 70, nose: 35 },
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

    const maskCanvas = document.createElement("canvas");
    maskCanvas.width = W;
    maskCanvas.height = H;
    const maskCtx = maskCanvas.getContext("2d")!;

    let landmarker: any = null;
    let lastLandmarks: Landmark[] | null = null;
    let frameCounter = 0;
    let cancelled = false;
    let rafId: number | null = null;
    let lastFrameTime = performance.now();
    let avgFrameMs = 16;
    let mode: BeautyStatus = "loading";

    // Race landmarker load against a 6s timeout — fall back to "lite" if slow.
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

    const buildFaceMask = (lms: Landmark[]) => {
      maskCtx.clearRect(0, 0, W, H);
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
    };

    // ── Lite fallback: center-oval beauty pass that always looks good ──
    const drawLite = (s: BeautySettings) => {
      // Estimated face oval ~ 55% width, 70% height, centered slightly above middle
      const cx = W / 2;
      const cy = H * 0.42;
      const rx = W * 0.32;
      const ry = H * 0.36;

      const smoothPct = s.smooth / 100;
      const brightPct = s.brighten / 100;

      // 1) Skin smoothing — blur a copy, mask to oval, composite
      if (s.smooth > 0) {
        const blurPx = 6 + smoothPct * 12; // 6-18px
        blurCtx.filter = `blur(${blurPx.toFixed(1)}px) saturate(1.08)`;
        blurCtx.drawImage(video, 0, 0, W, H);
        blurCtx.filter = "none";
        blurCtx.globalCompositeOperation = "destination-in";
        // Soft oval mask with feathered edge via radial gradient
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

        ctx.globalAlpha = 0.55 + smoothPct * 0.4; // 0.55-0.95
        ctx.drawImage(blurCanvas, 0, 0);
        ctx.globalAlpha = 1;
      }

      // 2) Brighten + warmth inside oval
      if (s.brighten > 0) {
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(rx, ry));
        const a = 0.15 + brightPct * 0.32;
        grad.addColorStop(0, `rgba(255, 230, 210, ${a})`);
        grad.addColorStop(0.7, `rgba(255, 230, 210, ${a * 0.6})`);
        grad.addColorStop(1, "rgba(255, 230, 210, 0)");
        ctx.globalCompositeOperation = "screen";
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, W, H);
        ctx.globalCompositeOperation = "source-over";
      }

      // 3) Soft outer vignette to focus eye on face (Bigo signature)
      if (s.brighten > 0 || s.smooth > 0) {
        const v = ctx.createRadialGradient(cx, cy, Math.min(W, H) * 0.35, cx, cy, Math.max(W, H) * 0.7);
        v.addColorStop(0, "rgba(0,0,0,0)");
        v.addColorStop(1, `rgba(0,0,0,${0.18 + brightPct * 0.12})`);
        ctx.fillStyle = v;
        ctx.fillRect(0, 0, W, H);
      }
    };

    // ── Pro mode: landmark-driven effects ──
    const drawPro = (s: BeautySettings, lms: Landmark[]) => {
      buildFaceMask(lms);

      const smoothPct = s.smooth / 100;
      const brightPct = s.brighten / 100;
      const slimPct = s.slim / 100;
      const eyesPct = s.eyes / 100;
      const lipsPct = s.lips / 100;
      const nosePct = s.nose / 100;

      // Skin smoothing — masked blur + light glow pass
      if (s.smooth > 0) {
        const blurPx = 6 + smoothPct * 12; // 6-18px
        blurCtx.filter = `blur(${blurPx.toFixed(1)}px) saturate(1.1) contrast(1.04)`;
        blurCtx.drawImage(video, 0, 0, W, H);
        blurCtx.filter = "none";
        blurCtx.globalCompositeOperation = "destination-in";
        blurCtx.drawImage(maskCanvas, 0, 0);
        blurCtx.globalCompositeOperation = "source-over";

        ctx.globalAlpha = 0.7 + smoothPct * 0.25; // 0.7-0.95
        ctx.drawImage(blurCanvas, 0, 0);
        ctx.globalAlpha = 1;
      }

      // Brighten + warmth — masked overlay
      if (s.brighten > 0) {
        const a = 0.15 + brightPct * 0.27; // 0.15-0.42
        blurCtx.globalCompositeOperation = "source-over";
        blurCtx.filter = "none";
        blurCtx.fillStyle = `rgba(255, 226, 200, ${a})`;
        blurCtx.fillRect(0, 0, W, H);
        blurCtx.globalCompositeOperation = "destination-in";
        blurCtx.drawImage(maskCanvas, 0, 0);
        blurCtx.globalCompositeOperation = "source-over";
        ctx.globalCompositeOperation = "screen";
        ctx.globalAlpha = 0.8;
        ctx.drawImage(blurCanvas, 0, 0);
        ctx.globalCompositeOperation = "source-over";
        ctx.globalAlpha = 1;
      }

      // Lip enhance — saturate+contrast inside lip contour
      if (s.lips > 0) {
        const sat = 1 + lipsPct * 0.6;
        const con = 1 + lipsPct * 0.2;
        blurCtx.filter = `saturate(${sat}) contrast(${con}) brightness(${1 + lipsPct * 0.05})`;
        blurCtx.globalCompositeOperation = "source-over";
        blurCtx.drawImage(video, 0, 0, W, H);
        blurCtx.filter = "none";
        // Build lip-only mask
        const lipMask = maskCtx;
        lipMask.save();
        lipMask.clearRect(0, 0, W, H);
        lipMask.fillStyle = "#fff";
        pathFromIndices(lipMask, lms, LIPS_OUTER, W, H);
        lipMask.fill();
        lipMask.restore();
        blurCtx.globalCompositeOperation = "destination-in";
        blurCtx.drawImage(maskCanvas, 0, 0);
        blurCtx.globalCompositeOperation = "source-over";
        ctx.globalAlpha = 0.85;
        ctx.drawImage(blurCanvas, 0, 0);
        ctx.globalAlpha = 1;
      }

      // Face slim — 4 feathered cheek slices per side
      if (s.slim > 0) {
        const lc = lms[LM_LEFT_CHEEK];
        const rc = lms[LM_RIGHT_CHEEK];
        const chin = lms[LM_CHIN];
        const fore = lms[LM_FOREHEAD];
        if (lc && rc && chin && fore) {
          const top = Math.max(0, fore.y * H + (chin.y - fore.y) * H * 0.25);
          const bot = Math.min(H, chin.y * H + 8);
          const bandH = Math.max(20, bot - top);
          const lcX = lc.x * W;
          const rcX = rc.x * W;
          const faceW = rcX - lcX;
          const totalSliceW = Math.max(40, faceW * 0.22);
          const slicePieceH = bandH / 4;
          // Pinch scaled by face width so it works zoomed in or out
          const maxPinch = Math.min(45, faceW * 0.06) * slimPct;

          for (let i = 0; i < 4; i++) {
            // Feather: stronger at the middle of band, lighter near forehead/chin
            const feather = Math.sin(((i + 0.5) / 4) * Math.PI); // 0..1..0
            const pinch = maxPinch * feather;
            const sy = top + i * slicePieceH;
            // Left slice
            ctx.drawImage(
              video,
              lcX - totalSliceW * 0.5, sy, totalSliceW, slicePieceH,
              lcX - totalSliceW * 0.5 + pinch, sy, totalSliceW, slicePieceH,
            );
            // Right slice (mirrored)
            ctx.drawImage(
              video,
              rcX - totalSliceW * 0.5, sy, totalSliceW, slicePieceH,
              rcX - totalSliceW * 0.5 - pinch, sy, totalSliceW, slicePieceH,
            );
          }
        }
      }

      // Nose slim — small horizontal pinch around nose tip
      if (s.nose > 0) {
        const nt = lms[LM_NOSE_TIP];
        const nl = lms[LM_NOSE_LEFT];
        const nr = lms[LM_NOSE_RIGHT];
        if (nt && nl && nr) {
          const ntX = nt.x * W;
          const ntY = nt.y * H;
          const noseW = Math.abs(nr.x - nl.x) * W;
          const noseH = noseW * 1.1;
          const sliceW = noseW * 0.55;
          const pinch = noseW * 0.08 * nosePct; // ~0-8% pull
          // Left half
          ctx.drawImage(
            video,
            ntX - sliceW, ntY - noseH * 0.4, sliceW, noseH,
            ntX - sliceW + pinch, ntY - noseH * 0.4, sliceW, noseH,
          );
          // Right half
          ctx.drawImage(
            video,
            ntX, ntY - noseH * 0.4, sliceW, noseH,
            ntX - pinch, ntY - noseH * 0.4, sliceW, noseH,
          );
        }
      }

      // Eye enlarge — feathered radial scale
      if (s.eyes > 0) {
        const scale = 1 + eyesPct * 0.28; // up to +28%
        const eyes: Point[] = [];
        const le = lms[LM_LEFT_EYE_CENTER] || lms[LM_LEFT_EYE_FALLBACK];
        const re = lms[LM_RIGHT_EYE_CENTER] || lms[LM_RIGHT_EYE_FALLBACK];
        if (le) eyes.push({ x: le.x * W, y: le.y * H });
        if (re) eyes.push({ x: re.x * W, y: re.y * H });

        const lc = lms[LM_LEFT_CHEEK];
        const rc = lms[LM_RIGHT_CHEEK];
        const faceW = lc && rc ? Math.abs(rc.x - lc.x) * W : W * 0.4;
        const radius = Math.max(20, faceW * 0.14);

        for (const eye of eyes) {
          const r = radius;
          const sr = r * scale;
          // Render scaled eye into blurCanvas with soft edge
          blurCtx.save();
          blurCtx.globalCompositeOperation = "source-over";
          blurCtx.clearRect(eye.x - r * 1.5, eye.y - r * 1.5, r * 3, r * 3);
          blurCtx.beginPath();
          blurCtx.arc(eye.x, eye.y, r, 0, Math.PI * 2);
          blurCtx.clip();
          blurCtx.drawImage(
            video,
            eye.x - r, eye.y - r, r * 2, r * 2,
            eye.x - sr, eye.y - sr, sr * 2, sr * 2,
          );
          blurCtx.restore();

          // Build a feathered radial mask in another pass and composite
          ctx.save();
          const grad = ctx.createRadialGradient(eye.x, eye.y, r * 0.55, eye.x, eye.y, r);
          grad.addColorStop(0, "rgba(255,255,255,1)");
          grad.addColorStop(1, "rgba(255,255,255,0)");
          ctx.fillStyle = grad;
          ctx.globalCompositeOperation = "source-over";
          // Use a temp clip with feathered alpha by drawing into blurCanvas-aligned region
          ctx.beginPath();
          ctx.arc(eye.x, eye.y, r, 0, Math.PI * 2);
          ctx.clip();
          ctx.drawImage(blurCanvas, eye.x - r * 1.5, eye.y - r * 1.5, r * 3, r * 3, eye.x - r * 1.5, eye.y - r * 1.5, r * 3, r * 3);
          ctx.restore();
        }
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
            }
          } catch {
            // ignore single-frame failure
          }
        }
        if (lastLandmarks) {
          drawPro(s, lastLandmarks);
        } else {
          // No face detected yet — still apply lite pass so user sees effect
          drawLite(s);
        }
      } else if (mode === "lite") {
        drawLite(s);
      } else {
        // mode === "loading" — show a tiny brighten so it doesn't look broken
        if (s.brighten > 0 || s.smooth > 0) {
          ctx.filter = `brightness(${1 + (s.brighten / 100) * 0.06})`;
          ctx.drawImage(video, 0, 0, W, H);
          ctx.filter = "none";
        }
      }

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

  return { stream: outputStream, status, ready: status !== "loading" };
}
