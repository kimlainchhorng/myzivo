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
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

const navItems = [
  {
    label: "Dashboard",
    path: "/dispatch",
    icon: LayoutDashboard,
  },
  {
    label: "Orders",
    path: "/dispatch/orders",
    icon: ClipboardList,
  },
  {
    label: "Drivers",
    path: "/dispatch/drivers",
    icon: Users,
  },
  {
    label: "Merchants",
    path: "/dispatch/merchants",
    icon: Store,
  },
  {
    label: "Payouts",
    path: "/dispatch/payouts",
    icon: DollarSign,
  },
  {
    label: "Analytics",
    path: "/dispatch/analytics",
    icon: BarChart3,
  },
  {
    label: "Disputes",
    path: "/dispatch/disputes",
    icon: AlertTriangle,
  },
  {
    label: "Quality",
    path: "/dispatch/quality",
    icon: Star,
  },
  {
    label: "Support",
    path: "/dispatch/support",
    icon: Headphones,
  },
  {
    label: "Settings",
    path: "/dispatch/settings",
    icon: Settings,
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
          "fixed md:relative inset-y-0 left-0 z-40 w-64 bg-card border-r border-border transition-transform duration-300",
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
                    "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
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
