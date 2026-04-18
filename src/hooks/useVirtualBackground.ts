/**
 * useVirtualBackground — clean background replacement using MediaPipe selfie segmentation.
 * Hard binary mask, raw face pixels, no beauty filter, no halo.
 */
import { useEffect, useRef, useState } from "react";
import { FilesetResolver, ImageSegmenter } from "@mediapipe/tasks-vision";

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
  const cfgRef = useRef(config);
  cfgRef.current = config;

  useEffect(() => {
    if (!source) {
      setStream(null);
      setStatus("off");
      return;
    }

    // Pass-through when off
    if (config.kind === "off") {
      setStream(source);
      setStatus("off");
      return;
    }

    let cancelled = false;
    let rafId = 0;
    let segmenter: ImageSegmenter | null = null;
    let video: HTMLVideoElement | null = null;
    let outStream: MediaStream | null = null;
    let bgImg: HTMLImageElement | null = null;

    const out = document.createElement("canvas");
    const person = document.createElement("canvas");
    const mask = document.createElement("canvas");
    const octx = out.getContext("2d")!;
    const pctx = person.getContext("2d")!;
    const mctx = mask.getContext("2d")!;

    setStatus("loading");

    const init = async () => {
      try {
        // Load background image if needed
        if (cfgRef.current.kind === "image" && cfgRef.current.imageUrl) {
          bgImg = new Image();
          bgImg.crossOrigin = "anonymous";
          bgImg.src = cfgRef.current.imageUrl;
          await new Promise<void>((res, rej) => {
            bgImg!.onload = () => res();
            bgImg!.onerror = () => rej(new Error("bg image failed"));
          });
        }

        // Setup video element
        video = document.createElement("video");
        video.srcObject = source;
        video.muted = true;
        video.playsInline = true;
        await video.play();

        const w = video.videoWidth || 1280;
        const h = video.videoHeight || 720;
        out.width = person.width = w;
        out.height = person.height = h;

        // Publish stream immediately
        outStream = (out as HTMLCanvasElement).captureStream(30);
        // Preserve audio
        source.getAudioTracks().forEach((t) => outStream!.addTrack(t));
        if (!cancelled) setStream(outStream);

        // Init segmenter with timeout
        const initPromise = (async () => {
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
        })();

        const timeout = new Promise<never>((_, rej) =>
          setTimeout(() => rej(new Error("segmenter timeout")), 8000),
        );

        await Promise.race([initPromise, timeout]);
        if (cancelled) return;
        setStatus("ready");

        const render = () => {
          if (cancelled || !video || !segmenter) return;
          try {
            const ts = performance.now();
            segmenter.segmentForVideo(video, ts, (result) => {
              const cfg = cfgRef.current;
              const W = out.width;
              const H = out.height;

              // 1. Draw background
              if (cfg.kind === "blur") {
                octx.filter = `blur(${cfg.blurPx ?? 22}px)`;
                octx.imageSmoothingEnabled = true;
                octx.drawImage(video!, 0, 0, W, H);
                octx.filter = "none";
              } else if (cfg.kind === "image" && bgImg) {
                octx.filter = "blur(2px) saturate(1.05)";
                octx.imageSmoothingEnabled = true;
                // cover-fit
                const ir = bgImg.width / bgImg.height;
                const cr = W / H;
                let dw = W, dh = H, dx = 0, dy = 0;
                if (ir > cr) {
                  dh = H;
                  dw = H * ir;
                  dx = (W - dw) / 2;
                } else {
                  dw = W;
                  dh = W / ir;
                  dy = (H - dh) / 2;
                }
                octx.drawImage(bgImg, dx, dy, dw, dh);
                octx.filter = "none";
              } else {
                octx.drawImage(video!, 0, 0, W, H);
              }

              // 2. Build hard binary mask from confidence
              const conf = result.confidenceMasks?.[0];
              if (!conf) {
                rafId = requestAnimationFrame(render);
                return;
              }
              const mw = conf.width;
              const mh = conf.height;
              mask.width = mw;
              mask.height = mh;
              const maskData = conf.getAsFloat32Array();
              const img = mctx.createImageData(mw, mh);
              for (let i = 0; i < maskData.length; i++) {
                const a = maskData[i] >= 0.5 ? 255 : 0;
                const j = i * 4;
                img.data[j] = 255;
                img.data[j + 1] = 255;
                img.data[j + 2] = 255;
                img.data[j + 3] = a;
              }
              mctx.putImageData(img, 0, 0);

              // 3. Draw raw person, then clip with mask (slight 0.6px blur on mask upscale to soften jaggies)
              pctx.globalCompositeOperation = "source-over";
              pctx.filter = "none";
              pctx.imageSmoothingEnabled = true;
              pctx.clearRect(0, 0, W, H);
              pctx.drawImage(video!, 0, 0, W, H);

              pctx.globalCompositeOperation = "destination-in";
              pctx.filter = "blur(0.6px)";
              pctx.imageSmoothingEnabled = true;
              pctx.drawImage(mask, 0, 0, W, H);
              pctx.filter = "none";
              pctx.globalCompositeOperation = "source-over";

              // 4. Composite person over background
              octx.drawImage(person, 0, 0, W, H);
            });
          } catch (e) {
            // swallow per-frame errors
          }
          rafId = requestAnimationFrame(render);
        };

        rafId = requestAnimationFrame(render);
      } catch (e) {
        console.warn("[useVirtualBackground] init failed, passing through:", e);
        if (!cancelled) {
          setStream(source);
          setStatus("error");
        }
      }
    };

    init();

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafId);
      if (segmenter) {
        try {
          segmenter.close();
        } catch {}
      }
      if (outStream) {
        outStream.getTracks().forEach((t) => {
          if (t.kind === "video") t.stop();
        });
      }
      if (video) {
        video.pause();
        video.srcObject = null;
      }
    };
  }, [source, config.kind, config.imageUrl, config.blurPx]);

  return { stream, status };
}
