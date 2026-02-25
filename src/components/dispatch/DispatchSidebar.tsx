/**
 * Dispatch Sidebar
 * Navigation sidebar for dispatch routes
 */

import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  ClipboardList,
  Star,
  Users,
  Store,
  DollarSign,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  Headphones,
  AlertTriangle,
  Package,
  FileText,
  AlertCircle,
  Tag,
  Gift,
  Timer,
  ShieldAlert,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

interface NavItem {
  label: string;
  path: string;
  icon: any;
  permission?: string | null;
}

const navItems: NavItem[] = [
  {
    label: "Dashboard",
    path: "/dispatch",
    icon: LayoutDashboard,
    permission: null, // Always visible
  },
  {
    label: "Orders",
    path: "/dispatch/orders",
    icon: ClipboardList,
    permission: "orders.view",
  },
  {
    label: "Batches",
    path: "/dispatch/batches",
    icon: Package,
    permission: "orders.dispatch",
  },
  {
    label: "Drivers",
    path: "/dispatch/drivers",
    icon: Users,
    permission: "drivers.manage",
  },
  {
    label: "Merchants",
    path: "/dispatch/merchants",
    icon: Store,
    permission: "merchants.manage",
  },
  {
    label: "Payouts",
    path: "/dispatch/payouts",
    icon: DollarSign,
    permission: "payouts.manage",
  },
  {
    label: "Analytics",
    path: "/dispatch/analytics",
    icon: BarChart3,
    permission: "analytics.view",
  },
  {
    label: "SLA",
    path: "/dispatch/sla",
    icon: Timer,
    permission: "analytics.view",
  },
  {
    label: "Safety",
    path: "/dispatch/safety",
    icon: ShieldAlert,
    permission: "safety.manage",
  },
  {
    label: "Disputes",
    path: "/dispatch/disputes",
    icon: AlertTriangle,
    permission: "refunds.manage",
  },
  {
    label: "Quality",
    path: "/dispatch/quality",
    icon: Star,
    permission: "analytics.view",
  },
  {
    label: "Support",
    path: "/dispatch/support",
    icon: Headphones,
    permission: "support.manage",
  },
  {
    label: "Promotions",
    path: "/dispatch/promotions",
    icon: Tag,
    permission: "promotions.manage",
  },
  {
    label: "Referrals",
    path: "/dispatch/referrals",
    icon: Gift,
    permission: "promotions.manage",
  },
  {
    label: "Audit Log",
    path: "/dispatch/audit",
    icon: FileText,
    permission: "audit.view",
  },
  {
    label: "Alerts",
    path: "/dispatch/alerts",
    icon: AlertCircle,
    permission: "alerts.manage",
  },
  {
    label: "Team",
    path: "/dispatch/team",
    icon: Users,
    permission: "tenant.manage_users",
  },
  {
    label: "Settings",
    path: "/dispatch/settings",
    icon: Settings,
    permission: "tenant.manage_settings",
  },
];

const DispatchSidebar = () => {
  const location = useLocation();
  const { signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const isActive = (path: string) => {
    if (path === "/dispatch") {
      return location.pathname === "/dispatch";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {/* Mobile hamburger */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 md:hidden"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed md:relative inset-y-0 left-0 z-40 w-64 bg-card border-r border-border transition-transform duration-200",
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-border">
            <h1 className="text-xl font-bold text-foreground">ZIVO Dispatch</h1>
            <p className="text-sm text-muted-foreground">Admin Panel</p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors",
                    active
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-border">
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground"
              onClick={() => signOut()}
            >
              <LogOut className="h-5 w-5" />
              Sign Out
            </Button>
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export default DispatchSidebar;
