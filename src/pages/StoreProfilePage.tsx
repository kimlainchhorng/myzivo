/**
 * StoreProfilePage - Ultra-premium 3D/4D Spatial UI store profile
 * Immersive glassmorphic design with depth, perspective, holographic cards
 */
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ShoppingCart, Star, Clock, MapPin, Phone, Store, Package, Loader2, Plus, Minus, Sparkles, Heart, Eye, MessageCircle, Facebook, Instagram, Send, CalendarCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import ZivoMobileNav from "@/components/app/ZivoMobileNav";
import { useStoreProfile, useStoreProducts, useStoreProductCategories, type StoreProductItem } from "@/hooks/useStoreProfile";
import { useGroceryCart } from "@/hooks/useGroceryCart";
import { GroceryCheckoutDrawer } from "@/components/grocery/GroceryCheckoutDrawer";
import { useState, useRef } from "react";
import StoreHeroCarousel from "@/components/grocery/StoreHeroCarousel";
import { toast } from "sonner";
import { useI18n } from "@/hooks/useI18n";
import storeRideBg from "@/assets/store-ride-bg.jpg";
import storeCallBg from "@/assets/store-call-bg.jpg";
import StoreLiveChat from "@/components/grocery/StoreLiveChat";
import { isAllowedSocialUrl } from "@/lib/urlSafety";

/**
 * Extract the correct language part from dual-format text like "Khmer/English".
 * If lang is "km" → return Khmer part (before "/"), otherwise English part (after "/").
 * If no "/" separator found, return the text as-is.
 */
function localizedName(text: string, lang: string): string {
  if (!text) return text;
  const slashIdx = text.indexOf("/");
  if (slashIdx === -1) return text;
  const kmPart = text.slice(0, slashIdx).trim();
  const enPart = text.slice(slashIdx + 1).trim();
  if (!enPart) return kmPart;
  if (!kmPart) return enPart;
  return lang === "km" ? kmPart : enPart;
}

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.04 } },
};

const cardVariant = {
  hidden: { opacity: 0, y: 24, rotateX: 12, scale: 0.92 },
  show: {
    opacity: 1, y: 0, rotateX: 0, scale: 1,
    transition: { type: "spring" as const, stiffness: 280, damping: 24 },
  },
};

/* Floating bokeh particle */
function BokehDot({ delay, size, x, y, color }: { delay: number; size: number; x: string; y: string; color: string }) {
  return (
    <motion.div
      animate={{ y: [-12, 12, -12], x: [-6, 6, -6], opacity: [0.3, 0.7, 0.3] }}
      transition={{ duration: 6 + delay * 2, repeat: Infinity, ease: "easeInOut", delay }}
      className="absolute rounded-full blur-sm pointer-events-none"
      style={{ width: size, height: size, left: x, top: y, background: color }}
    />
  );
}

export default function StoreProfilePage() {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const cart = useGroceryCart();
  const [showCart, setShowCart] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();
  const [likedProducts, setLikedProducts] = useState<Set<string>>(new Set());
  const [chatOpen, setChatOpen] = useState(searchParams.get("chat") === "open");
  // Track selected size per product: productId -> variant index
  const [selectedSizes, setSelectedSizes] = useState<Record<string, number>>({});
  const { t, currentLanguage } = useI18n();

  const { data: store, isLoading: loadingStore } = useStoreProfile(slug || "");
  const { data: products = [], isLoading: loadingProducts } = useStoreProducts(store?.id, selectedCategory);
  const { data: categories = [] } = useStoreProductCategories(store?.id);

  const handleAddToCart = (product: StoreProductItem, sizeVariant?: { size: string; price_khr: number; price_usd: number }) => {
    const displayName = localizedName(product.name, currentLanguage);
    cart.addItem({
      productId: sizeVariant ? `${product.id}__${sizeVariant.size}` : product.id,
      name: sizeVariant ? `${displayName} (${sizeVariant.size})` : displayName,
      price: sizeVariant ? sizeVariant.price_usd : product.price,
      image: product.image_url || "",
      brand: product.brand || "",
      sizeLabel: sizeVariant?.size,
    }, store?.name || "Store");
    toast.success(t("store.added_to_cart"), { icon: "🛒" });
  };

  const toggleLike = (id: string) => {
    setLikedProducts(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  if (loadingStore) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
          <Loader2 className="h-8 w-8 text-primary" />
        </motion.div>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 p-6">
        <Store className="h-12 w-12 text-muted-foreground/30" />
        <p className="text-muted-foreground">{t("store.not_found")}</p>
        <Button onClick={() => navigate("/grocery")} variant="outline">Back to Grocery</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 relative overflow-hidden">
      {/* ── Immersive Animated Background ── */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-background" />
        {/* Large floating orbs */}
        <motion.div
          animate={{ y: [-30, 30, -30], x: [-15, 15, -15], scale: [1, 1.2, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-16 -right-16 w-80 h-80 rounded-full bg-primary/[0.06] blur-[80px]"
        />
        <motion.div
          animate={{ y: [25, -25, 25], x: [12, -12, 12], scale: [1.1, 0.9, 1.1] }}
          transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/3 -left-24 w-72 h-72 rounded-full bg-sky-400/[0.05] blur-[80px]"
        />
        <motion.div
          animate={{ y: [15, -20, 15], scale: [1, 1.2, 1] }}
          transition={{ duration: 13, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-32 right-8 w-56 h-56 rounded-full bg-emerald-400/[0.04] blur-[60px]"
        />
        <motion.div
          animate={{ y: [-10, 20, -10], x: [8, -8, 8] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-2/3 left-1/3 w-40 h-40 rounded-full bg-rose-400/[0.03] blur-[50px]"
        />
        {/* Bokeh particles */}
        <BokehDot delay={0} size={6} x="15%" y="25%" color="hsl(var(--primary) / 0.3)" />
        <BokehDot delay={1} size={4} x="75%" y="40%" color="hsl(var(--primary) / 0.2)" />
        <BokehDot delay={2} size={8} x="60%" y="70%" color="hsl(142 76% 36% / 0.2)" />
        <BokehDot delay={0.5} size={5} x="30%" y="55%" color="hsl(200 90% 60% / 0.2)" />
        <BokehDot delay={1.5} size={3} x="85%" y="20%" color="hsl(var(--primary) / 0.25)" />
        <BokehDot delay={3} size={7} x="10%" y="80%" color="hsl(280 60% 60% / 0.15)" />
        {/* Dot grid */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 0.5px, transparent 0)`,
            backgroundSize: "24px 24px",
          }}
        />
      </div>

      {/* ── Banner with 3D parallax ── */}
      {(() => {
        const coverUrl = store.banner_url;

        return (
          <div className="relative w-full h-60 overflow-hidden">
            {coverUrl ? (
              <img
                src={coverUrl}
                alt={`${store.name} cover`}
                className="w-full h-full object-cover"
                style={{ objectPosition: `center ${(store as any).banner_position ?? 50}%` }}
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary/30 via-primary/10 to-sky-500/15" />
            )}
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent pointer-events-none z-[1]" />
            <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background to-transparent pointer-events-none z-[1]" />

            {/* Nav buttons */}
            <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 z-10" style={{ paddingTop: "max(calc(env(safe-area-inset-top, 0px) + 0.75rem), 52px)" }}>
              <motion.button
                whileTap={{ scale: 0.85 }}
                onClick={() => window.history.length > 1 ? navigate(-1) : navigate("/grocery")}
                className="h-10 w-10 rounded-2xl bg-background/50 backdrop-blur-2xl flex items-center justify-center shadow-xl border border-white/10"
              >
                <ArrowLeft className="h-4 w-4 text-foreground" />
              </motion.button>
              <div className="flex items-center gap-2">
                <motion.button
                  whileTap={{ scale: 0.85 }}
                  onClick={() => setChatOpen(true)}
                  className="h-10 w-10 rounded-2xl bg-background/50 backdrop-blur-2xl flex items-center justify-center shadow-xl border border-white/10"
                >
                  <MessageCircle className="h-4 w-4 text-foreground" />
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.85 }}
                  onClick={() => setShowCart(true)}
                  className="relative h-10 w-10 rounded-2xl bg-background/50 backdrop-blur-2xl flex items-center justify-center shadow-xl border border-white/10"
                >
                  <ShoppingCart className="h-4 w-4 text-foreground" />
                  {cart.itemCount > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1.5 -right-1.5 h-5 min-w-[20px] px-1 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center ring-2 ring-background shadow-lg shadow-primary/30"
                    >
                      {cart.itemCount}
                    </motion.span>
                  )}
                </motion.button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ── Store Info Card - 3D glassmorphic ── */}
      <div className="relative px-4 -mt-16 z-10" style={{ perspective: "1000px" }}>
        <motion.div
          initial={{ y: 50, opacity: 0, rotateX: 10 }}
          animate={{ y: 0, opacity: 1, rotateX: 0 }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.1 }}
          className="bg-card/70 backdrop-blur-2xl rounded-3xl border border-white/[0.08] shadow-2xl shadow-black/10 p-4 relative overflow-hidden"
        >
          {/* Holographic shine */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/[0.06] via-transparent to-primary/[0.02] rounded-3xl pointer-events-none" />
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          
          <div className="flex items-start gap-3 relative">
            <motion.div
              initial={{ scale: 0.7, opacity: 0, rotateY: -20 }}
              animate={{ scale: 1, opacity: 1, rotateY: 0 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 300 }}
              className="h-16 w-16 rounded-2xl bg-background/80 backdrop-blur-sm border border-white/10 overflow-hidden flex items-center justify-center shrink-0 shadow-xl shadow-black/5"
            >
              {store.logo_url ? (
                <img src={store.logo_url} alt={store.name} className="h-full w-full object-contain p-1" />
              ) : (
                <Store className="h-8 w-8 text-muted-foreground/30" />
              )}
            </motion.div>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-bold text-foreground truncate">{store.name}</h1>
              <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                  {store.rating || "4.5"}
                </span>
                {store.hours && (() => {
                  // Parse hours JSON and show today's hours
                  try {
                    const days = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
                    const today = days[new Date().getDay()];
                    const parsed = typeof store.hours === "string" ? JSON.parse(store.hours) : store.hours;
                    const todayHours = parsed?.[today];
                    if (todayHours?.closed) {
                      return (
                        <span className="flex items-center gap-0.5 text-xs text-red-500">
                          <Clock className="h-3 w-3" /> Closed Today
                        </span>
                      );
                    }
                    if (todayHours?.open && todayHours?.close) {
                      return (
                        <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" /> {todayHours.open} – {todayHours.close}
                        </span>
                      );
                    }
                  } catch {}
                  return null;
                })()}
                {store.delivery_min && (
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-primary/10 text-primary border-primary/15">
                    {store.delivery_min}m delivery
                  </Badge>
                )}
              </div>
              {store.description && (
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{store.description}</p>
              )}
            </div>
          </div>

          {/* Contact row — immersive 4D cards */}
          <div className="grid grid-cols-2 gap-2.5 mt-3 pt-3 border-t border-white/[0.06]" style={{ perspective: "800px" }}>
            {store.address && (
              <motion.button
                whileTap={{ scale: 0.94, rotateX: 2 }}
                whileHover={{ scale: 1.03, rotateY: -3, rotateX: 2 }}
                onClick={() => {
                  const params = new URLSearchParams({ destination: store.address! });
                  const s = store as any;
                  if (s.latitude && s.longitude) {
                    params.set("destLat", String(s.latitude));
                    params.set("destLng", String(s.longitude));
                  }
                  navigate(`/rides/hub?${params.toString()}`);
                }}
                className="relative flex items-center gap-2.5 rounded-xl border border-white/20 overflow-hidden h-14 px-3 group"
                style={{
                  transformStyle: "preserve-3d",
                  boxShadow: "0 6px 24px -6px hsl(var(--primary) / 0.2), 0 2px 6px -2px hsl(0 0% 0% / 0.12), inset 0 1px 0 0 hsl(0 0% 100% / 0.12)",
                }}
              >
                {/* Background image with parallax movement */}
                <motion.div
                  className="absolute inset-0 z-0"
                  animate={{ scale: [1, 1.08, 1], x: [0, 3, -2, 0], y: [0, -2, 1, 0] }}
                  transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                >
                  <img src={storeRideBg} alt="" className="w-full h-full object-cover" loading="lazy" />
                </motion.div>
                <div className="absolute inset-0 z-[1] bg-gradient-to-r from-black/60 via-black/40 to-black/50" />
                <motion.div
                  className="absolute inset-0 z-[2] pointer-events-none"
                  animate={{ opacity: [0, 0.3, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  style={{ background: "linear-gradient(135deg, transparent 30%, hsl(0 0% 100% / 0.12) 50%, transparent 70%)" }}
                />
                {/* Content */}
                <div className="relative z-[3] h-8 w-8 rounded-lg flex items-center justify-center shrink-0 border border-white/20"
                  style={{
                    background: "linear-gradient(135deg, hsl(var(--primary) / 0.85), hsl(var(--primary) / 0.6))",
                    boxShadow: "0 3px 10px -2px hsl(var(--primary) / 0.5)",
                    transform: "translateZ(16px)",
                  }}
                >
                  <MapPin className="h-4 w-4 text-primary-foreground drop-shadow-md" />
                </div>
                <div className="relative z-[3] flex flex-col items-start min-w-0">
                  <p className="text-[11px] font-bold text-white drop-shadow-md">{t("store.ride_there") || "Ride There"}</p>
                  <p className="text-[8px] text-white/65 leading-tight truncate w-full drop-shadow-sm">{store.address}</p>
                </div>
              </motion.button>
            )}
            {store.phone && (
              <motion.a
                whileTap={{ scale: 0.94, rotateX: 2 }}
                whileHover={{ scale: 1.03, rotateY: 3, rotateX: 2 }}
                href={`tel:${store.phone.startsWith("+") ? store.phone.replace(/\s+/g, "") : `+855${store.phone.replace(/\s+/g, "")}`}`}
                className="relative flex items-center gap-2.5 rounded-xl border border-white/20 overflow-hidden h-14 px-3 group"
                style={{
                  transformStyle: "preserve-3d",
                  boxShadow: "0 6px 24px -6px hsl(152 70% 50% / 0.2), 0 2px 6px -2px hsl(0 0% 0% / 0.12), inset 0 1px 0 0 hsl(0 0% 100% / 0.12)",
                }}
              >
                <motion.div
                  className="absolute inset-0 z-0"
                  animate={{ scale: [1, 1.06, 1], x: [0, -2, 3, 0], y: [0, 2, -1, 0] }}
                  transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
                >
                  <img src={storeCallBg} alt="" className="w-full h-full object-cover" loading="lazy" />
                </motion.div>
                <div className="absolute inset-0 z-[1] bg-gradient-to-r from-black/60 via-black/40 to-black/50" />
                <motion.div
                  className="absolute inset-0 z-[2] pointer-events-none"
                  animate={{ opacity: [0, 0.25, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                  style={{ background: "linear-gradient(225deg, transparent 30%, hsl(0 0% 100% / 0.12) 50%, transparent 70%)" }}
                />
                <div className="relative z-[3] h-8 w-8 rounded-lg flex items-center justify-center shrink-0 border border-white/20"
                  style={{
                    background: "linear-gradient(135deg, hsl(152 70% 45% / 0.9), hsl(152 70% 35% / 0.7))",
                    boxShadow: "0 3px 10px -2px hsl(152 70% 50% / 0.5)",
                    transform: "translateZ(16px)",
                  }}
                >
                  <Phone className="h-4 w-4 text-white drop-shadow-md" />
                </div>
                <div className="relative z-[3] flex flex-col items-start min-w-0">
                  <p className="text-[11px] font-bold text-white drop-shadow-md">{t("store.call_store") || "Call Store"}</p>
                  <p className="text-[10px] text-white/75 font-semibold drop-shadow-sm">{store.phone.startsWith("+") ? store.phone : `+855 ${store.phone}`}</p>
                </div>
              </motion.a>
            )}

            {/* Live Chat button */}
            <motion.button
              whileTap={{ scale: 0.94, rotateX: 2 }}
              whileHover={{ scale: 1.03, rotateY: -3, rotateX: 2 }}
              onClick={() => setChatOpen(true)}
              className="relative flex items-center gap-2.5 rounded-xl border border-white/20 overflow-hidden h-14 px-3 group"
              style={{
                transformStyle: "preserve-3d",
                boxShadow: "0 6px 24px -6px hsl(217 90% 55% / 0.2), 0 2px 6px -2px hsl(0 0% 0% / 0.12), inset 0 1px 0 0 hsl(0 0% 100% / 0.12)",
              }}
            >
              <div className="absolute inset-0 z-0 bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600" />
              <div className="absolute inset-0 z-[1] bg-black/20" />
              <motion.div
                className="absolute inset-0 z-[2] pointer-events-none"
                animate={{ opacity: [0, 0.3, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                style={{ background: "linear-gradient(135deg, transparent 30%, hsl(0 0% 100% / 0.15) 50%, transparent 70%)" }}
              />
              <div className="relative z-[3] h-8 w-8 rounded-lg flex items-center justify-center shrink-0 border border-white/20"
                style={{
                  background: "linear-gradient(135deg, hsl(217 90% 55% / 0.9), hsl(217 90% 45% / 0.7))",
                  boxShadow: "0 3px 10px -2px hsl(217 90% 55% / 0.5)",
                  transform: "translateZ(16px)",
                }}
              >
                <MessageCircle className="h-4 w-4 text-white drop-shadow-md" />
              </div>
              <div className="relative z-[3] flex flex-col items-start min-w-0">
                <p className="text-[11px] font-bold text-white drop-shadow-md">Live Chat</p>
                <p className="text-[10px] text-white/75 font-semibold drop-shadow-sm">Chat with store</p>
              </div>
            </motion.button>

            {/* Facebook button */}
            {(store as any).facebook_url && isAllowedSocialUrl((store as any).facebook_url) && (
              <motion.button
                whileTap={{ scale: 0.94, rotateX: 2 }}
                whileHover={{ scale: 1.03, rotateY: 3, rotateX: 2 }}
                onClick={() => import("@/lib/openExternalUrl").then(({ openExternalUrl }) => openExternalUrl((store as any).facebook_url))}
                className="relative flex items-center gap-2.5 rounded-xl border border-white/20 overflow-hidden h-14 px-3 group"
                style={{
                  transformStyle: "preserve-3d",
                  boxShadow: "0 6px 24px -6px hsl(221 44% 41% / 0.2), 0 2px 6px -2px hsl(0 0% 0% / 0.12), inset 0 1px 0 0 hsl(0 0% 100% / 0.12)",
                }}
              >
                <div className="absolute inset-0 z-0 bg-gradient-to-r from-[#1877F2] via-[#166FE5] to-[#0C5DC7]" />
                <div className="absolute inset-0 z-[1] bg-black/15" />
                <motion.div
                  className="absolute inset-0 z-[2] pointer-events-none"
                  animate={{ opacity: [0, 0.25, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
                  style={{ background: "linear-gradient(225deg, transparent 30%, hsl(0 0% 100% / 0.12) 50%, transparent 70%)" }}
                />
                <div className="relative z-[3] h-8 w-8 rounded-lg flex items-center justify-center shrink-0 border border-white/20"
                  style={{
                    background: "linear-gradient(135deg, #1877F2, #0C5DC7)",
                    boxShadow: "0 3px 10px -2px hsl(221 44% 41% / 0.5)",
                    transform: "translateZ(16px)",
                  }}
                >
                  <Facebook className="h-4 w-4 text-white drop-shadow-md" />
                </div>
                <div className="relative z-[3] flex flex-col items-start min-w-0">
                  <p className="text-[11px] font-bold text-white drop-shadow-md">Facebook</p>
                  <p className="text-[10px] text-white/75 font-semibold drop-shadow-sm">Visit page</p>
                </div>
              </motion.button>
            )}

            {/* Instagram button */}
            {(store as any).instagram_url && isAllowedSocialUrl((store as any).instagram_url) && (
              <motion.a
                whileTap={{ scale: 0.94, rotateX: 2 }}
                whileHover={{ scale: 1.03, rotateY: -3, rotateX: 2 }}
                href={(store as any).instagram_url}
                target="_blank"
                rel="noopener noreferrer"
                className="relative flex items-center gap-2.5 rounded-xl border border-white/20 overflow-hidden h-14 px-3 group"
                style={{
                  transformStyle: "preserve-3d",
                  boxShadow: "0 6px 24px -6px hsl(330 80% 50% / 0.2), 0 2px 6px -2px hsl(0 0% 0% / 0.12), inset 0 1px 0 0 hsl(0 0% 100% / 0.12)",
                }}
              >
                <div className="absolute inset-0 z-0 bg-gradient-to-r from-[#833AB4] via-[#E4405F] to-[#FCAF45]" />
                <div className="absolute inset-0 z-[1] bg-black/20" />
                <motion.div
                  className="absolute inset-0 z-[2] pointer-events-none"
                  animate={{ opacity: [0, 0.25, 0] }}
                  transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
                  style={{ background: "linear-gradient(135deg, transparent 30%, hsl(0 0% 100% / 0.15) 50%, transparent 70%)" }}
                />
                <div className="relative z-[3] h-8 w-8 rounded-lg flex items-center justify-center shrink-0 border border-white/20"
                  style={{
                    background: "linear-gradient(135deg, #E4405F, #833AB4)",
                    boxShadow: "0 3px 10px -2px hsl(330 80% 50% / 0.5)",
                    transform: "translateZ(16px)",
                  }}
                >
                  <Instagram className="h-4 w-4 text-white drop-shadow-md" />
                </div>
                <div className="relative z-[3] flex flex-col items-start min-w-0">
                  <p className="text-[11px] font-bold text-white drop-shadow-md">Instagram</p>
                  <p className="text-[10px] text-white/75 font-semibold drop-shadow-sm">Follow us</p>
                </div>
              </motion.a>
            )}

            {/* Telegram button */}
            {(store as any).telegram_url && isAllowedSocialUrl((store as any).telegram_url) && (
              <motion.a
                whileTap={{ scale: 0.94, rotateX: 2 }}
                whileHover={{ scale: 1.03, rotateY: 3, rotateX: 2 }}
                href={(store as any).telegram_url}
                target="_blank"
                rel="noopener noreferrer"
                className="relative flex items-center gap-2.5 rounded-xl border border-white/20 overflow-hidden h-14 px-3 group"
                style={{
                  transformStyle: "preserve-3d",
                  boxShadow: "0 6px 24px -6px hsl(200 80% 50% / 0.2), 0 2px 6px -2px hsl(0 0% 0% / 0.12), inset 0 1px 0 0 hsl(0 0% 100% / 0.12)",
                }}
              >
                <div className="absolute inset-0 z-0 bg-gradient-to-r from-[#0088cc] via-[#0099dd] to-[#00aaee]" />
                <div className="absolute inset-0 z-[1] bg-black/15" />
                <motion.div
                  className="absolute inset-0 z-[2] pointer-events-none"
                  animate={{ opacity: [0, 0.3, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1.2 }}
                  style={{ background: "linear-gradient(225deg, transparent 30%, hsl(0 0% 100% / 0.12) 50%, transparent 70%)" }}
                />
                <div className="relative z-[3] h-8 w-8 rounded-lg flex items-center justify-center shrink-0 border border-white/20"
                  style={{
                    background: "linear-gradient(135deg, #0088cc, #006699)",
                    boxShadow: "0 3px 10px -2px hsl(200 80% 50% / 0.5)",
                    transform: "translateZ(16px)",
                  }}
                >
                  <Send className="h-4 w-4 text-white drop-shadow-md" />
                </div>
                <div className="relative z-[3] flex flex-col items-start min-w-0">
                  <p className="text-[11px] font-bold text-white drop-shadow-md">Telegram</p>
                  <p className="text-[10px] text-white/75 font-semibold drop-shadow-sm">Message us</p>
                </div>
              </motion.a>
            )}

            {/* TikTok button */}
            {(store as any).tiktok_url && isAllowedSocialUrl((store as any).tiktok_url) && (
              <motion.a
                whileTap={{ scale: 0.94, rotateX: 2 }}
                whileHover={{ scale: 1.03, rotateY: -3, rotateX: 2 }}
                href={(store as any).tiktok_url}
                target="_blank"
                rel="noopener noreferrer"
                className="relative flex items-center gap-2.5 rounded-xl border border-white/20 overflow-hidden h-14 px-3 group"
                style={{
                  transformStyle: "preserve-3d",
                  boxShadow: "0 6px 24px -6px hsl(0 0% 0% / 0.3), 0 2px 6px -2px hsl(0 0% 0% / 0.12), inset 0 1px 0 0 hsl(0 0% 100% / 0.12)",
                }}
              >
                <div className="absolute inset-0 z-0 bg-gradient-to-r from-[#010101] via-[#1a1a2e] to-[#010101]" />
                <div className="absolute inset-0 z-[1] bg-black/10" />
                <motion.div
                  className="absolute inset-0 z-[2] pointer-events-none"
                  animate={{ opacity: [0, 0.3, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
                  style={{ background: "linear-gradient(135deg, transparent 20%, hsl(180 100% 50% / 0.1) 40%, hsl(340 100% 50% / 0.1) 60%, transparent 80%)" }}
                />
                <div className="relative z-[3] h-8 w-8 rounded-lg flex items-center justify-center shrink-0 border border-white/20"
                  style={{
                    background: "linear-gradient(135deg, #010101, #333)",
                    boxShadow: "0 3px 10px -2px hsl(180 100% 50% / 0.3), 0 3px 10px -2px hsl(340 100% 50% / 0.3)",
                    transform: "translateZ(16px)",
                  }}
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4 text-white drop-shadow-md" fill="currentColor">
                    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.34-6.34V9.16a8.18 8.18 0 004.76 1.52v-3.4a4.85 4.85 0 01-1-.59z" />
                  </svg>
                </div>
                <div className="relative z-[3] flex flex-col items-start min-w-0">
                  <p className="text-[11px] font-bold text-white drop-shadow-md">TikTok</p>
                  <p className="text-[10px] text-white/75 font-semibold drop-shadow-sm">Watch videos</p>
                </div>
              </motion.a>
            )}
          </div>

          {/* Book Now button for auto-repair stores */}
          {store.category === "auto-repair" && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-3 pt-3 border-t border-white/[0.06]"
            >
              <Button
                onClick={() => navigate(`/book/${slug}`)}
                className="w-full h-12 rounded-xl text-sm font-bold gap-2 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25"
              >
                <CalendarCheck className="h-4 w-4" />
                Book a Service
              </Button>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* ── Promo Banner Carousel ── */}
      {(store.gallery_images?.length ?? 0) > 0 && (
        <div className="px-4 pt-4">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 300, damping: 25 }}
            className="rounded-2xl overflow-hidden border border-white/[0.08] shadow-lg shadow-black/5 relative h-48"
          >
            <StoreHeroCarousel
              images={store.gallery_images!}
              storeName={store.name}
              positions={(store as any).gallery_positions}
            />
          </motion.div>
        </div>
      )}


      {/* ── Category Tabs - 3D Spatial Pills ── */}
      {categories.length > 0 && (
        <div className="relative px-4 pt-5">
          {/* Frosted track background */}
          <div className="absolute inset-x-4 top-5 bottom-0 rounded-2xl bg-card/30 backdrop-blur-xl border border-white/[0.06] shadow-inner" />
          <div className="relative flex gap-1.5 overflow-x-auto no-scrollbar p-1.5">
            <motion.button
              whileTap={{ scale: 0.88, rotateX: 8 }}
              whileHover={{ y: -2, scale: 1.03 }}
              onClick={() => setSelectedCategory(undefined)}
              className={cn(
                "relative px-5 py-2.5 rounded-xl text-[11px] font-extrabold whitespace-nowrap shrink-0 transition-all duration-200",
                "border backdrop-blur-sm",
                !selectedCategory
                  ? "bg-gradient-to-b from-primary via-primary to-primary/85 text-primary-foreground shadow-xl shadow-primary/30 border-primary/50 ring-1 ring-primary/20"
                  : "bg-card/60 text-muted-foreground border-white/[0.08] hover:bg-card/90 hover:border-white/[0.15] hover:text-foreground"
              )}
              style={{ transformStyle: "preserve-3d" }}
            >
              {!selectedCategory && (
                <div className="absolute inset-0 rounded-xl bg-gradient-to-b from-white/20 via-transparent to-black/10 pointer-events-none" />
              )}
              <span className="relative z-10">All</span>
            </motion.button>
            {categories.map((cat) => (
              <motion.button
                whileTap={{ scale: 0.88, rotateX: 8 }}
                whileHover={{ y: -2, scale: 1.03 }}
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={cn(
                  "relative px-5 py-2.5 rounded-xl text-[11px] font-extrabold whitespace-nowrap shrink-0 transition-all duration-200",
                  "border backdrop-blur-sm",
                  selectedCategory === cat
                    ? "bg-gradient-to-b from-primary via-primary to-primary/85 text-primary-foreground shadow-xl shadow-primary/30 border-primary/50 ring-1 ring-primary/20"
                    : "bg-card/60 text-muted-foreground border-white/[0.08] hover:bg-card/90 hover:border-white/[0.15] hover:text-foreground"
                )}
                style={{ transformStyle: "preserve-3d" }}
              >
                {selectedCategory === cat && (
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-b from-white/20 via-transparent to-black/10 pointer-events-none" />
                )}
                <span className="relative z-10">{localizedName(cat, currentLanguage)}</span>
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {/* ── Section Header ── */}
      <div className="flex items-center justify-between px-4 pt-5 pb-1">
        <div className="flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          <h2 className="text-sm font-bold text-foreground">
            {store.category === "auto-repair"
              ? (selectedCategory ? localizedName(selectedCategory, currentLanguage) : "All Services")
              : (selectedCategory ? localizedName(selectedCategory, currentLanguage) : t("store.all_products"))}
          </h2>
        </div>
        <span className="text-[10px] text-muted-foreground font-medium">
          {products.length} {store.category === "auto-repair" ? "services" : t("store.items")}
        </span>
      </div>

      {/* ── Auto Repair Services List ── */}
      {store.category === "auto-repair" ? (
        <div className="px-4 pt-1 pb-40 space-y-3">
          {loadingProducts ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <Package className="h-12 w-12 text-muted-foreground/20" />
              <p className="text-sm text-muted-foreground">No services available</p>
            </div>
          ) : (
            (() => {
              const grouped = !selectedCategory
                ? categories.reduce<Record<string, typeof products>>((acc, cat) => {
                    acc[cat] = products.filter((p: any) => p.category === cat);
                    return acc;
                  }, {})
                : { [selectedCategory]: products };
              if (!selectedCategory) {
                const uncategorized = products.filter((p: any) => !p.category || !categories.includes(p.category));
                if (uncategorized.length > 0) grouped["Other"] = uncategorized;
              }
              return Object.entries(grouped).map(([cat, catProducts]) => {
                if (!catProducts.length) return null;
                return (
                  <div key={cat} className="space-y-2">
                    {!selectedCategory && Object.keys(grouped).length > 1 && (
                      <div className="flex items-center gap-2 pt-2">
                        <div className="h-6 w-6 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Package className="h-3 w-3 text-primary" />
                        </div>
                        <h3 className="text-xs font-bold text-foreground">{cat}</h3>
                        <span className="text-[10px] text-muted-foreground bg-muted/40 px-1.5 py-0.5 rounded-full">{catProducts.length}</span>
                        <div className="flex-1 h-px bg-border/30" />
                      </div>
                    )}
                    {catProducts.map((service) => {
                      const p = service as any;
                      return (
                        <motion.div
                          key={service.id}
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="rounded-xl border border-border/50 bg-card/80 backdrop-blur-sm overflow-hidden"
                        >
                          <div className="flex gap-3 p-3">
                            {/* Service image */}
                            {service.image_url ? (
                              <div className="h-16 w-16 rounded-lg overflow-hidden bg-muted/10 shrink-0">
                                <img src={service.image_url} alt={service.name} className="h-full w-full object-cover" loading="lazy" />
                              </div>
                            ) : (
                              <div className="h-16 w-16 rounded-lg bg-primary/5 flex items-center justify-center shrink-0">
                                <Package className="h-6 w-6 text-primary/30" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-foreground leading-tight">{localizedName(service.name, currentLanguage)}</p>
                              {service.description && (
                                <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">{service.description}</p>
                              )}
                              <div className="flex items-center gap-2 mt-1.5">
                                {p.unit && (
                                  <Badge variant="secondary" className="text-[9px] px-1.5 py-0 h-4 gap-0.5">
                                    <Clock className="h-2.5 w-2.5" />
                                    {p.unit}
                                  </Badge>
                                )}
                                {p.category && (
                                  <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4">
                                    {p.category}
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <div className="flex flex-col items-end justify-between shrink-0">
                              <div className="text-right">
                                <p className="text-sm font-bold text-foreground">${service.price.toFixed(2)}</p>
                                <p className="text-[9px] text-muted-foreground">starting</p>
                              </div>
                              <motion.button
                                whileTap={{ scale: 0.92 }}
                                onClick={() => {
                                  navigate(`/book/${slug}?service=${encodeURIComponent(service.name)}`);
                                }}
                                className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-[11px] font-bold shadow-sm"
                              >
                                Book
                              </motion.button>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                );
              });
            })()
          )}
        </div>
      ) : (

      /* ── Products Grid - 3D Holographic Cards (Grocery) ── */
      <div className="px-3 pt-1 pb-40" style={{ perspective: "1200px" }}>
        {loadingProducts ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Package className="h-12 w-12 text-muted-foreground/20" />
            <p className="text-sm text-muted-foreground">{t("store.no_products")}</p>
          </div>
        ) : (
          (() => {
            // Group by category when showing "All"
            const grouped = !selectedCategory
              ? categories.reduce<Record<string, typeof products>>((acc, cat) => {
                  acc[cat] = products.filter((p: any) => p.category === cat);
                  return acc;
                }, {})
              : { [selectedCategory]: products };

            // Add uncategorized
            if (!selectedCategory) {
              const uncategorized = products.filter((p: any) => !p.category || !categories.includes(p.category));
              if (uncategorized.length > 0) grouped[t("store.other") || "Other"] = uncategorized;
            }

            return Object.entries(grouped).map(([cat, catProducts]) => {
              if (!catProducts.length) return null;
              return (
                <div key={cat} className="mb-5">
                  {!selectedCategory && Object.keys(grouped).length > 1 && (
                    <div className="flex items-center gap-2.5 mb-3 px-1">
                      <div className="h-7 w-7 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Package className="h-3.5 w-3.5 text-primary" />
                      </div>
                      <h3 className="text-[13px] font-bold text-foreground tracking-tight">{localizedName(cat, currentLanguage)}</h3>
                      <span className="text-[10px] text-muted-foreground/60 font-medium bg-muted/30 px-2 py-0.5 rounded-full">{catProducts.length}</span>
                      <div className="flex-1 h-px bg-border/30 ml-1" />
                    </div>
                  )}
                  <motion.div
                    variants={container}
                    initial="hidden"
                    animate="show"
                    className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-3 px-3"
                    style={{ WebkitOverflowScrolling: "touch" }}
                  >
                    {catProducts.map((product, i) => {
                      const p = product as any;
                      const sizeVariants: { size: string; price_khr: number; price_usd: number }[] = (p.size_variants || []);
                      const hasSizes = sizeVariants.length > 0;
                      const selectedIdx = selectedSizes[product.id] ?? 0;
                      const activeVariant = hasSizes ? sizeVariants[selectedIdx] : null;
                      const activePrice = activeVariant ? activeVariant.price_usd : product.price;
                      const activeKhr = activeVariant ? activeVariant.price_khr : ((p.price_khr || Math.round(product.price * ((store as any)?.khr_rate || 4050))));
                      const cartKey = hasSizes && activeVariant ? `${product.id}__${activeVariant.size}` : product.id;
                      const cartItem = cart.items.find((c) => c.productId === cartKey);
                      const khrPrice = activeKhr;
                      const isLiked = likedProducts.has(product.id);
                      const hasBogo = p.discount_type === "bogo" && (p.buy_quantity || 0) >= 1 && (p.get_quantity || 0) >= 1
                        && (!p.discount_expires_at || new Date(p.discount_expires_at) > new Date());
                      const hasDiscount = !hasBogo && p.discount_type && p.discount_value > 0 && p.discount_price_khr != null
                        && (!p.discount_expires_at || new Date(p.discount_expires_at) > new Date());
                      const discountKhr = hasDiscount ? p.discount_price_khr : null;
                      const discountUsd = hasDiscount ? parseFloat((discountKhr / ((store as any)?.khr_rate || 4050)).toFixed(2)) : null;
                      const discountPct = hasDiscount && p.discount_type === "percentage" ? p.discount_value : null;
                      return (
                <motion.div
                  key={product.id}
                  variants={cardVariant}
                  whileTap={{ scale: 0.96 }}
                  className={cn(
                    "group relative rounded-2xl overflow-hidden snap-start shrink-0",
                    "bg-card border",
                    "w-[28vw] min-w-[105px] max-w-[120px]",
                    cartItem
                      ? "border-primary/30 ring-1 ring-primary/10"
                      : "border-border/40"
                  )}
                >
                  {/* Image */}
                  <div className="relative aspect-square overflow-hidden bg-muted/10 rounded-t-2xl">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={localizedName(product.name, currentLanguage)}
                        className="h-full w-full object-contain p-1.5"
                        loading="lazy"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center">
                        <Package className="h-5 w-5 text-muted-foreground/20" />
                      </div>
                    )}

                    {/* Badge - top right */}
                    {(product as any).badge && (() => {
                      const badgeMap: Record<string, { labelKm: string; labelEn: string; cls: string }> = {
                        "new": { labelKm: "ថ្មី", labelEn: "New", cls: "from-blue-500 to-indigo-600" },
                        "hot": { labelKm: "ក្ដៅ", labelEn: "Hot", cls: "from-red-500 to-orange-500" },
                        "popular": { labelKm: "កំពូល", labelEn: "Popular", cls: "from-amber-400 to-orange-500" },
                        "best-seller": { labelKm: "លក់ដាច់", labelEn: "Best Seller", cls: "from-emerald-500 to-teal-500" },
                        "limited": { labelKm: "មានកំណត់", labelEn: "Limited", cls: "from-purple-500 to-pink-500" },
                        "recommended": { labelKm: "ណែនាំ", labelEn: "Recommended", cls: "from-sky-400 to-blue-500" },
                        "organic": { labelKm: "ធម្មជាតិ", labelEn: "Organic", cls: "from-green-500 to-emerald-500" },
                        "imported": { labelKm: "នាំចូល", labelEn: "Imported", cls: "from-violet-500 to-fuchsia-500" },
                      };
                      const b = badgeMap[(product as any).badge];
                      if (!b) return null;
                      return (
                        <div className={cn("absolute top-1 right-1 px-1.5 py-0.5 rounded-md bg-gradient-to-r text-white text-[6px] font-bold z-10", b.cls)}>
                          {currentLanguage === "km" ? b.labelKm : b.labelEn}
                        </div>
                      );
                    })()}

                    {/* Discount badge */}
                    {hasDiscount && (
                      <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded-md bg-destructive text-destructive-foreground text-[7px] font-bold z-10">
                        {discountPct ? `-${discountPct}%` : t("store.sale")}
                      </div>
                    )}

                    {/* BOGO badge */}
                    {hasBogo && (
                      <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded-md bg-emerald-500 text-white text-[6px] font-bold z-10">
                        {t("store.buy_x_get_y").replace("{buy}", String(p.buy_quantity)).replace("{get}", String(p.get_quantity))}
                      </div>
                    )}

                    {/* Cart quantity */}
                    <AnimatePresence>
                      {cartItem && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                          className="absolute top-1 left-1 h-5 min-w-[20px] px-1 rounded-full bg-primary flex items-center justify-center ring-1 ring-background z-20"
                        >
                          <span className="text-[8px] font-black text-primary-foreground">{cartItem.quantity}</span>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Like button */}
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleLike(product.id); }}
                      className="absolute bottom-1 right-1 h-5 w-5 rounded-full bg-background/60 backdrop-blur flex items-center justify-center z-20"
                    >
                      <Heart className={cn("h-2.5 w-2.5", isLiked ? "fill-rose-500 text-rose-500" : "text-muted-foreground/50")} />
                    </button>
                  </div>

                  {/* Info */}
                  <div className="px-1.5 pt-1 pb-1.5">
                    <p className="text-[9px] font-semibold text-foreground line-clamp-2 leading-tight min-h-[22px]">
                      {localizedName(product.name, currentLanguage)}
                    </p>

                    {/* Size pills */}
                    {hasSizes && (
                      <div className="flex gap-0.5 mt-1">
                        {sizeVariants.map((sv, sIdx) => (
                          <button
                            key={sv.size}
                            onClick={(e) => { e.stopPropagation(); setSelectedSizes(prev => ({ ...prev, [product.id]: sIdx })); }}
                            className={cn(
                              "h-4 px-1.5 rounded text-[7px] font-bold border transition-all",
                              selectedIdx === sIdx
                                ? "bg-primary/15 border-primary/40 text-primary"
                                : "bg-muted/10 border-border/30 text-muted-foreground/40"
                            )}
                          >
                            {sv.size}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Price + Add */}
                    <div className="flex items-end justify-between mt-1">
                      <div>
                        {hasDiscount && !hasSizes ? (
                          <>
                            <span className="text-[11px] font-black text-destructive leading-none block">
                              ៛{discountKhr.toLocaleString()}
                            </span>
                            <span className="text-[7px] text-muted-foreground/40 line-through">
                              ៛{khrPrice.toLocaleString()}
                            </span>
                          </>
                        ) : (
                          <>
                            <span className="text-[11px] font-black text-foreground leading-none block">
                              ៛{khrPrice.toLocaleString()}
                            </span>
                            <span className="text-[7px] text-muted-foreground/40">
                              ${activePrice.toFixed(2)}
                            </span>
                          </>
                        )}
                      </div>

                      {!cartItem && product.in_stock && (
                        <motion.button
                          whileTap={{ scale: 0.8 }}
                          onClick={(e) => { e.stopPropagation(); handleAddToCart(product, activeVariant || undefined); }}
                          className="h-6 w-6 shrink-0 rounded-full bg-primary flex items-center justify-center shadow-sm"
                        >
                          <Plus className="h-3 w-3 text-primary-foreground" />
                        </motion.button>
                      )}
                    </div>

                    {/* Quantity stepper */}
                    {cartItem && (
                      <div className="flex items-center justify-between bg-primary/[0.08] rounded-lg p-0.5 mt-1">
                        <button
                          onClick={(e) => { e.stopPropagation(); cart.updateQuantity(cartKey, cartItem.quantity - 1); }}
                          className="h-5 w-5 rounded-md bg-background/80 flex items-center justify-center touch-manipulation"
                        >
                          <Minus className="h-2.5 w-2.5 text-foreground/60" />
                        </button>
                        <span className="text-[9px] font-black text-primary">{cartItem.quantity}</span>
                        <button
                          onClick={(e) => { e.stopPropagation(); cart.updateQuantity(cartKey, cartItem.quantity + 1); }}
                          className="h-5 w-5 rounded-md bg-background/80 flex items-center justify-center touch-manipulation"
                        >
                          <Plus className="h-2.5 w-2.5 text-foreground/60" />
                        </button>
                      </div>
                    )}

                    {!product.in_stock && (
                      <div className="text-[7px] text-muted-foreground text-center py-1 rounded bg-muted/10 font-semibold mt-1 uppercase">
                        {t("store.out_of_stock")}
                      </div>
                    )}
                  </div>
                </motion.div>
                    );
                    })}
                  </motion.div>
                </div>
              );
            });
          })()
        )}
      </div>
      )}

      {/* ── Floating Cart Bar - Premium 3D ── */}
      <AnimatePresence>
        {cart.itemCount > 0 && !showCart && (
          <motion.div
            initial={{ y: 80, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 80, opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed bottom-24 left-3 right-3 z-50"
          >
            <button
              onClick={() => setShowCart(true)}
              className="w-full rounded-2xl bg-gradient-to-r from-primary via-primary to-primary/90 text-primary-foreground shadow-2xl shadow-primary/30 border border-primary/30 relative overflow-hidden active:scale-[0.98] transition-transform px-4 py-3"
            >
              {/* Shine */}
              <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-white/5 to-transparent pointer-events-none" />
              <div className="relative z-10 flex items-center justify-between">
                {/* Left: cart icon + count */}
                <div className="flex items-center gap-2">
                  <div className="h-9 w-9 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <ShoppingCart className="h-4 w-4" />
                  </div>
                  <div className="text-left">
                    <p className="text-[13px] font-extrabold">{store?.category === "auto-repair" ? "View Booking" : t("store.view_cart")}</p>
                    <p className="text-[10px] font-medium opacity-80">{cart.itemCount} {store?.category === "auto-repair" ? "services" : t("store.items")}</p>
                  </div>
                </div>
                {/* Right: price */}
                <div className="text-right">
                  <p className="text-[14px] font-extrabold">៛{Math.round(cart.total * ((store as any)?.khr_rate || 4050)).toLocaleString()}</p>
                  <p className="text-[10px] font-medium opacity-80">${cart.total.toFixed(2)}</p>
                </div>
              </div>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {showCart && (
        <GroceryCheckoutDrawer
          items={cart.items}
          total={cart.total}
          onClose={() => setShowCart(false)}
          onOrderPlaced={() => { cart.clearCart(); setShowCart(false); }}
          onRemoveItem={cart.removeItem}
          onUpdateQuantity={cart.updateQuantity}
          storeCoords={store?.latitude && store?.longitude ? { lat: store.latitude, lng: store.longitude } : null}
          storeName={store?.name}
          storePaymentTypes={(store?.payment_types as any[]) || ["cash", "card"]}
        />
      )}
      {store && (
        <StoreLiveChat
          storeId={store.id}
          storeName={store.name}
          storeLogo={store.logo_url}
          open={chatOpen}
          onClose={() => setChatOpen(false)}
        />
      )}
      <ZivoMobileNav />
    </div>
  );
}
