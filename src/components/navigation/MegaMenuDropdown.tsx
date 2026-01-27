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
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ 
              duration: 0.2, 
              ease: [0.25, 0.46, 0.45, 0.94]
            }}
            className="absolute top-full left-1/2 -translate-x-1/2 pt-3 z-50"
          >
            <div className={cn(
              "w-[760px] bg-card/95 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden relative",
              `shadow-xl ${getGlowColor()}`
            )}>
              {/* Animated background gradient */}
              <div className={cn(
                "absolute inset-0 bg-gradient-to-br opacity-50 pointer-events-none",
                getGradientClass()
              )} />
              
              {/* Decorative blur orbs */}
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-primary/20 to-transparent rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-gradient-to-br from-eats/10 to-transparent rounded-full blur-3xl pointer-events-none" />

              {/* Header Bar */}
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="relative px-6 py-5 border-b border-white/5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <motion.div
                      whileHover={{ scale: 1.05, rotate: 5 }}
                      className={cn(
                        "w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg relative overflow-hidden",
                        getAccentColor()
                      )}
                    >
                      {/* Shine effect */}
                      <motion.div
                        initial={{ x: "-100%", opacity: 0 }}
                        animate={{ x: "200%", opacity: 0.3 }}
                        transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 3 }}
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent skew-x-12"
                      />
                      <data.icon className="w-6 h-6 text-white relative z-10" />
                    </motion.div>
                    <div>
                      <h3 className="font-display font-bold text-lg text-foreground flex items-center gap-2">
                        ZIVO {data.label}
                        <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                      </h3>
                      <p className="text-sm text-muted-foreground">{data.description}</p>
                    </div>
                  </div>
                  <Link to={data.mainAction.href}>
                    <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                      <Button 
                        variant="hero" 
                        size="sm" 
                        className="gap-2 rounded-xl shadow-lg shadow-primary/20 group"
                      >
                        {data.mainAction.label}
                        <motion.div
                          initial={{ x: 0 }}
                          whileHover={{ x: 3 }}
                          transition={{ type: "spring", stiffness: 300 }}
                        >
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                        </motion.div>
                      </Button>
                    </motion.div>
                  </Link>
                </div>
              </motion.div>

              {/* Content Grid */}
              <div className="relative p-6">
                <div className="grid grid-cols-2 gap-10">
                  {data.sections.map((section, sectionIndex) => (
                    <motion.div 
                      key={section.title}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 + sectionIndex * 0.05 }}
                    >
                      <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
                        <span className="w-8 h-px bg-gradient-to-r from-primary/50 to-transparent" />
                        {section.title}
                      </h4>
                      <div className="space-y-1.5">
                        {section.items.map((item, itemIndex) => (
                          <Link
                            key={item.label}
                            to={item.href}
                          >
                            <motion.div
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.15 + sectionIndex * 0.05 + itemIndex * 0.03 }}
                              whileHover={{ x: 4, backgroundColor: "rgba(255,255,255,0.05)" }}
                              className="flex items-start gap-3 p-3 rounded-xl transition-all duration-200 group cursor-pointer relative overflow-hidden"
                            >
                              {/* Hover glow */}
                              <motion.div
                                initial={{ opacity: 0 }}
                                whileHover={{ opacity: 1 }}
                                className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent pointer-events-none"
                              />
                              
                              <motion.div
                                whileHover={{ scale: 1.1, rotate: 5 }}
                                className={cn(
                                  "w-10 h-10 rounded-xl bg-muted/80 flex items-center justify-center shrink-0 relative overflow-hidden border border-white/5",
                                  item.color || "text-muted-foreground"
                                )}
                              >
                                <item.icon className="w-5 h-5 relative z-10" />
                              </motion.div>
                              <div className="flex-1 min-w-0 relative z-10">
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold text-foreground text-sm group-hover:text-primary transition-colors">
                                    {item.label}
                                  </span>
                                  {item.badge && (
                                    <motion.div
                                      initial={{ scale: 0 }}
                                      animate={{ scale: 1 }}
                                      transition={{ type: "spring", stiffness: 500, delay: 0.2 }}
                                    >
                                      <Badge
                                        className="text-[10px] px-2 py-0.5 h-auto bg-gradient-to-r from-eats to-orange-500 text-white border-0 shadow-md shadow-eats/30 font-bold"
                                      >
                                        {item.badge}
                                      </Badge>
                                    </motion.div>
                                  )}
                                </div>
                                <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                                  {item.description}
                                </p>
                              </div>
                              <ArrowRight className="w-4 h-4 text-muted-foreground/50 group-hover:text-primary group-hover:translate-x-1 transition-all opacity-0 group-hover:opacity-100 mt-3" />
                            </motion.div>
                          </Link>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Policy Links Footer */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.25 }}
                className="relative px-6 py-4 bg-gradient-to-r from-muted/30 via-muted/20 to-muted/30 border-t border-white/5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-5">
                    {data.policies.slice(0, 4).map((policy, index) => (
                      <Link
                        key={policy.label}
                        to={policy.href}
                      >
                        <motion.div
                          whileHover={{ scale: 1.05, y: -1 }}
                          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors group"
                        >
                          <policy.icon className="w-3.5 h-3.5 group-hover:text-primary transition-colors" />
                          <span className="group-hover:underline underline-offset-2">{policy.label}</span>
                        </motion.div>
                      </Link>
                    ))}
                  </div>
                  <Link to="/help">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors font-medium"
                    >
                      <span>View all</span>
                      <ExternalLink className="w-3 h-3" />
                    </motion.div>
                  </Link>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MegaMenuDropdown;
