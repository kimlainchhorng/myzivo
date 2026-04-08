/**
 * Admin Layout - Responsive sidebar layout for admin dashboard
 */
/**
 * Admin Layout - Responsive sidebar layout for admin dashboard
 */
import { ReactNode, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useUserAccess } from "@/hooks/useUserAccess";
import zivoLogo from "@/assets/zivo-logo.png";
import {
  BarChart3,
  Users,
  ShoppingBag,
  LogOut,
  ChevronLeft,
  ChevronDown,
  Menu,
  Home,
  Activity,
  DollarSign,
  Plane,
  Search as SearchIcon,
  Server,
  Bell,
  Store,
  Headphones,
  MessageSquare,
  AlertTriangle,
  UserPlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Helmet } from "react-helmet-async";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

type NavItem = { label: string; icon: any; path: string };
type NavGroup = { label: string; icon: any; children: NavItem[] };
type NavEntry = NavItem | NavGroup;

const isGroup = (entry: NavEntry): entry is NavGroup => "children" in entry;

const adminNavEntries: NavEntry[] = [
  { label: "Overview", icon: BarChart3, path: "/admin/analytics" },
  { label: "Users", icon: Users, path: "/admin/users" },
  { label: "Orders", icon: ShoppingBag, path: "/admin/shopping-orders" },
  {
    label: "Flights", icon: Plane, children: [
      { label: "Flight Orders", icon: Plane, path: "/admin/flight-orders" },
      { label: "Search Analytics", icon: SearchIcon, path: "/admin/flight-searches" },
      { label: "API Monitoring", icon: Server, path: "/admin/flight-api" },
      { label: "Price Alerts", icon: Bell, path: "/admin/flight-price-alerts" },
    ],
  },
  { label: "Store", icon: Store, path: "/admin/stores" },
  { label: "Employees", icon: Users, path: "/admin/employees" },
  { label: "Pricing", icon: DollarSign, path: "/admin/pricing" },
  { label: "System Health", icon: Activity, path: "/admin/system-health" },
];

const supportNavEntries: NavEntry[] = [
  { label: "Support Home", icon: Headphones, path: "/admin/support#overview" },
  { label: "User Accounts", icon: UserPlus, path: "/admin/user-accounts" },
  { label: "Conversations", icon: MessageSquare, path: "/admin/support#conversations" },
  { label: "Alerts", icon: AlertTriangle, path: "/admin/support#alerts" },
];

interface AdminLayoutProps {
  children: ReactNode;
  title: string;
  brandLabel?: string;
}

export default function AdminLayout({ children, title, brandLabel }: AdminLayoutProps) {
  const { signOut, user } = useAuth();
  const { data: access } = useUserAccess(user?.id);
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const resolvedBrandLabel = brandLabel || (
    access?.isAdmin ? "ZIVO Admin" :
    access?.isSupport ? "ZIVO Support" :
    access?.isModerator ? "ZIVO Moderator" :
    access?.isOperations ? "ZIVO Operations" :
    "ZIVO Admin"
  );

  const navEntries = access?.isAdmin ? adminNavEntries :
    access?.isSupport ? supportNavEntries :
    adminNavEntries;

  const isPathActive = (path: string) => {
    const [pathname, hashFragment] = path.split("#");

    if (location.pathname !== pathname) {
      return false;
    }

    if (!hashFragment) {
      return true;
    }

    if (hashFragment === "overview") {
      return !location.hash || location.hash === "#overview";
    }

    return location.hash === `#${hashFragment}`;
  };

  return (
    <>
      <Helmet>
        <title>{title} — {resolvedBrandLabel}</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="min-h-screen bg-background flex">
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <aside
          className={cn(
            "fixed lg:sticky top-0 left-0 z-50 h-screen w-64 bg-card border-r border-border flex flex-col transition-transform duration-300",
            sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          )}
        >
          <div className="h-16 flex items-center justify-between px-5 border-b border-border">
            <div className="flex items-center gap-2.5">
              <img src={zivoLogo} alt="ZIVO" className="w-8 h-8 rounded-lg object-contain" />
              <span className="text-base font-bold text-foreground">{resolvedBrandLabel}</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
          </div>

          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {navEntries.map((entry) => {
              if (isGroup(entry)) {
                const isGroupActive = entry.children.some((child) => isPathActive(child.path));
                return (
                  <Collapsible key={entry.label} defaultOpen={isGroupActive}>
                    <CollapsibleTrigger className={cn(
                      "w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                      isGroupActive ? "text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}>
                      <div className="flex items-center gap-3">
                        <entry.icon className="w-4.5 h-4.5 shrink-0" />
                        {entry.label}
                      </div>
                      <ChevronDown className="w-3.5 h-3.5 transition-transform duration-200 [[data-state=open]>&]:rotate-180" />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="pl-4 space-y-0.5 mt-0.5">
                      {entry.children.map((child) => {
                        const isActive = isPathActive(child.path);
                        return (
                          <button
                            key={child.path}
                            onClick={() => { navigate(child.path); setSidebarOpen(false); }}
                            className={cn(
                              "w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all",
                              isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            )}
                          >
                            <child.icon className="w-4 h-4 shrink-0" />
                            {child.label}
                          </button>
                        );
                      })}
                    </CollapsibleContent>
                  </Collapsible>
                );
              }

              const item = entry as NavItem;
              const isActive = isPathActive(item.path);

              return (
                <button
                  key={item.path}
                  onClick={() => { navigate(item.path); setSidebarOpen(false); }}
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
          </nav>

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

          <div className="border-t border-border px-4 py-3">
            <p className="text-xs font-medium text-foreground truncate">{user?.email}</p>
            <p className="text-[10px] text-muted-foreground">Administrator</p>
          </div>
        </aside>

        <div className="flex-1 flex flex-col min-w-0">
          <header className="safe-area-top min-h-16 bg-card border-b border-border flex items-center justify-between px-4 sm:px-6 sticky top-0 z-30">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setSidebarOpen(true)}
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
}
