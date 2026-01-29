// CSS animations used instead of framer-motion for performance
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface PremiumCardProps {
  children: React.ReactNode;
  className?: string;
  hoverEffect?: boolean;
  glowColor?: string;
  delay?: number;
}

export const PremiumCard = ({ 
  children, 
  className,
  hoverEffect = true,
  glowColor = "primary",
  delay = 0
}: PremiumCardProps) => {
  const glowClasses: Record<string, string> = {
    primary: "from-primary/20 to-teal-400/10",
    eats: "from-eats/20 to-orange-500/10",
    violet: "from-violet-500/20 to-purple-500/10",
    sky: "from-sky-500/20 to-blue-500/10",
    amber: "from-amber-500/20 to-orange-500/10",
  };

  return (
    <div
      className={cn(
        "relative p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-card/95 to-card border border-border/50 shadow-xl hover:shadow-2xl transition-all duration-300 group overflow-hidden animate-in fade-in slide-in-from-bottom-4",
        hoverEffect && "hover:-translate-y-2 hover:scale-[1.02]",
        className
      )}
      style={{ animationDelay: `${delay * 1000}ms`, animationFillMode: 'both' }}
    >
      {/* Decorative glow */}
      <div className={cn(
        "absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500",
        glowClasses[glowColor]
      )} />
      {children}
    </div>
  );
};

interface ServiceCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  gradient: string;
  shadowColor: string;
  isNew?: boolean;
  onClick?: () => void;
  delay?: number;
}

export const ServiceCard = ({
  icon: Icon,
  title,
  description,
  gradient,
  shadowColor,
  isNew,
  onClick,
  delay = 0
}: ServiceCardProps) => {
  return (
    <button
      onClick={onClick}
      className="relative p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-card/95 to-card border border-border/50 shadow-xl hover:shadow-2xl transition-all duration-300 group text-left overflow-hidden hover:-translate-y-2 hover:scale-[1.02] active:scale-[0.98] animate-in fade-in slide-in-from-bottom-4 zoom-in-95"
      style={{ animationDelay: `${delay * 1000}ms`, animationFillMode: 'both' }}
    >
      {/* Decorative glow */}
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-white/5 to-transparent rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      {isNew && (
        <span className="absolute top-3 right-3 px-2.5 py-1 text-[10px] font-bold bg-gradient-to-r from-eats to-orange-500 text-white rounded-full shadow-lg animate-in zoom-in duration-300">
          New
        </span>
      )}
      
      <div 
        className={cn(
          "w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center mb-4 shadow-xl transition-transform duration-200 group-hover:scale-115 group-hover:rotate-6",
          gradient,
          shadowColor
        )}
      >
        <Icon className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
      </div>
      
      <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors">
        {title}
      </h3>
      <p className="text-xs text-muted-foreground mt-1">{description}</p>
    </button>
  );
};

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  stat?: string;
  gradient: string;
  shadowColor: string;
  delay?: number;
}

export const FeatureCard = ({
  icon: Icon,
  title,
  description,
  stat,
  gradient,
  shadowColor,
  delay = 0
}: FeatureCardProps) => {
  return (
    <div
      className="relative p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-card/95 to-card border border-border/50 shadow-xl hover:shadow-2xl transition-all duration-300 group overflow-hidden cursor-default hover:-translate-y-2 hover:scale-[1.02] animate-in fade-in slide-in-from-bottom-6"
      style={{ animationDelay: `${delay * 1000}ms`, animationFillMode: 'both' }}
    >
      {/* Corner glow */}
      <div className={cn(
        "absolute -top-10 -right-10 w-20 h-20 rounded-full blur-2xl opacity-0 group-hover:opacity-30 transition-opacity duration-500",
        `bg-gradient-to-br ${gradient}`
      )} />

      {/* Stat badge */}
      {stat && (
        <div className="absolute top-4 right-4 sm:top-5 sm:right-5">
          <span className={cn(
            "text-sm font-bold px-3 py-1 rounded-full text-white shadow-lg",
            `bg-gradient-to-r ${gradient}`
          )}>
            {stat}
          </span>
        </div>
      )}

      <div 
        className={cn(
          "w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center mb-5 shadow-lg transition-transform duration-200 group-hover:scale-110 group-hover:rotate-3",
          `bg-gradient-to-br ${gradient}`,
          shadowColor
        )}
      >
        <Icon className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
      </div>
      
      <h3 className="font-display text-xl sm:text-2xl font-bold mb-2 text-foreground group-hover:text-primary transition-colors">
        {title}
      </h3>
      <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
        {description}
      </p>
    </div>
  );
};
