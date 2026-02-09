/**
 * Hizovo Travel App Layout
 * Mobile-first shell for travel-only app (Flights, Hotels, Cars)
 */
import { ReactNode } from "react";
import HizovoAppBottomNav from "./HizovoAppBottomNav";
import HizovoAppHeader from "./HizovoAppHeader";
import SystemStatusBanner from "@/components/shared/SystemStatusBanner";
import { cn } from "@/lib/utils";

interface HizovoAppLayoutProps {
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

const HizovoAppLayout = ({
  children,
  title,
  showBack = false,
  onBack,
  hideNav = false,
  hideHeader = false,
  transparentHeader = false,
  headerRightAction,
  className,
}: HizovoAppLayoutProps) => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {!hideHeader && (
        <HizovoAppHeader 
          title={title}
          showBack={showBack}
          onBack={onBack}
          transparent={transparentHeader}
          rightAction={headerRightAction}
        />
      )}

      {/* System Status Banner (customer-facing) */}
      <SystemStatusBanner />

      <main className={cn(
        "flex-1",
        !hideHeader && "pt-14",
        !hideNav && "pb-20",
        className
      )}>
        {children}
      </main>

      {!hideNav && <HizovoAppBottomNav />}
    </div>
  );
};

export default HizovoAppLayout;
