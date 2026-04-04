/**
 * AdminStoreEditPage - Full store management: edit profile, cover, logo, products
 */
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { useI18n } from "@/hooks/useI18n";
import { useSupportedLanguages } from "@/hooks/useGlobalExpansion";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";
import ffmpegWorkerUrl from "@ffmpeg/ffmpeg/worker?url";

const FFMPEG_CDN_BASE = "https://unpkg.com/@ffmpeg/core@0.12.10/dist/esm";
const ffmpegCoreUrl = `${FFMPEG_CDN_BASE}/ffmpeg-core.js`;
const ffmpegWasmUrl = `${FFMPEG_CDN_BASE}/ffmpeg-core.wasm`;
import { supabase } from "@/integrations/supabase/client";
import { normalizeStorePostMediaUrl } from "@/utils/normalizeStorePostMediaUrl";
import AdminLayout from "@/components/admin/AdminLayout";
import StoreOwnerLayout from "@/components/admin/StoreOwnerLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Save, Store, Image, Package, Plus, Edit, Trash2, Loader2, Eye, Upload, Camera, MapPin, ExternalLink, Globe, Check, Percent, DollarSign, CalendarIcon, Tag, Gift, Video, ImagePlus, RefreshCw, Replace, CheckCircle2, XCircle, MinusCircle, AlertTriangle, Move, X, Ruler, MessageCircle, CreditCard, Banknote, QrCode, Building2, Smartphone, Wallet, Car, Heart, Clock, Send, Users, Shield } from "lucide-react";
import StoreLiveChat from "@/components/grocery/StoreLiveChat";
import StorePaymentSection from "@/components/admin/StorePaymentSection";
import StoreCustomersSection from "@/components/admin/StoreCustomersSection";
import StoreMarketingSection from "@/components/admin/StoreMarketingSection";
import StoreOrdersSection from "@/components/admin/StoreOrdersSection";
import ManagedTagDropdown from "@/components/admin/ManagedTagDropdown";
import { cn } from "@/lib/utils";
import { STORE_CATEGORY_OPTIONS } from "@/config/groceryStores";
import StoreMapPicker from "@/components/admin/StoreMapPicker";
import React, { useState, useEffect, useRef, useCallback } from "react";
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

  // Seek to 10% of duration, at least 1.5 s, capped at 3 s — skips dark iPhone intros.
  const targetTime = Math.min(3, Math.max(video.duration * 0.1, 1.5));
  if (Math.abs(video.currentTime - targetTime) < 0.05) return;

  try {
    video.currentTime = targetTime;
  } catch {
    // Ignore seek failures on restrictive browsers.
  }
}

function captureVideoPosterFrame(
  video: HTMLVideoElement,
  setPosterUrl: (value: string | null | ((prev: string | null) => string | null)) => void,
  onCORSFailure?: () => void,
) {
  if (video.videoWidth === 0 || video.videoHeight === 0) return;
  // Don't capture the black frame that appears before the seek settles.
  if (video.currentTime < 0.5) return;

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
  } catch (err) {
    // On CORS canvas taint (SecurityError), request a blob-URL reload so the next
    // capture attempt can draw without cross-origin restrictions.
    if (err instanceof DOMException && err.name === "SecurityError") {
      onCORSFailure?.();
    }
  }
}

function looksPlayableVideoElement(video: HTMLVideoElement) {
  const hasDuration = Number.isFinite(video.duration) && video.duration > 0;
  const hasDimensions = video.videoWidth > 0 && video.videoHeight > 0;
  const hasDecodedFrame = video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA;

  return hasDuration && hasDimensions && hasDecodedFrame;
}

function AdminVideoPreview({
  src,
  className,
  videoClassName,
  controls = true,
  autoPlay = false,
  loop = false,
  muted = false,
  canRepair = false,
  onRepair,
}: {
  src: string;
  className?: string;
  videoClassName?: string;
  controls?: boolean;
  autoPlay?: boolean;
  loop?: boolean;
  muted?: boolean;
  canRepair?: boolean;
  onRepair?: (src: string) => Promise<string>;
}) {
  const [posterUrl, setPosterUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(src);
  const [isRepairing, setIsRepairing] = useState(false);
  const [isBlobLoading, setIsBlobLoading] = useState(false);
  const [triedBlobFallback, setTriedBlobFallback] = useState(false);
  const [blobSrc, setBlobSrc] = useState<string | null>(null);
  const [hasLoadedFrame, setHasLoadedFrame] = useState(false);
  const [recoveryStage, setRecoveryStage] = useState<"idle" | "blob" | "repair">("idle");
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    setPosterUrl((prev) => {
      if (prev?.startsWith("blob:")) URL.revokeObjectURL(prev);
      return null;
    });
    setIsPlaying(false);
    setCurrentSrc(src);
    setIsRepairing(false);
    setIsBlobLoading(false);
    setTriedBlobFallback(false);
    setHasLoadedFrame(false);
    setRecoveryStage("idle");
    setBlobSrc((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
  }, [src]);

  useEffect(() => {
    return () => {
      if (blobSrc) URL.revokeObjectURL(blobSrc);
    };
  }, [blobSrc]);

  useEffect(() => {
    if (!canRepair || blobSrc || triedBlobFallback) return;
    if (!/^https?:\/\//i.test(currentSrc)) return;

    // Capacitor iOS WebView is more reliable with same-origin blob URLs for remote videos.
    void tryBlobFallback(currentSrc);
  }, [blobSrc, canRepair, currentSrc, triedBlobFallback]);

  const tryBlobFallback = async (url: string) => {
    if (triedBlobFallback) return false;

    setTriedBlobFallback(true);
    setIsBlobLoading(true);
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch video preview.");

      const blob = await response.blob();
      setBlobSrc((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return URL.createObjectURL(blob);
      });
      setCurrentSrc(url);
      return true;
    } catch {
      return false;
    } finally {
      setIsBlobLoading(false);
    }
  };

  const tryAutoplay = useCallback((video: HTMLVideoElement) => {
    if (!autoPlay) return;
    video.muted = true;
    void video.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
  }, [autoPlay]);

  const runRecovery = useCallback(async () => {
    if (isRepairing || isBlobLoading) return;

    if (recoveryStage === "idle" && !blobSrc) {
      setRecoveryStage("blob");
      const blobWorked = await tryBlobFallback(currentSrc);
      if (blobWorked) return;
    }

    if (!canRepair || !onRepair || recoveryStage === "repair") return;

    setRecoveryStage("repair");
    setIsRepairing(true);
    try {
      const repairedSrc = await onRepair(src);
      setBlobSrc((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return null;
      });
      setCurrentSrc(repairedSrc);
    } catch {
      // ignore and keep current UI state
    } finally {
      setIsRepairing(false);
    }
  }, [blobSrc, canRepair, currentSrc, isBlobLoading, isRepairing, onRepair, recoveryStage, src]);

  // Give large videos (9+ MB) enough time to buffer before treating them as stalled.
  // The original 800 ms timeout caused unnecessary FFmpeg repair cycles on every load.
  useEffect(() => {
    if (!canRepair || hasLoadedFrame || recoveryStage === "repair" || isBlobLoading) return;

    const timeoutId = window.setTimeout(() => {
      const video = videoRef.current;
      // Only trigger recovery if the network has truly stalled or if dimensions are
      // missing after metadata loaded (iOS black-frame bug). NETWORK_LOADING means the
      // browser is actively downloading — do not interrupt that.
      const looksStalled =
        !video ||
        video.networkState === 3 /* NETWORK_STALLED */ ||
        (video.readyState >= HTMLMediaElement.HAVE_METADATA &&
          (video.videoWidth === 0 || video.videoHeight === 0));

      if (looksStalled) {
        void runRecovery();
      }
    }, autoPlay ? 4000 : 5000);

    return () => window.clearTimeout(timeoutId);
  }, [autoPlay, canRepair, hasLoadedFrame, isBlobLoading, recoveryStage, runRecovery]);
  const handlePlayToggle = () => {
    const vid = videoRef.current;
    if (!vid) return;
    if (vid.paused) {
      vid.muted = autoPlay ? true : muted;
      void vid.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    } else {
      vid.pause();
      setIsPlaying(false);
    }
  };

  return (
    <div className={cn("relative bg-black", className)}>
      <video
        key={blobSrc || currentSrc}
        ref={videoRef}
        src={blobSrc || (isBlobLoading ? undefined : currentSrc)}
        poster={posterUrl ?? undefined}
        className={cn("h-full w-full", videoClassName)}
        controls={controls}
        playsInline
        preload="auto"
        muted={muted}
        loop={loop}
        onLoadedMetadata={(event) => {
          event.currentTarget.muted = muted;
          ensureVisibleVideoFrame(event.currentTarget);
        }}
        onLoadedData={(event) => {
          setIsRepairing(false);
          setHasLoadedFrame(true);
          ensureVisibleVideoFrame(event.currentTarget);
          captureVideoPosterFrame(event.currentTarget, setPosterUrl, () => {
            if (!triedBlobFallback) void tryBlobFallback(currentSrc);
          });
          tryAutoplay(event.currentTarget);
        }}
        onCanPlay={(event) => {
          setIsRepairing(false);
          setHasLoadedFrame(true);
          // Don't capture here — the seek from onLoadedMetadata hasn't finished yet.
          // onSeeked will fire once the frame is at the seeked position.
          tryAutoplay(event.currentTarget);
        }}
        onSeeked={(event) => {
          setHasLoadedFrame(true);
          captureVideoPosterFrame(event.currentTarget, setPosterUrl, () => {
            if (!triedBlobFallback) void tryBlobFallback(currentSrc);
          });
          tryAutoplay(event.currentTarget);
        }}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => {
          if (!loop) setIsPlaying(false);
        }}
        onError={() => {
          setIsPlaying(false);
          if (isBlobLoading) return;
          void runRecovery();
        }}
      />
      {/* Tap-to-play/pause overlay — only when controls are hidden (grid thumbnails) */}
      {!controls && (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); handlePlayToggle(); }}
          className="absolute inset-0 z-[10] flex items-center justify-center cursor-pointer"
          aria-label={isPlaying ? "Pause" : "Play"}
        >
          {!isPlaying && (
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-background/70 shadow-lg backdrop-blur-sm">
              <svg width="20" height="22" viewBox="0 0 20 22" fill="none">
                <path d="M2 1L18 11L2 21V1Z" fill="hsl(var(--foreground))" />
              </svg>
            </div>
          )}
        </button>
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
  size_variants: [] as { size: string; price_khr: number; price_usd: number }[],
  // Car dealership fields
  car_make: "", car_model: "", car_year: "" as string, car_vin: "",
  car_mileage: "", car_transmission: "" as string, car_fuel_type: "" as string,
  car_color: "", car_condition: "" as string, car_engine: "", car_doors: "" as string,
  car_body_type: "" as string,
};

export default function AdminStoreEditPage() {
  const { storeId } = useParams<{ storeId: string }>();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const queryClient = useQueryClient();
  const { currentLanguage, changeLanguage, t } = useI18n();
  const { data: supportedLanguages } = useSupportedLanguages(true);
  const STORE_LANG_CODES = ["en", "km", "th", "vi", "ko", "zh"];
  const activeLanguages = (supportedLanguages || []).filter(l => l.is_active && STORE_LANG_CODES.includes(l.code));
  const currentLangData = activeLanguages.find(l => l.code === currentLanguage);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [savedBrands, setSavedBrands] = useState<string[]>([]);
  const [savedCategories, setSavedCategories] = useState<string[]>([]);
  const [customBydModels, setCustomBydModels] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem("zivo_custom_byd_models") || "[]"); } catch { return []; }
  });
  const [addingBydModel, setAddingBydModel] = useState(false);
  const [newBydModelName, setNewBydModelName] = useState("");
  const [chatOpen, setChatOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");

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
    facebook_url: "",
    booking_days: [] as string[],
    booking_start_time: "9:00 AM",
    booking_end_time: "5:00 PM",
    booking_duration: "30",
    booking_note: "",
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
        facebook_url: (store as any).facebook_url || "",
        booking_days: (store as any).booking_days || [],
        booking_start_time: (store as any).booking_start_time || "9:00 AM",
        booking_end_time: (store as any).booking_end_time || "5:00 PM",
        booking_duration: (store as any).booking_duration || "30",
        booking_note: (store as any).booking_note || "",
      });
    }
  }, [store]);

  const saveProfile = useMutation({
    mutationFn: async () => {
      const { rating, booking_days, booking_start_time, booking_end_time, booking_duration, booking_note, ...profileData } = form;
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
  const [productCategoryFilter, setProductCategoryFilter] = useState("");
  const [productDialog, setProductDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [productForm, setProductForm] = useState(emptyProduct);

  // Auto-draft: persist product form to localStorage
  const draftKey = `zivo_product_draft_${storeId}`;
  useEffect(() => {
    if (!productDialog || editingProduct) return;
    // Only save draft for new products with some data entered
    const hasData = productForm.name || productForm.price > 0 || productForm.price_khr > 0 || (productForm.image_urls || []).length > 0 || productForm.category || productForm.brand;
    if (hasData) {
      try { localStorage.setItem(draftKey, JSON.stringify(productForm)); } catch {}
    }
  }, [productForm, productDialog, editingProduct, draftKey]);

  const clearProductDraft = () => { try { localStorage.removeItem(draftKey); } catch {} };
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
  const [postHashtags, setPostHashtags] = useState("");
  const [postLocation, setPostLocation] = useState("");
  const [postScheduledAt, setPostScheduledAt] = useState<Date | undefined>(undefined);
  const [postScheduleTime, setPostScheduleTime] = useState("12:00");
  const [isScheduled, setIsScheduled] = useState(false);
  const [postMediaItems, setPostMediaItems] = useState<Array<{
    id: string;
    previewUrl: string;
    uploadedUrl?: string;
    isVideo: boolean;
    isUploading: boolean;
    progress: number;
    status: "uploading" | "done" | "error";
    error?: string;
    sourceFile?: File;
    duration?: number;
  }>>([]);
  const [uploadingPostMedia, setUploadingPostMedia] = useState(false);
  const [deletePostId, setDeletePostId] = useState<string | null>(null);
  const [viewPostId, setViewPostId] = useState<string | null>(null);
  const [editPostId, setEditPostId] = useState<string | null>(null);
  const [editCaption, setEditCaption] = useState("");
  const [editHashtags, setEditHashtags] = useState("");
  const [editLocation, setEditLocation] = useState("");
  const [newComment, setNewComment] = useState("");
  const [reprocessingPostId, setReprocessingPostId] = useState<string | null>(null);
  const [replacingPostId, setReplacingPostId] = useState<string | null>(null);
  const [postMediaMode, setPostMediaMode] = useState<"image" | "video">("image");
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const postMediaInputRef = useRef<HTMLInputElement>(null);
  const replaceVideoInputRef = useRef<HTMLInputElement>(null);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const ffmpegRef = useRef<FFmpeg | null>(null);
  const ffmpegLoadPromiseRef = useRef<Promise<FFmpeg> | null>(null);
  const repairedPreviewUrlsRef = useRef<Map<string, string>>(new Map());
  const postMediaProgressTimersRef = useRef<Map<string, number>>(new Map());

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
      postMediaProgressTimersRef.current.forEach((timerId) => {
        window.clearInterval(timerId);
      });
      postMediaProgressTimersRef.current.clear();
    };
  }, []);

  useEffect(() => {
    setUploadingPostMedia(postMediaItems.some((item) => item.isUploading));
  }, [postMediaItems]);

  const cleanupPreviews = () => {
    postMediaItems.forEach((p) => {
      if (p.previewUrl.startsWith("blob:")) URL.revokeObjectURL(p.previewUrl);
      const timerId = postMediaProgressTimersRef.current.get(p.id);
      if (timerId) window.clearInterval(timerId);
    });
    postMediaProgressTimersRef.current.clear();
  };

  const resetPostState = () => {
    setPostCaption("");
    setPostHashtags("");
    setPostLocation("");
    setPostScheduledAt(undefined);
    setPostScheduleTime("12:00");
    setIsScheduled(false);
    setDragOverIndex(null);
    setDraggingIndex(null);
    cleanupPreviews();
    setPostMediaItems([]);
  };

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const reorderMedia = (fromIndex: number, toIndex: number) => {
    setPostMediaItems((prev) => {
      const items = [...prev];
      const [moved] = items.splice(fromIndex, 1);
      items.splice(toIndex, 0, moved);
      return items;
    });
  };

  const updatePostMediaItem = (
    id: string,
    updater: (item: {
      id: string;
      previewUrl: string;
      uploadedUrl?: string;
      isVideo: boolean;
      isUploading: boolean;
      progress: number;
      status: "uploading" | "done" | "error";
      error?: string;
      sourceFile?: File;
    }) => {
      id: string;
      previewUrl: string;
      uploadedUrl?: string;
      isVideo: boolean;
      isUploading: boolean;
      progress: number;
      status: "uploading" | "done" | "error";
      error?: string;
      sourceFile?: File;
    },
  ) => {
    setPostMediaItems((prev) => prev.map((item) => (item.id === id ? updater(item) : item)));
  };

  const clearPostMediaProgressTimer = (id: string) => {
    const timerId = postMediaProgressTimersRef.current.get(id);
    if (timerId) {
      window.clearInterval(timerId);
      postMediaProgressTimersRef.current.delete(id);
    }
  };

  const startPostMediaProgressTimer = (id: string, target: number) => {
    clearPostMediaProgressTimer(id);

    const timerId = window.setInterval(() => {
      setPostMediaItems((prev) => prev.map((item) => {
        if (item.id !== id || !item.isUploading) return item;
        if (item.progress >= target) return item;

        const step = item.progress < 25 ? 4 : item.progress < 60 ? 2 : 1;
        return { ...item, progress: Math.min(target, item.progress + step) };
      }));
    }, 400);

    postMediaProgressTimersRef.current.set(id, timerId);
  };

  const withTimeout = async <T,>(promise: Promise<T>, timeoutMs: number, message: string) => {
    return await new Promise<T>((resolve, reject) => {
      const timeoutId = window.setTimeout(() => reject(new Error(message)), timeoutMs);

      promise
        .then((value) => {
          window.clearTimeout(timeoutId);
          resolve(value);
        })
        .catch((error) => {
          window.clearTimeout(timeoutId);
          reject(error);
        });
    });
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

        const timeoutId = window.setTimeout(() => finalize(false), 8000);

        video.preload = "auto";
        video.muted = true;
        video.playsInline = true;
        video.setAttribute("playsinline", "true");
        video.setAttribute("webkit-playsinline", "true");

        const confirmPlayable = () => {
          if (looksPlayableVideoElement(video)) {
            finalize(true);
          }
        };

        video.onloadeddata = confirmPlayable;
        video.oncanplay = confirmPlayable;
        video.oncanplaythrough = confirmPlayable;
        video.onseeked = confirmPlayable;

        video.onloadedmetadata = () => {
          const hasDuration = Number.isFinite(video.duration) && video.duration > 0;
          const hasDimensions = video.videoWidth > 0 && video.videoHeight > 0;

          if (!hasDuration || !hasDimensions) {
            finalize(false);
            return;
          }

          // Safari/iOS WebView may never fire canplaythrough for otherwise valid files.
          // Seek slightly forward to force a decodable frame before rejecting the upload.
          try {
            const targetTime = Math.min(0.1, Math.max(video.duration * 0.05, 0.05));
            if (Number.isFinite(targetTime) && targetTime > 0) {
              video.currentTime = targetTime;
            }
          } catch {
            window.setTimeout(confirmPlayable, 0);
          }
        };
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
        try {
          const blobCoreURL = await toBlobURL(ffmpegCoreUrl, "text/javascript");
          const blobWasmURL = await toBlobURL(ffmpegWasmUrl, "application/wasm");
          const blobWorkerURL = await toBlobURL(ffmpegWorkerUrl, "text/javascript");

          await ffmpeg.load({
            coreURL: blobCoreURL,
            wasmURL: blobWasmURL,
            workerURL: blobWorkerURL,
          });
        } catch (blobErr) {
          console.warn("[FFmpeg] Blob URL load failed, retrying with direct asset URLs:", blobErr);
          try {
            await ffmpeg.load({
              coreURL: ffmpegCoreUrl,
              wasmURL: ffmpegWasmUrl,
              workerURL: ffmpegWorkerUrl,
            });
          } catch (workerErr) {
            console.warn("[FFmpeg] Worker URL load failed, retrying without workerURL:", workerErr);
            await ffmpeg.load({
              coreURL: ffmpegCoreUrl,
              wasmURL: ffmpegWasmUrl,
            });
          }
        }
        ffmpegRef.current = ffmpeg;
        return ffmpeg;
      })().catch((error) => {
        ffmpegLoadPromiseRef.current = null;
        throw error;
      });
    }

    return ffmpegLoadPromiseRef.current;
  };

  const transcodeVideoWithMediaRecorder = async (file: File): Promise<File | null> => {
    if (typeof MediaRecorder === "undefined") return null;

    const objectUrl = URL.createObjectURL(file);
    const video = document.createElement("video");
    video.preload = "auto";
    video.muted = false;
    video.defaultMuted = false;
    video.volume = 1;
    video.playsInline = true;
    video.src = objectUrl;

    const mimeCandidates = [
      'video/mp4;codecs="avc1.42E01E,mp4a.40.2"',
      "video/mp4",
    ];
    const mimeType = mimeCandidates.find((candidate) => MediaRecorder.isTypeSupported(candidate));
    if (!mimeType) {
      URL.revokeObjectURL(objectUrl);
      return null;
    }

    try {
      await new Promise<void>((resolve, reject) => {
        const timeoutId = window.setTimeout(() => reject(new Error("metadata timeout")), 8000);
        video.onloadedmetadata = () => {
          window.clearTimeout(timeoutId);
          resolve();
        };
        video.onerror = () => {
          window.clearTimeout(timeoutId);
          reject(new Error("video load failed"));
        };
        video.load();
      });

      const stream = (video as any).captureStream?.() || (video as any).mozCaptureStream?.();
      if (!stream) return null;

      const hasAudioTrack = stream.getAudioTracks().length > 0;

      const chunks: BlobPart[] = [];
      const recorder = new MediaRecorder(stream, {
        mimeType,
        videoBitsPerSecond: 2_000_000,
      });

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) chunks.push(event.data);
      };

      const stopped = new Promise<void>((resolve, reject) => {
        recorder.onstop = () => resolve();
        recorder.onerror = () => reject(new Error("recording failed"));
      });

      recorder.start(300);
      await video.play();

      await new Promise<void>((resolve) => {
        video.onended = () => resolve();
      });

      if (recorder.state !== "inactive") recorder.stop();
      await stopped;

      const blob = new Blob(chunks, { type: mimeType });
      if (blob.size === 0) return null;

      const output = new File([blob], `video-rec-${Date.now()}.mp4`, {
        type: "video/mp4",
        lastModified: Date.now(),
      });

      const playable = await probeVideoFile(output).catch(() => false);
      if (!playable || !hasAudioTrack) return null;
      return output;
    } finally {
      video.pause();
      video.removeAttribute("src");
      video.load();
      URL.revokeObjectURL(objectUrl);
    }
  };

  const transcodeVideoForBrowser = async (file: File) => {
    try {
      const ffmpeg = await ensureFFmpegLoaded();
      const inputName = `input-${Date.now()}.mp4`;
      const outputName = `output-${Date.now()}.mp4`;

      await ffmpeg.writeFile(inputName, await fetchFile(file));

      try {
        // Simplified pipeline — minimal filters to avoid crashes
        await ffmpeg.exec([
          "-i", inputName,
          "-map", "0:v:0",
          "-map", "0:a:0?",
          "-movflags", "+faststart",
          "-pix_fmt", "yuv420p",
          "-c:v", "libx264",
          "-preset", "ultrafast",
          "-profile:v", "baseline",
          "-level", "3.0",
          "-c:a", "aac",
          "-profile:a", "aac_low",
          "-ar", "44100",
          "-ac", "2",
          "-b:a", "128k",
          "-y",
          outputName,
        ]);

        const data = await ffmpeg.readFile(outputName);
        if (!(data instanceof Uint8Array)) {
          throw new Error("Failed to read transcoded video output.");
        }

        const normalizedBuffer = new ArrayBuffer(data.byteLength);
        new Uint8Array(normalizedBuffer).set(data);

        return new File([normalizedBuffer], `video-${Date.now()}.mp4`, {
          type: "video/mp4",
          lastModified: Date.now(),
        });
      } finally {
        await Promise.allSettled([
          ffmpeg.deleteFile(inputName),
          ffmpeg.deleteFile(outputName),
        ]);
      }
    } catch (error) {
      console.warn("[PostMedia] FFmpeg transcode failed, trying MediaRecorder fallback:", error);
      const fallback = await transcodeVideoWithMediaRecorder(file);
      if (fallback) return fallback;
      throw error;
    }
  };

  const normalizeVideoAudioForBrowser = async (file: File) => {
    const ffmpeg = await ensureFFmpegLoaded();
    const inputName = `input-audio-fix-${Date.now()}.mp4`;
    const outputName = `output-audio-fix-${Date.now()}.mp4`;

    await ffmpeg.writeFile(inputName, await fetchFile(file));

    try {
      await ffmpeg.exec([
        "-i", inputName,
        "-map", "0:v:0",
        "-map", "0:a:0?",
        "-movflags", "+faststart",
        "-c:v", "copy",
        "-c:a", "aac",
        "-profile:a", "aac_low",
        "-ar", "44100",
        "-ac", "2",
        "-b:a", "128k",
        "-y",
        outputName,
      ]);

      const data = await ffmpeg.readFile(outputName);
      if (!(data instanceof Uint8Array)) {
        throw new Error("Failed to read audio-normalized video output.");
      }

      const normalizedBuffer = new ArrayBuffer(data.byteLength);
      new Uint8Array(normalizedBuffer).set(data);

      return new File([normalizedBuffer], `video-audio-fixed-${Date.now()}.mp4`, {
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

  const stripVideoAudioForPreview = async (file: File) => {
    const ffmpeg = await ensureFFmpegLoaded();
    const inputName = `input-mute-fix-${Date.now()}.mp4`;
    const outputName = `output-mute-fix-${Date.now()}.mp4`;

    await ffmpeg.writeFile(inputName, await fetchFile(file));

    try {
      await ffmpeg.exec([
        "-i", inputName,
        "-movflags", "+faststart",
        "-c:v", "copy",
        "-an",
        "-y",
        outputName,
      ]);

      const data = await ffmpeg.readFile(outputName);
      if (!(data instanceof Uint8Array)) {
        throw new Error("Failed to read muted preview video output.");
      }

      const normalizedBuffer = new ArrayBuffer(data.byteLength);
      new Uint8Array(normalizedBuffer).set(data);

      return new File([normalizedBuffer], `video-muted-${Date.now()}.mp4`, {
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

  const normalizeVideoUpload = async (file: File, _options?: { silent?: boolean }) => {
    toast.info("Converting video to reel-safe format...");

    // Conversion-first strategy: always target MP4/H.264 baseline for iOS webview reliability.
    try {
      const transcoded = await withTimeout(transcodeVideoForBrowser(file), 45000, "Transcode timeout");
      const playable = await probeVideoFile(transcoded);
      if (playable) return transcoded;
      console.warn("[PostMedia] Transcoded output failed browser probe; using converted MP4 anyway.");
      return transcoded;
    } catch (error) {
      console.warn("[PostMedia] Primary transcode failed:", error);
    }

    try {
      const normalized = await withTimeout(normalizeVideoAudioForBrowser(file), 25000, "Audio normalize timeout");
      const playable = await probeVideoFile(normalized);
      if (playable) return normalized;
      console.warn("[PostMedia] Audio-normalized output failed browser probe; using converted MP4 anyway.");
      return normalized;
    } catch (error) {
      console.warn("[PostMedia] Audio normalize failed:", error);
    }

    const originalLooksUsable = await new Promise<boolean>((resolve) => {
      const objectUrl = URL.createObjectURL(file);
      const video = document.createElement("video");
      const finalize = (result: boolean) => {
        video.removeAttribute("src");
        video.load();
        URL.revokeObjectURL(objectUrl);
        resolve(result);
      };
      const timeoutId = window.setTimeout(() => finalize(false), 5000);

      video.preload = "metadata";
      video.muted = true;
      video.playsInline = true;
      video.onloadedmetadata = () => {
        window.clearTimeout(timeoutId);
        const ok = Number.isFinite(video.duration) && video.duration > 0 && video.videoWidth > 0 && video.videoHeight > 0;
        finalize(ok);
      };
      video.onerror = () => {
        window.clearTimeout(timeoutId);
        finalize(false);
      };
      video.src = objectUrl;
      video.load();
    });

    if (originalLooksUsable && /^(video\/mp4|video\/quicktime)$/i.test(file.type || "")) {
      console.warn("[PostMedia] Falling back to original upload after conversion attempts failed.");
      return file;
    }

    // Last-resort fallback: still allow upload so the merchant can post and reprocess later.
    // This avoids blocking valid-but-strictly-probed videos in iOS WebView environments.
    console.warn("[PostMedia] Falling back to original file after all normalization attempts.");
    return file;
  };

  const repairVideoPreviewSource = async (url: string) => {
    const normalizedUrl = normalizeStorePostMediaUrl(url);
    const cached = repairedPreviewUrlsRef.current.get(normalizedUrl);
    if (cached) return cached;

    const response = await fetch(normalizedUrl);
    if (!response.ok) {
      // Can't download — just return the original URL as blob fallback
      return normalizedUrl;
    }

    const blob = await response.blob();
    const file = new File([blob], "preview-repair.mp4", { type: blob.type || "video/mp4" });

    // Try fixing audio first, then full transcode
    let repairedFile: File | null = null;
    try {
      repairedFile = await withTimeout(normalizeVideoAudioForBrowser(file), 20000, "Audio normalize timeout");
      const isPlayable = await probeVideoFile(repairedFile);
      if (!isPlayable) repairedFile = null;
    } catch {
      repairedFile = null;
    }

    if (!repairedFile) {
      try {
        repairedFile = await withTimeout(transcodeVideoForBrowser(file), 45000, "Transcode timeout");
      } catch {
        repairedFile = null;
      }
    }

    // If all repair attempts failed, return a blob URL of the original download
    if (!repairedFile) {
      const fallbackUrl = URL.createObjectURL(blob);
      repairedPreviewUrlsRef.current.set(normalizedUrl, fallbackUrl);
      return fallbackUrl;
    }

    const repairedUrl = URL.createObjectURL(repairedFile);
    repairedPreviewUrlsRef.current.set(normalizedUrl, repairedUrl);
    return repairedUrl;
  };

  const videoHasAudioTrack = async (file: File) => {
    try {
      const ffmpeg = await ensureFFmpegLoaded();
      const inputName = `input-audio-check-${Date.now()}.mp4`;

      await ffmpeg.writeFile(inputName, await fetchFile(file));
      try {
        await ffmpeg.ffprobe([
          "-v", "error",
          "-select_streams", "a",
          "-show_entries", "stream=codec_type",
          "-of", "csv=p=0",
          inputName,
        ]);
        const output = await ffmpeg.readFile("ffprobe_output");
        const text = output instanceof Uint8Array ? new TextDecoder().decode(output).trim() : "";
        return text.length > 0;
      } finally {
        await Promise.allSettled([
          ffmpeg.deleteFile(inputName),
          ffmpeg.deleteFile("ffprobe_output"),
        ]);
      }
    } catch {
      return true;
    }
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
    setPostMediaItems(prev => [...prev, {
      id: mediaItemId,
      previewUrl: localPreviewUrl,
      isVideo: fileIsVideo,
      isUploading: true,
      progress: 1,
      status: "uploading",
      sourceFile: file,
    }]);
    startPostMediaProgressTimer(mediaItemId, fileIsVideo ? 42 : 78);

    try {
      const uploadFile = fileIsVideo ? await normalizeVideoUpload(file) : file;
      if (fileIsVideo) {
        startPostMediaProgressTimer(mediaItemId, 85);
        // Capture video duration
        try {
          const tempVideo = document.createElement("video");
          tempVideo.preload = "metadata";
          tempVideo.src = localPreviewUrl;
          await new Promise<void>((resolve) => {
            tempVideo.onloadedmetadata = () => {
              if (Number.isFinite(tempVideo.duration)) {
                setPostMediaItems(prev => prev.map(item => item.id === mediaItemId ? { ...item, duration: tempVideo.duration } : item));
              }
              resolve();
            };
            tempVideo.onerror = () => resolve();
            setTimeout(resolve, 3000);
          });
        } catch { /* ignore duration capture failures */ }
      }

      const ext = uploadFile.name.split(".").pop() || "jpg";
      const path = `posts/${storeId}/${Date.now()}-${mediaItemId}.${ext}`;
      console.log("[PostMedia] uploading to storage path:", path);
      const { error: upErr, data: uploadData } = await supabase.storage.from("store-posts").upload(path, uploadFile, {
        upsert: true,
        contentType: uploadFile.type || undefined,
      });
      console.log("[PostMedia] upload result:", { error: upErr, data: uploadData });
      if (upErr) throw upErr;
      const { data: urlData } = supabase.storage.from("store-posts").getPublicUrl(path);
      console.log("[PostMedia] publicUrl:", urlData.publicUrl);
      clearPostMediaProgressTimer(mediaItemId);
      setPostMediaItems(prev => prev.map((item) => item.id === mediaItemId ? {
        ...item,
        uploadedUrl: urlData.publicUrl,
        isUploading: false,
        progress: 100,
        status: "done",
        error: undefined,
      } : item));
    } catch (e: any) {
      clearPostMediaProgressTimer(mediaItemId);
      const errorMessage = e.message || "This video format could not be prepared for web playback.";
      updatePostMediaItem(mediaItemId, (item) => ({
        ...item,
        isUploading: false,
        progress: 100,
        status: "error",
        error: errorMessage,
      }));
      console.error("[PostMedia] upload error:", e);
      toast.error(errorMessage);
    }
  };

  const retryPostMedia = async (id: string) => {
    const currentItem = postMediaItems.find((item) => item.id === id);
    if (!currentItem?.sourceFile) {
      toast.error("Please add the video again.");
      return;
    }

    setPostMediaItems((prev) => prev.filter((item) => item.id !== id));
    if (currentItem.previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(currentItem.previewUrl);
    }
    clearPostMediaProgressTimer(id);
    await uploadPostMedia(currentItem.sourceFile);
  };

  const removePostMedia = (index: number) => {
    setPostMediaItems(prev => {
      const preview = prev[index];
      if (preview?.previewUrl.startsWith("blob:")) URL.revokeObjectURL(preview.previewUrl);
      if (preview?.id) clearPostMediaProgressTimer(preview.id);
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

      // Parse hashtags from dedicated field and caption
      const tagsFromField = postHashtags.match(/#[\w\u1780-\u17FF]+/g) || [];
      const tagsFromCaption = postCaption.match(/#[\w\u1780-\u17FF]+/g) || [];
      const allTags = [...new Set([...tagsFromField, ...tagsFromCaption].map(t => t.toLowerCase()))];

      // Build scheduled timestamp
      let scheduledTimestamp: string | null = null;
      if (isScheduled && postScheduledAt) {
        const [hours, minutes] = postScheduleTime.split(":").map(Number);
        const scheduled = new Date(postScheduledAt);
        scheduled.setHours(hours || 0, minutes || 0, 0, 0);
        if (scheduled <= new Date()) throw new Error("Scheduled time must be in the future");
        scheduledTimestamp = scheduled.toISOString();
      }

      const insertPayload = {
        store_id: storeId!,
        caption: postCaption || null,
        media_urls: postMediaUrls,
        media_type: postMediaMode === "video" ? "video" : "image",
        hashtags: allTags.length > 0 ? allTags : [],
        location: postLocation || null,
        scheduled_at: scheduledTimestamp,
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
      toast.success(isScheduled ? "Post scheduled!" : "Post created!");
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

  // Edit post mutation
  const editPost = useMutation({
    mutationFn: async () => {
      if (!editPostId) throw new Error("No post selected");
      const tagsFromField = editHashtags.match(/#[\w\u1780-\u17FF]+/g) || [];
      const tagsFromCaption = editCaption.match(/#[\w\u1780-\u17FF]+/g) || [];
      const allTags = [...new Set([...tagsFromField, ...tagsFromCaption].map(t => t.toLowerCase()))];
      const { error } = await supabase.from("store_posts").update({
        caption: editCaption || null,
        hashtags: allTags,
        location: editLocation || null,
      } as any).eq("id", editPostId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-store-posts", storeId] });
      setEditPostId(null);
      toast.success("Post updated!");
    },
    onError: (e: any) => toast.error(e.message),
  });

  // Comments query
  const { data: postComments = [] } = useQuery({
    queryKey: ["post-comments", viewPostId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("store_post_comments")
        .select("*")
        .eq("post_id", viewPostId!)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!viewPostId,
  });

  // Add comment mutation
  const addComment = useMutation({
    mutationFn: async () => {
      if (!viewPostId || !newComment.trim()) throw new Error("Empty comment");
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase.from("store_post_comments").insert({
        post_id: viewPostId,
        user_id: user.id,
        content: newComment.trim(),
      } as any);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["post-comments", viewPostId] });
      queryClient.invalidateQueries({ queryKey: ["admin-store-posts", storeId] });
      setNewComment("");
      toast.success("Comment added");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const deleteComment = useMutation({
    mutationFn: async (commentId: string) => {
      const { error } = await supabase.from("store_post_comments").delete().eq("id", commentId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["post-comments", viewPostId] });
      queryClient.invalidateQueries({ queryKey: ["admin-store-posts", storeId] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  const openEditPost = (post: any) => {
    setEditPostId(post.id);
    setEditCaption(post.caption || "");
    setEditHashtags((post.hashtags || []).join(" "));
    setEditLocation(post.location || "");
  };


  const reprocessPostVideo = async (post: any) => {
    if (reprocessingPostId) return;
    setReprocessingPostId(post.id);
    try {
      const allUrls: string[] = post.media_urls || [];
      const videoUrls = allUrls.filter((u: string) =>
        isVideoUrl(normalizeStorePostMediaUrl(u))
      );
      if (videoUrls.length === 0) {
        toast.error("No video files found in this post");
        return;
      }

      const newUrls: string[] = [];
      for (const url of allUrls) {
        if (!isVideoUrl(normalizeStorePostMediaUrl(url))) {
          newUrls.push(url);
          continue;
        }

        const normalizedUrl = normalizeStorePostMediaUrl(url);
        toast.info("Step 1/3: Downloading video...");
        const resp = await fetch(normalizedUrl);
        if (!resp.ok) throw new Error(`Download failed (${resp.status}): ${normalizedUrl}`);
        const blob = await resp.blob();
        const originalFile = new File([blob], "reprocess.mp4", { type: blob.type || "video/mp4" });

        const hasAudio = await videoHasAudioTrack(originalFile);
        if (!hasAudio) {
          throw new Error("This stored video has no audio track anymore. Please replace it with the original video file to restore sound.");
        }

        toast.info("Step 2/3: Converting to iOS-compatible format...");
        const transcodedFile = await transcodeVideoForBrowser(originalFile);

        toast.info("Step 3/3: Uploading fixed video...");
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
      toast.success("✅ Video fixed! It should now play in the feed.");
    } catch (e: any) {
      console.error("[reprocessPostVideo] failed:", e);
      toast.error(`Fix failed: ${e?.message || "Unknown error"}`);
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
    // Restore draft if available
    try {
      const draft = localStorage.getItem(draftKey);
      if (draft) {
        const parsed = JSON.parse(draft);
        setProductForm({ ...emptyProduct, ...parsed });
        toast.info("Draft restored — continue where you left off");
      } else {
        setProductForm(emptyProduct);
      }
    } catch {
      setProductForm(emptyProduct);
    }
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
      size_variants: (p.size_variants as any[]) || [],
      car_make: p.car_make || "", car_model: p.car_model || "", car_year: p.car_year || "",
      car_vin: p.car_vin || "", car_mileage: p.car_mileage || "", car_transmission: p.car_transmission || "",
      car_fuel_type: p.car_fuel_type || "", car_color: p.car_color || "", car_condition: p.car_condition || "",
      car_engine: p.car_engine || "", car_doors: p.car_doors || "", car_body_type: p.car_body_type || "",
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
      clearProductDraft();
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

  const employeeTitles: Record<string, string> = { employees: "Employees", payroll: "Payroll", "employee-schedule": "Employee Schedule", "time-clock": "Time Clock", "employee-rules": "Employee Rules" };
  const storeOwnerTitle = employeeTitles[activeTab] || (activeTab === "orders" ? "Orders" : activeTab === "products" ? "Products" : activeTab === "payment" ? (form.category === "car-dealership" ? t("admin.store.booking_appointment") : t("admin.store.payment")) : activeTab === "customers" ? "Customers" : activeTab === "marketing" ? "Marketing & Ads" : activeTab === "settings" ? "Settings" : `Edit: ${store?.name || "Store"}`);
  const Layout = isAdmin ? AdminLayout : ({ children, title }: { children: React.ReactNode; title: string }) => (
    <StoreOwnerLayout title={storeOwnerTitle} storeId={storeId} storeName={store?.name} storeLogoUrl={store?.logo_url} activeTab={activeTab} onTabChange={setActiveTab} productCount={products?.length}>{children}</StoreOwnerLayout>
  );

  if (isLoading) {
    return (
      <Layout title="Edit Store">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!store) {
    return (
      <Layout title="Store Not Found">
        <div className="text-center py-20 space-y-4">
          <p className="text-muted-foreground">Store not found</p>
          <Button onClick={() => navigate(isAdmin ? "/admin/stores" : "/")} variant="outline">
            {isAdmin ? "Back to Stores" : "Back to Home"}
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <>
    <Layout title={`Edit: ${store.name}`}>
      <div className="space-y-6">
        {(isAdmin || activeTab === "profile") && (<>
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
        </>)}

        {(isAdmin || activeTab === "profile") && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="icon" onClick={() => navigate(isAdmin ? "/admin/stores" : "/")}>
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

            <Button onClick={() => setChatOpen(true)} variant="outline" className="gap-2">
              <MessageCircle className="h-4 w-4" /> Live Chat
            </Button>
            <Button onClick={() => navigate(`/grocery/shop/${store.slug}`)} variant="outline" className="gap-2">
              <Eye className="h-4 w-4" /> {t("admin.store.preview")}
            </Button>
          </div>
        </div>
        )}

        {false && (<>
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
              {galleryImages.map((url, i) => {
                const isRepos = repositioningGalleryIdx === i;
                const pos = galleryPositions[url] ?? 50;
                return (
                <div
                  key={i}
                  className={cn("relative group aspect-video rounded-xl overflow-hidden border border-border bg-muted", isRepos && "cursor-grab active:cursor-grabbing ring-2 ring-primary")}
                  onMouseDown={isRepos ? (e) => { e.preventDefault(); setGalleryDragStartY(e.clientY); setGalleryDragStartPos(pos); } : undefined}
                  onMouseMove={isRepos && galleryDragStartY !== null ? (e) => {
                    const deltaY = e.clientY - galleryDragStartY;
                    const newPos = Math.max(0, Math.min(100, galleryDragStartPos - (deltaY / 120) * 100));
                    setGalleryPositions(prev => ({ ...prev, [url]: Math.round(newPos) }));
                  } : undefined}
                  onMouseUp={isRepos ? () => setGalleryDragStartY(null) : undefined}
                  onMouseLeave={isRepos ? () => setGalleryDragStartY(null) : undefined}
                  onTouchStart={isRepos ? (e) => { setGalleryDragStartY(e.touches[0].clientY); setGalleryDragStartPos(pos); } : undefined}
                  onTouchMove={isRepos ? (e) => {
                    if (galleryDragStartY === null) return;
                    const deltaY = e.touches[0].clientY - galleryDragStartY;
                    const newPos = Math.max(0, Math.min(100, galleryDragStartPos - (deltaY / 120) * 100));
                    setGalleryPositions(prev => ({ ...prev, [url]: Math.round(newPos) }));
                  } : undefined}
                  onTouchEnd={isRepos ? () => setGalleryDragStartY(null) : undefined}
                >
                  <img src={url} alt={`Gallery ${i + 1}`} className="w-full h-full object-cover select-none" draggable={false} style={{ objectPosition: `center ${pos}%` }} />
                  {isRepos && (
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center pointer-events-none">
                      <div className="bg-background/90 backdrop-blur-sm rounded-md px-2 py-1 text-[10px] font-medium text-foreground shadow flex items-center gap-1">
                        <Move className="h-3 w-3" /> Drag up/down
                      </div>
                    </div>
                  )}
                  {isRepos ? (
                    <div className="absolute top-1.5 right-1.5 flex gap-1">
                      <button
                        onClick={async () => {
                          setRepositioningGalleryIdx(null);
                          const { error } = await supabase.from("store_profiles").update({ gallery_positions: galleryPositions } as any).eq("id", storeId!);
                          if (error) toast.error(error.message);
                          else toast.success("Position saved");
                        }}
                        className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg"
                      >
                        <Check className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => {
                          setRepositioningGalleryIdx(null);
                          setGalleryPositions(prev => ({ ...prev, [url]: galleryDragStartPos }));
                        }}
                        className="h-6 w-6 rounded-full bg-muted text-foreground flex items-center justify-center shadow-lg border border-border"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="absolute top-1.5 right-1.5 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => { setRepositioningGalleryIdx(i); setGalleryDragStartPos(pos); }}
                        className="h-6 w-6 rounded-full bg-background/80 backdrop-blur-sm text-foreground flex items-center justify-center shadow-lg border border-border"
                      >
                        <Move className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => removeGalleryImage(i)}
                        className="h-6 w-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center shadow-lg"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                </div>
                );
              })}
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

        {/* ── Feed Posts ── */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Camera className="h-4 w-4" /> Feed Posts
              <Badge variant="secondary" className="text-[10px]">{posts.length}</Badge>
            </CardTitle>
            <p className="text-xs text-muted-foreground">Create posts like Facebook & TikTok — photos, videos, and reels for your store</p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => { setPostMediaMode("image"); setPostDialog(true); }}
                className="group relative flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-border bg-muted/30 p-6 transition-all duration-200 hover:border-primary/50 hover:bg-primary/5 hover:shadow-md active:scale-[0.98]"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 transition-colors group-hover:bg-emerald-500/20">
                  <ImagePlus className="h-6 w-6" />
                </div>
                <div className="text-center">
                  <span className="block text-sm font-semibold text-foreground">📷 Photo Post</span>
                  <span className="block text-[11px] text-muted-foreground mt-0.5">JPG, PNG, WebP</span>
                </div>
              </button>
              <button
                type="button"
                onClick={() => { setPostMediaMode("video"); setPostDialog(true); }}
                className="group relative flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-border bg-muted/30 p-6 transition-all duration-200 hover:border-primary/50 hover:bg-primary/5 hover:shadow-md active:scale-[0.98]"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 transition-colors group-hover:bg-blue-500/20">
                  <Video className="h-6 w-6" />
                </div>
                <div className="text-center">
                  <span className="block text-sm font-semibold text-foreground">🎬 Video Post</span>
                  <span className="block text-[11px] text-muted-foreground mt-0.5">MP4, MOV, WebM</span>
                </div>
              </button>
            </div>

            {/* Existing posts list */}
            {posts.length > 0 && (
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Recent Posts</p>
                  <span className="text-[10px] text-muted-foreground">{posts.length} total</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {posts.slice(0, 12).map((post: any) => {
                    const firstUrl = (post.media_urls || [])[0];
                    const mediaCount = (post.media_urls || []).length;
                    const isVideo = firstUrl && isVideoUrl(normalizeStorePostMediaUrl(firstUrl));
                    const postDate = post.created_at ? format(new Date(post.created_at), "MMM d") : "";
                    return (
                      <div key={post.id} className="relative group rounded-xl overflow-hidden border border-border bg-card shadow-sm hover:shadow-md transition-shadow">
                        {/* Thumbnail */}
                        <div className="aspect-square relative cursor-pointer" onClick={() => setViewPostId(post.id)}>
                          {isVideo && firstUrl ? (
                            <AdminVideoPreview
                              src={normalizeStorePostMediaUrl(firstUrl)}
                              className="h-full w-full"
                              videoClassName="h-full w-full object-cover"
                              controls={false}
                              muted
                              loop
                              autoPlay={false}
                              canRepair
                              onRepair={repairVideoPreviewSource}
                            />
                          ) : firstUrl ? (
                            <img src={normalizeStorePostMediaUrl(firstUrl)} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-muted">
                              <ImagePlus className="h-5 w-5 text-muted-foreground" />
                            </div>
                          )}
                          {/* Reprocessing overlay */}
                          {isVideo && reprocessingPostId === post.id && (
                            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-2 bg-black/70">
                              <RefreshCw className="h-8 w-8 text-white animate-spin" />
                              <span className="text-[11px] text-white font-medium text-center px-2">Converting video...</span>
                            </div>
                          )}
                          {/* Overlay badges */}
                          <div className="absolute top-1.5 left-1.5 z-10 flex items-center gap-1">
                            {isVideo && (
                              <div className="rounded-md bg-background/80 backdrop-blur-sm px-1.5 py-0.5 flex items-center gap-0.5">
                                <Video className="h-2.5 w-2.5 text-foreground" />
                              </div>
                            )}
                            {mediaCount > 1 && (
                              <div className="rounded-md bg-background/80 backdrop-blur-sm px-1.5 py-0.5">
                                <span className="text-[9px] font-medium text-foreground">{mediaCount} files</span>
                              </div>
                            )}
                          </div>
                          {post.scheduled_at && new Date(post.scheduled_at) > new Date() && (
                            <div className="absolute top-1.5 right-1.5 z-10 rounded-md bg-accent/90 backdrop-blur-sm px-1.5 py-0.5 flex items-center gap-0.5">
                              <Clock className="h-2.5 w-2.5 text-accent-foreground" />
                              <span className="text-[9px] font-medium text-accent-foreground">Scheduled</span>
                            </div>
                          )}
                        </div>
                        {/* Fix Video button — full-width, easy to tap on mobile */}
                        {isVideo && (
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); void reprocessPostVideo(post); }}
                            disabled={reprocessingPostId === post.id}
                            className="w-full flex items-center justify-center gap-1.5 py-2 bg-blue-500/10 hover:bg-blue-500/20 active:bg-blue-500/30 border-b border-blue-500/20 transition-colors disabled:opacity-60"
                          >
                            <RefreshCw className={`h-3.5 w-3.5 text-blue-600 ${reprocessingPostId === post.id ? "animate-spin" : ""}`} />
                            <span className="text-[11px] font-semibold text-blue-600">
                              {reprocessingPostId === post.id ? "Converting..." : "Fix Video"}
                            </span>
                          </button>
                        )}
                        {/* Post info */}
                        <div className="p-2 space-y-1.5">
                          {post.caption && (
                            <p className="text-[11px] text-foreground line-clamp-2 leading-tight">{post.caption}</p>
                          )}
                          {/* Analytics row */}
                          <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                            <span className="flex items-center gap-0.5"><Heart className="h-3 w-3" /> {post.likes_count || 0}</span>
                            <span className="flex items-center gap-0.5"><MessageCircle className="h-3 w-3" /> {post.comments_count || 0}</span>
                            <span className="flex items-center gap-0.5"><Eye className="h-3 w-3" /> {post.view_count || 0}</span>
                          </div>
                          {/* Meta row */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              {post.location && (
                                <span className="flex items-center gap-0.5 text-[9px] text-muted-foreground"><MapPin className="h-2.5 w-2.5" />{post.location.length > 12 ? post.location.slice(0, 12) + "…" : post.location}</span>
                              )}
                              <span className="text-[9px] text-muted-foreground">{postDate}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <button onClick={(e) => { e.stopPropagation(); openEditPost(post); }} className="h-5 w-5 rounded-full hover:bg-muted flex items-center justify-center transition-colors" title="Edit">
                                <Edit className="h-3 w-3 text-muted-foreground" />
                              </button>
                              <button onClick={(e) => { e.stopPropagation(); setDeletePostId(post.id); }} className="h-5 w-5 rounded-full hover:bg-destructive/10 flex items-center justify-center transition-colors" title="Delete">
                                <Trash2 className="h-3 w-3 text-destructive" />
                              </button>
                            </div>
                          </div>
                          {/* Hashtags */}
                          {post.hashtags && post.hashtags.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {post.hashtags.slice(0, 3).map((tag: string) => (
                                <span key={tag} className="text-[9px] text-primary font-medium">{tag}</span>
                              ))}
                              {post.hashtags.length > 3 && <span className="text-[9px] text-muted-foreground">+{post.hashtags.length - 3}</span>}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        </>)}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          {isAdmin && (
            <TabsList>
              <TabsTrigger value="profile" className="gap-1.5"><Store className="h-3.5 w-3.5" /> {t("admin.store.profile")}</TabsTrigger>
              <TabsTrigger value="products" className="gap-1.5"><Package className="h-3.5 w-3.5" /> {t("admin.store.products")} ({products.length})</TabsTrigger>
              {form.category === "car-dealership" ? (
                <TabsTrigger value="payment" className="gap-1.5"><CalendarIcon className="h-3.5 w-3.5" /> {t("admin.store.booking_appointment")}</TabsTrigger>
              ) : (
                <TabsTrigger value="payment" className="gap-1.5"><CreditCard className="h-3.5 w-3.5" /> {t("admin.store.payment")}</TabsTrigger>
              )}
              <TabsTrigger value="settings" className="gap-1.5"><Building2 className="h-3.5 w-3.5" /> Settings</TabsTrigger>
            </TabsList>
          )}


          <TabsContent value="profile" className="space-y-4">
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
                  {galleryImages.map((url, i) => {
                    const isRepos = repositioningGalleryIdx === i;
                    const pos = galleryPositions[url] ?? 50;
                    return (
                    <div
                      key={i}
                      className={cn("relative group aspect-video rounded-xl overflow-hidden border border-border bg-muted", isRepos && "cursor-grab active:cursor-grabbing ring-2 ring-primary")}
                      onMouseDown={isRepos ? (e) => { e.preventDefault(); setGalleryDragStartY(e.clientY); setGalleryDragStartPos(pos); } : undefined}
                      onMouseMove={isRepos && galleryDragStartY !== null ? (e) => {
                        const deltaY = e.clientY - galleryDragStartY;
                        const newPos = Math.max(0, Math.min(100, galleryDragStartPos - (deltaY / 120) * 100));
                        setGalleryPositions(prev => ({ ...prev, [url]: Math.round(newPos) }));
                      } : undefined}
                      onMouseUp={isRepos ? () => setGalleryDragStartY(null) : undefined}
                      onMouseLeave={isRepos ? () => setGalleryDragStartY(null) : undefined}
                      onTouchStart={isRepos ? (e) => { setGalleryDragStartY(e.touches[0].clientY); setGalleryDragStartPos(pos); } : undefined}
                      onTouchMove={isRepos ? (e) => {
                        if (galleryDragStartY === null) return;
                        const deltaY = e.touches[0].clientY - galleryDragStartY;
                        const newPos = Math.max(0, Math.min(100, galleryDragStartPos - (deltaY / 120) * 100));
                        setGalleryPositions(prev => ({ ...prev, [url]: Math.round(newPos) }));
                      } : undefined}
                      onTouchEnd={isRepos ? () => setGalleryDragStartY(null) : undefined}
                    >
                      <img src={url} alt={`Gallery ${i + 1}`} className="w-full h-full object-cover select-none" draggable={false} style={{ objectPosition: `center ${pos}%` }} />
                      {isRepos && (
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center pointer-events-none">
                          <div className="bg-background/90 backdrop-blur-sm rounded-md px-2 py-1 text-[10px] font-medium text-foreground shadow flex items-center gap-1">
                            <Move className="h-3 w-3" /> Drag up/down
                          </div>
                        </div>
                      )}
                      {isRepos ? (
                        <div className="absolute top-1.5 right-1.5 flex gap-1">
                          <button
                            onClick={async () => {
                              setRepositioningGalleryIdx(null);
                              const { error } = await supabase.from("store_profiles").update({ gallery_positions: galleryPositions } as any).eq("id", storeId!);
                              if (error) toast.error(error.message);
                              else toast.success("Position saved");
                            }}
                            className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg"
                          >
                            <Check className="h-3 w-3" />
                          </button>
                          <button
                            onClick={() => {
                              setRepositioningGalleryIdx(null);
                              setGalleryPositions(prev => ({ ...prev, [url]: galleryDragStartPos }));
                            }}
                            className="h-6 w-6 rounded-full bg-muted text-foreground flex items-center justify-center shadow-lg border border-border"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ) : (
                        <div className="absolute top-1.5 right-1.5 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => { setRepositioningGalleryIdx(i); setGalleryDragStartPos(pos); }}
                            className="h-6 w-6 rounded-full bg-background/80 backdrop-blur-sm text-foreground flex items-center justify-center shadow-lg border border-border"
                          >
                            <Move className="h-3 w-3" />
                          </button>
                          <button
                            onClick={() => removeGalleryImage(i)}
                            className="h-6 w-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center shadow-lg"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      )}
                    </div>
                    );
                  })}
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

            {/* ── Feed Posts ── */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Camera className="h-4 w-4" /> Feed Posts
                  <Badge variant="secondary" className="text-[10px]">{posts.length}</Badge>
                </CardTitle>
                <p className="text-xs text-muted-foreground">Create posts like Facebook & TikTok — photos, videos, and reels for your store</p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => { setPostMediaMode("image"); setPostDialog(true); }}
                    className="group relative flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-border bg-muted/30 p-6 transition-all duration-200 hover:border-primary/50 hover:bg-primary/5 hover:shadow-md active:scale-[0.98]"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 transition-colors group-hover:bg-emerald-500/20">
                      <ImagePlus className="h-6 w-6" />
                    </div>
                    <div className="text-center">
                      <span className="block text-sm font-semibold text-foreground">📷 Photo Post</span>
                      <span className="block text-[11px] text-muted-foreground mt-0.5">JPG, PNG, WebP</span>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => { setPostMediaMode("video"); setPostDialog(true); }}
                    className="group relative flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-border bg-muted/30 p-6 transition-all duration-200 hover:border-primary/50 hover:bg-primary/5 hover:shadow-md active:scale-[0.98]"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 transition-colors group-hover:bg-blue-500/20">
                      <Video className="h-6 w-6" />
                    </div>
                    <div className="text-center">
                      <span className="block text-sm font-semibold text-foreground">🎬 Video Post</span>
                      <span className="block text-[11px] text-muted-foreground mt-0.5">MP4, MOV, WebM</span>
                    </div>
                  </button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab — Store Information */}
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">{t("admin.store.store_info")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl border border-border bg-muted/30">
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
                    <Label>Open Hour</Label>
                    <select
                      value={form.hours?.split(" - ")[0] || ""}
                      onChange={e => {
                        const close = form.hours?.split(" - ")[1] || "";
                        updateField("hours", close ? `${e.target.value} - ${close}` : e.target.value);
                      }}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring overflow-y-auto"
                    >
                      <option value="">Select</option>
                      {Array.from({ length: 48 }, (_, i) => {
                        const h = Math.floor(i / 2);
                        const m = i % 2 === 0 ? "00" : "30";
                        const ampm = h < 12 ? "AM" : "PM";
                        const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
                        const label = `${h12}:${m} ${ampm}`;
                        return <option key={i} value={label}>{label}</option>;
                      })}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Close Hour</Label>
                    <select
                      value={form.hours?.split(" - ")[1] || ""}
                      onChange={e => {
                        const open = form.hours?.split(" - ")[0] || "";
                        updateField("hours", open ? `${open} - ${e.target.value}` : `- ${e.target.value}`);
                      }}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring overflow-y-auto"
                    >
                      <option value="">Select</option>
                      {Array.from({ length: 48 }, (_, i) => {
                        const h = Math.floor(i / 2);
                        const m = i % 2 === 0 ? "00" : "30";
                        const ampm = h < 12 ? "AM" : "PM";
                        const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
                        const label = `${h12}:${m} ${ampm}`;
                        return <option key={i} value={label}>{label}</option>;
                      })}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>{t("admin.store.delivery_min")}</Label>
                    <Input type="number" value={form.delivery_min} onChange={e => updateField("delivery_min", parseInt(e.target.value) || 0)} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Facebook URL</Label>
                  <Input
                    value={form.facebook_url}
                    onChange={e => updateField("facebook_url", e.target.value)}
                    placeholder="https://facebook.com/yourstore"
                  />
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
                  <div className="space-y-3">
                    {/* Category Filter Bar */}
                    {(() => {
                      const allCats = Array.from(new Set(products.map((p: any) => p.category).filter(Boolean))).sort() as string[];
                      return (
                        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
                          <button
                            onClick={() => setProductCategoryFilter("")}
                            className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                              !productCategoryFilter
                                ? "bg-primary text-primary-foreground border-primary"
                                : "bg-muted/60 text-muted-foreground border-border hover:bg-muted"
                            }`}
                          >
                            All ({products.length})
                          </button>
                          {allCats.map(cat => {
                            const count = products.filter((p: any) => p.category === cat).length;
                            return (
                              <button
                                key={cat}
                                onClick={() => setProductCategoryFilter(productCategoryFilter === cat ? "" : cat)}
                                className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                                  productCategoryFilter === cat
                                    ? "bg-primary text-primary-foreground border-primary"
                                    : "bg-muted/60 text-muted-foreground border-border hover:bg-muted"
                                }`}
                              >
                                {cat} ({count})
                              </button>
                            );
                          })}
                          {products.some((p: any) => !p.category) && (
                            <button
                              onClick={() => setProductCategoryFilter("__uncategorized__")}
                              className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                                productCategoryFilter === "__uncategorized__"
                                  ? "bg-primary text-primary-foreground border-primary"
                                  : "bg-muted/60 text-muted-foreground border-border hover:bg-muted"
                              }`}
                            >
                              Uncategorized ({products.filter((p: any) => !p.category).length})
                            </button>
                          )}
                        </div>
                      );
                    })()}
                    <div className="divide-y divide-border">
                      {products
                        .filter((product: any) => !productCategoryFilter || (productCategoryFilter === "__uncategorized__" ? !product.category : product.category === productCategoryFilter))
                        .map((product: any) => (
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
                                {product.brand && ` · ${product.brand}`}
                              </p>
                              {product.category && (
                                <span className="inline-block mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-medium bg-accent text-accent-foreground">
                                  {product.category}
                                </span>
                              )}
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
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payment / Booking Tab */}
          <TabsContent value="payment">
            {form.category === "car-dealership" ? (
              <Card className="rounded-2xl border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CalendarIcon className="h-5 w-5 text-primary" />
                    {t("admin.store.booking_settings")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="font-medium">{t("admin.store.available_days")}</Label>
                      <div className="flex flex-wrap gap-2">
                        {(["monday","tuesday","wednesday","thursday","friday","saturday","sunday"] as const).map(dayKey => {
                          const dayEn = dayKey.charAt(0).toUpperCase() + dayKey.slice(1);
                          return (
                            <button
                              key={dayEn}
                              type="button"
                              onClick={() => {
                                const days = form.booking_days || [];
                                const updated = days.includes(dayEn) ? days.filter((d: string) => d !== dayEn) : [...days, dayEn];
                                updateField("booking_days", updated);
                              }}
                              className={cn(
                                "px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors",
                                (form.booking_days || []).includes(dayEn)
                                  ? "bg-primary text-primary-foreground border-primary"
                                  : "bg-muted/30 text-muted-foreground border-border/50 hover:bg-muted/50"
                              )}
                            >
                              {t(`admin.store.${dayKey}`)}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>{t("admin.store.start_time")}</Label>
                        <select
                          value={form.booking_start_time || "09:00 AM"}
                          onChange={e => updateField("booking_start_time", e.target.value)}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        >
                          {Array.from({ length: 48 }, (_, i) => {
                            const h = Math.floor(i / 2);
                            const m = i % 2 === 0 ? "00" : "30";
                            const ampm = h < 12 ? "AM" : "PM";
                            const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
                            return `${h12}:${m} ${ampm}`;
                          }).map(ti => <option key={ti} value={ti}>{ti}</option>)}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label>{t("admin.store.end_time")}</Label>
                        <select
                          value={form.booking_end_time || "5:00 PM"}
                          onChange={e => updateField("booking_end_time", e.target.value)}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        >
                          {Array.from({ length: 48 }, (_, i) => {
                            const h = Math.floor(i / 2);
                            const m = i % 2 === 0 ? "00" : "30";
                            const ampm = h < 12 ? "AM" : "PM";
                            const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
                            return `${h12}:${m} ${ampm}`;
                          }).map(ti => <option key={ti} value={ti}>{ti}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>{t("admin.store.appointment_duration")}</Label>
                      <select
                        value={form.booking_duration || "30"}
                        onChange={e => updateField("booking_duration", e.target.value)}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      >
                        <option value="15">{t("admin.store.minutes_15")}</option>
                        <option value="30">{t("admin.store.minutes_30")}</option>
                        <option value="45">{t("admin.store.minutes_45")}</option>
                        <option value="60">{t("admin.store.hours_1")}</option>
                        <option value="90">{t("admin.store.hours_1_5")}</option>
                        <option value="120">{t("admin.store.hours_2")}</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label>{t("admin.store.booking_note")}</Label>
                      <Textarea
                        value={form.booking_note || ""}
                        onChange={e => updateField("booking_note", e.target.value)}
                        placeholder={t("admin.store.booking_note_placeholder")}
                        rows={3}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <StorePaymentSection storeId={storeId!} />
            )}
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders">
            <StoreOrdersSection storeId={storeId!} />
          </TabsContent>

          {/* Customers Tab */}
          <TabsContent value="customers">
            <StoreCustomersSection storeId={storeId!} />
          </TabsContent>

          {/* Marketing Tab */}
          <TabsContent value="marketing">
            <StoreMarketingSection storeId={storeId!} />
          </TabsContent>

          <TabsContent value="employees">
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-14 h-14 rounded-full bg-blue-500/10 flex items-center justify-center mb-4"><Users className="w-7 h-7 text-blue-500" /></div>
              <h2 className="font-semibold text-lg mb-1">Employees</h2>
              <p className="text-sm text-muted-foreground max-w-sm">Add, remove, and manage your store employees and their roles.</p>
            </div>
          </TabsContent>

          <TabsContent value="payroll">
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-14 h-14 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4"><DollarSign className="w-7 h-7 text-emerald-500" /></div>
              <h2 className="font-semibold text-lg mb-1">Payroll</h2>
              <p className="text-sm text-muted-foreground max-w-sm">Manage wages, pay runs, and compensation for your employees.</p>
            </div>
          </TabsContent>

          <TabsContent value="employee-schedule">
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-14 h-14 rounded-full bg-purple-500/10 flex items-center justify-center mb-4"><CalendarIcon className="w-7 h-7 text-purple-500" /></div>
              <h2 className="font-semibold text-lg mb-1">Employee Schedule</h2>
              <p className="text-sm text-muted-foreground max-w-sm">Create and manage employee work schedules and shifts.</p>
            </div>
          </TabsContent>

          <TabsContent value="time-clock">
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-14 h-14 rounded-full bg-amber-500/10 flex items-center justify-center mb-4"><Clock className="w-7 h-7 text-amber-500" /></div>
              <h2 className="font-semibold text-lg mb-1">Time Clock</h2>
              <p className="text-sm text-muted-foreground max-w-sm">Track employee clock-in/out times, attendance, and work hours.</p>
            </div>
          </TabsContent>

          <TabsContent value="employee-rules">
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-14 h-14 rounded-full bg-rose-500/10 flex items-center justify-center mb-4"><Shield className="w-7 h-7 text-rose-500" /></div>
              <h2 className="font-semibold text-lg mb-1">Employee Rules</h2>
              <p className="text-sm text-muted-foreground max-w-sm">Set employee rules, access levels, and workplace policies.</p>
            </div>
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
            {form.category !== "car-dealership" && (
              <>
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
              </>
            )}

            {/* ── Car Dealership Fields ── */}
            {form.category === "car-dealership" && (
              <div className="space-y-3 rounded-xl border border-border/50 bg-muted/30 p-3">
                <div className="flex items-center gap-2">
                  <Car className="h-4 w-4 text-primary" />
                  <Label className="font-semibold text-sm">{t("admin.store.vehicle_details")}</Label>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">{t("admin.store.make")} *</Label>
                    <select
                      value={productForm.car_make}
                      onChange={e => {
                        updateProductField("car_make", e.target.value);
                        updateProductField("car_model", "");
                      }}
                      className="flex h-9 w-full rounded-md border border-input bg-background px-2 py-1 text-sm"
                    >
                      <option value="">Select Make</option>
                      {(form.name?.toLowerCase().includes("byd")
                        ? ["BYD"]
                        : ["Toyota","Honda","Ford","Chevrolet","BMW","Mercedes-Benz","Audi","Hyundai","Kia","Nissan","Lexus","Mazda","Volkswagen","Subaru","Jeep","Tesla","Porsche","Land Rover","Volvo","Mitsubishi","Suzuki","Isuzu","Peugeot","BYD","Other"]
                      ).map(m => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">{t("admin.store.model")} *</Label>
                    {productForm.car_make === "BYD" ? (
                      <div className="space-y-2">
                        <div className="flex items-center gap-1.5">
                          <select
                            value={productForm.car_model}
                            onChange={e => updateProductField("car_model", e.target.value)}
                            className="flex h-9 w-full rounded-lg border border-border/40 bg-muted/50 px-2.5 py-1 text-sm flex-1 focus:outline-none focus:border-primary/50 transition-colors"
                          >
                            <option value="">Select Model</option>
                            {[...["Atto 3","Dolphin","Seal","Han","Tang","Song Plus","Song Pro","Yuan Plus","Shark","Sealion 6","Sealion 7","Denza D9","Yangwang U8","Yangwang U9","e6","T3"], ...customBydModels].map(m => (
                              <option key={m} value={m}>{m}</option>
                            ))}
                          </select>
                          {!addingBydModel && (
                            <Button type="button" size="sm" variant="outline" className="h-9 w-9 p-0 shrink-0 border-dashed border-emerald-500/40 text-emerald-500 hover:bg-emerald-500/10 hover:border-emerald-500 transition-all" onClick={() => setAddingBydModel(true)} title="Add custom model">
                              <Plus className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                        {addingBydModel && (
                          <div className="flex items-center gap-1.5 animate-in fade-in slide-in-from-top-1 duration-200">
                            <Input
                              value={newBydModelName}
                              onChange={e => setNewBydModelName(e.target.value)}
                              placeholder="e.g. Seal U DM-i"
                              className="h-8 text-xs flex-1"
                              autoFocus
                              onKeyDown={e => {
                                if (e.key === "Enter" && newBydModelName.trim()) {
                                  const name = newBydModelName.trim();
                                  const updated = [...new Set([...customBydModels, name])];
                                  setCustomBydModels(updated);
                                  localStorage.setItem("zivo_custom_byd_models", JSON.stringify(updated));
                                  updateProductField("car_model", name);
                                  setNewBydModelName("");
                                  setAddingBydModel(false);
                                } else if (e.key === "Escape") {
                                  setAddingBydModel(false);
                                  setNewBydModelName("");
                                }
                              }}
                            />
                            <Button
                              type="button"
                              size="sm"
                              className="h-8 px-3 text-xs rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm gap-1"
                              disabled={!newBydModelName.trim()}
                              onClick={() => {
                                const name = newBydModelName.trim();
                                if (!name) return;
                                const updated = [...new Set([...customBydModels, name])];
                                setCustomBydModels(updated);
                                localStorage.setItem("zivo_custom_byd_models", JSON.stringify(updated));
                                updateProductField("car_model", name);
                                setNewBydModelName("");
                                setAddingBydModel(false);
                              }}
                            >
                              <Check className="h-3 w-3" /> Save
                            </Button>
                            <Button type="button" size="sm" variant="ghost" className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive transition-colors" onClick={() => { setAddingBydModel(false); setNewBydModelName(""); }}>
                              <X className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <Input value={productForm.car_model} onChange={e => updateProductField("car_model", e.target.value)} placeholder="e.g. Camry" className="h-9 text-sm" />
                    )}
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">{t("admin.store.year")} *</Label>
                    <select
                      value={productForm.car_year}
                      onChange={e => updateProductField("car_year", e.target.value)}
                      className="flex h-9 w-full rounded-md border border-input bg-background px-2 py-1 text-sm"
                    >
                      <option value="">{t("admin.store.year")}</option>
                      {Array.from({ length: 30 }, (_, i) => new Date().getFullYear() + 1 - i).map(y => (
                        <option key={y} value={String(y)}>{y}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">{t("admin.store.vin")}</Label>
                    <Input value={productForm.car_vin} onChange={e => updateProductField("car_vin", e.target.value.toUpperCase())} placeholder="17-character VIN" maxLength={17} className="h-9 text-sm font-mono" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">{t("admin.store.mileage")}</Label>
                    <Input type="text" inputMode="numeric" value={productForm.car_mileage} onChange={e => updateProductField("car_mileage", e.target.value.replace(/[^0-9]/g, ""))} placeholder="e.g. 45000" className="h-9 text-sm" />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">{t("admin.store.transmission")}</Label>
                    <select value={productForm.car_transmission} onChange={e => updateProductField("car_transmission", e.target.value)} className="flex h-9 w-full rounded-md border border-input bg-background px-2 py-1 text-sm">
                      <option value="">Select</option>
                      <option value="Automatic">Automatic</option>
                      <option value="Manual">Manual</option>
                      <option value="CVT">CVT</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">{t("admin.store.fuel_type")}</Label>
                    <select value={productForm.car_fuel_type} onChange={e => updateProductField("car_fuel_type", e.target.value)} className="flex h-9 w-full rounded-md border border-input bg-background px-2 py-1 text-sm">
                      <option value="">Select</option>
                      <option value="Gasoline">Gasoline</option>
                      <option value="Diesel">Diesel</option>
                      <option value="Hybrid">Hybrid</option>
                      <option value="Electric">Electric</option>
                      <option value="LPG">LPG</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">{t("admin.store.condition")}</Label>
                    <select value={productForm.car_condition} onChange={e => updateProductField("car_condition", e.target.value)} className="flex h-9 w-full rounded-md border border-input bg-background px-2 py-1 text-sm">
                      <option value="">Select</option>
                      <option value="New">New</option>
                      <option value="Used">Used</option>
                      <option value="Certified Pre-Owned">Certified Pre-Owned</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">{t("admin.store.color")}</Label>
                    <Input value={productForm.car_color} onChange={e => updateProductField("car_color", e.target.value)} placeholder="e.g. Silver" className="h-9 text-sm" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">{t("admin.store.engine")}</Label>
                    <Input value={productForm.car_engine} onChange={e => updateProductField("car_engine", e.target.value)} placeholder="e.g. 2.5L 4-Cyl" className="h-9 text-sm" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">{t("admin.store.body_type")}</Label>
                    <select value={productForm.car_body_type} onChange={e => updateProductField("car_body_type", e.target.value)} className="flex h-9 w-full rounded-md border border-input bg-background px-2 py-1 text-sm">
                      <option value="">Select</option>
                      <option value="Sedan">Sedan</option>
                      <option value="SUV">SUV</option>
                      <option value="Truck">Truck</option>
                      <option value="Coupe">Coupe</option>
                      <option value="Hatchback">Hatchback</option>
                      <option value="Van">Van</option>
                      <option value="Wagon">Wagon</option>
                      <option value="Convertible">Convertible</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

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

            {form.category !== "car-dealership" && (
              <>
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

                {/* ── Size Variants / តម្លៃតាមទំហំ ── */}
                <div className="space-y-3 rounded-xl border border-border/50 bg-muted/30 p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Ruler className="h-4 w-4 text-primary" />
                      <Label className="font-semibold text-sm">Size Prices / តម្លៃតាមទំហំ</Label>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs gap-1"
                      onClick={() => {
                        const variants = [...(productForm.size_variants || [])];
                        variants.push({ size: "", price_khr: 0, price_usd: 0 });
                        updateProductField("size_variants", variants);
                      }}
                    >
                      <Plus className="h-3 w-3" /> Add Size
                    </Button>
                  </div>
                  {(productForm.size_variants || []).length > 0 && (
                    <div className="space-y-2">
                      {(productForm.size_variants || []).map((v: { size: string; price_khr: number; price_usd: number }, idx: number) => (
                        <div key={idx} className="space-y-1.5 rounded-lg border border-border/40 bg-background/50 p-2.5">
                          <div className="flex items-center gap-2">
                            <Input
                              value={v.size}
                              onChange={e => {
                                const variants = [...(productForm.size_variants || [])];
                                variants[idx] = { ...variants[idx], size: e.target.value };
                                updateProductField("size_variants", variants);
                              }}
                              placeholder="Size name (S, M, L...)"
                              className="flex-1"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const variants = (productForm.size_variants || []).filter((_: any, i: number) => i !== idx);
                                updateProductField("size_variants", variants);
                              }}
                              className="w-6 h-6 rounded-full bg-destructive/10 text-destructive flex items-center justify-center hover:bg-destructive/20 transition-colors shrink-0"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-0.5">
                              <Label className="text-[10px] text-muted-foreground">Price (៛ KHR)</Label>
                              <Input
                                type="text"
                                inputMode="numeric"
                                value={v.price_khr || ""}
                                onChange={e => {
                                  const val = e.target.value.replace(/[^0-9]/g, "");
                                  const khr = val === "" ? 0 : parseInt(val, 10);
                                  const variants = [...(productForm.size_variants || [])];
                                  variants[idx] = { ...variants[idx], price_khr: khr, price_usd: parseFloat((khr / (form.khr_rate || 4062.5)).toFixed(2)) };
                                  updateProductField("size_variants", variants);
                                }}
                                placeholder="0"
                              />
                            </div>
                            <div className="space-y-0.5">
                              <Label className="text-[10px] text-muted-foreground">Price ($)</Label>
                              <Input
                                type="text"
                                inputMode="decimal"
                                value={v.price_usd || ""}
                                onChange={e => {
                                  const parts = e.target.value.split(".");
                                  const safe = parts.length > 1
                                    ? `${parts[0].replace(/[^0-9]/g, "")}.${parts.slice(1).join("").replace(/[^0-9]/g, "")}`
                                    : e.target.value.replace(/[^0-9]/g, "");
                                  if (safe === "" || safe === ".") {
                                    const variants = [...(productForm.size_variants || [])];
                                    variants[idx] = { ...variants[idx], price_khr: 0, price_usd: 0 };
                                    updateProductField("size_variants", variants);
                                    return;
                                  }
                                  const usd = parseFloat(safe);
                                  if (!Number.isNaN(usd)) {
                                    const variants = [...(productForm.size_variants || [])];
                                    variants[idx] = { ...variants[idx], price_usd: usd, price_khr: Math.round(usd * (form.khr_rate || 4062.5)) };
                                    updateProductField("size_variants", variants);
                                  }
                                }}
                                placeholder="0"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {(productForm.size_variants || []).length === 0 && (
                    <p className="text-xs text-muted-foreground">Add sizes with different prices (e.g. Small, Medium, Large)</p>
                  )}
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
              </>
            )}

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
            <DialogTitle className="flex items-center gap-2">
              {postMediaMode === "video" ? (
                <><Video className="h-4.5 w-4.5 text-primary" /> {t("admin.store.add_video_post")}</>
              ) : (
                <><ImagePlus className="h-4.5 w-4.5 text-primary" /> {t("admin.store.add_photo_post")}</>
              )}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2 overflow-y-auto pr-1 max-h-[calc(90vh-11rem)]">
            {/* Caption */}
            <div className="space-y-2">
              <Label>{t("admin.store.post_caption")}</Label>
              <Textarea
                value={postCaption}
                onChange={e => setPostCaption(e.target.value)}
                placeholder={t("admin.store.post_caption_placeholder")}
                rows={3}
                maxLength={2200}
              />
              <div className="flex justify-between">
                <span className="text-[10px] text-muted-foreground">
                  {postCaption.length > 0 ? `${postCaption.length}/2,200` : "Optional"}
                </span>
              </div>
            </div>

            {/* Hashtags */}
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5">
                <Tag className="h-3.5 w-3.5" /> Hashtags
              </Label>
              <Input
                value={postHashtags}
                onChange={e => setPostHashtags(e.target.value)}
                placeholder="#food #delivery #promo"
                className="text-sm"
              />
              <span className="text-[10px] text-muted-foreground">Separate with spaces. Auto-detected from caption too.</span>
            </div>

            {/* Location */}
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" /> Location
              </Label>
              <Input
                value={postLocation}
                onChange={e => setPostLocation(e.target.value)}
                placeholder="Phnom Penh, Cambodia"
                className="text-sm"
              />
            </div>

            {/* Schedule */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-1.5">
                  <CalendarIcon className="h-3.5 w-3.5" /> Schedule Post
                </Label>
                <Switch checked={isScheduled} onCheckedChange={setIsScheduled} />
              </div>
              {isScheduled && (
                <div className="flex items-center gap-2 rounded-xl border border-border bg-muted/30 p-3">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm" className={cn("gap-1.5 text-xs", !postScheduledAt && "text-muted-foreground")}>
                        <CalendarIcon className="h-3.5 w-3.5" />
                        {postScheduledAt ? format(postScheduledAt, "PPP") : "Pick date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={postScheduledAt}
                        onSelect={setPostScheduledAt}
                        disabled={(date) => date < new Date()}
                        initialFocus
                        className="p-3 pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                  <Input
                    type="time"
                    value={postScheduleTime}
                    onChange={e => setPostScheduleTime(e.target.value)}
                    className="w-28 h-8 text-xs"
                  />
                </div>
              )}
            </div>

            {/* Media Grid with drag-to-reorder */}
            <div className="space-y-2">
              <Label>{t("admin.store.post_media")}</Label>
              <div className={cn(
                postMediaMode === "video"
                  ? "grid grid-cols-2 gap-3"
                  : "grid grid-cols-3 gap-2"
              )}>
                {postMediaItems.map((preview, i) => (
                  <div
                    key={`${preview.id}-${i}`}
                    draggable={preview.status === "done" && postMediaItems.length > 1}
                    onDragStart={() => setDraggingIndex(i)}
                    onDragOver={(e) => { e.preventDefault(); setDragOverIndex(i); }}
                    onDragLeave={() => setDragOverIndex(null)}
                    onDrop={(e) => {
                      e.preventDefault();
                      if (draggingIndex !== null && draggingIndex !== i) {
                        reorderMedia(draggingIndex, i);
                      }
                      setDraggingIndex(null);
                      setDragOverIndex(null);
                    }}
                    onDragEnd={() => { setDraggingIndex(null); setDragOverIndex(null); }}
                    className={cn(
                      "transition-all",
                      draggingIndex === i && "opacity-40 scale-95",
                      dragOverIndex === i && draggingIndex !== i && "ring-2 ring-primary rounded-lg"
                    )}
                  >
                    <div className="relative overflow-hidden rounded-lg border border-border bg-muted/20">
                      {preview.isVideo ? (
                        <>
                          <AdminVideoPreview
                            src={preview.previewUrl}
                            className="rounded-lg"
                            videoClassName="rounded-lg bg-muted object-contain"
                            controls
                            muted
                            autoPlay={false}
                            loop
                            canRepair={preview.status === "done"}
                            onRepair={repairVideoPreviewSource}
                          />
                          {/* Duration badge */}
                          {preview.duration != null && preview.duration > 0 && (
                            <div className="absolute bottom-1 right-1 z-10 rounded bg-background/80 px-1.5 py-0.5">
                              <span className="text-[10px] font-mono font-medium text-foreground">{formatDuration(preview.duration)}</span>
                            </div>
                          )}
                          {preview.status === "done" && (
                            <div className="absolute bottom-1 left-1 z-10 flex items-center gap-1 rounded bg-primary/90 px-1.5 py-0.5">
                              <CheckCircle2 className="h-3 w-3 text-primary-foreground" />
                              <span className="text-[10px] font-medium text-primary-foreground">Ready</span>
                            </div>
                          )}
                        </>
                      ) : (
                        <img
                          src={preview.previewUrl}
                          alt="Post preview"
                          className="w-full rounded-lg object-cover"
                          style={{ aspectRatio: "1 / 1" }}
                        />
                      )}
                      {/* Drag handle + remove button */}
                      <div className="absolute right-1 top-1 z-10 flex items-center gap-1">
                        {postMediaItems.length > 1 && preview.status === "done" && (
                          <div className="rounded-full bg-background/80 p-1 cursor-grab" title="Drag to reorder">
                            <Move className="h-3 w-3 text-foreground" />
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => removePostMedia(i)}
                          className="rounded-full bg-destructive p-1 text-destructive-foreground"
                          aria-label="Remove media"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      {preview.sourceFile && preview.status !== "error" && (
                        <div className="absolute top-1 left-1 z-10 rounded bg-background/80 px-1 py-0.5">
                          <span className="text-[9px] font-medium text-foreground">
                            {(preview.sourceFile.size / (1024 * 1024)).toFixed(1)} MB
                          </span>
                        </div>
                      )}
                      {(preview.isUploading || preview.status === "error") && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-lg bg-background/80 px-3 text-center backdrop-blur-[1px]">
                          {preview.isUploading ? (
                            <>
                              <Loader2 className="h-5 w-5 animate-spin text-primary" />
                              <div className="text-xs font-semibold text-foreground">{preview.progress}%</div>
                              <div className="h-1.5 w-24 overflow-hidden rounded-full bg-muted">
                                <div
                                  className="h-full rounded-full bg-primary transition-all duration-300"
                                  style={{ width: `${preview.progress}%` }}
                                />
                              </div>
                              <span className="text-[9px] text-muted-foreground">Uploading...</span>
                            </>
                          ) : (
                            <>
                              <AlertTriangle className="h-5 w-5 text-destructive" />
                              <div className="text-[11px] font-medium text-foreground">Upload failed</div>
                              {preview.error && (
                                <div className="text-[9px] text-muted-foreground line-clamp-2">{preview.error}</div>
                              )}
                              <button
                                type="button"
                                onClick={() => void retryPostMedia(preview.id)}
                                className="rounded-md bg-primary px-2.5 py-1 text-[11px] font-semibold text-primary-foreground"
                              >
                                Retry
                              </button>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {postMediaItems.length < 10 && (
                  <div
                    onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      const files = Array.from(e.dataTransfer.files).filter(f =>
                        postMediaMode === "video" ? f.type.startsWith("video/") : f.type.startsWith("image/")
                      );
                      files.forEach((file) => void uploadPostMedia(file));
                    }}
                    onClick={() => postMediaInputRef.current?.click()}
                    className={cn(
                      "rounded-lg border-2 border-dashed border-border hover:border-primary/40 flex flex-col items-center justify-center gap-1.5 text-muted-foreground hover:text-primary transition-all cursor-pointer hover:bg-primary/5",
                      postMediaMode === "video" ? "w-full" : "aspect-square"
                    )}
                    style={postMediaMode === "video" ? { aspectRatio: "9 / 16" } : undefined}
                  >
                    {uploadingPostMedia ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <>
                        <div className="h-10 w-10 rounded-full bg-muted/60 flex items-center justify-center">
                          {postMediaMode === "video" ? (
                            <Video className="h-5 w-5" />
                          ) : (
                            <Camera className="h-5 w-5" />
                          )}
                        </div>
                        <span className="text-[10px] font-medium">
                          {postMediaItems.length === 0 ? "Tap or drag to add" : "Add more"}
                        </span>
                        <span className="text-[9px] text-muted-foreground/70">
                          {postMediaMode === "video" ? "MP4, MOV, WebM" : "JPG, PNG, WebP"}
                        </span>
                      </>
                    )}
                  </div>
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
                accept={postMediaMode === "video" ? "video/mp4,video/quicktime,video/webm,video/x-matroska" : "image/jpeg,image/png,image/webp,image/gif"}
                multiple
                className="hidden"
                onChange={e => {
                  const files = Array.from(e.target.files || []);
                  files.forEach((file) => {
                    void uploadPostMedia(file);
                  });
                  e.target.value = "";
                }}
              />
              <div className="flex flex-wrap items-center gap-2 text-[10px] text-muted-foreground">
                <span>📎 Max 10 files</span>
                <span>•</span>
                <span>{postMediaMode === "video" ? "🎬 100 MB per video" : "📷 20 MB per image"}</span>
                <span>•</span>
                <span>✨ Drag & drop supported</span>
                {postMediaItems.length > 1 && <><span>•</span><span>↕️ Drag to reorder</span></>}
              </div>
            </div>
          </div>
          <DialogFooter className="border-t border-border pt-4">
            <div className="flex w-full items-center justify-between">
              <span className="text-[10px] text-muted-foreground">
                {postMediaUrls.length > 0 ? `${postMediaUrls.length} file${postMediaUrls.length > 1 ? "s" : ""} ready` : "No files added"}
                {isScheduled && postScheduledAt ? ` · Scheduled` : ""}
              </span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => { setPostDialog(false); }}>Cancel</Button>
                <Button
                  size="sm"
                  onClick={() => savePost.mutate()}
                  disabled={savePost.isPending || postMediaUrls.length === 0 || hasPendingPostUploads}
                >
                  {savePost.isPending ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : null}
                  {savePost.isPending ? "Posting..." : hasPendingPostUploads ? "Uploading..." : isScheduled ? "Schedule" : t("admin.store.add_post")}
                </Button>
              </div>
            </div>
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

      {/* View Post Detail Dialog */}
      <Dialog open={!!viewPostId} onOpenChange={() => setViewPostId(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-hidden">
          {(() => {
            const post = posts.find((p: any) => p.id === viewPostId);
            if (!post) return null;
            const firstUrl = (post.media_urls || [])[0];
            const isVid = firstUrl && isVideoUrl(normalizeStorePostMediaUrl(firstUrl));
            return (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Eye className="h-4 w-4" /> Post Detail
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 overflow-y-auto max-h-[calc(90vh-10rem)] pr-1">
                  {/* Media preview */}
                  <div className="rounded-xl overflow-hidden border border-border bg-muted">
                    {isVid && firstUrl ? (
                      <AdminVideoPreview
                        src={normalizeStorePostMediaUrl(firstUrl)}
                        className="w-full"
                        videoClassName="w-full max-h-80 object-contain"
                        controls
                        muted
                        loop
                        canRepair
                        onRepair={repairVideoPreviewSource}
                      />
                    ) : firstUrl ? (
                      <img src={normalizeStorePostMediaUrl(firstUrl)} alt="" className="w-full max-h-80 object-contain" />
                    ) : null}
                  </div>
                  {/* Post info */}
                  {post.caption && <p className="text-sm text-foreground">{post.caption}</p>}
                  {/* Analytics */}
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1"><Heart className="h-4 w-4" /> {post.likes_count || 0} likes</span>
                    <span className="flex items-center gap-1"><MessageCircle className="h-4 w-4" /> {post.comments_count || 0} comments</span>
                    <span className="flex items-center gap-1"><Eye className="h-4 w-4" /> {post.view_count || 0} views</span>
                  </div>
                  {post.location && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5" /> {post.location}
                    </div>
                  )}
                  {post.hashtags && post.hashtags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {post.hashtags.map((tag: string) => (
                        <span key={tag} className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">{tag}</span>
                      ))}
                    </div>
                  )}
                  {/* Comments section */}
                  <div className="space-y-3 border-t border-border pt-3">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Comments ({postComments.length})</p>
                    {postComments.length === 0 ? (
                      <p className="text-xs text-muted-foreground py-4 text-center">No comments yet</p>
                    ) : (
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {postComments.map((comment: any) => (
                          <div key={comment.id} className="flex items-start justify-between gap-2 rounded-lg bg-muted/30 p-2">
                            <div>
                              <p className="text-xs text-foreground">{comment.content}</p>
                              <span className="text-[10px] text-muted-foreground">{format(new Date(comment.created_at), "MMM d, h:mm a")}</span>
                            </div>
                            <button onClick={() => deleteComment.mutate(comment.id)} className="shrink-0 h-5 w-5 rounded-full hover:bg-destructive/10 flex items-center justify-center">
                              <Trash2 className="h-3 w-3 text-destructive" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    {/* Add comment */}
                    <div className="flex gap-2">
                      <Input
                        value={newComment}
                        onChange={e => setNewComment(e.target.value)}
                        placeholder="Add a comment..."
                        className="text-sm"
                        onKeyDown={e => { if (e.key === "Enter" && newComment.trim()) addComment.mutate(); }}
                      />
                      <Button size="sm" onClick={() => addComment.mutate()} disabled={!newComment.trim() || addComment.isPending}>
                        <Send className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" size="sm" onClick={() => { setViewPostId(null); openEditPost(post); }}>
                    <Edit className="h-3.5 w-3.5 mr-1.5" /> Edit Post
                  </Button>
                </DialogFooter>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* Edit Post Dialog */}
      <Dialog open={!!editPostId} onOpenChange={() => setEditPostId(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-4 w-4" /> Edit Post
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Caption</Label>
              <Textarea value={editCaption} onChange={e => setEditCaption(e.target.value)} rows={3} maxLength={2200} />
              <span className="text-[10px] text-muted-foreground">{editCaption.length}/2,200</span>
            </div>
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5"><Tag className="h-3.5 w-3.5" /> Hashtags</Label>
              <Input value={editHashtags} onChange={e => setEditHashtags(e.target.value)} placeholder="#food #delivery" />
            </div>
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> Location</Label>
              <Input value={editLocation} onChange={e => setEditLocation(e.target.value)} placeholder="Phnom Penh" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setEditPostId(null)}>Cancel</Button>
            <Button size="sm" onClick={() => editPost.mutate()} disabled={editPost.isPending}>
              {editPost.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> : null}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
    {store && (
      <StoreLiveChat
        storeId={store.id}
        storeName={store.name}
        storeLogo={store.logo_url}
        open={chatOpen}
        onClose={() => setChatOpen(false)}
        isAdmin
      />
    )}
    </>
  );
}
