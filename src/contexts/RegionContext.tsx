/**
 * Region Context for admin region scoping
 */
import { createContext, useContext, useState, ReactNode, useMemo } from "react";
import { useRegions } from "@/hooks/useRegions";
import { useAuth } from "@/contexts/AuthContext";
import type { Region, RegionWithSettings } from "@/types/region";

interface RegionContextType {
  selectedRegionId: string | null;
  selectedRegion: RegionWithSettings | null;
  setSelectedRegionId: (id: string | null) => void;
  regions: RegionWithSettings[];
  activeRegions: RegionWithSettings[];
  isLoading: boolean;
  isSuperAdmin: boolean;
}

const RegionContext = createContext<RegionContextType | undefined>(undefined);

export function useRegion() {
  const context = useContext(RegionContext);
  if (!context) {
    throw new Error("useRegion must be used within a RegionProvider");
  }
  return context;
}

interface RegionProviderProps {
  children: ReactNode;
}

export function RegionProvider({ children }: RegionProviderProps) {
  const [selectedRegionId, setSelectedRegionId] = useState<string | null>(null);
  const { data: regions, isLoading } = useRegions();
  const { isAdmin } = useAuth();

  // For now, all admins are super admins (can see all regions)
  const isSuperAdmin = isAdmin;

  const allRegions = useMemo(() => regions || [], [regions]);
  const activeRegions = useMemo(() => allRegions.filter(r => r.is_active), [allRegions]);

  const selectedRegion = useMemo(
    () => allRegions.find(r => r.id === selectedRegionId) || null,
    [allRegions, selectedRegionId]
  );

  const value: RegionContextType = {
    selectedRegionId,
    selectedRegion,
    setSelectedRegionId,
    regions: allRegions,
    activeRegions,
    isLoading,
    isSuperAdmin,
  };

  return (
    <RegionContext.Provider value={value}>
      {children}
    </RegionContext.Provider>
  );
}
