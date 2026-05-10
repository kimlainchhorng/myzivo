/**
 * BookmarksPage — Saved posts, flights, restaurants organized by collection
 */
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Bookmark, Plane, UtensilsCrossed, Image, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import ZivoMobileNav from "@/components/app/ZivoMobileNav";
import SEOHead from "@/components/SEOHead";
import { EmptyState } from "@/components/ui/empty-state";

type BookmarkTab = "all" | "post" | "flight" | "restaurant";

export default function BookmarksPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<BookmarkTab>("all");

  const { data: bookmarks = [], isLoading } = useQuery({
    queryKey: ["bookmarks", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await (supabase as any)
        .from("bookmarks")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      const rows = (data || []) as any[];

      // Enrich saved posts with caption + first media for a real preview
      const postIds = rows.filter((b) => b.item_type === "post").map((b) => b.item_id);
      if (postIds.length > 0) {
        const { data: posts } = await (supabase as any)
          .from("user_posts")
          .select("id, caption, media_url, media_urls")
          .in("id", postIds);
        const postMap = new Map<string, any>((posts || []).map((p: any) => [p.id, p]));
        return rows.map((b) => {
          if (b.item_type !== "post") return b;
          const p = postMap.get(b.item_id);
          if (!p) return b;
          const firstMedia = (Array.isArray(p.media_urls) && p.media_urls[0]) || p.media_url || null;
          const title = (p.caption || "").trim().split("\n")[0].slice(0, 140) || null;
          return { ...b, title, preview_url: firstMedia };
        });
      }
      return rows;
    },
    enabled: !!user,
  });

  const filtered = activeTab === "all" ? bookmarks : bookmarks.filter((b: any) => b.item_type === activeTab);

  const removeBookmark = async (id: string) => {
    await (supabase as any).from("bookmarks").delete().eq("id", id);
    queryClient.invalidateQueries({ queryKey: ["bookmarks"] });
    toast.success("Bookmark removed");
  };

  const tabs: { id: BookmarkTab; label: string; icon: typeof Bookmark }[] = [
    { id: "all", label: "All", icon: Bookmark },
    { id: "post", label: "Posts", icon: Image },
    { id: "flight", label: "Flights", icon: Plane },
    { id: "restaurant", label: "Food", icon: UtensilsCrossed },
  ];

  return (
    <div className="zivo-shell-mobile bg-background pb-20">
      <SEOHead title="Bookmarks – ZIVO" description="Your saved flights, restaurants, and content on ZIVO." canonical="/bookmarks" noIndex />
      <div className="zivo-sticky-mobile-header safe-area-top">
        <div className="flex items-center gap-3 px-4 py-3">
          <Button aria-label="Back" variant="ghost" size="icon" className="h-10 w-10 rounded-full" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold">Saved</h1>
        </div>
        <div className="flex gap-1 px-4 pb-2">
          {tabs.map((t) => (
            <button type="button"
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
                activeTab === t.id ? "bg-primary text-primary-foreground" : "bg-muted/50 text-muted-foreground"
              )}
            >
              <t.icon className="h-3.5 w-3.5" />
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 space-y-2">
        {isLoading && <Loader2 className="h-6 w-6 animate-spin mx-auto mt-12 text-muted-foreground" />}
        {!isLoading && filtered.length === 0 && (
          <EmptyState
            icon={Bookmark}
            tone="brand"
            title={activeTab === "all" ? "Nothing saved yet" : `No ${activeTab}s saved`}
            description="Tap the bookmark icon on any post, flight, or restaurant to keep it here."
            action={
              <Button onClick={() => navigate("/feed")} className="rounded-full">
                Browse the feed
              </Button>
            }
          />
        )}
        <AnimatePresence>
          {filtered.map((b: any) => {
            // Resolve a tap target — posts open in the feed at the saved item.
            const openHref = (() => {
              if (b.item_type === "post" && b.item_id) return `/feed?post=${encodeURIComponent(b.item_id)}`;
              if (b.item_type === "flight" && b.item_id) return `/flights/${b.item_id}`;
              if (b.item_type === "restaurant" && b.item_id) return `/eats/${b.item_id}`;
              return null;
            })();
            const previewTitle = b.title || (b.item_type === "post" ? "Saved post" : null);
            return (
            <motion.div
              key={b.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -100 }}
              className="flex items-stretch gap-3 p-3 rounded-xl bg-card border border-border/40 active:bg-muted/40 transition-colors"
            >
              <button
                type="button"
                onClick={() => openHref && navigate(openHref)}
                disabled={!openHref}
                className="flex flex-1 items-start gap-3 min-w-0 text-left disabled:cursor-default"
              >
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 overflow-hidden">
                  {b.item_type === "post" && b.preview_url ? (
                    <img src={b.preview_url} alt="" loading="lazy" className="h-full w-full object-cover" />
                  ) : b.item_type === "post" ? (
                    <Image className="h-4 w-4 text-primary" />
                  ) : b.item_type === "flight" ? (
                    <Plane className="h-4 w-4 text-primary" />
                  ) : b.item_type === "restaurant" ? (
                    <UtensilsCrossed className="h-4 w-4 text-primary" />
                  ) : null}
                </div>
                <div className="flex-1 min-w-0">
                  {previewTitle ? (
                    <p className="text-sm font-medium text-foreground line-clamp-2 leading-snug">{previewTitle}</p>
                  ) : (
                    <p className="text-sm font-medium text-foreground capitalize">{b.item_type}</p>
                  )}
                  <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                    {b.collection_name && <>{b.collection_name} · </>}
                    Saved {new Date(b.created_at).toLocaleDateString()}
                  </p>
                </div>
              </button>
              <button type="button" onClick={() => removeBookmark(b.id)} aria-label="Remove bookmark" title="Remove bookmark" className="p-2 rounded-full hover:bg-destructive/10 self-start">
                <Trash2 className="h-4 w-4 text-muted-foreground" />
              </button>
            </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      <ZivoMobileNav />
    </div>
  );
}
