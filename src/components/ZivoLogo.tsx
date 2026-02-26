import { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface ZivoLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: { container: "h-7", icon: "w-6 h-6", text: "text-lg", z: "text-sm" },
  md: { container: "h-9", icon: "w-8 h-8", text: "text-xl", z: "text-base" },
  lg: { container: "h-11", icon: "w-10 h-10", text: "text-2xl", z: "text-lg" },
  xl: { container: "h-14", icon: "w-12 h-12", text: "text-3xl", z: "text-xl" },
};

const ZivoLogo = forwardRef<HTMLDivElement, ZivoLogoProps>(({ size = "md", showText = true, className }, ref) => {
  const sizes = sizeClasses[size];
  
  return (
    <div ref={ref} className={cn("flex items-center gap-2", sizes.container, className)}>
      {/* Z Icon - Clean, solid blue */}
      <div className={cn(
        "relative flex items-center justify-center rounded-xl bg-primary",
        sizes.icon
      )}>
        <span className={cn(
          "font-bold text-white leading-none",
          sizes.z
        )}>
          Z
        </span>
      </div>
      
      {/* ZIVO Text */}
      {showText && (
        <span className={cn(
          "font-bold tracking-tight text-foreground",
          sizes.text
        )}>
          ZIVO
        </span>
      )}
    </div>
  );
});

ZivoLogo.displayName = "ZivoLogo";

export default ZivoLogo;
