import zivoLogo from "@/assets/zivo-logo.png";
import { cn } from "@/lib/utils";

interface ZivoLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: "h-8",
  md: "h-10 sm:h-12",
  lg: "h-16 sm:h-20",
  xl: "h-24 sm:h-28",
};

const ZivoLogo = ({ size = "md", showText = true, className }: ZivoLogoProps) => {
  return (
    <img 
      src={zivoLogo} 
      alt="ZIVO" 
      className={cn(
        sizeClasses[size],
        "w-auto object-contain",
        className
      )}
    />
  );
};

export default ZivoLogo;
