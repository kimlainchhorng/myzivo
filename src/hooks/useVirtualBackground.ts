/**
 * useVirtualBackground — MediaPipe Image Segmenter that replaces the
 * background of a MediaStream with a chosen image (or blur).
 */
import { useEffect, useRef, useState } from "react";

export type VirtualBgKind = "off" | "blur" | "image";
export interface VirtualBgConfig {
  kind: VirtualBgKind;
  imageUrl?: string;
  blurPx?: number;
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
    let timeoutId = 0;

    const video = document.createElement("video");
    video.autoplay = true;
    video.muted = true;
    video.playsInline = true;
    video.srcObject = source;

    const out = document.createElement("canvas");
    const ctx = out.getContext("2d")!;
    // Reusable person-cutout canvas (don't allocate per frame!)
    const personCanvas = document.createElement("canvas");
    const pctx = personCanvas.getContext("2d")!;
    // Reusable mask canvas
    const maskCanvas = document.createElement("canvas");
    const maskCtx = maskCanvas.getContext("2d")!;

    const bgImg = new Image();
    bgImg.crossOrigin = "anonymous";
    let bgImgLoaded = false;
    let bgAvgColor = { r: 128, g: 128, b: 128 };
    if (config.imageUrl) {
      bgImg.src = config.imageUrl;
      bgImg.onload = () => {
        bgImgLoaded = true;
        // Sample average color via 1x1 downscale
        try {
          const c = document.createElement("canvas");
          c.width = 1; c.height = 1;
          const cx = c.getContext("2d")!;
          cx.drawImage(bgImg, 0, 0, 1, 1);
          const d = cx.getImageData(0, 0, 1, 1).data;
          bgAvgColor = { r: d[0], g: d[1], b: d[2] };
        } catch {}
      };
    }

    const drawVignette = () => {
      const w = out.width, h = out.height;
      const grd = ctx.createRadialGradient(w/2, h/2, Math.min(w,h)*0.35, w/2, h/2, Math.max(w,h)*0.75);
      grd.addColorStop(0, "rgba(0,0,0,0)");
      grd.addColorStop(1, "rgba(0,0,0,0.45)");
      ctx.save();
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, w, h);
      ctx.restore();
    };

    const drawBackground = (cfg: VirtualBgConfig) => {
      if (cfg.kind === "blur") {
        ctx.save();
        ctx.filter = `blur(${cfg.blurPx ?? 24}px) saturate(1.05) brightness(0.92)`;
        ctx.drawImage(video, 0, 0, out.width, out.height);
        ctx.restore();
        drawVignette();
      } else if (cfg.kind === "image" && bgImgLoaded) {
        const ir = bgImg.width / bgImg.height;
        const or = out.width / out.height;
        let dw = out.width, dh = out.height, dx = 0, dy = 0;
        if (ir > or) { dh = out.height; dw = dh * ir; dx = (out.width - dw) / 2; }
        else { dw = out.width; dh = dw / ir; dy = (out.height - dh) / 2; }
        ctx.save();
        // Stronger DoF blur + brightness drop pushes scene back
        ctx.filter = "blur(4px) saturate(1.1) brightness(0.88)";
        ctx.drawImage(bgImg, dx, dy, dw, dh);
        ctx.restore();
        drawVignette();
        // ambient grounding tint
        ctx.save();
        ctx.fillStyle = "rgba(0,0,0,0.06)";
        ctx.fillRect(0, 0, out.width, out.height);
        ctx.restore();
      } else {
        ctx.fillStyle = "#000";
        ctx.fillRect(0, 0, out.width, out.height);
      }
    };

    const start = async () => {
      setStatus("loading");
      try { await video.play(); } catch {}

      // Wait for video metadata so dimensions are correct
      if (video.readyState < 2) {
        await new Promise<void>((res) => {
          const on = () => { video.removeEventListener("loadeddata", on); res(); };
          video.addEventListener("loadeddata", on);
          setTimeout(res, 1500);
        });
      }

      const w = video.videoWidth || 720;
      const h = video.videoHeight || 1280;
      out.width = w; out.height = h;
      personCanvas.width = w; personCanvas.height = h;

      // Draw an initial frame so captureStream has data right away
      ctx.drawImage(video, 0, 0, w, h);

      // Capture the canvas stream NOW and publish it, regardless of segmenter readiness
      const captured = (out as any).captureStream?.(30) as MediaStream | undefined;
      if (captured) {
        source.getAudioTracks().forEach((t) => captured.addTrack(t));
        if (!cancelled) setStream(captured);
      } else {
        if (!cancelled) { setStream(source); setStatus("error"); }
        return;
      }

      // Initialize segmenter (GPU → CPU fallback)
      try {
        const { FilesetResolver, ImageSegmenter } = await import("@mediapipe/tasks-vision");
        const fileset = await FilesetResolver.forVisionTasks("/mediapipe");
        try {
          segmenter = await ImageSegmenter.createFromOptions(fileset, {
            baseOptions: {
              modelAssetPath: "/mediapipe/selfie_segmenter.tflite",
              delegate: "GPU",
            },
            runningMode: "VIDEO",
            outputCategoryMask: false,
            outputConfidenceMasks: true,
          });
        } catch {
          segmenter = await ImageSegmenter.createFromOptions(fileset, {
            baseOptions: {
              modelAssetPath: "/mediapipe/selfie_segmenter.tflite",
              delegate: "CPU",
            },
            runningMode: "VIDEO",
            outputCategoryMask: false,
            outputConfidenceMasks: true,
          });
        }
      } catch (err) {
        console.error("[virtualBg] segmenter init failed", err);
        if (!cancelled) setStatus("error");
        // keep canvas stream running with raw video pass-through
        const passTick = () => {
          if (cancelled) return;
          raf = requestAnimationFrame(passTick);
          if (video.readyState >= 2) ctx.drawImage(video, 0, 0, out.width, out.height);
        };
        raf = requestAnimationFrame(passTick);
        return;
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
            if (!mask) {
              // no mask — just show raw
              ctx.drawImage(video, 0, 0, out.width, out.height);
              return;
            }

            // 1) Background layer
            drawBackground(cfg);

            // 2) Build tight alpha mask — narrow smoothstep band for crisp silhouette
            const mw = mask.width, mh = mask.height;
            const maskData = mask.getAsFloat32Array();
            if (maskCanvas.width !== mw || maskCanvas.height !== mh) {
              maskCanvas.width = mw; maskCanvas.height = mh;
            }
            const tmp = maskCtx.createImageData(mw, mh);
            const data = tmp.data;
            const LO = 0.5, HI = 0.62, BAND = HI - LO;
            for (let i = 0; i < maskData.length; i++) {
              const v = maskData[i];
              let a: number;
              if (v >= HI) a = 255;
              else if (v <= LO) a = 0;
              else {
                const t = (v - LO) / BAND;
                a = Math.round(t * t * (3 - 2 * t) * 255);
              }
              const j = i * 4;
              data[j] = 255; data[j+1] = 255; data[j+2] = 255; data[j+3] = a;
            }
            maskCtx.putImageData(tmp, 0, 0);
            // Refinement: slight blur + high contrast re-threshold (dilate/erode-ish)
            maskCtx.globalCompositeOperation = "copy";
            maskCtx.filter = "blur(0.8px) contrast(1.6)";
            maskCtx.drawImage(maskCanvas, 0, 0);
            maskCtx.filter = "none";
            maskCtx.globalCompositeOperation = "source-over";

            // 3) Compose person cutout with high-quality upscale + 1px inner feather
            pctx.globalCompositeOperation = "source-over";
            pctx.filter = "none";
            pctx.imageSmoothingEnabled = true;
            (pctx as any).imageSmoothingQuality = "high";
            pctx.clearRect(0, 0, personCanvas.width, personCanvas.height);
            pctx.drawImage(video, 0, 0, personCanvas.width, personCanvas.height);
            pctx.globalCompositeOperation = "destination-in";
            pctx.filter = "blur(1px)";
            pctx.drawImage(maskCanvas, 0, 0, personCanvas.width, personCanvas.height);
            pctx.filter = "none";

            // 3b) Light/color match — multiply bg avg color over person, then re-clip
            if (cfg.kind === "image" && bgImgLoaded) {
              pctx.globalCompositeOperation = "multiply";
              pctx.fillStyle = `rgba(${bgAvgColor.r},${bgAvgColor.g},${bgAvgColor.b},0.18)`;
              pctx.fillRect(0, 0, personCanvas.width, personCanvas.height);
              pctx.globalCompositeOperation = "destination-in";
              pctx.drawImage(maskCanvas, 0, 0, personCanvas.width, personCanvas.height);
            }
            pctx.globalCompositeOperation = "source-over";

            // 4) Subtle inner rim shadow for depth separation
            ctx.save();
            ctx.globalAlpha = 0.3;
            ctx.filter = "blur(1.5px) brightness(0.35)";
            ctx.drawImage(personCanvas, 0, 1);
            ctx.restore();

            // 5) Draw person on top of background
            ctx.drawImage(personCanvas, 0, 0);

            try { mask.close?.(); } catch {}
          });
        } catch {
          // swallow per-frame errors — keep last good frame
        }
      };
      raf = requestAnimationFrame(tick);
    };

    timeoutId = window.setTimeout(() => {
      // If still loading after 8s, mark error but keep running
      setStatus((s) => (s === "loading" ? "error" : s));
    }, 8000);

    start();

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      window.clearTimeout(timeoutId);
      try { segmenter?.close?.(); } catch {}
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [source, config.kind, config.imageUrl]);

  return { stream, status };
}
