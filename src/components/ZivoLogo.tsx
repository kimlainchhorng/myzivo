import { cn } from "@/lib/utils";

interface ZivoLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: { container: "h-7 sm:h-8", icon: "w-6 h-6 sm:w-7 sm:h-7", text: "text-lg sm:text-xl", z: "text-sm sm:text-base" },
  md: { container: "h-8 sm:h-10", icon: "w-7 h-7 sm:w-9 sm:h-9", text: "text-xl sm:text-2xl", z: "text-base sm:text-lg" },
  lg: { container: "h-12 sm:h-14", icon: "w-10 h-10 sm:w-12 sm:h-12", text: "text-2xl sm:text-3xl", z: "text-xl sm:text-2xl" },
  xl: { container: "h-16 sm:h-20", icon: "w-14 h-14 sm:w-18 sm:h-18", text: "text-3xl sm:text-4xl", z: "text-2xl sm:text-3xl" },
};

const ZivoLogo = ({ size = "md", showText = true, className }: ZivoLogoProps) => {
  const sizes = sizeClasses[size];
  
  return (
    <div className={cn("flex items-center gap-2", sizes.container, className)}>
      {/* Z Icon with gradient */}
      <div className={cn(
        "relative flex items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 via-teal-500 to-primary shadow-lg shadow-primary/25",
        sizes.icon
      )}>
        <span className={cn(
          "font-display font-black text-white leading-none",
          sizes.z
        )}>
          Z
        </span>
        {/* Glow effect */}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-cyan-400/20 to-transparent blur-sm -z-10" />
      </div>
      
      {/* ZIVO Text */}
      {showText && (
        <span className={cn(
          "font-display font-bold tracking-tight text-foreground",
          sizes.text
        )}>
          ZIVO
        </span>
      )}
    </div>
  );
};

export default ZivoLogo;
