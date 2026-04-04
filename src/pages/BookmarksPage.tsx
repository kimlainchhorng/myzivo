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
      return data || [];
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
    <div className="min-h-screen bg-background pb-20">
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border/50 safe-area-top">
        <div className="flex items-center gap-3 px-4 py-3">
          <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold">Saved</h1>
        </div>
        <div className="flex gap-1 px-4 pb-2">
          {tabs.map((t) => (
            <button
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
          <div className="text-center py-16">
            <Bookmark className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
            <p className="text-sm text-muted-foreground">No saved items yet</p>
          </div>
        )}
        <AnimatePresence>
          {filtered.map((b: any) => (
            <motion.div
              key={b.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -100 }}
              className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border/40"
            >
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                {b.item_type === "post" && <Image className="h-4 w-4 text-primary" />}
                {b.item_type === "flight" && <Plane className="h-4 w-4 text-primary" />}
                {b.item_type === "restaurant" && <UtensilsCrossed className="h-4 w-4 text-primary" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground capitalize">{b.item_type}</p>
                <p className="text-xs text-muted-foreground truncate">{b.collection_name} • {new Date(b.created_at).toLocaleDateString()}</p>
              </div>
              <button onClick={() => removeBookmark(b.id)} className="p-2 rounded-full hover:bg-destructive/10">
                <Trash2 className="h-4 w-4 text-muted-foreground" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <ZivoMobileNav />
    </div>
  );
}
