import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, ArrowRight, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MegaMenuData } from "./megaMenuData";

interface MegaMenuDropdownProps {
  data: MegaMenuData;
}

const MegaMenuDropdown = ({ data }: MegaMenuDropdownProps) => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleNavigation = (href: string) => {
    navigate(href);
    setIsOpen(false);
  };

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      {/* Trigger Button */}
      <button
        className={cn(
          "flex items-center gap-2 text-muted-foreground transition-colors py-2 group",
          data.hoverColor,
          isOpen && data.color
        )}
        onClick={() => handleNavigation(data.mainAction.href)}
      >
        <data.icon className="w-4 h-4" />
        <span className="font-medium">{data.label}</span>
        <ChevronDown
          className={cn(
            "w-3 h-3 transition-transform duration-200",
            isOpen && "rotate-180"
          )}
        />
      </button>

      {/* Mega Menu Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 z-50">
          <div className="w-[720px] bg-card/95 backdrop-blur-xl border border-border rounded-2xl shadow-2xl overflow-hidden animate-scale-in">
            {/* Header */}
            <div className="bg-gradient-to-r from-card to-muted/30 p-4 border-b border-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", 
                    data.id === "rides" && "gradient-rides",
                    data.id === "eats" && "gradient-eats",
                    data.id === "flights" && "bg-sky-500",
                    data.id === "hotels" && "bg-amber-500",
                    data.id === "car-rental" && "bg-primary",
                    data.id === "more" && "bg-muted"
                  )}>
                    <data.icon className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-foreground">{data.label}</h3>
                    <p className="text-sm text-muted-foreground">{data.description}</p>
                  </div>
                </div>
                <Button
                  variant="hero"
                  size="sm"
                  onClick={() => handleNavigation(data.mainAction.href)}
                  className="gap-2"
                >
                  {data.mainAction.label}
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Content Grid */}
            <div className="p-4 grid grid-cols-2 gap-6">
              {data.sections.map((section) => (
                <div key={section.title}>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                    {section.title}
                  </h4>
                  <div className="space-y-1">
                    {section.items.map((item) => (
                      <button
                        key={item.label}
                        onClick={() => handleNavigation(item.href)}
                        className="w-full flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors group text-left"
                      >
                        <div className={cn("w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0 group-hover:bg-muted/80", item.color)}>
                          <item.icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-foreground text-sm">{item.label}</span>
                            {item.badge && (
                              <Badge variant="secondary" className="text-xs px-1.5 py-0 bg-primary/10 text-primary">
                                {item.badge}
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-1">{item.description}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Policies Footer */}
            <div className="bg-muted/30 border-t border-border px-4 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {data.policies.map((policy) => (
                    <button
                      key={policy.label}
                      onClick={() => handleNavigation(policy.href)}
                      className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <policy.icon className="w-3 h-3" />
                      <span>{policy.label}</span>
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => handleNavigation("/help")}
                  className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors"
                >
                  <span>Help Center</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MegaMenuDropdown;
