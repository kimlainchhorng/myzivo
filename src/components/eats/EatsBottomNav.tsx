/**
 * ZIVO Eats Bottom Navigation
 * Mobile-first nav with unread alerts badge
 */
import { useNavigate, useLocation } from "react-router-dom";
import { Home, Package, ShoppingBag, Bell, User, Heart } from "lucide-react";
import { motion } from "framer-motion";
import { useCart } from "@/contexts/CartContext";
import { useEatsAlerts } from "@/hooks/useEatsAlerts";
import { cn } from "@/lib/utils";

interface NavItem {
  icon: React.ReactNode;
  label: string;
  path: string;
  badge?: number;
}

export function EatsBottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { getItemCount } = useCart();
  const { unreadCount } = useEatsAlerts();

  const cartCount = getItemCount();

  const navItems: NavItem[] = [
    {
      icon: <Home className="w-5 h-5" />,
      label: "Home",
      path: "/eats",
    },
    {
      icon: <Heart className="w-5 h-5" />,
      label: "Favorites",
      path: "/eats/favorites",
    },
    {
      icon: <Package className="w-5 h-5" />,
      label: "Orders",
      path: "/eats/orders",
    },
    {
      icon: <ShoppingBag className="w-5 h-5" />,
      label: "Cart",
      path: "/eats/cart",
      badge: cartCount > 0 ? cartCount : undefined,
    },
    {
      icon: <Bell className="w-5 h-5" />,
      label: "Alerts",
      path: "/eats/alerts",
      badge: unreadCount > 0 ? unreadCount : undefined,
    },
  ];

  const isActive = (path: string) => {
    if (path === "/eats") {
      return location.pathname === "/eats" || location.pathname === "/eats/";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-zinc-950/95 backdrop-blur-xl border-t border-white/5 safe-area-pb">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const active = isActive(item.path);
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                "relative flex flex-col items-center justify-center flex-1 h-full transition-all duration-150 touch-manipulation active:scale-[0.92]",
                active ? "text-orange-500" : "text-zinc-500"
              )}
            >
              <div className="relative">
                {item.icon}
                {item.badge && item.badge > 0 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] bg-orange-500 rounded-full flex items-center justify-center text-[10px] font-bold text-white border-2 border-zinc-950"
                  >
                    {item.badge > 99 ? "99+" : item.badge}
                  </motion.div>
                )}
              </div>
              <span className="text-[10px] font-medium mt-1">{item.label}</span>
              {active && (
                <motion.div
                  layoutId="eats-nav-indicator"
                  className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-orange-500 rounded-full"
                />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
