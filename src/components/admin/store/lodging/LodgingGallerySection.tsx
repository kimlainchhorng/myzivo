import { Images, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LoadingPanel, NextActions, SectionShell, StatCard } from "./LodgingOperationsShared";
import { useLodgePropertyProfile } from "@/hooks/lodging/useLodgePropertyProfile";

const goTab = (tab: string) => window.dispatchEvent(new CustomEvent("lodge-set-tab", { detail: { tab } }));

export default function LodgingGallerySection({ storeId }: { storeId: string }) {
  const { data: profile, isLoading } = useLodgePropertyProfile(storeId);
  const photos: string[] = (profile as any)?.photos || (profile as any)?.gallery || [];

  return (
    <SectionShell
      title="Photos & Gallery"
      subtitle="Manage your hero, cover, and gallery imagery — what guests see first when discovering your property."
      icon={Images}
      actions={<Button size="sm" onClick={() => goTab("lodge-property")} className="gap-1.5">Edit in Property Profile <ArrowRight className="h-3.5 w-3.5" /></Button>}
    >
      {isLoading ? <LoadingPanel /> : <>
        <div className="grid gap-3 sm:grid-cols-3">
          <StatCard label="Gallery photos" value={String(photos.length)} icon={Images} />
          <StatCard label="Cover photo" value={(profile as any)?.cover_photo_url ? "Set" : "Missing"} icon={Images} />
          <StatCard label="Hero photo" value={(profile as any)?.hero_photo_url ? "Set" : "Missing"} icon={Images} />
        </div>

        {photos.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border p-8 text-center">
            <Images className="mx-auto h-10 w-10 text-muted-foreground" />
            <p className="mt-3 text-sm font-semibold text-foreground">Your gallery is empty</p>
            <p className="mt-1 text-xs text-muted-foreground">Strong gallery photos directly increase booking conversion. Add at least 6 high-resolution images of rooms, exterior, restaurant, and amenities.</p>
            <Button className="mt-4" onClick={() => goTab("lodge-property")}>Add gallery photos</Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
            {photos.slice(0, 12).map((url, i) => (
              <div key={`${url}-${i}`} className="relative aspect-video overflow-hidden rounded-lg border border-border bg-muted">
                <img src={url} alt={`Gallery ${i + 1}`} className="h-full w-full object-cover" loading="lazy" />
                {i === 0 && <span className="absolute left-1.5 top-1.5 rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold text-primary-foreground">Hero</span>}
              </div>
            ))}
          </div>
        )}

        <NextActions actions={[
          { label: "Edit property profile", tab: "lodge-property", hint: "Update cover, hero, and gallery from here." },
          { label: "Refine room photos", tab: "lodge-rooms", hint: "Each room type can have its own gallery." },
          { label: "Highlight in promotions", tab: "lodge-promos", hint: "Pair signature photos with seasonal offers." },
        ]} />
      </>}
    </SectionShell>
  );
}
