/**
 * ZIVO Super App Layout
 * Unified mobile shell for all services with role-aware navigation
 */
import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Bell, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";
import ZivoSuperAppNav from "./ZivoSuperAppNav";
import { useAuth } from "@/contexts/AuthContext";
import { useCredits } from "@/hooks/useCredits";

interface ZivoSuperAppLayoutProps {
  children: ReactNode;
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
  hideNav?: boolean;
  hideHeader?: boolean;
  transparentHeader?: boolean;
  headerRightAction?: ReactNode;
  showWallet?: boolean;
  className?: string;
  navMode?: "customer" | "driver" | "owner" | "auto";
}

const ZivoSuperAppLayout = ({
  children,
  title,
  showBack = false,
  onBack,
  hideNav = false,
  hideHeader = false,
  transparentHeader = false,
  headerRightAction,
  showWallet = false,
  className,
  navMode = "auto",
}: ZivoSuperAppLayoutProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { summary } = useCredits();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      {!hideHeader && (
        <header className={cn(
          "fixed top-0 left-0 right-0 z-50 h-14 flex items-center px-4 safe-area-top",
          transparentHeader 
            ? "bg-transparent" 
            : "bg-card/95 backdrop-blur-xl border-b border-border/50"
        )}>
          <div className="flex items-center justify-between w-full max-w-lg mx-auto">
            {/* Left side */}
            <div className="w-14 flex justify-start">
              {showBack ? (
                <button
                  onClick={handleBack}
                  className="p-2 -ml-2 rounded-full hover:bg-muted touch-manipulation active:scale-95"
                  aria-label="Go back"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
              ) : (
                <div className="flex items-center">
                  <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                    ZIVO
                  </span>
                </div>
              )}
            </div>

            {/* Center - Title */}
            {title && (
              <h1 className="font-semibold text-base truncate max-w-[180px] text-center">
                {title}
              </h1>
            )}

            {/* Right side */}
            <div className="w-14 flex justify-end items-center gap-1">
              {showWallet && user && (
                <button
                  onClick={() => navigate('/wallet')}
                  className="px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center gap-1"
                >
                  <Wallet className="w-3 h-3" />
                  ${summary.available.toFixed(0)}
                </button>
              )}
              {headerRightAction || (
                <button
                  onClick={() => navigate('/notifications')}
                  className="p-2 -mr-2 rounded-full hover:bg-muted touch-manipulation active:scale-95 relative"
                  aria-label="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {/* Notification dot - would be dynamic */}
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full" />
                </button>
              )}
            </div>
          </div>
        </header>
      )}

      {/* Main Content */}
      <main className={cn(
        "flex-1",
        !hideHeader && "pt-14",
        !hideNav && "pb-20",
        className
      )}>
        {children}
      </main>

      {/* Bottom Navigation */}
      {!hideNav && <ZivoSuperAppNav mode={navMode} />}
    </div>
  );
};

export default ZivoSuperAppLayout;
