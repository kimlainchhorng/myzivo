/**
 * Store Owner Layout — Simplified sidebar for store owners (non-admin).
 * Shows Profile, Products, Payment as sidebar navigation.
 */
import { ReactNode } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  LogOut, ChevronLeft, Menu, Home, Store,
  Package, CreditCard, MessageCircle, Users, Megaphone, ClipboardList, Settings,
  Wallet, Calendar, Clock, Shield, CalendarCheck, GraduationCap, Star, FolderOpen, Radio
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";
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

  const isAutoRepair = storeCategory === "auto-repair";
  const productsLabel = isAutoRepair ? "Services" : "Products";
  const paymentLabel = isAutoRepair ? "Bookings" : "Payment";

  const navItems = [
    { id: "profile", label: "Profile", icon: Store },
    { id: "orders", label: `Orders${orderCount ? ` (${orderCount})` : ""}`, icon: ClipboardList },
    { id: "products", label: `${productsLabel}${productCount != null ? ` (${productCount})` : ""}`, icon: Package },
    { id: "payment", label: paymentLabel, icon: CreditCard },
    { id: "customers", label: "Customers", icon: Users },
    { id: "marketing", label: "Marketing & Ads", icon: Megaphone },
    { id: "livestream", label: "Live Stream", icon: Radio },
    { id: "settings", label: "Settings", icon: Settings },
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
          <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
        )}

        <aside className={cn(
          "fixed lg:sticky top-0 left-0 z-50 h-screen w-64 bg-card border-r border-border flex flex-col transition-transform duration-300",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}>
          {/* Store branding */}
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
            <Button variant="ghost" size="icon" className="lg:hidden h-10 w-10 shrink-0 -mr-2 touch-manipulation" onClick={() => setSidebarOpen(false)}>
              <ChevronLeft className="w-5 h-5" />
            </Button>
          </div>

          {/* Nav */}
          <nav className="flex-1 px-3 py-4 overflow-y-auto">
            <div className="space-y-1">
              {navItems.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => { onTabChange?.(item.id); setSidebarOpen(false); }}
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

            <div className="my-4 px-3">
              <div className="border-t border-border" />
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mt-3 mb-1 px-1">Employee Management</p>
            </div>

            <div className="space-y-1">
              {employeeItems.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => { onTabChange?.(item.id); setSidebarOpen(false); }}
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
          </nav>

          {/* Footer */}
          <div className="border-t border-border p-3 space-y-1">
            <button
              onClick={() => navigate("/")}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
            >
              <Home className="w-4.5 h-4.5" />
              Back to App
            </button>
            <button
              onClick={() => signOut()}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-500 hover:bg-red-500/10 transition-all"
            >
              <LogOut className="w-4.5 h-4.5" />
              Sign Out
            </button>
          </div>

          {/* User info */}
          <div className="border-t border-border px-4 py-3">
            <p className="text-xs font-medium text-foreground truncate">{user?.email}</p>
            <p className="text-[10px] text-muted-foreground">Store Owner</p>
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1 flex flex-col min-w-0">
          <header className="safe-area-top min-h-16 bg-card border-b border-border flex items-center justify-between px-4 sm:px-6 sticky top-0 z-30">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(true)}>
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
