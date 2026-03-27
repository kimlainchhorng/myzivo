/**
 * AdminStoreEditPage - Full store management: edit profile, cover, logo, products
 */
import { useParams, useNavigate } from "react-router-dom";
import { useI18n } from "@/hooks/useI18n";
import { useSupportedLanguages } from "@/hooks/useGlobalExpansion";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile } from "@ffmpeg/util";
import ffmpegCoreUrl from "@ffmpeg/core?url";
import ffmpegWasmUrl from "@ffmpeg/core/wasm?url";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Save, Store, Image, Package, Plus, Edit, Trash2, Loader2, Eye, Upload, Camera, MapPin, ExternalLink, Globe, Check, Percent, DollarSign, CalendarIcon, Tag, Gift, Video, ImagePlus, RefreshCw, Replace, CheckCircle2, XCircle, MinusCircle, AlertTriangle, Move, X } from "lucide-react";
import ManagedTagDropdown from "@/components/admin/ManagedTagDropdown";
import { cn } from "@/lib/utils";
import { STORE_CATEGORY_OPTIONS } from "@/config/groceryStores";
import StoreMapPicker from "@/components/admin/StoreMapPicker";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";


function normalizeLocalizedNumberInput(value: string): string {
  const khmerToLatin: Record<string, string> = {
    "០": "0", "១": "1", "២": "2", "៣": "3", "៤": "4",
    "៥": "5", "៦": "6", "៧": "7", "៨": "8", "៩": "9",
    "٫": ".", ",": ".",
  };

  return value
    .split("")
    .map((char) => khmerToLatin[char] ?? char)
    .join("");
}

function generateSku(storeName: string, category: string, name: string): string {
  const s = (storeName || "ST").substring(0, 2).toUpperCase();
  const c = (category || "GN").substring(0, 2).toUpperCase();
  const n = (name || "").replace(/[^a-zA-Z0-9]/g, "").substring(0, 3).toUpperCase() || "XXX";
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `${s}-${c}-${n}${rand}`;
}

function ensureVisibleVideoFrame(video: HTMLVideoElement) {
  if (!Number.isFinite(video.duration) || video.duration <= 0) return;

  const targetTime = Math.min(1, Math.max(video.duration * 0.1, 0.25));
  if (Math.abs(video.currentTime - targetTime) < 0.01) return;

  try {
    video.currentTime = targetTime;
  } catch {
    // Ignore seek failures on restrictive browsers.
  }
}

function captureVideoPosterFrame(video: HTMLVideoElement, setPosterUrl: (value: string | null | ((prev: string | null) => string | null)) => void) {
  if (video.videoWidth === 0 || video.videoHeight === 0) return;

  try {
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const nextPoster = canvas.toDataURL("image/jpeg", 0.82);
    setPosterUrl((prev) => {
      if (prev?.startsWith("blob:")) URL.revokeObjectURL(prev);
      return nextPoster;
    });
  } catch {
    // Ignore poster extraction failures.
  }
}

type DiagnosticStep = {
  id: string;
  label: string;
  status: "pending" | "running" | "success" | "failed" | "skipped";
};

function AdminVideoPreview({
  src,
  className,
  videoClassName,
  controls = true,
  autoPlay = false,
  loop = false,
  muted = true,
  onRepairSource,
}: {
  src: string;
  className?: string;
  videoClassName?: string;
  controls?: boolean;
  autoPlay?: boolean;
  loop?: boolean;
  muted?: boolean;
  onRepairSource?: (src: string) => Promise<string | null>;
}) {
  const [posterUrl, setPosterUrl] = useState<string | null>(null);
  const [activeSrc, setActiveSrc] = useState(src);
  const [diagSteps, setDiagSteps] = useState<DiagnosticStep[]>([]);
  const [isDiagnosing, setIsDiagnosing] = useState(false);
  const [diagComplete, setDiagComplete] = useState(false);
  const [diagSuccess, setDiagSuccess] = useState(false);
  const attemptedRef = useRef(false);

  // Reset when src changes
  useEffect(() => {
    attemptedRef.current = false;
    setActiveSrc(src);
    setDiagSteps([]);
    setIsDiagnosing(false);
    setDiagComplete(false);
    setDiagSuccess(false);
    setPosterUrl((prev) => {
      if (prev?.startsWith("blob:")) URL.revokeObjectURL(prev);
      return null;
    });
  }, [src]);

  const updateStep = (id: string, status: DiagnosticStep["status"]) => {
    setDiagSteps((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status } : s))
    );
  };

  // Test if a URL can be played by creating a temporary video element
  const testPlayback = (url: string, timeoutMs = 8000): Promise<boolean> =>
    new Promise((resolve) => {
      const vid = document.createElement("video");
      vid.muted = true;
      vid.playsInline = true;
      vid.preload = "auto";
      const timer = setTimeout(() => {
        vid.src = "";
        resolve(false);
      }, timeoutMs);
      vid.onloadeddata = () => {
        clearTimeout(timer);
        vid.src = "";
        resolve(true);
      };
      vid.onerror = () => {
        clearTimeout(timer);
        vid.src = "";
        resolve(false);
      };
      vid.src = url;
    });

  const runDiagnostics = async () => {
    if (attemptedRef.current) return;
    attemptedRef.current = true;
    setIsDiagnosing(true);
    setDiagComplete(false);
    setDiagSuccess(false);

    const steps: DiagnosticStep[] = [
      { id: "check_url", label: "Checking video URL…", status: "pending" },
      { id: "blob_fetch", label: "Fetching as local blob…", status: "pending" },
      { id: "codec_probe", label: "Probing codec compatibility…", status: "pending" },
      { id: "transcode", label: "Transcoding to H.264/AAC…", status: "pending" },
    ];
    setDiagSteps(steps);

    // Step 1: Check URL reachability
    updateStep("check_url", "running");
    let urlOk = false;
    try {
      const res = await fetch(src, { method: "HEAD" });
      urlOk = res.ok;
    } catch { /* ignore */ }
    updateStep("check_url", urlOk ? "success" : "failed");
    if (!urlOk) {
      updateStep("blob_fetch", "skipped");
      updateStep("codec_probe", "skipped");
      updateStep("transcode", "skipped");
      setIsDiagnosing(false);
      setDiagComplete(true);
      return;
    }

    // Step 2: Blob fetch fallback
    updateStep("blob_fetch", "running");
    let blobUrl: string | null = null;
    try {
      const res = await fetch(src);
      if (!res.ok) throw new Error("fetch failed");
      const blob = await res.blob();
      blobUrl = URL.createObjectURL(blob);
    } catch { /* ignore */ }

    if (blobUrl) {
      const canPlay = await testPlayback(blobUrl);
      if (canPlay) {
        updateStep("blob_fetch", "success");
        updateStep("codec_probe", "skipped");
        updateStep("transcode", "skipped");
        setActiveSrc(blobUrl);
        setIsDiagnosing(false);
        setDiagComplete(true);
        setDiagSuccess(true);
        return;
      }
      URL.revokeObjectURL(blobUrl);
    }
    updateStep("blob_fetch", "failed");

    // Step 3: Codec probe
    updateStep("codec_probe", "running");
    const codecTypes = [
      'video/mp4; codecs="avc1.42E01E, mp4a.40.2"',
      'video/mp4; codecs="avc1.4D401E"',
      'video/mp4',
    ];
    const supported = codecTypes.filter((c) => {
      try { return MediaSource.isTypeSupported(c); } catch { return false; }
    });
    updateStep("codec_probe", supported.length > 0 ? "success" : "failed");

    // Step 4: Full transcode via FFmpeg (with timeout)
    if (onRepairSource) {
      updateStep("transcode", "running");
      try {
        const repairedUrl = await Promise.race([
          onRepairSource(src),
          new Promise<null>((_, reject) =>
            setTimeout(() => reject(new Error("Transcode timed out")), 60000)
          ),
        ]);
        if (repairedUrl) {
          updateStep("transcode", "success");
          setActiveSrc(repairedUrl);
          setDiagSuccess(true);
        } else {
          updateStep("transcode", "failed");
        }
      } catch {
        updateStep("transcode", "failed");
      }
    } else {
      updateStep("transcode", "skipped");
    }

    setIsDiagnosing(false);
    setDiagComplete(true);
  };

  const stepIcon = (status: DiagnosticStep["status"]) => {
    switch (status) {
      case "running":
        return <Loader2 className="h-3 w-3 animate-spin text-blue-400" />;
      case "success":
        return <CheckCircle2 className="h-3 w-3 text-emerald-400" />;
      case "failed":
        return <XCircle className="h-3 w-3 text-red-400" />;
      case "skipped":
        return <MinusCircle className="h-3 w-3 text-muted-foreground/50" />;
      default:
        return <div className="h-3 w-3 rounded-full border border-muted-foreground/30" />;
    }
  };

  return (
    <div className={cn("relative bg-black", className)}>
      <video
        key={activeSrc}
        src={activeSrc}
        poster={posterUrl ?? undefined}
        className={cn("w-full h-full", videoClassName)}
        controls={controls}
        playsInline
        preload="auto"
        muted={muted}
        autoPlay={autoPlay}
        loop={loop}
        onLoadedMetadata={(event) => {
          event.currentTarget.muted = muted;
          ensureVisibleVideoFrame(event.currentTarget);
          if (!autoPlay) event.currentTarget.pause();
        }}
        onLoadedData={(event) => {
          ensureVisibleVideoFrame(event.currentTarget);
          captureVideoPosterFrame(event.currentTarget, setPosterUrl);
          if (!autoPlay) event.currentTarget.pause();
        }}
        onError={() => {
          if (!attemptedRef.current) void runDiagnostics();
        }}
      />

      {/* AI Diagnostic Overlay */}
      {(isDiagnosing || (diagComplete && !diagSuccess)) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/80 px-5 text-center backdrop-blur-sm">
          <div className="flex items-center gap-2">
            {isDiagnosing ? (
              <Loader2 className="h-4 w-4 animate-spin text-blue-400" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-amber-400" />
            )}
            <p className="text-xs font-semibold text-white">
              {isDiagnosing ? "AI Video Doctor — Diagnosing…" : "Diagnosis Complete"}
            </p>
          </div>

          <div className="w-full max-w-[200px] space-y-1.5">
            {diagSteps.map((step) => (
              <div key={step.id} className="flex items-center gap-2">
                {stepIcon(step.status)}
                <span
                  className={cn(
                    "text-[10px] leading-tight",
                    step.status === "skipped"
                      ? "text-muted-foreground/50"
                      : step.status === "failed"
                      ? "text-red-300"
                      : "text-white/80"
                  )}
                >
                  {step.label}
                </span>
              </div>
            ))}
          </div>

          {diagComplete && !diagSuccess && (
            <p className="mt-1 text-[10px] text-amber-300">
              Auto-fix failed — use <strong>Replace</strong> or <strong>Reprocess</strong> below.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

const emptyProduct = {
  name: "", description: "", price: 0, price_khr: 0, image_url: "", image_urls: [] as string[], category: "",
  brand: "", sku: "", unit: "", badge: "" as string, in_stock: true, sort_order: 0,
  discount_type: null as string | null, discount_value: null as number | null,
  discount_price_khr: null as number | null, discount_expires_at: "" as string,
  buy_quantity: 1, get_quantity: 0,
};

export default function AdminStoreEditPage() {
  const { storeId } = useParams<{ storeId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { currentLanguage, changeLanguage, t } = useI18n();
  const { data: supportedLanguages } = useSupportedLanguages(true);
  const STORE_LANG_CODES = ["en", "km", "th", "vi", "ko", "zh"];
  const activeLanguages = (supportedLanguages || []).filter(l => l.is_active && STORE_LANG_CODES.includes(l.code));
  const currentLangData = activeLanguages.find(l => l.code === currentLanguage);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [savedBrands, setSavedBrands] = useState<string[]>([]);
  const [savedCategories, setSavedCategories] = useState<string[]>([]);

  const { data: store, isLoading } = useQuery({
    queryKey: ["admin-store", storeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("store_profiles")
        .select("*")
        .eq("id", storeId!)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!storeId,
  });

  const { data: products = [], isLoading: loadingProducts } = useQuery({
    queryKey: ["admin-store-products", storeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("store_products")
        .select("*")
        .eq("store_id", storeId!)
        .order("sort_order")
        .order("name");
      if (error) throw error;
      return data;
    },
    enabled: !!storeId,
  });

  const { data: posts = [], isLoading: loadingPosts } = useQuery({
    queryKey: ["admin-store-posts", storeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("store_posts")
        .select("*")
        .eq("store_id", storeId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!storeId,
  });

  const existingCategories = [...new Set(products.map((p: any) => p.category).filter(Boolean))] as string[];

  // Derive saved brands/categories from existing products
  useEffect(() => {
    const brands = [...new Set(products.map((p: any) => p.brand).filter(Boolean))] as string[];
    const cats = [...new Set(products.map((p: any) => p.category).filter(Boolean))] as string[];
    setSavedBrands((prev) => [...new Set([...prev, ...brands])]);
    setSavedCategories((prev) => [...new Set([...prev, ...cats])]);
  }, [products]);

  const [form, setForm] = useState({
    name: "", slug: "", description: "", logo_url: "", banner_url: "",
    market: "", category: "", address: "", phone: "", hours: "",
    rating: 0, delivery_min: 0, is_active: true, khr_rate: 4062.5,
    latitude: null as number | null, longitude: null as number | null,
    banner_position: 50,
  });
  const [isRepositioning, setIsRepositioning] = useState(false);
  const [dragStartY, setDragStartY] = useState<number | null>(null);
  const [dragStartPos, setDragStartPos] = useState(50);
  const coverContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (store) {
      setForm({
        name: store.name || "",
        slug: store.slug || "",
        description: store.description || "",
        logo_url: store.logo_url || "",
        banner_url: store.banner_url || "",
        banner_position: (store as any).banner_position ?? 50,
        market: store.market || "",
        category: store.category || "",
        address: store.address || "",
        phone: store.phone || "",
        hours: store.hours || "",
        rating: store.rating || 0,
        delivery_min: store.delivery_min || 0,
        is_active: store.is_active ?? true,
        khr_rate: (store as any).khr_rate ?? 4062.5,
        latitude: (store as any).latitude ?? null,
        longitude: (store as any).longitude ?? null,
      });
    }
  }, [store]);

  const saveProfile = useMutation({
    mutationFn: async () => {
      const { rating, ...profileData } = form;
      const { error } = await supabase
        .from("store_profiles")
        .update(profileData as any)
        .eq("id", storeId!);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-store", storeId] });
      queryClient.invalidateQueries({ queryKey: ["admin-stores"] });
      toast.success("Store profile updated");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const [mapPickerOpen, setMapPickerOpen] = useState(false);
  const [productDialog, setProductDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [productForm, setProductForm] = useState(emptyProduct);
  const [deleteProductId, setDeleteProductId] = useState<string | null>(null);
  const [uploadingProductImage, setUploadingProductImage] = useState(false);
  const productImageInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [galleryPositions, setGalleryPositions] = useState<Record<string, number>>({});
  const [repositioningGalleryIdx, setRepositioningGalleryIdx] = useState<number | null>(null);
  const [galleryDragStartY, setGalleryDragStartY] = useState<number | null>(null);
  const [galleryDragStartPos, setGalleryDragStartPos] = useState(50);
  // Post state
  const [postDialog, setPostDialog] = useState(false);
  const [postCaption, setPostCaption] = useState("");
  const [postMediaItems, setPostMediaItems] = useState<Array<{ id: string; previewUrl: string; uploadedUrl?: string; isVideo: boolean; isUploading: boolean }>>([]);
  const [uploadingPostMedia, setUploadingPostMedia] = useState(false);
  const [deletePostId, setDeletePostId] = useState<string | null>(null);
  const [reprocessingPostId, setReprocessingPostId] = useState<string | null>(null);
  const [replacingPostId, setReplacingPostId] = useState<string | null>(null);
  const [postMediaMode, setPostMediaMode] = useState<"image" | "video">("image");
  const postMediaInputRef = useRef<HTMLInputElement>(null);
  const replaceVideoInputRef = useRef<HTMLInputElement>(null);
  const ffmpegRef = useRef<FFmpeg | null>(null);
  const ffmpegLoadPromiseRef = useRef<Promise<FFmpeg> | null>(null);
  const repairedPreviewUrlsRef = useRef<Map<string, string>>(new Map());

  useEffect(() => {
   if (store) {
      setGalleryImages((store as any).gallery_images || []);
      setGalleryPositions((store as any).gallery_positions || {});
    }
  }, [store]);

  useEffect(() => {
    return () => {
      repairedPreviewUrlsRef.current.forEach((url) => {
        if (url.startsWith("blob:")) URL.revokeObjectURL(url);
      });
      repairedPreviewUrlsRef.current.clear();
    };
  }, []);

  const cleanupPreviews = () => {
    postMediaItems.forEach((p) => {
      if (p.previewUrl.startsWith("blob:")) URL.revokeObjectURL(p.previewUrl);
    });
  };

  const resetPostState = () => {
    setPostCaption("");
    cleanupPreviews();
    setPostMediaItems([]);
  };

  const updatePostMediaItem = (
    id: string,
    updater: (item: { id: string; previewUrl: string; uploadedUrl?: string; isVideo: boolean; isUploading: boolean }) => { id: string; previewUrl: string; uploadedUrl?: string; isVideo: boolean; isUploading: boolean },
  ) => {
    setPostMediaItems((prev) => prev.map((item) => (item.id === id ? updater(item) : item)));
  };

  const probeVideoFile = async (file: File) => {
    const objectUrl = URL.createObjectURL(file);

    try {
      return await new Promise<boolean>((resolve) => {
        const video = document.createElement("video");
        let settled = false;

        const finalize = (result: boolean) => {
          if (settled) return;
          settled = true;
          window.clearTimeout(timeoutId);
          video.removeAttribute("src");
          video.load();
          resolve(result);
        };

        const timeoutId = window.setTimeout(() => finalize(false), 4000);

        video.preload = "metadata";
        video.muted = true;
        video.playsInline = true;
        video.onloadedmetadata = () => finalize(Number.isFinite(video.duration) && video.duration > 0);
        video.onerror = () => finalize(false);
        video.src = objectUrl;
        video.load();
      });
    } finally {
      URL.revokeObjectURL(objectUrl);
    }
  };

  const ensureFFmpegLoaded = async () => {
    if (ffmpegRef.current) return ffmpegRef.current;

    if (!ffmpegLoadPromiseRef.current) {
      ffmpegLoadPromiseRef.current = (async () => {
        const ffmpeg = new FFmpeg();
        await ffmpeg.load({
          coreURL: ffmpegCoreUrl,
          wasmURL: ffmpegWasmUrl,
        });
        ffmpegRef.current = ffmpeg;
        return ffmpeg;
      })().catch((error) => {
        ffmpegLoadPromiseRef.current = null;
        throw error;
      });
    }

    return ffmpegLoadPromiseRef.current;
  };

  const transcodeVideoForBrowser = async (file: File) => {
    const ffmpeg = await ensureFFmpegLoaded();
    const inputExtension = file.name.split(".").pop()?.toLowerCase() || "mp4";
    const safeBaseName = (file.name.replace(/\.[^.]+$/, "") || "video").replace(/[^a-zA-Z0-9-_]/g, "-");
    const inputName = `${safeBaseName}.${inputExtension}`;
    const outputName = `${safeBaseName}-browser.mp4`;

    await ffmpeg.writeFile(inputName, await fetchFile(file));

    try {
      await ffmpeg.exec([
        "-i", inputName,
        "-movflags", "+faststart",
        "-pix_fmt", "yuv420p",
        "-c:v", "libx264",
        "-preset", "veryfast",
        "-profile:v", "baseline",
        "-level", "3.0",
        "-c:a", "aac",
        "-profile:a", "aac_low",
        "-b:a", "128k",
        "-ar", "44100",
        "-ac", "2",
        "-y",
        outputName,
      ]);

      const data = await ffmpeg.readFile(outputName);
      if (!(data instanceof Uint8Array)) {
        throw new Error("Failed to read transcoded video output.");
      }

      const normalizedBuffer = new ArrayBuffer(data.byteLength);
      new Uint8Array(normalizedBuffer).set(data);

      return new File([normalizedBuffer], `${safeBaseName}.mp4`, {
        type: "video/mp4",
        lastModified: Date.now(),
      });
    } finally {
      await Promise.allSettled([
        ffmpeg.deleteFile(inputName),
        ffmpeg.deleteFile(outputName),
      ]);
    }
  };

  const normalizeVideoUpload = async (file: File) => {
    toast.info("Optimizing video for browser playback...");
    const normalizedFile = await transcodeVideoForBrowser(file);
    const normalizedIsPlayable = await probeVideoFile(normalizedFile);

    if (!normalizedIsPlayable) {
      throw new Error("This video could not be converted into a browser-safe format.");
    }

    return normalizedFile;
  };

  const repairVideoPreviewSource = async (url: string) => {
    const normalizedUrl = normalizeStorePostMediaUrl(url);
    const cached = repairedPreviewUrlsRef.current.get(normalizedUrl);
    if (cached) return cached;

    const response = await fetch(normalizedUrl);
    if (!response.ok) throw new Error("Failed to download video for repair.");

    const blob = await response.blob();
    const file = new File([blob], "preview-repair.mp4", { type: blob.type || "video/mp4" });
    const repairedFile = await transcodeVideoForBrowser(file);
    const repairedUrl = URL.createObjectURL(repairedFile);
    repairedPreviewUrlsRef.current.set(normalizedUrl, repairedUrl);
    return repairedUrl;
  };

  const uploadPostMedia = async (file: File) => {
    console.log("[PostMedia] uploadPostMedia called", { name: file.name, type: file.type, size: file.size });
    if (postMediaItems.length >= 10) {
      toast.error("Maximum 10 files per post");
      return;
    }

    const fileIsVideo = file.type.startsWith("video/");
    const mediaItemId = crypto.randomUUID();

    if (fileIsVideo && file.size > 100 * 1024 * 1024) {
      toast.error("Video file is too large. Maximum 100 MB.");
      return;
    }

    const localPreviewUrl = URL.createObjectURL(file);
    setPostMediaItems(prev => [...prev, { id: mediaItemId, previewUrl: localPreviewUrl, isVideo: fileIsVideo, isUploading: true }]);
    setUploadingPostMedia(true);

    try {
      const uploadFile = fileIsVideo ? await normalizeVideoUpload(file) : file;

      if (uploadFile !== file) {
        const normalizedPreviewUrl = URL.createObjectURL(uploadFile);
        updatePostMediaItem(mediaItemId, (item) => ({ ...item, previewUrl: normalizedPreviewUrl }));
        URL.revokeObjectURL(localPreviewUrl);
      }

      const ext = uploadFile.name.split(".").pop() || "jpg";
      const path = `posts/${storeId}/${Date.now()}.${ext}`;
      console.log("[PostMedia] uploading to storage path:", path);
      const { error: upErr, data: uploadData } = await supabase.storage.from("store-posts").upload(path, uploadFile, { upsert: true });
      console.log("[PostMedia] upload result:", { error: upErr, data: uploadData });
      if (upErr) throw upErr;
      const { data: urlData } = supabase.storage.from("store-posts").getPublicUrl(path);
      console.log("[PostMedia] publicUrl:", urlData.publicUrl);
      setPostMediaItems(prev => prev.map((item) => item.id === mediaItemId ? {
        ...item,
        uploadedUrl: urlData.publicUrl,
        isUploading: false,
      } : item));
    } catch (e: any) {
      setPostMediaItems(prev => {
        const currentItem = prev.find((p) => p.id === mediaItemId);
        if (currentItem?.previewUrl.startsWith("blob:")) URL.revokeObjectURL(currentItem.previewUrl);
        if (localPreviewUrl.startsWith("blob:")) URL.revokeObjectURL(localPreviewUrl);
        return prev.filter((p) => p.id !== mediaItemId);
      });
      console.error("[PostMedia] upload error:", e);
      toast.error(e.message || "This video format could not be prepared for web playback.");
    } finally {
      setUploadingPostMedia(false);
    }
  };
  const removePostMedia = (index: number) => {
    setPostMediaItems(prev => {
      const preview = prev[index];
      if (preview?.previewUrl.startsWith("blob:")) URL.revokeObjectURL(preview.previewUrl);
      return prev.filter((_, i) => i !== index);
    });
  };

  const postMediaUrls = postMediaItems
    .map((item) => item.uploadedUrl)
    .filter((url): url is string => Boolean(url));

  const hasPendingPostUploads = postMediaItems.some((item) => item.isUploading);

  const isVideoUrl = (url: string) => {
    if (!url) return false;
    return /\.(mp4|mov|webm|avi|mkv)(\?.*)?$/i.test(url) || /\.(mp4|mov|webm|avi|mkv)/i.test(url);
  };

  const normalizeStorePostMediaUrl = (url: string) => {
    if (!url) return "";
    if (/^https?:\/\//i.test(url) || url.startsWith("blob:")) return url;

    let cleaned = url.trim();
    cleaned = cleaned.replace(/^\/+/, "");
    cleaned = cleaned.replace(/^storage\/v1\/object\/public\/store-posts\//, "");
    cleaned = cleaned.replace(/^store-posts\//, "");

    return supabase.storage.from("store-posts").getPublicUrl(cleaned).data.publicUrl;
  };

  const getMediaType = (urls: string[]): string => {
    const hasVideo = urls.some((url) => isVideoUrl(normalizeStorePostMediaUrl(url)));
    const hasImage = urls.some((url) => !isVideoUrl(normalizeStorePostMediaUrl(url)));
    if (hasVideo && hasImage) return "mixed";
    if (hasVideo) return "video";
    return "image";
  };

  const savePost = useMutation({
    mutationFn: async () => {
      console.log("[SavePost] starting save", { postMediaUrls, hasPendingPostUploads, postMediaItems, postMediaMode });
      if (postMediaUrls.length === 0) throw new Error("Add at least one picture or video");
      if (hasPendingPostUploads) throw new Error("Please wait for media upload to finish");
      const insertPayload = {
        store_id: storeId!,
        caption: postCaption || null,
        media_urls: postMediaUrls,
        media_type: postMediaMode === "video" ? "video" : "image",
      };
      console.log("[SavePost] inserting:", JSON.stringify(insertPayload));
      const { data, error } = await supabase.from("store_posts").insert(insertPayload as any).select();
      console.log("[SavePost] result:", { data, error });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-store-posts", storeId] });
      setPostDialog(false);
      resetPostState();
      toast.success("Post created!");
    },
    onError: (e: any) => {
      const message = typeof e?.message === "string" ? e.message : "Failed to create post";
      if (message.toLowerCase().includes("row-level security") || message.toLowerCase().includes("permission")) {
        toast.error("Only admins can create video posts.");
        return;
      }
      toast.error(message);
    },
  });

  const deletePost = useMutation({
    mutationFn: async (postId: string) => {
      const { error } = await supabase.from("store_posts").delete().eq("id", postId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-store-posts", storeId] });
      setDeletePostId(null);
      toast.success("Post deleted");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const reprocessPostVideo = async (post: any) => {
    if (reprocessingPostId) return;
    setReprocessingPostId(post.id);
    try {
      const videoUrls = (post.media_urls || []).filter((u: string) =>
        /\.(mp4|mov|webm|avi|mkv)/i.test(u)
      );
      if (videoUrls.length === 0) {
        toast.error("No video files found in this post");
        return;
      }

      const newUrls: string[] = [];
      for (const url of post.media_urls as string[]) {
        if (!/\.(mp4|mov|webm|avi|mkv)/i.test(url)) {
          newUrls.push(url);
          continue;
        }

        toast.info("Downloading video for reprocessing...");
        const resp = await fetch(normalizeStorePostMediaUrl(url));
        if (!resp.ok) throw new Error("Failed to download video");
        const blob = await resp.blob();
        const originalFile = new File([blob], "reprocess.mp4", { type: blob.type || "video/mp4" });

        toast.info("Transcoding video...");
        const transcodedFile = await transcodeVideoForBrowser(originalFile);

        const path = `${storeId}/reprocessed-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.mp4`;
        const { error: uploadError } = await supabase.storage
          .from("store-posts")
          .upload(path, transcodedFile, { contentType: "video/mp4", upsert: false });
        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage.from("store-posts").getPublicUrl(path);
        newUrls.push(urlData.publicUrl);
      }

      const { error: updateError } = await supabase
        .from("store_posts")
        .update({ media_urls: newUrls } as any)
        .eq("id", post.id);
      if (updateError) throw updateError;

      queryClient.invalidateQueries({ queryKey: ["admin-store-posts", storeId] });
      toast.success("Video reprocessed successfully!");
    } catch (e: any) {
      toast.error(e?.message || "Failed to reprocess video");
    } finally {
      setReprocessingPostId(null);
    }
  };

  const replacePostVideo = async (post: any, file: File) => {
    if (replacingPostId) return;
    setReplacingPostId(post.id);

    try {
      const normalizedFile = await normalizeVideoUpload(file);
      const path = `${storeId}/replaced-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.mp4`;
      const { error: uploadError } = await supabase.storage
        .from("store-posts")
        .upload(path, normalizedFile, { contentType: "video/mp4", upsert: false });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from("store-posts").getPublicUrl(path);
      const videoIndex = (post.media_urls || []).findIndex((url: string) =>
        isVideoUrl(normalizeStorePostMediaUrl(url))
      );

      if (videoIndex === -1) {
        throw new Error("No video file found to replace.");
      }

      const nextUrls = (post.media_urls || []).map((url: string, index: number) =>
        index === videoIndex ? urlData.publicUrl : url
      );

      const { error: updateError } = await supabase
        .from("store_posts")
        .update({ media_urls: nextUrls } as any)
        .eq("id", post.id);

      if (updateError) throw updateError;

      queryClient.invalidateQueries({ queryKey: ["admin-store-posts", storeId] });
      toast.success("Video replaced successfully!");
    } catch (e: any) {
      toast.error(e?.message || "Failed to replace video");
    } finally {
      setReplacingPostId(null);
    }
  };

  const uploadProductImage = async (file: File) => {
    const currentImages = productForm.image_urls || [];
    if (currentImages.length >= 8) {
      toast.error("Maximum 8 images allowed");
      return;
    }
    setUploadingProductImage(true);
    try {
      const ext = file.name.split(".").pop() || "jpg";
      const path = `products/${storeId}/${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("store-assets").upload(path, file, { upsert: true });
      if (upErr) throw upErr;
      const { data: urlData } = supabase.storage.from("store-assets").getPublicUrl(path);
      const newUrls = [...currentImages, urlData.publicUrl];
      updateProductField("image_urls", newUrls);
      updateProductField("image_url", newUrls[0]); // keep first as primary
      toast.success("Image uploaded");
    } catch (e: any) {
      toast.error(e.message || "Upload failed");
    } finally {
      setUploadingProductImage(false);
    }
  };

  const removeProductImage = (index: number) => {
    const newUrls = (productForm.image_urls || []).filter((_: string, i: number) => i !== index);
    updateProductField("image_urls", newUrls);
    updateProductField("image_url", newUrls[0] || "");
  };

  const openAddProduct = () => {
    setEditingProduct(null);
    setProductForm(emptyProduct);
    setProductDialog(true);
  };

  const openEditProduct = (p: any) => {
    setEditingProduct(p);
    setProductForm({
      name: p.name || "",
      description: p.description || "",
      price: p.price || 0,
      price_khr: p.price_khr || Math.round((p.price || 0) * (form.khr_rate || 4062.5)),
      image_url: p.image_url || "",
      image_urls: (p.image_urls as string[]) || (p.image_url ? [p.image_url] : []),
      category: p.category || "",
      brand: p.brand || "",
      sku: p.sku || "",
      unit: p.unit || "",
      badge: p.badge || "",
      in_stock: p.in_stock ?? true,
      sort_order: p.sort_order || 0,
      discount_type: p.discount_type || null,
      discount_value: p.discount_value || null,
      discount_price_khr: p.discount_price_khr || null,
      discount_expires_at: p.discount_expires_at || "",
      buy_quantity: p.buy_quantity || 1,
      get_quantity: p.get_quantity || 0,
    });
    setProductDialog(true);
  };

  const saveProduct = useMutation({
    mutationFn: async (keepOpen?: boolean) => {
      const { _khrRaw, ...rest } = productForm as typeof productForm & { _khrRaw?: string };
      // Auto-generate SKU if empty
      const productPayload = {
        ...rest,
        sku: rest.sku || generateSku(form.name, rest.category, rest.name),
        // Clean empty discount fields
        discount_type: rest.discount_type || null,
        discount_value: rest.discount_value || null,
        discount_price_khr: rest.discount_price_khr || null,
        discount_expires_at: rest.discount_expires_at || null,
        buy_quantity: rest.discount_type === "bogo" ? (rest.buy_quantity || 1) : 1,
        get_quantity: rest.discount_type === "bogo" ? (rest.get_quantity || 0) : 0,
      };

      if (editingProduct) {
        const { error } = await supabase
          .from("store_products")
          .update(productPayload as any)
          .eq("id", editingProduct.id);
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from("store_products")
          .insert({ ...(productPayload as any), store_id: storeId! })
          .select()
          .single();
        if (error) throw error;
        if (data) setEditingProduct(data);
      }
      return keepOpen;
    },
    onSuccess: (keepOpen) => {
      queryClient.invalidateQueries({ queryKey: ["admin-store-products", storeId] });
      if (keepOpen) {
        toast.success("Saved");
      } else {
        setProductDialog(false);
        toast.success(editingProduct ? "Product updated" : "Product added");
      }
    },
    onError: (e: any) => toast.error(e.message),
  });

  const deleteProduct = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("store_products").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-store-products", storeId] });
      setDeleteProductId(null);
      toast.success("Product deleted");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const updateField = (field: string, value: any) => setForm((p) => ({ ...p, [field]: value }));
  const updateProductField = (field: string, value: any) => setProductForm((p) => ({ ...p, [field]: value }));

  const logoInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);

  const uploadGalleryImage = async (file: File) => {
    if (galleryImages.length >= 10) {
      toast.error("Maximum 10 gallery images allowed");
      return;
    }
    setUploadingGallery(true);
    try {
      const ext = file.name.split(".").pop() || "jpg";
      const path = `${storeId}/gallery-${Date.now()}.${ext}`;
      const { error: uploadErr } = await supabase.storage.from("store-assets").upload(path, file, { upsert: true });
      if (uploadErr) throw uploadErr;
      const { data: urlData } = supabase.storage.from("store-assets").getPublicUrl(path);
      const newImages = [...galleryImages, urlData.publicUrl];
      setGalleryImages(newImages);
      const { error: saveErr } = await supabase
        .from("store_profiles")
        .update({ gallery_images: newImages } as any)
        .eq("id", storeId!);
      if (saveErr) throw saveErr;
      queryClient.invalidateQueries({ queryKey: ["admin-store", storeId] });
      toast.success("Gallery image added");
    } catch (e: any) {
      toast.error(e.message || "Upload failed");
    } finally {
      setUploadingGallery(false);
    }
  };

  const removeGalleryImage = async (index: number) => {
    const newImages = galleryImages.filter((_, i) => i !== index);
    setGalleryImages(newImages);
    try {
      const { error } = await supabase
        .from("store_profiles")
        .update({ gallery_images: newImages } as any)
        .eq("id", storeId!);
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ["admin-store", storeId] });
      toast.success("Gallery image removed");
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const uploadImage = async (file: File, type: "logo" | "cover") => {
    const isLogo = type === "logo";
    isLogo ? setUploadingLogo(true) : setUploadingCover(true);
    try {
      const ext = file.name.split(".").pop() || "jpg";
      const path = `${storeId}/${type}-${Date.now()}.${ext}`;
      const { error: uploadErr } = await supabase.storage
        .from("store-assets")
        .upload(path, file, { upsert: true });
      if (uploadErr) throw uploadErr;
      const { data: urlData } = supabase.storage.from("store-assets").getPublicUrl(path);
      const field = isLogo ? "logo_url" : "banner_url";
      updateField(field, urlData.publicUrl);
      // Auto-save immediately
      const { error: saveErr } = await supabase
        .from("store_profiles")
        .update({ [field]: urlData.publicUrl })
        .eq("id", storeId!);
      if (saveErr) throw saveErr;
      queryClient.invalidateQueries({ queryKey: ["admin-store", storeId] });
      toast.success(`${isLogo ? "Profile" : "Cover"} image updated`);
    } catch (e: any) {
      toast.error(e.message || "Upload failed");
    } finally {
      isLogo ? setUploadingLogo(false) : setUploadingCover(false);
    }
  };

  if (isLoading) {
    return (
      <AdminLayout title="Edit Store">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  if (!store) {
    return (
      <AdminLayout title="Store Not Found">
        <div className="text-center py-20 space-y-4">
          <p className="text-muted-foreground">Store not found</p>
          <Button onClick={() => navigate("/admin/stores")} variant="outline">Back to Stores</Button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title={`Edit: ${store.name}`}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="icon" onClick={() => navigate("/admin/stores")}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h2 className="text-xl font-bold text-foreground">{store.name}</h2>
              <p className="text-sm text-muted-foreground">/{store.slug} · {store.market}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Language Switcher */}
            <Popover open={isLangOpen} onOpenChange={setIsLangOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 h-9">
                  {currentLangData?.flag_svg ? (
                    <img src={currentLangData.flag_svg} alt="" className="w-5 h-3.5 rounded-[2px] object-cover shadow-sm border border-foreground/10" />
                  ) : (
                    <Globe className="h-4 w-4" />
                  )}
                  <span className="text-xs font-medium">{currentLangData?.native_name || "English"}</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-72 p-0 bg-card/95 backdrop-blur-2xl border-border/50 shadow-2xl rounded-2xl overflow-hidden" align="end" sideOffset={8}>
                {/* Header with background flag watermark */}
                <div className="relative p-3 border-b border-border/50 bg-muted/30 overflow-hidden">
                  {currentLangData?.flag_svg && (
                    <img src={currentLangData.flag_svg} alt="" className="absolute -right-4 -top-4 w-32 h-32 opacity-[0.07] pointer-events-none blur-[1px]" style={{ transform: "rotate(-12deg) scale(1.3)" }} />
                  )}
                  <div className="flex items-center gap-2 relative z-10">
                    <Globe className="w-4 h-4 text-muted-foreground" />
                    <p className="text-sm font-medium">{t("admin.store.select_language")}</p>
                  </div>
                </div>
                <div className="overflow-y-auto max-h-[360px] p-1">
                  {activeLanguages.map(lang => (
                    <button
                      key={lang.code}
                      onClick={() => { changeLanguage(lang.code); setIsLangOpen(false); }}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 relative overflow-hidden group",
                        currentLanguage === lang.code ? "bg-primary/10 text-primary ring-1 ring-primary/20" : "hover:bg-muted/60"
                      )}
                    >
                      {/* Hover background flag watermark */}
                      {lang.flag_svg && (
                        <img src={lang.flag_svg} alt="" className="absolute right-1 top-1/2 -translate-y-1/2 w-16 h-16 opacity-0 group-hover:opacity-[0.08] transition-opacity duration-300 pointer-events-none blur-[0.5px]" style={{ transform: "translateY(-50%) rotate(-8deg)" }} />
                      )}
                      {lang.flag_svg ? (
                        <img src={lang.flag_svg} alt={lang.name} className="w-6 h-[17px] rounded-[3px] object-cover shadow-sm border border-black/10 shrink-0 relative z-10" />
                      ) : (
                        <span className="text-lg">{lang.flag_emoji}</span>
                      )}
                      <div className="flex-1 text-left relative z-10">
                        <p className="font-medium text-sm">{lang.name}</p>
                        <p className="text-xs text-muted-foreground">{lang.native_name}</p>
                      </div>
                      <span className="text-[10px] font-mono text-muted-foreground/70 uppercase relative z-10">{lang.code}</span>
                      {currentLanguage === lang.code && <Check className="w-4 h-4 text-primary relative z-10" />}
                    </button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>

            <Button onClick={() => navigate(`/grocery/shop/${store.slug}`)} variant="outline" className="gap-2">
              <Eye className="h-4 w-4" /> {t("admin.store.preview")}
            </Button>
          </div>
        </div>

        <Card className="overflow-hidden">
          <div
            ref={coverContainerRef}
            className={cn("relative h-52 bg-gradient-to-br from-primary/20 via-primary/10 to-accent/10", isRepositioning && "cursor-grab active:cursor-grabbing")}
            onMouseDown={isRepositioning ? (e) => { e.preventDefault(); setDragStartY(e.clientY); setDragStartPos(form.banner_position); } : undefined}
            onMouseMove={isRepositioning && dragStartY !== null ? (e) => {
              const containerH = coverContainerRef.current?.clientHeight || 208;
              const deltaY = e.clientY - dragStartY;
              const deltaPct = (deltaY / containerH) * 100;
              const newPos = Math.max(0, Math.min(100, dragStartPos - deltaPct));
              updateField("banner_position", Math.round(newPos));
            } : undefined}
            onMouseUp={isRepositioning ? () => setDragStartY(null) : undefined}
            onMouseLeave={isRepositioning ? () => setDragStartY(null) : undefined}
            onTouchStart={isRepositioning ? (e) => { setDragStartY(e.touches[0].clientY); setDragStartPos(form.banner_position); } : undefined}
            onTouchMove={isRepositioning ? (e) => {
              if (dragStartY === null) return;
              const containerH = coverContainerRef.current?.clientHeight || 208;
              const deltaY = e.touches[0].clientY - dragStartY;
              const deltaPct = (deltaY / containerH) * 100;
              const newPos = Math.max(0, Math.min(100, dragStartPos - deltaPct));
              updateField("banner_position", Math.round(newPos));
            } : undefined}
            onTouchEnd={isRepositioning ? () => setDragStartY(null) : undefined}
          >
            {form.banner_url && (
              <img
                src={form.banner_url}
                alt="Banner"
                className="w-full h-full object-cover select-none"
                draggable={false}
                style={{ objectPosition: `center ${form.banner_position}%` }}
              />
            )}
            {!isRepositioning && (
              <div className="absolute inset-0 bg-gradient-to-t from-background/45 via-transparent to-transparent" />
            )}
            {isRepositioning && (
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center pointer-events-none">
                <div className="bg-background/90 backdrop-blur-sm rounded-lg px-4 py-2 text-sm font-medium text-foreground shadow-lg flex items-center gap-2">
                  <Move className="h-4 w-4" />
                  Drag to reposition
                </div>
              </div>
            )}
            <div className="absolute top-3 right-4 flex items-center gap-2">
              {isRepositioning ? (
                <>
                  <Button size="sm" variant="secondary" className="gap-1.5 bg-background/90 backdrop-blur-sm" onClick={async () => {
                    setIsRepositioning(false);
                    const { error } = await supabase.from("store_profiles").update({ banner_position: form.banner_position } as any).eq("id", storeId!);
                    if (error) toast.error(error.message);
                    else toast.success("Cover position saved");
                  }}>
                    <Check className="h-3.5 w-3.5" /> Save Position
                  </Button>
                  <Button size="sm" variant="ghost" className="bg-background/90 backdrop-blur-sm" onClick={() => {
                    setIsRepositioning(false);
                    updateField("banner_position", dragStartPos);
                  }}>
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </>
              ) : (
                <>
                  {form.banner_url && (
                    <Button size="sm" variant="secondary" className="gap-1.5 bg-background/80 backdrop-blur-sm" onClick={() => { setIsRepositioning(true); setDragStartPos(form.banner_position); }}>
                      <Move className="h-3.5 w-3.5" /> Reposition
                    </Button>
                  )}
                  <input ref={coverInputRef} type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) uploadImage(f, "cover"); e.target.value = ""; }} />
                  <Button size="sm" variant="secondary" className="gap-1.5 bg-background/80 backdrop-blur-sm" onClick={() => coverInputRef.current?.click()} disabled={uploadingCover}>
                    {uploadingCover ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Camera className="h-3.5 w-3.5" />} {t("admin.store.change_cover")}
                  </Button>
                </>
              )}
            </div>
            {!isRepositioning && (
              <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between gap-3">
                <div className="flex items-end gap-3 min-w-0">
                  <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) uploadImage(f, "logo"); e.target.value = ""; }} />
                  <button
                    type="button"
                    onClick={() => logoInputRef.current?.click()}
                    disabled={uploadingLogo}
                    className="relative h-16 w-16 rounded-xl bg-background border-2 border-background shadow-lg overflow-hidden flex items-center justify-center shrink-0 group cursor-pointer hover:opacity-90 transition-opacity"
                  >
                    {form.logo_url ? (
                      <img src={form.logo_url} alt="Logo" className="h-full w-full object-cover" />
                    ) : (
                      <Store className="h-8 w-8 text-muted-foreground/30" />
                    )}
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-xl">
                      {uploadingLogo ? <Loader2 className="h-5 w-5 text-white animate-spin" /> : <Camera className="h-5 w-5 text-white" />}
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* ── Gallery Images ── */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Image className="h-4 w-4" /> Gallery Images
              <Badge variant="secondary" className="text-[10px]">{galleryImages.length}/10</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {galleryImages.map((url, i) => (
                <div key={i} className="relative group aspect-video rounded-xl overflow-hidden border border-border bg-muted">
                  <img src={url} alt={`Gallery ${i + 1}`} className="w-full h-full object-cover" />
                  <button
                    onClick={() => removeGalleryImage(i)}
                    className="absolute top-1.5 right-1.5 h-6 w-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              ))}
              {galleryImages.length < 10 && (
                <button
                  onClick={() => galleryInputRef.current?.click()}
                  disabled={uploadingGallery}
                  className="aspect-video rounded-xl border-2 border-dashed border-border hover:border-primary/40 flex flex-col items-center justify-center gap-1.5 text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                >
                  {uploadingGallery ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      <Plus className="h-5 w-5" />
                      <span className="text-[10px] font-medium">Add Photo</span>
                    </>
                  )}
                </button>
              )}
            </div>
            <input
              ref={galleryInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={e => {
                const f = e.target.files?.[0];
                if (f) uploadGalleryImage(f);
                e.target.value = "";
              }}
            />
            <p className="text-[11px] text-muted-foreground mt-2">These images appear as a scrolling banner on your store page.</p>
          </CardContent>
        </Card>

        <Tabs defaultValue="profile" className="space-y-4">
          <TabsList>
             <TabsTrigger value="profile" className="gap-1.5"><Store className="h-3.5 w-3.5" /> {t("admin.store.profile")}</TabsTrigger>
            <TabsTrigger value="products" className="gap-1.5"><Package className="h-3.5 w-3.5" /> {t("admin.store.products")} ({products.length})</TabsTrigger>
            <TabsTrigger value="photos" className="gap-1.5"><ImagePlus className="h-3.5 w-3.5" /> {t("admin.store.photo_posts")} ({posts.filter((p: any) => p.media_type === "image").length})</TabsTrigger>
            <TabsTrigger value="videos" className="gap-1.5"><Video className="h-3.5 w-3.5" /> {t("admin.store.video_posts")} ({posts.filter((p: any) => p.media_type === "video" || p.media_type === "mixed").length})</TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl border border-border bg-card">
            <span className="text-sm font-medium text-foreground whitespace-nowrap">៛ KHR Rate</span>
            <span className="text-xs text-muted-foreground whitespace-nowrap">1 USD =</span>
            <Input
              type="number"
              step="0.5"
              min="1"
              value={form.khr_rate || ""}
              onChange={e => updateField("khr_rate", parseFloat(e.target.value) || 0)}
              placeholder="4062.5"
              className="w-28 h-8 text-sm"
            />
            <span className="text-xs text-muted-foreground">KHR</span>
          </div>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">{t("admin.store.store_info")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t("admin.store.store_name")}</Label>
                    <Input value={form.name} onChange={e => updateField("name", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>{t("admin.store.slug")}</Label>
                    <Input value={form.slug} onChange={e => updateField("slug", e.target.value)} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>{t("admin.store.description")}</Label>
                  <Textarea value={form.description} onChange={e => updateField("description", e.target.value)} rows={3} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t("admin.store.market")}</Label>
                    <Input value={form.market} onChange={e => updateField("market", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>{t("admin.store.category")}</Label>
                    <select
                      value={form.category}
                      onChange={e => updateField("category", e.target.value)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      {STORE_CATEGORY_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>{t("admin.store.address")}</Label>
                  <div
                    className="flex items-center gap-2 px-3 h-11 rounded-xl border border-border bg-background cursor-pointer hover:bg-muted transition-colors"
                    onClick={() => setMapPickerOpen(true)}
                  >
                    <MapPin className="h-4 w-4 text-primary shrink-0" />
                    <span className={`text-sm truncate ${form.address ? "text-foreground" : "text-muted-foreground"}`}>
                      {form.address || t("admin.store.tap_pick_location")}
                    </span>
                  </div>
                  {form.address && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      onClick={() => {
                        const query = form.latitude != null && form.longitude != null
                          ? `${form.latitude},${form.longitude}`
                          : encodeURIComponent(form.address);
                        window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, "_blank", "noopener,noreferrer");
                      }}
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      {t("admin.store.view_on_maps")}
                    </Button>
                  )}
                  <StoreMapPicker
                    open={mapPickerOpen}
                    onOpenChange={setMapPickerOpen}
                    currentAddress={form.address}
                    currentCoords={form.latitude != null && form.longitude != null ? { lat: form.latitude, lng: form.longitude } : null}
                    onConfirm={(addr, lat, lng) => {
                      updateField("address", addr);
                      updateField("latitude", lat);
                      updateField("longitude", lng);
                    }}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>{t("admin.store.phone")}</Label>
                    <div className="flex gap-2">
                      <div className="flex items-center gap-1.5 px-3 rounded-xl border border-border bg-muted text-sm text-muted-foreground shrink-0">
                        <span>🇰🇭</span>
                        <span>+855</span>
                      </div>
                      <Input
                        value={form.phone.replace(/^\+855\s?/, "")}
                        onChange={e => {
                          let val = e.target.value.replace(/[^0-9]/g, "").replace(/^0+/, "");
                          if (val.length > 9) val = val.slice(0, 9);
                          updateField("phone", val ? `+855 ${val}` : "");
                        }}
                        placeholder="12 345 678"
                        maxLength={9}
                      />
                    </div>
                    {form.phone && (() => {
                      const digits = form.phone.replace(/^\+855\s?/, "").replace(/\D/g, "");
                      if (digits.length > 0 && (digits.length < 8 || digits.length > 9)) {
                        return <p className="text-xs text-destructive">Must be 8–9 digits</p>;
                      }
                      return null;
                    })()}
                  </div>
                  <div className="space-y-2">
                    <Label>{t("admin.store.hours")}</Label>
                    <Input value={form.hours} onChange={e => updateField("hours", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>{t("admin.store.delivery_min")}</Label>
                    <Input type="number" value={form.delivery_min} onChange={e => updateField("delivery_min", parseInt(e.target.value) || 0)} />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t("admin.store.rating")}</Label>
                    <div className="flex items-center gap-2 h-11 px-3 rounded-xl border border-border bg-muted">
                      <span className="text-amber-500">★</span>
                      <span className="text-sm font-medium">{form.rating || "0"}</span>
                      <span className="text-[10px] text-muted-foreground">/ 5 — from customer reviews</span>
                    </div>
                  </div>
                  <div className="space-y-2 pt-1">
                    <Label>{t("admin.store.store_status")}</Label>
                    <div className="flex items-center gap-2 h-11 px-3 rounded-xl border border-border bg-muted">
                      <span className="text-sm font-medium">{form.is_active ? t("admin.store.active") : t("admin.store.inactive")}</span>
                      <span className="text-[10px] text-muted-foreground">— status is controlled elsewhere</span>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end pt-2">
                  <Button onClick={() => saveProfile.mutate()} disabled={saveProfile.isPending} className="gap-2">
                    <Save className="h-4 w-4" />
                    {saveProfile.isPending ? t("admin.store.saving") : t("admin.store.save_changes")}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Products Tab */}
          <TabsContent value="products">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base">{t("admin.store.products")}</CardTitle>
                <Button size="sm" onClick={openAddProduct} className="gap-1.5">
                  <Plus className="h-4 w-4" /> {t("admin.store.add_product")}
                </Button>
              </CardHeader>
              <CardContent>
                {loadingProducts ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : products.length === 0 ? (
                  <div className="text-center py-12 space-y-3">
                    <Package className="h-10 w-10 text-muted-foreground/20 mx-auto" />
                    <p className="text-muted-foreground">{t("admin.store.no_products")}</p>
                    <Button variant="outline" size="sm" onClick={openAddProduct} className="gap-1.5">
                      <Plus className="h-4 w-4" /> {t("admin.store.add_first_product")}
                    </Button>
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {products.map((product: any) => (
                      <div key={product.id} className="flex items-center justify-between py-3">
                        <div className="flex items-center gap-3">
                          {product.image_url ? (
                            <img src={product.image_url} alt={product.name} className="w-12 h-12 rounded-lg object-cover bg-muted" />
                          ) : (
                            <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                              <Package className="h-5 w-5 text-muted-foreground/30" />
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-sm text-foreground">{product.name}</p>
                            <p className="text-xs text-muted-foreground">
                              ៛{(product.price_khr || Math.round(product.price * (form.khr_rate || 4062.5))).toLocaleString()} · ${product.price?.toFixed(2)}
                              {product.category && ` · ${product.category}`}
                              {product.brand && ` · ${product.brand}`}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={product.in_stock ? "default" : "secondary"} className="text-[10px]">
                            {product.in_stock ? t("admin.store.in_stock") : t("admin.store.out_of_stock")}
                          </Badge>
                          <Button size="sm" variant="outline" onClick={() => openEditProduct(product)}>
                            <Edit className="h-3.5 w-3.5" />
                          </Button>
                          <Button size="sm" variant="outline" className="text-destructive hover:text-destructive" onClick={() => setDeleteProductId(product.id)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Photos Tab */}
          <TabsContent value="photos">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base">{t("admin.store.photo_posts")}</CardTitle>
                <Button size="sm" onClick={() => { resetPostState(); setPostMediaMode("image"); setPostDialog(true); }} className="gap-1.5">
                  <Plus className="h-4 w-4" /> {t("admin.store.add_photo_post")}
                </Button>
              </CardHeader>
              <CardContent>
                {loadingPosts ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : posts.filter((p: any) => p.media_type === "image").length === 0 ? (
                  <div className="text-center py-12 space-y-3">
                    <ImagePlus className="h-10 w-10 text-muted-foreground/20 mx-auto" />
                    <p className="text-muted-foreground">{t("admin.store.no_photo_posts")}</p>
                    <Button variant="outline" size="sm" onClick={() => { resetPostState(); setPostMediaMode("image"); setPostDialog(true); }} className="gap-1.5">
                      <Plus className="h-4 w-4" /> {t("admin.store.add_photo_post")}
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                    {posts.filter((p: any) => p.media_type === "image").map((post: any) => (
                      <div key={post.id} className="rounded-xl border border-border overflow-hidden bg-card group">
                        <div className="aspect-square relative bg-muted overflow-hidden">
                          {post.media_urls?.[0] && (
                            <img src={normalizeStorePostMediaUrl(post.media_urls[0])} alt="" className="w-full h-full object-cover" />
                          )}
                          {post.media_urls?.length > 1 && (
                            <div className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm text-foreground text-xs font-medium px-2 py-0.5 rounded-full">
                              +{post.media_urls.length - 1}
                            </div>
                          )}
                        </div>
                        <div className="p-2.5 space-y-1.5">
                          {post.caption && <p className="text-xs text-foreground line-clamp-2">{post.caption}</p>}
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] text-muted-foreground">{new Date(post.created_at).toLocaleDateString()}</span>
                            <Button size="sm" variant="outline" className="h-6 w-6 p-0 text-destructive hover:text-destructive" onClick={() => setDeletePostId(post.id)}>
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Videos Tab */}
          <TabsContent value="videos">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base">{t("admin.store.video_posts")}</CardTitle>
                <Button size="sm" onClick={() => { resetPostState(); setPostMediaMode("video"); setPostDialog(true); }} className="gap-1.5">
                  <Plus className="h-4 w-4" /> {t("admin.store.add_video_post")}
                </Button>
              </CardHeader>
              <CardContent>
                {loadingPosts ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : posts.filter((p: any) => p.media_type === "video" || p.media_type === "mixed").length === 0 ? (
                  <div className="text-center py-12 space-y-3">
                    <Video className="h-10 w-10 text-muted-foreground/20 mx-auto" />
                    <p className="text-muted-foreground">{t("admin.store.no_video_posts")}</p>
                    <Button variant="outline" size="sm" onClick={() => { resetPostState(); setPostMediaMode("video"); setPostDialog(true); }} className="gap-1.5">
                      <Plus className="h-4 w-4" /> {t("admin.store.add_video_post")}
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {posts.filter((p: any) => p.media_type === "video" || p.media_type === "mixed").map((post: any) => {
                      const primaryMediaUrl = normalizeStorePostMediaUrl(post.media_urls?.[0] || "");

                      return (
                      <div key={post.id} className="rounded-xl border border-border overflow-hidden bg-card group">
                        <div className="aspect-[9/16] relative overflow-hidden bg-muted/10">
                          {primaryMediaUrl && (
                            <AdminVideoPreview
                              src={primaryMediaUrl}
                              className="h-full w-full"
                              videoClassName="object-contain"
                              controls
                              muted
                              onRepairSource={repairVideoPreviewSource}
                            />
                          )}
                          {post.media_urls?.length > 1 && (
                            <div className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm text-foreground text-xs font-medium px-2 py-0.5 rounded-full">
                              +{post.media_urls.length - 1}
                            </div>
                          )}
                        </div>
                        <div className="p-3 space-y-2">
                          {post.caption && <p className="text-sm text-foreground line-clamp-2">{post.caption}</p>}
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] text-muted-foreground">{new Date(post.created_at).toLocaleDateString()}</span>
                            <div className="flex items-center gap-1">
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 text-xs gap-1"
                                disabled={replacingPostId === post.id || reprocessingPostId === post.id}
                                onClick={() => {
                                  setReplacingPostId(post.id);
                                  replaceVideoInputRef.current?.click();
                                }}
                              >
                                {replacingPostId === post.id ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  <Replace className="h-3 w-3" />
                                )}
                                {replacingPostId === post.id ? "Selecting..." : "Replace"}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 text-xs gap-1"
                                disabled={reprocessingPostId === post.id}
                                onClick={() => reprocessPostVideo(post)}
                              >
                                {reprocessingPostId === post.id ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  <RefreshCw className="h-3 w-3" />
                                )}
                                {reprocessingPostId === post.id ? "Processing..." : "Reprocess"}
                              </Button>
                              <Button size="sm" variant="outline" className="h-7 w-7 p-0 text-destructive hover:text-destructive" onClick={() => setDeletePostId(post.id)}>
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )})}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Product Add/Edit Dialog */}
      <Dialog open={productDialog} onOpenChange={setProductDialog}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingProduct ? "Edit Product" : "Add Product"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Product Name *</Label>
              <Input value={productForm.name} onChange={e => updateProductField("name", e.target.value)} placeholder="Product name" />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={productForm.description} onChange={e => updateProductField("description", e.target.value)} rows={2} />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Price (៛ KHR) *</Label>
                <Input
                  type="text"
                  inputMode="numeric"
                  value={productForm.price_khr || ""}
                  onChange={e => {
                    const normalized = normalizeLocalizedNumberInput(e.target.value);
                    const val = normalized.replace(/[^0-9]/g, "");
                    if (val === "") {
                      updateProductField("price_khr", 0);
                      updateProductField("price", 0);
                      return;
                    }
                    const khr = parseInt(val, 10);
                    if (!Number.isNaN(khr)) {
                      updateProductField("price_khr", khr);
                      updateProductField("price", parseFloat((khr / (form.khr_rate || 4062.5)).toFixed(2)));
                    }
                  }}
                  placeholder="0"
                />
                <p className="text-[10px] text-muted-foreground">Rate: 1 USD = {(form.khr_rate || 4062.5).toLocaleString()} KHR</p>
              </div>
              <div className="space-y-2">
                <Label>Price ($)</Label>
                <Input
                  type="text"
                  inputMode="decimal"
                  value={productForm.price || ""}
                  onChange={e => {
                    const normalized = normalizeLocalizedNumberInput(e.target.value);
                    const parts = normalized.split(".");
                    const safeDecimal = parts.length > 1
                      ? `${parts[0].replace(/[^0-9]/g, "")}.${parts.slice(1).join("").replace(/[^0-9]/g, "")}`
                      : normalized.replace(/[^0-9]/g, "");
                    if (safeDecimal === "" || safeDecimal === ".") {
                      updateProductField("price", 0);
                      updateProductField("price_khr", 0);
                      return;
                    }
                    const num = parseFloat(safeDecimal);
                    if (!Number.isNaN(num)) {
                      updateProductField("price", num);
                      updateProductField("price_khr", Math.round(num * (form.khr_rate || 4062.5)));
                    }
                  }}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label>SKU</Label>
                <div className="flex gap-2">
                  <Input value={productForm.sku} onChange={e => updateProductField("sku", e.target.value)} className="flex-1" placeholder="Auto-generated" />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="shrink-0 text-xs"
                    onClick={() => updateProductField("sku", generateSku(form.name, productForm.category, productForm.name))}
                  >
                    Auto
                  </Button>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Images ({(productForm.image_urls || []).length}/8)</Label>
              <input ref={productImageInputRef} type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) uploadProductImage(f); e.target.value = ""; }} />
              <div className="flex flex-wrap gap-2">
                {(productForm.image_urls || []).map((url: string, idx: number) => (
                  <div key={idx} className="relative group shrink-0">
                    <img src={url} alt={`Product ${idx + 1}`} className="w-20 h-20 rounded-xl object-cover border border-border" />
                    <button
                      type="button"
                      onClick={() => removeProductImage(idx)}
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-destructive text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs shadow-sm"
                    >
                      ×
                    </button>
                    {idx === 0 && (
                      <span className="absolute bottom-0.5 left-0.5 text-[8px] bg-primary text-primary-foreground px-1 rounded">Main</span>
                    )}
                  </div>
                ))}
                {(productForm.image_urls || []).length < 8 && (
                  <button
                    type="button"
                    onClick={() => productImageInputRef.current?.click()}
                    disabled={uploadingProductImage}
                    className="w-20 h-20 rounded-xl border-2 border-dashed border-border bg-muted/50 flex flex-col items-center justify-center gap-1 hover:bg-muted transition-colors shrink-0"
                  >
                    {uploadingProductImage ? (
                      <Loader2 className="h-5 w-5 text-muted-foreground animate-spin" />
                    ) : (
                      <>
                        <Upload className="h-5 w-5 text-muted-foreground" />
                        <span className="text-[10px] text-muted-foreground">Upload</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <ManagedTagDropdown
                  label="Category"
                  value={productForm.category}
                  onChange={(v) => updateProductField("category", v)}
                  savedItems={savedCategories}
                  onSaveItem={(item) => setSavedCategories((prev) => [...new Set([...prev, item])])}
                  onDeleteItem={(item) => setSavedCategories((prev) => prev.filter((c) => c !== item))}
                  placeholder="e.g. Snacks"
                />
              </div>
              <div className="space-y-2">
                <Label>Brand</Label>
                <ManagedTagDropdown
                  label="Brand"
                  value={productForm.brand}
                  onChange={(v) => updateProductField("brand", v)}
                  savedItems={savedBrands}
                  onSaveItem={(item) => setSavedBrands((prev) => [...new Set([...prev, item])])}
                  onDeleteItem={(item) => setSavedBrands((prev) => prev.filter((b) => b !== item))}
                  placeholder="e.g. Coca-Cola"
                />
              </div>
            </div>
            {/* ── Discount Section ── */}
            <div className="space-y-3 rounded-xl border border-border/50 bg-muted/30 p-3">
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-primary" />
                <Label className="font-semibold text-sm">Discount</Label>
                <Switch
                  checked={!!productForm.discount_type}
                  onCheckedChange={(v) => {
                    if (v) {
                      updateProductField("discount_type", "percentage");
                      updateProductField("discount_value", 0);
                    } else {
                      updateProductField("discount_type", null);
                      updateProductField("discount_value", null);
                      updateProductField("discount_price_khr", null);
                      updateProductField("discount_expires_at", "");
                      updateProductField("buy_quantity", 1);
                      updateProductField("get_quantity", 0);
                    }
                  }}
                />
              </div>
              {productForm.discount_type && (
                <div className="space-y-3">
                  <div className="flex gap-1.5">
                    <Button
                      type="button"
                      size="sm"
                      variant={productForm.discount_type === "percentage" ? "default" : "outline"}
                      className="flex-1 gap-1 text-xs"
                      onClick={() => {
                        updateProductField("discount_type", "percentage");
                        const val = productForm.discount_value || 0;
                        updateProductField("discount_price_khr", Math.round((productForm.price_khr || 0) * (1 - val / 100)));
                      }}
                    >
                      <Percent className="h-3 w-3" /> %
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant={productForm.discount_type === "fixed" ? "default" : "outline"}
                      className="flex-1 gap-1 text-xs"
                      onClick={() => {
                        updateProductField("discount_type", "fixed");
                        const val = productForm.discount_value || 0;
                        updateProductField("discount_price_khr", Math.max(0, (productForm.price_khr || 0) - val));
                      }}
                    >
                      <DollarSign className="h-3 w-3" /> Fixed
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant={productForm.discount_type === "bogo" ? "default" : "outline"}
                      className="flex-1 gap-1 text-xs"
                      onClick={() => {
                        updateProductField("discount_type", "bogo");
                        updateProductField("discount_value", null);
                        updateProductField("discount_price_khr", null);
                        updateProductField("buy_quantity", 1);
                        updateProductField("get_quantity", 1);
                      }}
                    >
                      <Gift className="h-3 w-3" /> Buy X Get Y
                    </Button>
                  </div>

                  {/* Percentage / Fixed fields */}
                  {(productForm.discount_type === "percentage" || productForm.discount_type === "fixed") && (
                    <>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label className="text-xs">
                            {productForm.discount_type === "percentage" ? "Discount %" : "Discount ៛ KHR"}
                          </Label>
                          <Input
                            type="number"
                            min="0"
                            step={productForm.discount_type === "percentage" ? "1" : "100"}
                            value={productForm.discount_value || ""}
                            onChange={e => {
                              const val = parseFloat(e.target.value) || 0;
                              updateProductField("discount_value", val);
                              const origKhr = productForm.price_khr || 0;
                              if (productForm.discount_type === "percentage") {
                                updateProductField("discount_price_khr", Math.round(origKhr * (1 - val / 100)));
                              } else {
                                updateProductField("discount_price_khr", Math.max(0, origKhr - val));
                              }
                            }}
                            placeholder={productForm.discount_type === "percentage" ? "e.g. 10" : "e.g. 500"}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Sale Price ៛</Label>
                          <Input
                            type="number"
                            value={productForm.discount_price_khr || ""}
                            readOnly
                            className="bg-muted/50 font-bold text-primary"
                          />
                        </div>
                      </div>
                      {(productForm.discount_value || 0) > 0 && (
                        <div className="flex items-center gap-2 text-xs">
                          <span className="line-through text-muted-foreground">៛{(productForm.price_khr || 0).toLocaleString()}</span>
                          <span className="font-bold text-primary">→ ៛{(productForm.discount_price_khr || 0).toLocaleString()}</span>
                          {productForm.discount_type === "percentage" && (
                            <Badge variant="secondary" className="text-[10px] bg-destructive/10 text-destructive border-destructive/20">
                              -{productForm.discount_value}%
                            </Badge>
                          )}
                        </div>
                      )}
                    </>
                  )}

                  {/* BOGO fields */}
                  {productForm.discount_type === "bogo" && (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label className="text-xs">Buy Quantity</Label>
                          <Input
                            type="number"
                            min="1"
                            value={productForm.buy_quantity === 0 ? "" : productForm.buy_quantity}
                            onChange={e => updateProductField("buy_quantity", parseInt(e.target.value) || 1)}
                            placeholder="e.g. 2"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Get Free</Label>
                          <Input
                            type="number"
                            min="1"
                            value={productForm.get_quantity === 0 ? "" : productForm.get_quantity}
                            onChange={e => updateProductField("get_quantity", parseInt(e.target.value) || 1)}
                            placeholder="e.g. 1"
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                          <Gift className="h-3 w-3 mr-1" />
                          Buy {productForm.buy_quantity} Get {productForm.get_quantity} Free
                        </Badge>
                      </div>
                    </div>
                  )}
                  <div className="space-y-1">
                    <Label className="text-xs flex items-center gap-1">
                      <CalendarIcon className="h-3 w-3" /> Discount Expires
                    </Label>
                    <Input
                      type="datetime-local"
                      value={productForm.discount_expires_at ? productForm.discount_expires_at.slice(0, 16) : ""}
                      onChange={e => updateProductField("discount_expires_at", e.target.value ? new Date(e.target.value).toISOString() : "")}
                    />
                    <p className="text-[10px] text-muted-foreground">Leave empty for no expiry</p>
                  </div>
                </div>
              )}
            </div>

            {/* Unit selector */}
            <div className="space-y-2">
              <Label>Unit / ឯកតា</Label>
              <div className="flex flex-wrap gap-1.5">
                {["ចំនួន", "គីឡូ", "កញ្ចប់", "ដប", "កំប៉ុង", "ប្រអប់", "ដុំ", "ចាន", "កែវ", "ថង់", "kg", "g", "pcs", "pack", "bottle", "box", "liter", "dozen"].map(u => (
                  <button
                    key={u}
                    type="button"
                    onClick={() => updateProductField("unit", productForm.unit === u ? "" : u)}
                    className={cn(
                      "px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors",
                      productForm.unit === u
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-muted/30 text-muted-foreground border-border/50 hover:bg-muted/50"
                    )}
                  >
                    {u}
                  </button>
                ))}
              </div>
              <Input
                value={productForm.unit || ""}
                onChange={e => updateProductField("unit", e.target.value)}
                placeholder="Custom unit..."
                className="mt-1"
              />
            </div>

            {/* Badge / Tag selector */}
            <div className="space-y-2">
              <Label>Badge / ស្លាក</Label>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { value: "new", label: "🆕 New Arrival / ទំនិញថ្មី", color: "bg-blue-500/15 text-blue-500 border-blue-500/30" },
                  { value: "hot", label: "🔥 Hot / ពេញនិយម", color: "bg-red-500/15 text-red-500 border-red-500/30" },
                  { value: "popular", label: "⭐ Popular / កំពូល", color: "bg-amber-500/15 text-amber-500 border-amber-500/30" },
                  { value: "best-seller", label: "🏆 Best Seller / លក់ដាច់", color: "bg-emerald-500/15 text-emerald-500 border-emerald-500/30" },
                  { value: "limited", label: "⏰ Limited / មានកំណត់", color: "bg-purple-500/15 text-purple-500 border-purple-500/30" },
                  { value: "recommended", label: "👍 Recommended / ណែនាំ", color: "bg-sky-500/15 text-sky-500 border-sky-500/30" },
                  { value: "organic", label: "🌿 Organic / ធម្មជាតិ", color: "bg-green-500/15 text-green-500 border-green-500/30" },
                  { value: "imported", label: "✈️ Imported / នាំចូល", color: "bg-violet-500/15 text-violet-500 border-violet-500/30" },
                ].map(b => (
                  <button
                    key={b.value}
                    type="button"
                    onClick={() => updateProductField("badge", productForm.badge === b.value ? "" : b.value)}
                    className={cn(
                      "px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors",
                      productForm.badge === b.value
                        ? b.color
                        : "bg-muted/30 text-muted-foreground border-border/50 hover:bg-muted/50"
                    )}
                  >
                    {b.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Sort Order</Label>
                <Input
                  type="text"
                  inputMode="numeric"
                  value={productForm.sort_order === 0 ? "0" : productForm.sort_order || ""}
                  onChange={e => {
                    const normalized = normalizeLocalizedNumberInput(e.target.value);
                    const val = normalized.replace(/[^0-9]/g, "");
                    updateProductField("sort_order", val === "" ? "" : parseInt(val, 10) || 0);
                  }}
                  onBlur={e => {
                    if (e.target.value === "") updateProductField("sort_order", 0);
                  }}
                />
              </div>
              <div className="flex items-center gap-3 pt-6">
                <Switch checked={productForm.in_stock} onCheckedChange={v => updateProductField("in_stock", v)} />
                <Label>In Stock</Label>
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setProductDialog(false)}>Cancel</Button>
            <Button
              variant="secondary"
              onClick={() => {
                if (!productForm.name || productForm.price <= 0) {
                  toast.error("Name and price are required");
                  return;
                }
                saveProduct.mutate(true);
              }}
              disabled={saveProduct.isPending}
            >
              {saveProduct.isPending ? "Saving..." : "Save"}
            </Button>
            <Button
              onClick={() => {
                if (!productForm.name || productForm.price <= 0) {
                  toast.error("Name and price are required");
                  return;
                }
                saveProduct.mutate(false);
              }}
              disabled={saveProduct.isPending}
            >
              {saveProduct.isPending ? "Saving..." : editingProduct ? "Update & Close" : "Add & Close"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Product Confirmation */}
      <Dialog open={!!deleteProductId} onOpenChange={() => setDeleteProductId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Product</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground">Are you sure? This cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteProductId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deleteProductId && deleteProduct.mutate(deleteProductId)} disabled={deleteProduct.isPending}>
              {deleteProduct.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Post Dialog */}
      <Dialog open={postDialog} onOpenChange={(open) => {
        setPostDialog(open);
        if (!open) resetPostState();
      }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>{postMediaMode === "video" ? t("admin.store.add_video_post") : t("admin.store.add_photo_post")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2 overflow-y-auto pr-1 max-h-[calc(90vh-11rem)]">
            <div className="space-y-2">
              <Label>{t("admin.store.post_caption")}</Label>
              <Textarea
                value={postCaption}
                onChange={e => setPostCaption(e.target.value)}
                placeholder={t("admin.store.post_caption_placeholder")}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>{t("admin.store.post_media")}</Label>
              <div className={cn(
                postMediaMode === "video"
                  ? "grid grid-cols-2 gap-3"
                  : "grid grid-cols-3 gap-2"
              )}>
                {postMediaItems.map((preview, i) => (
                  <div key={`${preview.previewUrl}-${i}`}>
                    <div className="relative overflow-hidden rounded-lg border border-border bg-muted/20">
                      {preview.isVideo ? (
                        <AdminVideoPreview
                          src={preview.previewUrl}
                          className="rounded-lg"
                          videoClassName="rounded-lg bg-muted object-contain"
                          controls
                          muted
                          autoPlay
                          loop
                        />
                      ) : (
                        <img
                          src={preview.previewUrl}
                          alt="Post preview"
                          className="w-full rounded-lg object-cover"
                          style={{ aspectRatio: "1 / 1" }}
                        />
                      )}
                      <button
                        type="button"
                        onClick={() => removePostMedia(i)}
                        className="absolute right-1 top-1 z-10 rounded-full bg-destructive p-1 text-destructive-foreground"
                        aria-label="Remove media"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                      {preview.isUploading && (
                        <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-background/70 backdrop-blur-[1px]">
                          <Loader2 className="h-5 w-5 animate-spin text-primary" />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {postMediaItems.length < 10 && (
                  <button
                    type="button"
                    onClick={() => postMediaInputRef.current?.click()}
                    disabled={uploadingPostMedia}
                    className={cn(
                      "rounded-lg border-2 border-dashed border-border hover:border-primary/40 flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-primary transition-colors cursor-pointer",
                      postMediaMode === "video" ? "w-full" : "aspect-square"
                    )}
                    style={postMediaMode === "video" ? { aspectRatio: "9 / 16" } : undefined}
                  >
                    {uploadingPostMedia ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <>
                        <Camera className="h-5 w-5" />
                        <span className="text-[10px]">Add</span>
                      </>
                    )}
                  </button>
                )}
              </div>
              <input
                ref={replaceVideoInputRef}
                type="file"
                accept="video/*"
                className="hidden"
                onChange={e => {
                  const f = e.target.files?.[0];
                  if (f && replacingPostId) {
                    const post = posts.find((item: any) => item.id === replacingPostId);
                    if (post) {
                      void replacePostVideo(post, f);
                    } else {
                      setReplacingPostId(null);
                    }
                  } else {
                    setReplacingPostId(null);
                  }
                  e.target.value = "";
                }}
              />
              <input
                ref={postMediaInputRef}
                type="file"
                accept={postMediaMode === "video" ? "video/*" : "image/*"}
                className="hidden"
                onChange={e => {
                  const f = e.target.files?.[0];
                  if (f) uploadPostMedia(f);
                  e.target.value = "";
                }}
              />
              <p className="text-[10px] text-muted-foreground">Supports images (JPG, PNG) and videos (MP4, MOV). Max 10 files, 100 MB per video.</p>
            </div>
          </div>
          <DialogFooter className="border-t border-border pt-4">
            <Button variant="outline" onClick={() => { setPostDialog(false); }}>Cancel</Button>
            <Button
              onClick={() => savePost.mutate()}
              disabled={savePost.isPending || postMediaUrls.length === 0 || hasPendingPostUploads}
            >
              {savePost.isPending ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : null}
              {savePost.isPending ? "Posting..." : t("admin.store.add_post")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Post Confirmation */}
      <Dialog open={!!deletePostId} onOpenChange={() => setDeletePostId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("admin.store.delete_post")}</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground">Are you sure? This cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletePostId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deletePostId && deletePost.mutate(deletePostId)} disabled={deletePost.isPending}>
              {deletePost.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
