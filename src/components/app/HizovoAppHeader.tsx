/**
 * Hizovo Travel App Header
 * Clean mobile header with back button and title
 */
import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Bell } from "lucide-react";
import { cn } from "@/lib/utils";
import { BrandLogo } from "@/components/shared/BrandLogo";

interface HizovoAppHeaderProps {
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
  transparent?: boolean;
  rightAction?: ReactNode;
}

const HizovoAppHeader = ({
  title,
  showBack = false,
  onBack,
  transparent = false,
  rightAction,
}: HizovoAppHeaderProps) => {
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
      "fixed top-0 left-0 right-0 z-50 h-14 flex items-center px-4 safe-area-top",
      transparent 
        ? "bg-transparent" 
        : "bg-card/95 backdrop-blur-xl border-b border-border/50"
    )}>
      <div className="flex items-center justify-between w-full max-w-lg mx-auto">
        {/* Left side */}
        <div className="w-12 flex justify-start">
          {showBack ? (
            <button
              onClick={handleBack}
              className="p-2.5 -ml-2 rounded-full hover:bg-muted touch-manipulation active:scale-95 min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          ) : (
            <div className="flex items-center">
              <BrandLogo size="sm" showText={true} />
            </div>
          )}
        </div>

        {/* Center - Title */}
        {title && (
          <h1 className="font-semibold text-base truncate max-w-[180px]">
            {title}
          </h1>
        )}

        {/* Right side */}
        <div className="w-12 flex justify-end">
          {rightAction || (
            <button
              onClick={() => navigate('/app/notifications')}
              className="p-2.5 -mr-2 rounded-full hover:bg-muted touch-manipulation active:scale-95 relative min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
              {/* Notification dot */}
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default HizovoAppHeader;
