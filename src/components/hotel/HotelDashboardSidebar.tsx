import { motion } from "framer-motion";
import { 
  Hotel, 
  Search, 
  ClipboardList, 
  BedDouble, 
  Settings, 
  LogOut,
  User,
  ChevronRight,
  TrendingUp,
  Calendar,
  Star
} from "lucide-react";
import { cn } from "@/lib/utils";
import ZivoLogo from "@/components/ZivoLogo";

interface NavItem {
  value: string;
  label: string;
  icon: React.ElementType;
  gradient: string;
}

interface HotelDashboardSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  user: { email?: string } | null;
  onLogout: () => void;
  navItems: NavItem[];
}

const HotelDashboardSidebar = ({ 
  activeTab, 
  setActiveTab, 
  user, 
  onLogout,
  navItems 
}: HotelDashboardSidebarProps) => {
  return (
    <div className="flex flex-col h-full">
      {/* Header with Logo */}
      <div className="p-5 border-b border-border/50">
        <div className="flex items-center gap-3">
          <motion.div whileHover={{ scale: 1.05 }}>
            <ZivoLogo size="sm" />
          </motion.div>
          <div>
            <span className="font-bold text-lg block">Hotels</span>
            <span className="text-xs text-muted-foreground">Travel Hub</span>
          </div>
        </div>
      </div>

      {/* User Info */}
      <div className="p-4">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-amber-500/5 border border-amber-500/10">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center">
            <User className="h-5 w-5 text-amber-500" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.email?.split('@')[0]}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="px-4 mb-4">
        <div className="grid grid-cols-2 gap-2">
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="p-3 rounded-xl bg-gradient-to-br from-amber-500/10 to-orange-500/5 border border-amber-500/20 cursor-pointer"
          >
            <div className="flex items-center gap-1 mb-1">
              <Calendar className="h-3 w-3 text-amber-500" />
              <p className="text-lg font-bold text-amber-500">8</p>
            </div>
            <p className="text-[10px] text-muted-foreground">Today's Bookings</p>
          </motion.div>
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="p-3 rounded-xl bg-gradient-to-br from-emerald-500/10 to-green-500/5 border border-emerald-500/20 cursor-pointer"
          >
            <div className="flex items-center gap-1 mb-1">
              <TrendingUp className="h-3 w-3 text-emerald-500" />
              <p className="text-lg font-bold text-emerald-500">72%</p>
            </div>
            <p className="text-[10px] text-muted-foreground">Occupancy</p>
          </motion.div>
        </div>
        
        {/* Rating */}
        <div className="mt-2 p-3 rounded-xl bg-gradient-to-br from-violet-500/10 to-purple-500/5 border border-violet-500/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
              <span className="font-bold">4.8</span>
            </div>
            <span className="text-xs text-muted-foreground">Guest Rating</span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="px-3 py-2 space-y-1 flex-1 overflow-y-auto">
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-2">Management</p>
        {navItems.map((item, index) => {
          const isActive = activeTab === item.value;
          return (
            <motion.button
              key={item.value}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.03 }}
              onClick={() => setActiveTab(item.value)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left group",
                isActive
                  ? "bg-amber-500/10 text-amber-500"
                  : "hover:bg-muted/50 text-muted-foreground hover:text-foreground"
              )}
            >
              <motion.div 
                whileHover={{ scale: 1.1, rotate: isActive ? 0 : 5 }}
                className={cn(
                  "w-9 h-9 rounded-lg flex items-center justify-center transition-all",
                  isActive 
                    ? `bg-gradient-to-br ${item.gradient} shadow-lg` 
                    : "bg-muted/50 group-hover:bg-muted"
                )}
              >
                <item.icon className={cn(
                  "h-4 w-4 transition-all duration-200",
                  isActive ? "text-white" : "text-muted-foreground group-hover:text-foreground"
                )} />
              </motion.div>
              <span className="font-medium flex-1">{item.label}</span>
              {isActive && (
                <motion.div
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <ChevronRight className="w-4 h-4 text-amber-500" />
                </motion.div>
              )}
            </motion.button>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-border/50">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors text-left hover:bg-destructive/10 text-destructive group"
        >
          <div className="w-9 h-9 rounded-lg bg-destructive/10 group-hover:bg-destructive/20 flex items-center justify-center">
            <LogOut className="h-4 w-4" />
          </div>
          <span className="font-medium">Sign Out</span>
        </motion.button>
      </div>
    </div>
  );
};

export default HotelDashboardSidebar;
