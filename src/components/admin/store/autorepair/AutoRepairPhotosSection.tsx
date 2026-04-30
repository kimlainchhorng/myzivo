import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import Camera from "lucide-react/dist/esm/icons/camera";
import Upload from "lucide-react/dist/esm/icons/upload";
import ImageIcon from "lucide-react/dist/esm/icons/image";
import { toast } from "sonner";

interface Props { storeId: string }

type PhotoType = "all" | "before" | "after" | "in-progress";

const TYPE_STYLE: Record<string, { label: string; className: string }> = {
  before:      { label: "Before",      className: "bg-blue-100 text-blue-800 border-blue-200" },
  after:       { label: "After",       className: "bg-emerald-100 text-emerald-800 border-emerald-200" },
  "in-progress": { label: "In Progress", className: "bg-amber-100 text-amber-800 border-amber-200" },
};

const FILTERS: { value: PhotoType; label: string }[] = [
  { value: "all", label: "All" },
  { value: "before", label: "Before" },
  { value: "after", label: "After" },
  { value: "in-progress", label: "In Progress" },
];

export default function AutoRepairPhotosSection({ storeId }: Props) {
  const [typeFilter, setTypeFilter] = useState<PhotoType>("all");

  const { data: photos = [], isLoading } = useQuery({
    queryKey: ["ar-job-photos", storeId],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("ar_job_photos")
        .select("*")
        .eq("store_id", storeId)
        .order("uploaded_at", { ascending: false });
      if (error) throw error;
      return data as any[];
    },
  });

  const filtered = photos.filter((p: any) =>
    typeFilter === "all" ? true : p.photo_type === typeFilter
  );

  const grouped: Record<string, any[]> = {};
  filtered.forEach((p: any) => {
    const key = p.work_order_id ?? "unassigned";
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(p);
  });

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Camera className="w-4 h-4" /> Job Photos
          </CardTitle>
        </CardHeader>
      </Card>

      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex gap-1.5 flex-wrap">
          {FILTERS.map((f) => (
            <Button
              key={f.value}
              size="sm"
              variant={typeFilter === f.value ? "default" : "outline"}
              className="h-7 text-xs px-3"
              onClick={() => setTypeFilter(f.value)}
            >
              {f.label}
            </Button>
          ))}
        </div>
        <Button
          size="sm"
          className="gap-1.5"
          onClick={() => toast.info("Photo upload coming soon")}
        >
          <Upload className="w-3.5 h-3.5" /> Upload Photo
        </Button>
      </div>

      {isLoading ? (
        <Card><CardContent className="py-10 text-center text-sm text-muted-foreground">Loading photos…</CardContent></Card>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center space-y-3">
            <ImageIcon className="w-8 h-8 mx-auto text-muted-foreground/40" />
            <p className="text-sm font-medium">No photos yet</p>
            <p className="text-xs text-muted-foreground">
              {photos.length === 0
                ? "Job photos will appear here once uploaded."
                : "No photos match this filter."}
            </p>
            {photos.length === 0 && (
              <Button
                size="sm"
                className="gap-1.5"
                onClick={() => toast.info("Photo upload coming soon")}
              >
                <Upload className="w-3.5 h-3.5" /> Upload Photo
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <AnimatePresence initial={false}>
            {Object.entries(grouped).map(([workOrderId, groupPhotos]) => (
              <motion.div
                key={workOrderId}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    {workOrderId === "unassigned"
                      ? "Unassigned"
                      : `Work Order #${workOrderId.slice(0, 8).toUpperCase()}`}
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {groupPhotos.map((p: any) => {
                      const typeMeta = TYPE_STYLE[p.photo_type ?? "before"] ?? TYPE_STYLE.before;
                      return (
                        <Card key={p.id} className="overflow-hidden">
                          <div className="aspect-video bg-muted relative">
                            {p.photo_url ? (
                              <img
                                src={p.photo_url}
                                alt={p.caption ?? "Job photo"}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <ImageIcon className="w-6 h-6 text-muted-foreground/40" />
                              </div>
                            )}
                            <Badge
                              variant="outline"
                              className={`absolute top-1.5 left-1.5 text-[10px] ${typeMeta.className}`}
                            >
                              {typeMeta.label}
                            </Badge>
                          </div>
                          <CardContent className="p-2">
                            {p.caption && (
                              <p className="text-xs font-medium line-clamp-1">{p.caption}</p>
                            )}
                            {p.uploaded_at && (
                              <p className="text-[10px] text-muted-foreground">
                                {new Date(p.uploaded_at).toLocaleDateString()}
                              </p>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
