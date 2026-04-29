/**
 * Renders a parts supplier's real logo via Clearbit, with monogram fallback.
 */
import { useState } from "react";
import { cn } from "@/lib/utils";
import { getSupplierLogoUrl, type PartsSupplier } from "@/config/partsSuppliers";

type Size = "sm" | "md" | "lg";

const SIZE_MAP: Record<Size, { box: string; text: string; px: number }> = {
  sm: { box: "w-5 h-5", text: "text-[9px]", px: 40 },
  md: { box: "w-8 h-8", text: "text-[11px]", px: 64 },
  lg: { box: "w-12 h-12", text: "text-sm", px: 96 },
};

interface Props {
  supplier: PartsSupplier;
  size?: Size;
  className?: string;
}

export default function PartsSupplierLogo({ supplier, size = "md", className }: Props) {
  const [errored, setErrored] = useState(false);
  const dims = SIZE_MAP[size];
  const url = getSupplierLogoUrl(supplier, dims.px * 2);

  const monogram =
    (supplier.shortName ?? supplier.name)
      .replace(/[^A-Za-z0-9 ]/g, "")
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase() ?? "")
      .join("") || "?";

  if (!url || errored) {
    return (
      <div
        className={cn(
          "shrink-0 rounded-md bg-muted text-muted-foreground font-semibold flex items-center justify-center border border-border",
          dims.box,
          dims.text,
          className,
        )}
        aria-label={supplier.name}
      >
        {monogram}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "shrink-0 rounded-md bg-background border border-border flex items-center justify-center overflow-hidden",
        dims.box,
        className,
      )}
    >
      <img
        src={url}
        alt={supplier.name}
        loading="lazy"
        decoding="async"
        onError={() => setErrored(true)}
        className="w-full h-full object-contain"
      />
    </div>
  );
}
