/**
 * Global Region Selector for Admin Panel header
 */
import { MapPin, Globe } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useRegion } from "@/contexts/RegionContext";
import { cn } from "@/lib/utils";

export function RegionSelector() {
  const { selectedRegionId, setSelectedRegionId, regions, activeRegions, isSuperAdmin, isLoading } = useRegion();

  const disabledRegions = regions.filter(r => !r.is_active);

  if (isLoading) {
    return (
      <div className="w-48 h-9 bg-muted/50 rounded-md animate-pulse" />
    );
  }

  return (
    <Select 
      value={selectedRegionId || "all"} 
      onValueChange={(v) => setSelectedRegionId(v === "all" ? null : v)}
    >
      <SelectTrigger className="w-52 gap-2">
        {selectedRegionId ? (
          <MapPin className="w-4 h-4 text-primary shrink-0" />
        ) : (
          <Globe className="w-4 h-4 text-muted-foreground shrink-0" />
        )}
        <SelectValue placeholder="Select Region" />
      </SelectTrigger>
      <SelectContent>
        {/* All Regions option (super admin only) */}
        {isSuperAdmin && (
          <SelectItem value="all">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              <span className="font-medium">All Regions</span>
            </div>
          </SelectItem>
        )}

        {/* Active regions */}
        {activeRegions.length > 0 && (
          <>
            {isSuperAdmin && activeRegions.length > 0 && <Separator className="my-1" />}
            {activeRegions.map(region => (
              <SelectItem key={region.id} value={region.id}>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-emerald-500" />
                  <span>{region.city}, {region.state}</span>
                </div>
              </SelectItem>
            ))}
          </>
        )}

        {/* Disabled regions (super admin only) */}
        {isSuperAdmin && disabledRegions.length > 0 && (
          <>
            <Separator className="my-1" />
            <div className="px-2 py-1.5 text-xs text-muted-foreground font-medium">
              Disabled
            </div>
            {disabledRegions.map(region => (
              <SelectItem key={region.id} value={region.id}>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <span>{region.city}, {region.state}</span>
                  <Badge variant="outline" className="text-[10px] ml-1">Off</Badge>
                </div>
              </SelectItem>
            ))}
          </>
        )}

        {/* No regions */}
        {regions.length === 0 && (
          <div className="px-2 py-4 text-center text-sm text-muted-foreground">
            No regions configured
          </div>
        )}
      </SelectContent>
    </Select>
  );
}
