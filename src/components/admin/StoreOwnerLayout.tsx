/**
 * Store Owner Layout — Simplified sidebar for store owners (non-admin).
 * Shows Profile, Products, Payment as sidebar navigation.
 */
import { ReactNode, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  LogOut, ChevronLeft, ChevronDown, Menu, Home, Store,
  Package, CreditCard, Users, Megaphone, ClipboardList, Settings,
  Wallet, Calendar, Clock, Shield, CalendarCheck, GraduationCap, FolderOpen, Radio,
  FileText, ScanSearch, Wrench, ClipboardCheck, Car
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Helmet } from "react-helmet-async";

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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const asideRef = useRef<HTMLElement | null>(null);
  const navRef = useRef<HTMLElement | null>(null);
  const employeeIds = ["employees", "payroll", "employee-schedule", "time-clock", "attendance", "training", "documents", "employee-rules"];
  const [employeesOpen, setEmployeesOpen] = useState(employeeIds.includes(activeTab || ""));

  const resetSidebarScroll = () => {
    if (asideRef.current) {
      asideRef.current.scrollTop = 0;
    }
    if (navRef.current) {
      navRef.current.scrollTop = 0;
    }
  };

  const closeSidebar = () => setSidebarOpen(false);
  const openSidebar = () => {
    resetSidebarScroll();
    setSidebarOpen(true);
  };

  useEffect(() => {
    if (!sidebarOpen || typeof document === "undefined") return;

    resetSidebarScroll();

    let raf2 = 0;
    const raf1 = requestAnimationFrame(() => {
      resetSidebarScroll();
      raf2 = requestAnimationFrame(resetSidebarScroll);
    });

    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
    };
  }, [sidebarOpen]);

  const isAutoRepair = storeCategory === "auto-repair";
  const productsLabel = isAutoRepair ? "Services" : "Products";
  const paymentLabel = isAutoRepair ? "Bookings" : "Payment";

  const navItems = [
    { id: "profile", label: "Profile", icon: Store },
    { id: "orders", label: `Orders${orderCount ? ` (${orderCount})` : ""}`, icon: ClipboardList },
    { id: "products", label: `${productsLabel}${productCount != null ? ` (${productCount})` : ""}`, icon: Package },
    { id: "payment", label: paymentLabel, icon: isAutoRepair ? Calendar : CreditCard },
    ...(isAutoRepair ? [
      { id: "ar-invoices", label: "Invoices", icon: FileText },
      { id: "ar-autocheck", label: "Auto Check", icon: ScanSearch },
      { id: "ar-parts", label: "Part Shop", icon: Wrench },
      { id: "ar-inspections", label: "Inspections", icon: ClipboardCheck },
      { id: "ar-vehicles", label: "Vehicles", icon: Car },
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
        {sidebarOpen && (
          <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={closeSidebar} />
        )}

        <aside
          ref={asideRef}
          onTransitionEnd={() => {
            if (sidebarOpen) resetSidebarScroll();
          }}
          className={cn(
            "fixed lg:sticky top-0 left-0 z-50 h-[100dvh] w-[82vw] max-w-[300px] lg:w-64 bg-card border-r border-border flex flex-col overflow-hidden transition-transform duration-300 shadow-xl lg:shadow-none overscroll-contain",
            sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          )}
        >
          <div
            className="flex items-center justify-between px-5 border-b border-border shrink-0"
            style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 12px)', paddingBottom: '12px' }}
          >
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              {storeLogoUrl ? (
                <img src={storeLogoUrl} alt="" className="w-9 h-9 rounded-lg object-cover shrink-0" />
              ) : (
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Store className="w-4 h-4 text-primary" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <span className="text-sm font-bold text-foreground truncate block">{storeName || "My Store"}</span>
                {storeId && (
                  <span className="text-[10px] text-muted-foreground font-mono">CBD{storeId.replace(/-/g, '').slice(0, 8).toUpperCase()}</span>
                )}
              </div>
            </div>
            <Button variant="ghost" size="icon" className="lg:hidden h-10 w-10 shrink-0 -mr-2 touch-manipulation" onClick={closeSidebar}>
              <ChevronLeft className="w-5 h-5" />
            </Button>
          </div>

          <nav ref={navRef} className="flex-1 min-h-0 px-3 py-4 overflow-y-auto overscroll-contain touch-pan-y">
            <div className="space-y-1">
              {navItems.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => { onTabChange?.(item.id); closeSidebar(); }}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                      isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <item.icon className="w-4.5 h-4.5 shrink-0" />
                    {item.label}
                  </button>
                );
              })}
            </div>

            <div className="my-3 px-3">
              <div className="border-t border-border" />
            </div>

            <div className="space-y-1">
              <button
                onClick={() => setEmployeesOpen((v) => !v)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                  employeeItems.some((i) => i.id === activeTab)
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
                aria-expanded={employeesOpen}
              >
                <Users className="w-4.5 h-4.5 shrink-0" />
                <span className="flex-1 text-left">Employees</span>
                <ChevronDown className={cn("w-4 h-4 transition-transform", employeesOpen && "rotate-180")} />
              </button>

              {employeesOpen && (
                <div className="ml-3 pl-3 border-l border-border space-y-1">
                  {employeeItems.map((item) => {
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => { onTabChange?.(item.id); closeSidebar(); }}
                        className={cn(
                          "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-all",
                          isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        )}
                      >
                        <item.icon className="w-4 h-4 shrink-0" />
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </nav>

          <div className="border-t border-border px-4 py-2.5 shrink-0">
            <p className="text-xs font-medium text-foreground truncate">{user?.email}</p>
            <p className="text-[10px] text-muted-foreground">Store Owner</p>
          </div>

          <div
            className="border-t border-border p-3 space-y-1 shrink-0"
            style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 12px)' }}
          >
            <button
              onClick={() => { onTabChange?.("settings"); closeSidebar(); }}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all",
                activeTab === "settings" ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Settings className="w-4.5 h-4.5" />
              Settings
            </button>
            <button
              onClick={() => navigate("/")}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
            >
              <Home className="w-4.5 h-4.5" />
              Back to App
            </button>
            <button
              onClick={() => signOut()}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-destructive hover:bg-destructive/10 transition-all"
            >
              <LogOut className="w-4.5 h-4.5" />
              Sign Out
            </button>
          </div>
        </aside>

        <div className="flex-1 flex flex-col min-w-0">
          <header className="safe-area-top min-h-16 bg-card border-b border-border flex items-center justify-between px-4 sm:px-6 sticky top-0 z-30">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" className="lg:hidden" onClick={openSidebar}>
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
}
