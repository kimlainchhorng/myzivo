/**
 * useBeautyFilter — Bigo/TikTok-style face-aware beauty pipeline.
 *
 * Uses MediaPipe FaceLandmarker (478 landmarks) to apply effects only on the
 * face — no global blur, no horizontal seams, follows the face as it moves.
 *
 * Effects (all face-masked):
 *   • Skin smoothing — blur a copy of the frame and composite it inside the
 *     face oval, with eyes/brows/lips punched out so detail stays sharp.
 *   • Brighten — soft warm overlay inside the same mask.
 *   • Face slim — gentle horizontal pinch on left/right cheek slices.
 *   • Eye enlarge — feathered radial scale-up on each eye.
 *
 * Falls back to a *non-blurred* light brighten/saturate pass if MediaPipe
 * fails to load — never ships the global mushy look.
 *
 * Output is delivered via canvas.captureStream(30) preserving the original
 * audio track, so the WebRTC publisher path is unchanged.
 */
import { useEffect, useRef, useState } from "react";

export interface BeautySettings {
  enabled: boolean;
  smooth: number;   // 0-100 skin smoothing (face-masked blur composite)
  brighten: number; // 0-100 brighten + warmth (face-masked overlay)
  slim: number;     // 0-100 face slim (cheek pinch)
  eyes: number;     // 0-100 eye enlarge
}

export const DEFAULT_BEAUTY: BeautySettings = {
  enabled: true,
  smooth: 65,
  brighten: 40,
  slim: 25,
  eyes: 20,
};

export const BEAUTY_PRESETS: Record<"natural" | "glam" | "off", BeautySettings> = {
  natural: { enabled: true, smooth: 55, brighten: 30, slim: 18, eyes: 12 },
  glam:    { enabled: true, smooth: 85, brighten: 55, slim: 40, eyes: 35 },
  off:     { enabled: false, smooth: 0, brighten: 0, slim: 0, eyes: 0 },
};

// MediaPipe FaceLandmarker face-oval contour indices (closed loop)
const FACE_OVAL = [
  10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365,
  379, 378, 400, 377, 152, 148, 176, 149, 150, 136, 172, 58, 132, 93,
  234, 127, 162, 21, 54, 103, 67, 109,
];
// Eye + brow + lip contours to "punch out" so detail stays sharp
const LEFT_EYE = [33, 7, 163, 144, 145, 153, 154, 155, 133, 173, 157, 158, 159, 160, 161, 246];
const RIGHT_EYE = [263, 249, 390, 373, 374, 380, 381, 382, 362, 398, 384, 385, 386, 387, 388, 466];
const LIPS = [61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291, 409, 270, 269, 267, 0, 37, 39, 40, 185];
// Single-point landmarks
const LM_LEFT_EYE_CENTER = 468;  // iris center (when iris landmarks present)
const LM_RIGHT_EYE_CENTER = 473;
const LM_LEFT_EYE_FALLBACK = 33;
const LM_RIGHT_EYE_FALLBACK = 263;
const LM_LEFT_CHEEK = 234;
const LM_RIGHT_CHEEK = 454;
const LM_CHIN = 152;
const LM_FOREHEAD = 10;

type Point = { x: number; y: number };
type Landmark = { x: number; y: number; z?: number };

let landmarkerPromise: Promise<any> | null = null;
async function loadLandmarker(): Promise<any> {
  if (landmarkerPromise) return landmarkerPromise;
  landmarkerPromise = (async () => {
    const vision = await import("@mediapipe/tasks-vision");
    const fileset = await vision.FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.22/wasm",
    );
    const lm = await vision.FaceLandmarker.createFromOptions(fileset, {
      baseOptions: {
        modelAssetPath:
          "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
        delegate: "GPU",
      },
      runningMode: "VIDEO",
      numFaces: 1,
      outputFaceBlendshapes: false,
      outputFacialTransformationMatrixes: false,
    });
    return lm;
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
  const [ready, setReady] = useState(false);
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

    // Offscreen blurred copy for skin smoothing
    const blurCanvas = document.createElement("canvas");
    blurCanvas.width = W;
    blurCanvas.height = H;
    const blurCtx = blurCanvas.getContext("2d", { alpha: false })!;

    // Mask canvas (face oval minus eyes/lips)
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

    loadLandmarker()
      .then((lm) => {
        if (cancelled) return;
        landmarker = lm;
        setReady(true);
      })
      .catch(() => {
        // Fallback path will be used (no landmarks).
      });

    const buildFaceMask = (lms: Landmark[]) => {
      maskCtx.clearRect(0, 0, W, H);
      maskCtx.fillStyle = "#fff";
      // Face oval
      pathFromIndices(maskCtx, lms, FACE_OVAL, W, H);
      maskCtx.fill();
      // Punch out eyes + lips so detail stays sharp
      maskCtx.globalCompositeOperation = "destination-out";
      pathFromIndices(maskCtx, lms, LEFT_EYE, W, H);
      maskCtx.fill();
      pathFromIndices(maskCtx, lms, RIGHT_EYE, W, H);
      maskCtx.fill();
      pathFromIndices(maskCtx, lms, LIPS, W, H);
      maskCtx.fill();
      maskCtx.globalCompositeOperation = "source-over";
    };

    const draw = () => {
      if (cancelled) return;
      const now = performance.now();
      const dt = now - lastFrameTime;
      lastFrameTime = now;
      avgFrameMs = avgFrameMs * 0.9 + dt * 0.1;
      frameCounter++;

      const s = settingsRef.current;

      // Always start with raw frame
      ctx.filter = "none";
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";
      ctx.drawImage(video, 0, 0, W, H);

      if (!s.enabled) {
        rafId = requestAnimationFrame(draw);
        return;
      }

      // Try landmark detection (skip every other frame if perf is poor)
      const slowMode = avgFrameMs > 40; // under ~25fps
      const shouldDetect =
        landmarker &&
        video.readyState >= 2 &&
        (!slowMode || frameCounter % 2 === 0);
      if (shouldDetect) {
        try {
          const result = landmarker.detectForVideo(video, now);
          if (result?.faceLandmarks?.[0]) {
            lastLandmarks = result.faceLandmarks[0];
          }
        } catch {
          // ignore
        }
      }

      const lms = lastLandmarks;

      if (!lms) {
        // Fallback (no face detected yet) — gentle global brighten/saturate only.
        // Never apply global blur — that's the mushy look we removed.
        if (s.brighten > 0 || s.smooth > 0) {
          const b = 1 + (s.brighten / 100) * 0.10 + (s.smooth / 100) * 0.04;
          const sat = 1 + (s.smooth / 100) * 0.08;
          ctx.filter = `brightness(${b.toFixed(3)}) saturate(${sat.toFixed(3)})`;
          ctx.drawImage(video, 0, 0, W, H);
          ctx.filter = "none";
        }
        rafId = requestAnimationFrame(draw);
        return;
      }

      // Build face mask once per frame
      buildFaceMask(lms);

      // ---- Skin smoothing: face-masked blur composite ----
      if (s.smooth > 0) {
        const smoothPct = s.smooth / 100;
        const blurPx = 4 + smoothPct * 6; // 4-10px blur
        blurCtx.filter = `blur(${blurPx.toFixed(1)}px)`;
        blurCtx.drawImage(video, 0, 0, W, H);
        blurCtx.filter = "none";

        // Mask the blurred copy to face area
        blurCtx.globalCompositeOperation = "destination-in";
        blurCtx.drawImage(maskCanvas, 0, 0);
        blurCtx.globalCompositeOperation = "source-over";

        // Composite onto main canvas
        ctx.globalAlpha = 0.55 + smoothPct * 0.35; // 0.55-0.9
        ctx.drawImage(blurCanvas, 0, 0);
        ctx.globalAlpha = 1;
      }

      // ---- Brighten + warmth: face-masked overlay ----
      if (s.brighten > 0) {
        const bPct = s.brighten / 100;
        ctx.save();
        // Clip to face mask
        // Use the maskCanvas as a clipping pattern via globalCompositeOperation
        // Simpler: draw a warm overlay then mask it.
        const warmCanvas = blurCanvas; // reuse: now repurposed
        const warmCtx = blurCtx;
        warmCtx.globalCompositeOperation = "source-over";
        warmCtx.fillStyle = `rgba(255, 226, 200, ${0.10 + bPct * 0.18})`;
        warmCtx.fillRect(0, 0, W, H);
        warmCtx.globalCompositeOperation = "destination-in";
        warmCtx.drawImage(maskCanvas, 0, 0);
        warmCtx.globalCompositeOperation = "source-over";

        ctx.globalCompositeOperation = "screen";
        ctx.globalAlpha = 0.6 + bPct * 0.3;
        ctx.drawImage(warmCanvas, 0, 0);
        ctx.globalAlpha = 1;
        ctx.globalCompositeOperation = "source-over";
        ctx.restore();
      }

      // ---- Face slim: gentle cheek pinch ----
      if (s.slim > 0) {
        const slimPct = s.slim / 100;
        const lc = lms[LM_LEFT_CHEEK];
        const rc = lms[LM_RIGHT_CHEEK];
        const chin = lms[LM_CHIN];
        const fore = lms[LM_FOREHEAD];
        if (lc && rc && chin && fore) {
          const top = Math.max(0, fore.y * H);
          const bot = Math.min(H, chin.y * H + (chin.y - fore.y) * H * 0.05);
          const bandH = Math.max(20, bot - top);
          const lcX = lc.x * W;
          const rcX = rc.x * W;
          const sliceW = Math.max(20, (rcX - lcX) * 0.18);
          const pinch = Math.min(sliceW * 0.6, 20 * slimPct + sliceW * 0.25 * slimPct);

          // Left cheek slice: source x = lcX - sliceW/2 .. lcX + sliceW/2,
          // dest shifted inward by `pinch`
          ctx.drawImage(
            video,
            lcX - sliceW / 2, top, sliceW, bandH,
            lcX - sliceW / 2 + pinch, top, sliceW, bandH,
          );
          // Right cheek slice mirrored
          ctx.drawImage(
            video,
            rcX - sliceW / 2, top, sliceW, bandH,
            rcX - sliceW / 2 - pinch, top, sliceW, bandH,
          );
        }
      }

      // ---- Eye enlarge: feathered radial scale ----
      if (s.eyes > 0) {
        const eyesPct = s.eyes / 100;
        const scale = 1 + eyesPct * 0.18; // up to +18%
        const eyes: Point[] = [];
        const le = lms[LM_LEFT_EYE_CENTER] || lms[LM_LEFT_EYE_FALLBACK];
        const re = lms[LM_RIGHT_EYE_CENTER] || lms[LM_RIGHT_EYE_FALLBACK];
        if (le) eyes.push({ x: le.x * W, y: le.y * H });
        if (re) eyes.push({ x: re.x * W, y: re.y * H });

        // Approximate eye region radius from face width
        const lc = lms[LM_LEFT_CHEEK];
        const rc = lms[LM_RIGHT_CHEEK];
        const faceW = lc && rc ? Math.abs(rc.x - lc.x) * W : W * 0.4;
        const radius = Math.max(20, faceW * 0.13);

        for (const eye of eyes) {
          const r = radius;
          const sr = r * scale;
          ctx.save();
          // Feathered circular clip
          ctx.beginPath();
          ctx.arc(eye.x, eye.y, r, 0, Math.PI * 2);
          ctx.clip();
          // Draw scaled-up region
          ctx.drawImage(
            video,
            eye.x - r, eye.y - r, r * 2, r * 2,
            eye.x - sr, eye.y - sr, sr * 2, sr * 2,
          );
          ctx.restore();
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
      if (rafId != null) cancelAnimationFrame(rafId);
      try { video.srcObject = null; } catch {}
      processed.getVideoTracks().forEach((t) => t.stop());
      setOutputStream(null);
    };
  }, [rawStream]);

  return { stream: outputStream, ready };
}
