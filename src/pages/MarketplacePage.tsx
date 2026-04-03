/**
 * MarketplacePage — Buy & sell items between users
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import ZivoMobileNav from "@/components/app/ZivoMobileNav";
import { ArrowLeft, Plus, Search, Heart, MapPin, Tag, ShoppingBag, Filter, DollarSign, Eye, Grid3X3, LayoutList } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

const CONDITIONS = ["All", "New", "Like New", "Good", "Fair"];

export default function MarketplacePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [conditionFilter, setConditionFilter] = useState("All");
  const [showCreate, setShowCreate] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [newListing, setNewListing] = useState({ title: "", description: "", price: "", condition: "New", location: "", is_negotiable: false });

  const { data: listings = [], isLoading } = useQuery({
    queryKey: ["marketplace-listings", conditionFilter],
    queryFn: async () => {
      let query = (supabase as any)
        .from("marketplace_listings")
        .select("*")
        .eq("status", "active")
        .order("created_at", { ascending: false });
      if (conditionFilter !== "All") query = query.eq("condition", conditionFilter.toLowerCase());
      const { data, error } = await query.limit(50);
      if (error) throw error;
      return data || [];
    },
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Login required");
      const priceCents = Math.round(parseFloat(newListing.price) * 100);
      if (isNaN(priceCents) || priceCents <= 0) throw new Error("Invalid price");
      const { error } = await (supabase as any).from("marketplace_listings").insert({
        title: newListing.title,
        description: newListing.description || null,
        price_cents: priceCents,
        condition: newListing.condition.toLowerCase(),
        location: newListing.location || null,
        is_negotiable: newListing.is_negotiable,
        seller_id: user.id,
        status: "active",
        currency: "USD",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["marketplace-listings"] });
      toast.success("Listing created!");
      setShowCreate(false);
      setNewListing({ title: "", description: "", price: "", condition: "New", location: "", is_negotiable: false });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const filtered = listings.filter((l: any) =>
    !searchQuery || l.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-dvh bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-border/30">
        <div className="flex items-center gap-3 px-4 py-3">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-muted/50">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-lg font-bold flex-1">Marketplace</h1>
          <button onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")} className="p-2 rounded-full hover:bg-muted/50">
            {viewMode === "grid" ? <LayoutList className="h-4 w-4" /> : <Grid3X3 className="h-4 w-4" />}
          </button>
          {user && (
            <button onClick={() => setShowCreate(true)} className="p-2 rounded-full bg-primary text-primary-foreground">
              <Plus className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Search */}
        <div className="px-4 pb-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search marketplace..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-muted/40 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        {/* Condition Filter */}
        <div className="flex gap-2 px-4 pb-3 overflow-x-auto scrollbar-none">
          {CONDITIONS.map((c) => (
            <button
              key={c}
              onClick={() => setConditionFilter(c)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                conditionFilter === c
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted/50 text-muted-foreground hover:bg-muted"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Listings */}
      <div className={`px-4 py-4 ${viewMode === "grid" ? "grid grid-cols-2 gap-3" : "space-y-3"}`}>
        {isLoading ? (
          <div className="col-span-2 text-center py-12 text-muted-foreground text-sm">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="col-span-2 text-center py-12">
            <ShoppingBag className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No listings found</p>
          </div>
        ) : (
          filtered.map((item: any, i: number) => {
            const images = Array.isArray(item.images) ? item.images : [];
            const firstImage = images[0] as string | undefined;

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.03 }}
                className={`bg-card rounded-2xl border border-border/30 overflow-hidden ${
                  viewMode === "list" ? "flex" : ""
                }`}
              >
                {/* Image */}
                <div className={`bg-muted/30 ${viewMode === "grid" ? "aspect-square" : "w-28 h-28 shrink-0"}`}>
                  {firstImage ? (
                    <img src={firstImage} alt={item.title} className="w-full h-full object-cover" loading="lazy" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ShoppingBag className="h-8 w-8 text-muted-foreground/20" />
                    </div>
                  )}
                </div>

                <div className="p-3 flex-1">
                  <h3 className="text-sm font-bold text-foreground line-clamp-1">{item.title}</h3>
                  <p className="text-base font-bold text-primary mt-0.5">
                    ${(item.price_cents / 100).toFixed(2)}
                    {item.is_negotiable && <span className="text-[10px] font-normal text-muted-foreground ml-1">OBO</span>}
                  </p>

                  <div className="flex flex-wrap gap-2 mt-1.5 text-[10px] text-muted-foreground">
                    {item.condition && (
                      <span className="flex items-center gap-0.5">
                        <Tag className="h-2.5 w-2.5" /> {item.condition}
                      </span>
                    )}
                    {item.location && (
                      <span className="flex items-center gap-0.5">
                        <MapPin className="h-2.5 w-2.5" /> {item.location}
                      </span>
                    )}
                    <span className="flex items-center gap-0.5">
                      <Eye className="h-2.5 w-2.5" /> {item.views_count || 0}
                    </span>
                  </div>

                  <p className="text-[10px] text-muted-foreground mt-1">
                    {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                  </p>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Create Listing Sheet */}
      <AnimatePresence>
        {showCreate && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-end justify-center bg-black/50"
            onClick={() => setShowCreate(false)}
          >
            <motion.div
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md bg-background rounded-t-3xl pb-8 max-h-[85vh] overflow-y-auto"
            >
              <div className="flex justify-center py-3">
                <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
              </div>
              <div className="px-5 space-y-4">
                <h3 className="text-base font-bold">Create Listing</h3>
                <input
                  value={newListing.title}
                  onChange={(e) => setNewListing({ ...newListing, title: e.target.value })}
                  placeholder="What are you selling?"
                  className="w-full px-4 py-3 rounded-xl bg-muted/40 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="number"
                    value={newListing.price}
                    onChange={(e) => setNewListing({ ...newListing, price: e.target.value })}
                    placeholder="Price"
                    step="0.01"
                    min="0.01"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-muted/40 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <textarea
                  value={newListing.description}
                  onChange={(e) => setNewListing({ ...newListing, description: e.target.value })}
                  placeholder="Description (optional)"
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl bg-muted/40 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                <input
                  value={newListing.location}
                  onChange={(e) => setNewListing({ ...newListing, location: e.target.value })}
                  placeholder="Location (optional)"
                  className="w-full px-4 py-3 rounded-xl bg-muted/40 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                <select
                  value={newListing.condition}
                  onChange={(e) => setNewListing({ ...newListing, condition: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-muted/40 text-sm focus:outline-none"
                >
                  {CONDITIONS.filter((c) => c !== "All").map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newListing.is_negotiable}
                    onChange={(e) => setNewListing({ ...newListing, is_negotiable: e.target.checked })}
                    className="rounded border-border"
                  />
                  <span className="text-sm text-muted-foreground">Price is negotiable</span>
                </label>
                <button
                  onClick={() => createMutation.mutate()}
                  disabled={!newListing.title || !newListing.price || createMutation.isPending}
                  className="w-full py-3.5 rounded-2xl bg-primary text-primary-foreground font-bold text-sm disabled:opacity-50"
                >
                  {createMutation.isPending ? "Listing..." : "Create Listing"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <ZivoMobileNav />
    </div>
  );
}
