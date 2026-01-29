import zivoLogo from "@/assets/zivo-logo.png";
import { cn } from "@/lib/utils";

interface ZivoLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: "h-7 sm:h-8",
  md: "h-8 sm:h-10",
  lg: "h-12 sm:h-14",
  xl: "h-16 sm:h-20",
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
