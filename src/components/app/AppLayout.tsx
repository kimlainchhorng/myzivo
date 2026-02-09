/**
 * App Layout
 * Mobile-first shell with header and bottom navigation
 */
import { ReactNode } from "react";
import AppBottomNav from "./AppBottomNav";
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
}: AppLayoutProps) => {
  const { isOnline } = useNetworkStatus();

  return (
    <div className="min-h-screen bg-background flex flex-col">
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

      <main className={cn(
        "flex-1",
        !hideHeader && "pt-14",
        !hideNav && "pb-20",
        className
      )}>
        {children}
      </main>

      {!hideNav && <AppBottomNav />}
    </div>
  );
};

export default AppLayout;
