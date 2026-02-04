/**
 * Admin Layout
 * Unified shell for the Master Admin Control Center
 */

import { useState } from "react";
import { Link, useLocation, useNavigate, Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useAdminRole } from "@/hooks/useAdminRole";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  LayoutDashboard,
  Plane,
  Car,
  Utensils,
  Headphones,
  Wallet,
  Settings,
  BarChart3,
  Menu,
  LogOut,
  User,
  ChevronDown,
  Shield,
  Bell,
  Search,
  Home,
  Users,
  FileText,
  Truck,
} from "lucide-react";
import ZivoLogo from "@/components/ZivoLogo";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  roles?: string[]; // If empty, all admin roles can access
  badge?: number;
  children?: { label: string; href: string }[];
}

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { 
    label: "Travel", 
    href: "/admin/travel", 
    icon: Plane,
    roles: ["admin", "super_admin", "operations"],
    children: [
      { label: "Bookings", href: "/admin/travel/bookings" },
      { label: "Refunds", href: "/admin/travel/refunds" },
      { label: "Suppliers", href: "/admin/travel/suppliers" },
    ]
  },
  { 
    label: "Drivers", 
    href: "/admin/drivers", 
    icon: Car,
    roles: ["admin", "super_admin", "operations"],
  },
  { 
    label: "Eats", 
    href: "/admin/eats", 
    icon: Utensils,
    roles: ["admin", "super_admin", "operations"],
  },
  { 
    label: "Jobs", 
    href: "/admin/jobs", 
    icon: Truck,
    roles: ["admin", "super_admin", "operations"],
  },
  { 
    label: "Support", 
    href: "/admin/support", 
    icon: Headphones,
    roles: ["admin", "super_admin", "support"],
  },
  { 
    label: "Payouts", 
    href: "/admin/payouts", 
    icon: Wallet,
    roles: ["admin", "super_admin", "finance"],
  },
  { 
    label: "Reports", 
    href: "/admin/reports", 
    icon: BarChart3,
    roles: ["admin", "super_admin", "finance"],
  },
  { 
    label: "Users", 
    href: "/admin/users", 
    icon: Users,
  },
  { 
    label: "Settings", 
    href: "/admin/settings", 
    icon: Settings,
    roles: ["admin", "super_admin"],
  },
];

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { roles, isAdmin, isSuperAdmin } = useAdminRole();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate("/admin/login");
  };

  // Get role badge color
  const getRoleBadgeVariant = () => {
    if (isSuperAdmin) return "default";
    if (isAdmin) return "default";
    return "secondary";
  };

  const getRoleLabel = () => {
    if (isSuperAdmin) return "Super Admin";
    if (isAdmin) return "Admin";
    if (roles.includes("operations")) return "Operations";
    if (roles.includes("finance")) return "Finance";
    if (roles.includes("support")) return "Support";
    return "Staff";
  };

  // Filter nav items based on user roles
  const visibleNavItems = navItems.filter((item) => {
    if (!item.roles || item.roles.length === 0) return true;
    if (isAdmin || isSuperAdmin) return true;
    return item.roles.some((role) => roles.includes(role as any));
  });

  const isActive = (href: string) => {
    if (href === "/admin") return location.pathname === "/admin";
    return location.pathname.startsWith(href);
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-4 border-b">
        <Link to="/admin" className="flex items-center gap-2">
          <ZivoLogo size="sm" />
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Admin
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-1">
          {visibleNavItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <div key={item.href}>
                <Link
                  to={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    active
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                  {item.badge && (
                    <Badge variant="secondary" className="ml-auto text-xs">
                      {item.badge}
                    </Badge>
                  )}
                </Link>

                {/* Subnav */}
                {item.children && active && (
                  <div className="ml-7 mt-1 space-y-1">
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        to={child.href}
                        onClick={() => setMobileOpen(false)}
                        className={cn(
                          "block px-3 py-1.5 rounded text-sm transition-colors",
                          location.pathname === child.href
                            ? "text-primary font-medium"
                            : "text-muted-foreground hover:text-foreground"
                        )}
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </ScrollArea>

      {/* User section */}
      <div className="p-4 border-t">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="h-4 w-4 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">
              {user?.email?.split("@")[0]}
            </p>
            <Badge variant={getRoleBadgeVariant()} className="text-xs">
              {getRoleLabel()}
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:flex lg:w-64 lg:flex-col bg-card border-r">
        <SidebarContent />
      </aside>

      {/* Mobile Header */}
      <header className="lg:hidden sticky top-0 z-40 flex h-14 items-center gap-4 border-b bg-card px-4">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <SidebarContent />
          </SheetContent>
        </Sheet>

        <div className="flex-1">
          <ZivoLogo size="sm" />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <User className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>{user?.email}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Desktop Top Bar */}
        <header className="hidden lg:flex sticky top-0 z-40 h-14 items-center gap-4 border-b bg-card px-6">
          <div className="flex-1">
            <h1 className="text-lg font-semibold flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Admin Control Center
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon">
              <Search className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5" />
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <Button variant="ghost" size="sm" asChild>
              <Link to="/">
                <Home className="mr-2 h-4 w-4" />
                View Site
              </Link>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <User className="mr-2 h-4 w-4" />
                  {user?.email?.split("@")[0]}
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span>{user?.email}</span>
                    <Badge variant={getRoleBadgeVariant()} className="w-fit mt-1 text-xs">
                      {getRoleLabel()}
                    </Badge>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
