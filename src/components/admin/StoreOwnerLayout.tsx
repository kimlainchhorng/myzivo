/**
 * Store Owner Layout — Simplified sidebar for store owners (non-admin).
 * Shows Profile, Products, Payment as sidebar navigation.
 */
import { ReactNode, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  LogOut, ChevronLeft, ChevronDown, Menu, Home, Store,
  Package, CreditCard, Users, Megaphone, ClipboardList, Settings,
  Wallet, Calendar, Clock, Shield, CalendarCheck, GraduationCap, FolderOpen, Radio,
  FileText, ScanSearch, Wrench, ClipboardCheck, Car,
  FileSignature, Hammer, HardHat, BellRing, CircleDot, ShieldAlert, Truck, BarChart3,
  BedDouble, CalendarRange, CalendarDays, KeyRound, Sparkles, Hotel
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Helmet } from "react-helmet-async";
import { useFocusTrap } from "./useFocusTrap";
import { useFocusReturn } from "./ads/useFocusReturn";

interface StoreOwnerLayoutProps {
  children: ReactNode;
  title: string;
  storeId?: string;
  storeName?: string;
  storeLogoUrl?: string;
  storeCategory?: string;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  productCount?: number;
  orderCount?: number;
}

export default function StoreOwnerLayout({ children, title, storeId, storeName, storeLogoUrl, storeCategory, activeTab, onTabChange, productCount, orderCount }: StoreOwnerLayoutProps) {
  const { signOut, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const asideRef = useRef<HTMLElement | null>(null);
  const navRef = useRef<HTMLElement | null>(null);
  const scrollMemoryRef = useRef<Record<string, number>>({});
  const employeeIds = ["employees", "payroll", "employee-schedule", "time-clock", "attendance", "training", "documents", "employee-rules"];
  const [employeesOpen, setEmployeesOpen] = useState(employeeIds.includes(activeTab || ""));

  const tabKey = activeTab || "_default";

  const closeSidebar = () => setSidebarOpen(false);
  const openSidebar = () => {
    if (!employeeIds.includes(activeTab || "")) {
      setEmployeesOpen(false);
    }
    setSidebarOpen(true);
  };

  // Restore per-tab scroll position when sidebar opens
  useEffect(() => {
    if (!sidebarOpen) return;
    const r = requestAnimationFrame(() => {
      if (navRef.current) {
        navRef.current.scrollTop = scrollMemoryRef.current[tabKey] ?? 0;
      }
    });
    return () => cancelAnimationFrame(r);
  }, [sidebarOpen, tabKey]);

  // Lock background scroll via overflow:hidden
  useEffect(() => {
    if (!sidebarOpen || typeof document === "undefined") return;

    const html = document.documentElement;
    const body = document.body;
    const prev = {
      htmlOverflow: html.style.overflow,
      bodyOverflow: body.style.overflow,
      bodyTouchAction: body.style.touchAction,
    };

    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    body.style.touchAction = "none";

    return () => {
      html.style.overflow = prev.htmlOverflow;
      body.style.overflow = prev.bodyOverflow;
      body.style.touchAction = prev.bodyTouchAction;
    };
  }, [sidebarOpen]);

  // ESC to close
  useEffect(() => {
    if (!sidebarOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") closeSidebar(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [sidebarOpen]);

  // Auto-close on tab change (external/programmatic)
  useEffect(() => {
    if (sidebarOpen) closeSidebar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  // Auto-close on route change
  useEffect(() => {
    if (sidebarOpen) closeSidebar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  // Focus trap + focus return for the mobile drawer
  useFocusTrap(asideRef, sidebarOpen);
  useFocusReturn(sidebarOpen);

  const handleNavScroll = (e: React.UIEvent<HTMLElement>) => {
    scrollMemoryRef.current[tabKey] = e.currentTarget.scrollTop;
  };

  const isAutoRepair = storeCategory === "auto-repair";
  const isLodging = ["hotel", "resort", "guesthouse"].includes(storeCategory || "");
  const productsLabel = isAutoRepair ? "Services" : isLodging ? "Rooms" : "Products";
  const paymentLabel = isAutoRepair ? "Bookings" : isLodging ? "Reservations" : "Payment";

  const navItems = [
    { id: "profile", label: "Profile", icon: Store },
    { id: "orders", label: `Orders${orderCount ? ` (${orderCount})` : ""}`, icon: ClipboardList },
    { id: "products", label: `${productsLabel}${productCount != null ? ` (${productCount})` : ""}`, icon: isLodging ? BedDouble : Package },
    { id: "payment", label: paymentLabel, icon: isAutoRepair ? Calendar : isLodging ? CalendarRange : CreditCard },
    ...(isAutoRepair ? [
      { id: "ar-invoices", label: "Invoices", icon: FileText },
      { id: "ar-autocheck", label: "Auto Check", icon: ScanSearch },
      { id: "ar-parts", label: "Part Shop", icon: Wrench },
      { id: "ar-inspections", label: "Inspections", icon: ClipboardCheck },
      { id: "ar-vehicles", label: "Vehicles", icon: Car },
      { id: "_ar_shop_ops_label", label: "SHOP OPS", icon: Wrench, divider: true },
      { id: "ar-estimates", label: "Estimates", icon: FileSignature },
      { id: "ar-workorders", label: "Work Orders", icon: Hammer },
      { id: "ar-techs", label: "Technicians & Bays", icon: HardHat },
      { id: "ar-reminders", label: "Reminders & Recalls", icon: BellRing },
      { id: "ar-tires", label: "Tire Inventory", icon: CircleDot },
      { id: "ar-warranty", label: "Warranty & Comebacks", icon: ShieldAlert },
      { id: "ar-fleet", label: "Fleet Accounts", icon: Truck },
      { id: "ar-reports", label: "Reports", icon: BarChart3 },
    ] : []),
    ...(isLodging ? [
      { id: "_lodging_ops_label", label: "HOTEL OPS", icon: BedDouble, divider: true },
      { id: "lodge-rooms", label: "Rooms & Rates", icon: BedDouble },
      { id: "lodge-reservations", label: "Reservations", icon: CalendarRange },
      { id: "lodge-calendar", label: "Calendar & Availability", icon: CalendarDays },
      { id: "lodge-guests", label: "Guests", icon: Users },
      { id: "lodge-frontdesk", label: "Front Desk", icon: KeyRound },
      { id: "lodge-housekeeping", label: "Housekeeping", icon: Sparkles },
      { id: "lodge-maintenance", label: "Maintenance", icon: Wrench },
      { id: "lodge-amenities", label: "Amenities & Policies", icon: Hotel },
      { id: "lodge-reports", label: "Reports", icon: BarChart3 },
    ] : []),
    { id: "customers", label: "Customers", icon: Users },
    { id: "marketing", label: "Marketing & Ads", icon: Megaphone },
    { id: "livestream", label: "Live Stream", icon: Radio },
  ];

  const employeeItems = [
    { id: "employees", label: "Employees", icon: Users },
    { id: "payroll", label: "Payroll", icon: Wallet },
    { id: "employee-schedule", label: "Schedule", icon: Calendar },
    { id: "time-clock", label: "Time Clock", icon: Clock },
    { id: "attendance", label: "Attendance & Leave", icon: CalendarCheck },
    { id: "training", label: "Training & Onboarding", icon: GraduationCap },
    { id: "documents", label: "Documents & Files", icon: FolderOpen },
    { id: "employee-rules", label: "Employee Rules", icon: Shield },
  ];

  return (
    <>
      <Helmet>
        <title>{title} — {storeName || "ZIVO Store"}</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="min-h-screen bg-background flex">
        {/* Mobile drawer + backdrop, portaled to body */}
        {typeof document !== "undefined" && createPortal(
          <>
            <div
              className={cn(
                "fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity duration-300",
                sidebarOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
              )}
              onClick={closeSidebar}
              aria-hidden={!sidebarOpen}
              role="presentation"
            />
            <aside
              id="store-owner-sidebar"
              ref={asideRef}
              role="dialog"
              aria-modal="true"
              aria-label="Store navigation"
              aria-hidden={!sidebarOpen}
              tabIndex={-1}
              className={cn(
                "fixed inset-y-0 left-0 z-50 w-[84vw] max-w-[310px] bg-card border-r border-border flex flex-col overflow-hidden rounded-r-2xl shadow-2xl overscroll-contain lg:hidden",
                "transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]",
                sidebarOpen ? "translate-x-0" : "-translate-x-full"
              )}
            >
              {renderSidebarContent({ isMobile: true })}
            </aside>
          </>,
          document.body
        )}

        {/* Desktop sticky sidebar */}
        <aside className="hidden lg:flex sticky top-0 left-0 z-30 h-[100dvh] w-64 bg-card border-r border-border flex-col overflow-hidden">
          {renderSidebarContent({ isMobile: false })}
        </aside>

        <div className="flex-1 flex flex-col min-w-0">
          <header className="safe-area-top min-h-16 bg-card border-b border-border flex items-center justify-between px-4 sm:px-6 sticky top-0 z-30">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={openSidebar}
                aria-controls="store-owner-sidebar"
                aria-expanded={sidebarOpen}
                aria-label="Open navigation"
              >
                <Menu className="w-5 h-5" />
              </Button>
              <h1 className="text-lg font-bold text-foreground">{title}</h1>
            </div>
          </header>

          <main className="flex-1 p-4 sm:p-6 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </>
  );

  function renderSidebarContent({ isMobile }: { isMobile: boolean }) {
    return (
      <>
        {/* Header — gradient brand strip */}
        <div
          className="relative flex items-center justify-between px-4 border-b border-border shrink-0 bg-gradient-to-br from-primary/8 via-card to-card"
          style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 14px)', paddingBottom: '14px' }}
        >
          <div className="flex items-center gap-3 min-w-0 flex-1">
            {storeLogoUrl ? (
              <img src={storeLogoUrl} alt="" className="w-10 h-10 rounded-xl object-cover shrink-0 ring-1 ring-border shadow-sm" />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 ring-1 ring-primary/20">
                <Store className="w-5 h-5 text-primary" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <span className="text-[15px] font-bold text-foreground truncate block leading-tight">{storeName || "My Store"}</span>
              {storeId && (
                <span className="text-[10px] text-muted-foreground font-mono tracking-wider">CBD{storeId.replace(/-/g, '').slice(0, 8).toUpperCase()}</span>
              )}
            </div>
          </div>
          {isMobile && (
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 shrink-0 -mr-1 rounded-full hover:bg-muted touch-manipulation"
              onClick={closeSidebar}
              aria-label="Close navigation"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
          )}
        </div>

        {/* Nav */}
        <nav
          ref={isMobile ? navRef : undefined}
          onScroll={isMobile ? handleNavScroll : undefined}
          aria-label="Store sections"
          className="flex-1 min-h-0 px-2.5 py-3 overflow-y-scroll scroll-momentum overscroll-contain touch-pan-y"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          <p id="sidebar-group-manage" className="px-3 pb-1.5 text-[10px] uppercase tracking-[0.12em] font-semibold text-muted-foreground/70">Manage</p>
          <div className="space-y-0.5" role="group" aria-labelledby="sidebar-group-manage">
            {navItems.map((item: any) => {
              if (item.divider) {
                return (
                  <div key={item.id} className="pt-3 pb-1 px-3">
                    <div className="border-t border-border/60 mb-2" />
                    <p className="text-[10px] uppercase tracking-[0.12em] font-semibold text-muted-foreground/70">{item.label}</p>
                  </div>
                );
              }
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => { onTabChange?.(item.id); closeSidebar(); }}
                  className={cn(
                    "relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] font-medium transition-colors duration-150 active:scale-[0.99]",
                    isActive
                      ? "bg-primary/12 text-primary"
                      : "text-foreground/75 hover:bg-muted hover:text-foreground"
                  )}
                >
                  {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 rounded-r-full bg-primary" />
                  )}
                  <item.icon className={cn("w-[18px] h-[18px] shrink-0", isActive ? "text-primary" : "text-muted-foreground")} />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </div>

          <div className="my-3 mx-3 border-t border-border/60" />

          <p id="sidebar-group-team" className="px-3 pb-1.5 text-[10px] uppercase tracking-[0.12em] font-semibold text-muted-foreground/70">Team</p>
          <div className="space-y-0.5" role="group" aria-labelledby="sidebar-group-team">
            <button
              onClick={() => setEmployeesOpen((v) => !v)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] font-medium transition-colors",
                employeeItems.some((i) => i.id === activeTab)
                  ? "bg-primary/12 text-primary"
                  : "text-foreground/75 hover:bg-muted hover:text-foreground"
              )}
              aria-expanded={employeesOpen}
            >
              <Users className="w-[18px] h-[18px] shrink-0" />
              <span className="flex-1 text-left">Employees</span>
              <ChevronDown className={cn("w-4 h-4 transition-transform duration-200", employeesOpen && "rotate-180")} />
            </button>

            {employeesOpen && (
              <div className="ml-4 pl-3 border-l border-border/60 space-y-0.5 py-1">
                {employeeItems.map((item) => {
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => { onTabChange?.(item.id); closeSidebar(); }}
                      className={cn(
                        "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-colors",
                        isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                    >
                      <item.icon className="w-4 h-4 shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </nav>

        {/* User card */}
        <div className="border-t border-border px-3 py-2.5 shrink-0 bg-muted/30">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
              <span className="text-xs font-bold text-primary">
                {(user?.email || "?").charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[12px] font-semibold text-foreground truncate leading-tight">{user?.email}</p>
              <p className="text-[10px] text-muted-foreground">Store Owner</p>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div
          className="border-t border-border p-2 space-y-0.5 shrink-0"
          style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 10px)' }}
        >
          <button
            onClick={() => { onTabChange?.("settings"); closeSidebar(); }}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] transition-colors",
              activeTab === "settings" ? "bg-primary/12 text-primary font-semibold" : "text-foreground/75 hover:bg-muted hover:text-foreground"
            )}
          >
            <Settings className="w-[18px] h-[18px]" />
            Settings
          </button>
          <button
            onClick={() => navigate("/")}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] text-foreground/75 hover:bg-muted hover:text-foreground transition-colors"
          >
            <Home className="w-[18px] h-[18px]" />
            Back to App
          </button>
          <button
            onClick={() => signOut()}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] text-destructive hover:bg-destructive/10 transition-colors"
          >
            <LogOut className="w-[18px] h-[18px]" />
            Sign Out
          </button>
        </div>
      </>
    );
  }
}
