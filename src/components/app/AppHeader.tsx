/**
 * App Header Component
 * Mobile-first header with logo, location selector, and help
 */
import { useNavigate } from "react-router-dom";
import { MapPin, HelpCircle, ChevronLeft, Bell } from "lucide-react";
import ZivoLogo from "@/components/ZivoLogo";
import { cn } from "@/lib/utils";

interface AppHeaderProps {
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
  transparent?: boolean;
  rightAction?: React.ReactNode;
  hideLocation?: boolean;
}

const AppHeader = ({ 
  title, 
  showBack = false, 
  onBack, 
  transparent = false,
  rightAction,
  hideLocation = false
}: AppHeaderProps) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  return (
    <header className={cn(
      "fixed top-0 left-0 right-0 z-50 safe-area-top transition-all duration-200",
      transparent 
        ? "bg-transparent" 
        : "bg-background border-b border-border"
    )}>
      <div className="flex items-center justify-between h-14 px-4">
        {/* Left */}
        {showBack ? (
          <button
            onClick={handleBack}
            className="w-10 h-10 -ml-2 rounded-xl flex items-center justify-center hover:bg-muted transition-colors active:scale-90 touch-manipulation"
            aria-label="Go back"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        ) : (
          <div 
            onClick={() => navigate("/")}
            className="cursor-pointer active:scale-95 transition-transform touch-manipulation"
          >
            <ZivoLogo size="sm" />
          </div>
        )}

        {/* Center - Title or Location */}
        {title ? (
          <h1 className="font-bold text-lg absolute left-1/2 -translate-x-1/2">
            {title}
          </h1>
        ) : !hideLocation && (
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted border border-border touch-manipulation active:bg-muted/80 transition-colors">
            <MapPin className="w-3.5 h-3.5 text-primary" />
            <span className="text-sm font-medium truncate max-w-[140px]">Current Location</span>
          </button>
        )}

        {/* Right */}
        {rightAction || (
          <button
            onClick={() => navigate("/help")}
            className="w-10 h-10 -mr-2 rounded-xl flex items-center justify-center hover:bg-muted transition-colors active:scale-90 touch-manipulation"
            aria-label="Help"
          >
            <HelpCircle className="w-5 h-5 text-muted-foreground" />
          </button>
        )}
      </div>
    </header>
  );
};

export default AppHeader;
