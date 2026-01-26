import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, ArrowRight, ExternalLink } from "lucide-react";
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

  return (
    <div
      ref={menuRef}
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Trigger Button */}
      <button
        className={cn(
          "flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
          isOpen
            ? `${data.color} bg-muted`
            : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
        )}
      >
        <data.icon className={cn("w-4 h-4", isOpen && data.color)} />
        <span>{data.label}</span>
        <ChevronDown
          className={cn(
            "w-4 h-4 transition-transform duration-200",
            isOpen && "rotate-180"
          )}
        />
      </button>

      {/* Dropdown Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-1/2 -translate-x-1/2 pt-2 z-50"
          >
            <div className="w-[720px] bg-card/98 backdrop-blur-xl border border-border rounded-2xl shadow-2xl overflow-hidden">
              {/* Header Bar */}
              <div className="px-6 py-4 border-b border-border bg-muted/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center",
                        data.id === "rides" && "gradient-rides",
                        data.id === "eats" && "gradient-eats",
                        data.id === "flights" && "bg-sky-500",
                        data.id === "hotels" && "bg-amber-500",
                        data.id === "car-rental" && "bg-primary",
                        data.id === "more" && "bg-muted-foreground"
                      )}
                    >
                      <data.icon className="w-5 h-5 text-primary-foreground" />
                    </div>
                    <div>
                      <h3 className="font-display font-semibold text-foreground">
                        ZIVO {data.label}
                      </h3>
                      <p className="text-sm text-muted-foreground">{data.description}</p>
                    </div>
                  </div>
                  <Link to={data.mainAction.href}>
                    <Button variant="hero" size="sm" className="gap-2">
                      {data.mainAction.label}
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Content Grid */}
              <div className="p-6">
                <div className="grid grid-cols-2 gap-8">
                  {data.sections.map((section) => (
                    <div key={section.title}>
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                        {section.title}
                      </h4>
                      <div className="space-y-1">
                        {section.items.map((item) => (
                          <Link
                            key={item.label}
                            to={item.href}
                            className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-muted/50 transition-colors group"
                          >
                            <div
                              className={cn(
                                "w-9 h-9 rounded-lg bg-muted flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform",
                                item.color || "text-muted-foreground"
                              )}
                            >
                              <item.icon className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-foreground text-sm group-hover:text-primary transition-colors">
                                  {item.label}
                                </span>
                                {item.badge && (
                                  <Badge
                                    variant="secondary"
                                    className="text-[10px] px-1.5 py-0 h-4 bg-eats/10 text-eats border-0"
                                  >
                                    {item.badge}
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground line-clamp-1">
                                {item.description}
                              </p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Policy Links Footer */}
              <div className="px-6 py-4 bg-muted/20 border-t border-border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {data.policies.slice(0, 4).map((policy) => (
                      <Link
                        key={policy.label}
                        to={policy.href}
                        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <policy.icon className="w-3.5 h-3.5" />
                        <span>{policy.label}</span>
                      </Link>
                    ))}
                  </div>
                  <Link
                    to="/help"
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <span>View all</span>
                    <ExternalLink className="w-3 h-3" />
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
