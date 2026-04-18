/**
 * useBeautyFilter — Bigo-style real-time face beautification.
 *
 * Pulls frames from a raw camera MediaStream, runs them through an offscreen
 * canvas pipeline with:
 *   • Skin smoothing + brightening (CSS filter: blur/brightness/contrast/saturate)
 *   • Subtle face slim + eye enlarge (radial warp around face center)
 *
 * Returns a beautified MediaStream (via canvas.captureStream) that includes the
 * original audio track, so it can drop straight into the WebRTC publisher.
 */
import { useEffect, useRef, useState } from "react";

export interface BeautySettings {
  enabled: boolean;
  smooth: number; // 0-100 skin smoothing + brightening
  slim: number; // 0-100 face slim
  eyes: number; // 0-100 eye enlarge
}

export const DEFAULT_BEAUTY: BeautySettings = {
  enabled: true,
  smooth: 55,
  slim: 35,
  eyes: 25,
};

export function useBeautyFilter(rawStream: MediaStream | null, settings: BeautySettings) {
  const [outputStream, setOutputStream] = useState<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const videoElRef = useRef<HTMLVideoElement | null>(null);
  const rafRef = useRef<number | null>(null);
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

    const settingsAtMount = settingsRef.current;
    if (!settingsAtMount.enabled) {
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
    videoElRef.current = video;
    video.play().catch(() => {});

    const canvas = document.createElement("canvas");
    canvas.width = W;
    canvas.height = H;
    canvasRef.current = canvas;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) {
      setOutputStream(rawStream);
      return;
    }

    const draw = () => {
      const s = settingsRef.current;
      if (!s.enabled) {
        ctx.filter = "none";
        ctx.drawImage(video, 0, 0, W, H);
      } else {
        // Skin smoothing via slight blur + brightening + warmth
        const smoothPct = s.smooth / 100;
        const blur = (smoothPct * 1.2).toFixed(2); // up to 1.2px blur
        const bright = (1 + smoothPct * 0.12).toFixed(3);
        const contrast = (1 + smoothPct * 0.05).toFixed(3);
        const sat = (1 + smoothPct * 0.15).toFixed(3);
        ctx.filter = `blur(${blur}px) brightness(${bright}) contrast(${contrast}) saturate(${sat})`;

        // Face slim: pinch the horizontal edges around face area (center).
        // We simulate by drawing the source slightly compressed horizontally
        // around the central band, leaving outer pixels in place.
        const slimPct = s.slim / 100;
        const eyesPct = s.eyes / 100;
        if (slimPct > 0 || eyesPct > 0) {
          // Base draw
          ctx.drawImage(video, 0, 0, W, H);

          // Face slim: redraw central band slightly narrower (gives jaw-slim look)
          if (slimPct > 0) {
            const bandTop = H * 0.25;
            const bandHeight = H * 0.55;
            const inset = W * 0.04 * slimPct; // up to 4% inset each side
            ctx.filter = "none";
            ctx.drawImage(
              video,
              0, bandTop, W, bandHeight,
              inset, bandTop, W - inset * 2, bandHeight,
            );
            // restore filter for next frame
            ctx.filter = `blur(${blur}px) brightness(${bright}) contrast(${contrast}) saturate(${sat})`;
          }

          // Eye enlarge: redraw eye band slightly scaled up vertically
          if (eyesPct > 0) {
            const eyeTop = H * 0.30;
            const eyeHeight = H * 0.12;
            const scale = 1 + eyesPct * 0.08; // up to +8%
            const newH = eyeHeight * scale;
            const offset = (newH - eyeHeight) / 2;
            ctx.filter = "none";
            ctx.drawImage(
              video,
              0, eyeTop, W, eyeHeight,
              0, eyeTop - offset, W, newH,
            );
          }
        } else {
          ctx.drawImage(video, 0, 0, W, H);
        }
      }
      rafRef.current = requestAnimationFrame(draw);
    };

    const start = () => { if (rafRef.current == null) draw(); };
    video.onloadedmetadata = () => {
      canvas.width = video.videoWidth || W;
      canvas.height = video.videoHeight || H;
      start();
    };

    // Build output stream: processed video + original audio
    const processed = (canvas as any).captureStream(30) as MediaStream;
    const audio = rawStream.getAudioTracks()[0];
    if (audio) processed.addTrack(audio);
    setOutputStream(processed);

    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      try { video.srcObject = null; } catch {}
      processed.getVideoTracks().forEach((t) => t.stop());
      setOutputStream(null);
    };
  }, [rawStream]);

  return outputStream;
}
