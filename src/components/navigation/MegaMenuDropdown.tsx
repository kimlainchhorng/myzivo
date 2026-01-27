import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, ArrowRight, ExternalLink, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { MegaMenuData } from "./megaMenuData";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface MegaMenuDropdownProps {
  data: MegaMenuData;
}

const MegaMenuDropdown = ({ data }: MegaMenuDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 150);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const getGradientClass = () => {
    switch (data.id) {
      case "rides": return "from-rides/20 to-teal-500/10";
      case "eats": return "from-eats/20 to-orange-400/10";
      case "flights": return "from-sky-500/20 to-blue-400/10";
      case "hotels": return "from-amber-500/20 to-yellow-400/10";
      case "car-rental": return "from-primary/20 to-teal-400/10";
      default: return "from-muted-foreground/20 to-muted/10";
    }
  };

  const getAccentColor = () => {
    switch (data.id) {
      case "rides": return "bg-gradient-to-br from-rides to-teal-400";
      case "eats": return "bg-gradient-to-br from-eats to-orange-400";
      case "flights": return "bg-gradient-to-br from-sky-500 to-blue-400";
      case "hotels": return "bg-gradient-to-br from-amber-500 to-yellow-400";
      case "car-rental": return "bg-gradient-to-br from-primary to-teal-400";
      default: return "bg-gradient-to-br from-muted-foreground to-muted";
    }
  };

  const getGlowColor = () => {
    switch (data.id) {
      case "rides": return "shadow-rides/30";
      case "eats": return "shadow-eats/30";
      case "flights": return "shadow-sky-500/30";
      case "hotels": return "shadow-amber-500/30";
      case "car-rental": return "shadow-primary/30";
      default: return "shadow-muted-foreground/20";
    }
  };

  return (
    <div
      ref={menuRef}
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Trigger Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={cn(
          "flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 relative overflow-hidden",
          isOpen
            ? `${data.color} bg-muted/80 shadow-lg`
            : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
        )}
      >
        {isOpen && (
          <motion.div
            layoutId={`menu-glow-${data.id}`}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          />
        )}
        <data.icon className={cn("w-4 h-4 relative z-10", isOpen && data.color)} />
        <span className="relative z-10">{data.label}</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
        >
          <ChevronDown className="w-4 h-4 relative z-10" />
        </motion.div>
      </motion.button>

      {/* Dropdown Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute top-full left-1/2 -translate-x-1/2 pt-3 z-50"
          >
            <div className={cn(
              "w-[760px] bg-card/95 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden relative",
              `shadow-xl ${getGlowColor()}`
            )}>
              {/* Static background gradient - no animation */}
              <div className={cn(
                "absolute inset-0 bg-gradient-to-br opacity-50 pointer-events-none",
                getGradientClass()
              )} />

              {/* Header Bar */}
              <div className="relative px-6 py-5 border-b border-white/5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg",
                      getAccentColor()
                    )}>
                      <data.icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-lg text-foreground flex items-center gap-2">
                        ZIVO {data.label}
                        <Sparkles className="w-4 h-4 text-primary" />
                      </h3>
                      <p className="text-sm text-muted-foreground">{data.description}</p>
                    </div>
                  </div>
                  <Link to={data.mainAction.href}>
                    <Button 
                      variant="hero" 
                      size="sm" 
                      className="gap-2 rounded-xl shadow-lg shadow-primary/20 group hover:scale-[1.02] active:scale-[0.98] transition-transform"
                    >
                      {data.mainAction.label}
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Content Grid */}
              <div className="relative p-6">
                <div className="grid grid-cols-2 gap-10">
                  {data.sections.map((section) => (
                    <div key={section.title}>
                      <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
                        <span className="w-8 h-px bg-gradient-to-r from-primary/50 to-transparent" />
                        {section.title}
                      </h4>
                      <div className="space-y-2">
                        {section.items.map((item) => (
                          <Link key={item.label} to={item.href}>
                            <div className="flex items-center gap-4 p-3.5 rounded-2xl transition-all duration-200 group cursor-pointer relative overflow-hidden border border-transparent hover:border-white/10 hover:bg-white/5 hover:translate-x-1">
                              {/* Icon container */}
                              <div className={cn(
                                "w-11 h-11 rounded-xl flex items-center justify-center shrink-0",
                                "bg-gradient-to-br from-muted/90 to-muted/50 border border-white/10",
                                "group-hover:border-primary/30 group-hover:shadow-lg group-hover:shadow-primary/20",
                                "transition-all duration-200",
                                item.color || "text-muted-foreground"
                              )}>
                                <item.icon className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
                              </div>
                              
                              {/* Text content */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2.5">
                                  <span className="font-semibold text-foreground text-sm group-hover:text-primary transition-colors duration-200">
                                    {item.label}
                                  </span>
                                  {item.badge && (
                                    <Badge className="text-[10px] px-2.5 py-0.5 h-auto bg-gradient-to-r from-eats via-orange-500 to-eats text-white border-0 shadow-lg shadow-eats/40 font-bold uppercase tracking-wide">
                                      {item.badge}
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-xs text-muted-foreground/80 line-clamp-1 mt-1 group-hover:text-muted-foreground transition-colors duration-200">
                                  {item.description}
                                </p>
                              </div>
                              
                              {/* Arrow indicator */}
                              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                <ArrowRight className="w-4 h-4 text-primary" />
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Policy Links Footer */}
              <div className="relative px-6 py-4 bg-gradient-to-r from-muted/30 via-muted/20 to-muted/30 border-t border-white/5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-5">
                    {data.policies.slice(0, 4).map((policy) => (
                      <Link key={policy.label} to={policy.href}>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors group">
                          <policy.icon className="w-3.5 h-3.5 group-hover:text-primary transition-colors" />
                          <span className="group-hover:underline underline-offset-2">{policy.label}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                  <Link to="/help">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors font-medium">
                      <span>View all</span>
                      <ExternalLink className="w-3 h-3" />
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MegaMenuDropdown;
