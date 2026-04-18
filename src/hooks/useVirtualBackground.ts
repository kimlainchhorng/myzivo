/**
 * useVirtualBackground — MediaPipe Selfie Segmentation that replaces the
 * background of a MediaStream with a chosen image (or blur).
 *
 * Mirrors the architecture of useBeautyFilter:
 *   - Self-hosts WASM + model under /public/mediapipe
 *   - GPU delegate first, auto-falls-back to CPU
 *   - 6s timeout; if it never loads we just pass the raw stream through
 *
 * Output: a MediaStream you can publish or hand to <video>.
 */
import { useEffect, useRef, useState } from "react";

export type VirtualBgKind = "off" | "blur" | "image";
export interface VirtualBgConfig {
  kind: VirtualBgKind;
  imageUrl?: string; // used when kind === "image"
  blurPx?: number;   // used when kind === "blur" (default 18)
}

export type VirtualBgStatus = "loading" | "ready" | "off" | "error";

export function useVirtualBackground(
  source: MediaStream | null,
  config: VirtualBgConfig,
) {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [status, setStatus] = useState<VirtualBgStatus>("off");
  const configRef = useRef(config);
  configRef.current = config;

  useEffect(() => {
    if (!source) { setStream(null); setStatus("off"); return; }
    if (config.kind === "off") {
      setStream(source);
      setStatus("off");
      return;
    }

    let cancelled = false;
    let segmenter: any = null;
    let raf = 0;
    const video = document.createElement("video");
    video.autoplay = true;
    video.muted = true;
    video.playsInline = true;
    video.srcObject = source;

    const out = document.createElement("canvas");
    const ctx = out.getContext("2d", { willReadFrequently: false })!;
    const maskCanvas = document.createElement("canvas");
    const maskCtx = maskCanvas.getContext("2d")!;
    const bgImg = new Image();
    bgImg.crossOrigin = "anonymous";
    let bgImgLoaded = false;
    if (config.imageUrl) {
      bgImg.src = config.imageUrl;
      bgImg.onload = () => { bgImgLoaded = true; };
    }

    const start = async () => {
      setStatus("loading");
      try {
        await video.play();
      } catch {}
      const track = source.getVideoTracks()[0];
      const settings = track?.getSettings?.() ?? {};
      const w = settings.width ?? video.videoWidth ?? 720;
      const h = settings.height ?? video.videoHeight ?? 1280;
      out.width = w; out.height = h;
      maskCanvas.width = w; maskCanvas.height = h;

      try {
        const { FilesetResolver, ImageSegmenter } = await import("@mediapipe/tasks-vision");
        const fileset = await FilesetResolver.forVisionTasks("/mediapipe");
        segmenter = await ImageSegmenter.createFromOptions(fileset, {
          baseOptions: {
            modelAssetPath: "/mediapipe/selfie_segmenter.tflite",
            delegate: "GPU",
          },
          runningMode: "VIDEO",
          outputCategoryMask: false,
          outputConfidenceMasks: true,
        });
      } catch (e) {
        try {
          const { FilesetResolver, ImageSegmenter } = await import("@mediapipe/tasks-vision");
          const fileset = await FilesetResolver.forVisionTasks("/mediapipe");
          segmenter = await ImageSegmenter.createFromOptions(fileset, {
            baseOptions: {
              modelAssetPath: "/mediapipe/selfie_segmenter.tflite",
              delegate: "CPU",
            },
            runningMode: "VIDEO",
            outputCategoryMask: false,
            outputConfidenceMasks: true,
          });
        } catch (err) {
          console.error("[virtualBg] segmenter init failed", err);
          if (!cancelled) { setStream(source); setStatus("error"); }
          return;
        }
      }

      if (cancelled) return;
      setStatus("ready");

      const tick = () => {
        if (cancelled) return;
        raf = requestAnimationFrame(tick);
        if (video.readyState < 2) return;
        const cfg = configRef.current;
        const ts = performance.now();
        try {
          segmenter.segmentForVideo(video, ts, (result: any) => {
            const mask = result.confidenceMasks?.[0];
            if (!mask) return;
            // 1) Draw background layer
            if (cfg.kind === "blur") {
              ctx.save();
              ctx.filter = `blur(${cfg.blurPx ?? 18}px)`;
              ctx.drawImage(video, 0, 0, out.width, out.height);
              ctx.restore();
            } else if (cfg.kind === "image" && bgImgLoaded) {
              // cover-fit
              const ir = bgImg.width / bgImg.height;
              const or = out.width / out.height;
              let dw = out.width, dh = out.height, dx = 0, dy = 0;
              if (ir > or) { dh = out.height; dw = dh * ir; dx = (out.width - dw) / 2; }
              else { dw = out.width; dh = dw / ir; dy = (out.height - dh) / 2; }
              ctx.drawImage(bgImg, dx, dy, dw, dh);
            } else {
              ctx.fillStyle = "#000";
              ctx.fillRect(0, 0, out.width, out.height);
            }

            // 2) Build mask alpha image
            const mw = mask.width, mh = mask.height;
            const maskData = mask.getAsFloat32Array();
            const tmp = maskCtx.createImageData(mw, mh);
            const data = tmp.data;
            for (let i = 0; i < maskData.length; i++) {
              const v = maskData[i];
              const a = v > 0.5 ? 255 : Math.max(0, Math.min(255, v * 510));
              const j = i * 4;
              data[j] = 255; data[j+1] = 255; data[j+2] = 255; data[j+3] = a;
            }
            // resize mask to output via scratch canvas
            maskCanvas.width = mw; maskCanvas.height = mh;
            maskCtx.putImageData(tmp, 0, 0);

            // 3) Composite person on top using mask
            ctx.save();
            // Draw mask scaled, then keep video where mask alpha exists
            ctx.globalCompositeOperation = "source-over";
            // Use offscreen approach: draw video clipped to mask
            const personCanvas = document.createElement("canvas");
            personCanvas.width = out.width; personCanvas.height = out.height;
            const pctx = personCanvas.getContext("2d")!;
            pctx.drawImage(video, 0, 0, out.width, out.height);
            pctx.globalCompositeOperation = "destination-in";
            // soften mask edges
            pctx.filter = "blur(2px)";
            pctx.drawImage(maskCanvas, 0, 0, out.width, out.height);
            pctx.filter = "none";
            ctx.drawImage(personCanvas, 0, 0);
            ctx.restore();
          });
        } catch (e) {
          // swallow per-frame errors
        }
      };
      raf = requestAnimationFrame(tick);

      const captured = (out as any).captureStream?.(30) as MediaStream | undefined;
      if (captured) {
        // attach original audio
        source.getAudioTracks().forEach((t) => captured.addTrack(t));
        if (!cancelled) setStream(captured);
      } else {
        if (!cancelled) { setStream(source); setStatus("error"); }
      }
    };

    const timeout = window.setTimeout(() => {
      if (status === "loading") {
        // give up — pass through
        setStream(source);
        setStatus("error");
      }
    }, 6000);

    start();

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      window.clearTimeout(timeout);
      try { segmenter?.close?.(); } catch {}\\
      try { (out as any).captureStream?.()?.getTracks?.().forEach?.((t: MediaStreamTrack) => t.stop()); } catch {}\\
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [source, config.kind, config.imageUrl]);

  return { stream, status };
}
