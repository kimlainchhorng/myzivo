/**
 * App Layout
 * Mobile-first shell with header and bottom navigation
 */
import { ReactNode } from "react";
import ZivoMobileNav from "./ZivoMobileNav";
import AppHeader from "./AppHeader";
import SystemStatusBanner from "@/components/shared/SystemStatusBanner";
import OfflineBanner from "@/components/shared/OfflineBanner";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import { cn } from "@/lib/utils";

interface AppLayoutProps {
  children: ReactNode;
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
  hideNav?: boolean;
  hideHeader?: boolean;
  transparentHeader?: boolean;
  headerRightAction?: ReactNode;
  className?: string;
  fixedHeight?: boolean;
}

const AppLayout = ({
  children,
  title,
  showBack = false,
  onBack,
  hideNav = false,
  hideHeader = false,
  transparentHeader = false,
  headerRightAction,
  className,
  fixedHeight = false,
}: AppLayoutProps) => {
  const { isOnline } = useNetworkStatus();

  return (
    <div className={cn(
      "bg-background flex flex-col overscroll-none tap-highlight-none",
      fixedHeight ? "h-[100dvh] overflow-hidden" : "min-h-screen"
    )}>
      {!hideHeader && (
        <AppHeader 
          title={title}
          showBack={showBack}
          onBack={onBack}
          transparent={transparentHeader}
          rightAction={headerRightAction}
        />
      )}

      {/* System Status Banner (customer-facing) */}
      <SystemStatusBanner />

      {/* Offline Banner */}
      <OfflineBanner isOffline={!isOnline} />

      <main
        className={cn(
          "flex-1",
          fixedHeight ? "min-h-0 overflow-hidden flex flex-col" : "scroll-momentum",
          !hideNav && "pb-nav",
          hideHeader && "safe-area-top",
          className
        )}
        style={
          !hideHeader
            ? { paddingTop: "calc(56px + env(safe-area-inset-top, 0px))" }
            : undefined
        }
      >
        {children}
      </main>

      {!hideNav && <ZivoMobileNav />}
    </div>
  );
};

export default AppLayout;
