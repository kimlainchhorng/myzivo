import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Check, Info } from "lucide-react";

interface FeatureHighlightProps {
  features: string[];
  variant?: "check" | "bullet" | "numbered";
  columns?: 1 | 2 | 3;
  className?: string;
  accentColor?: "primary" | "emerald" | "amber" | "sky" | "eats";
  animated?: boolean;
}

const colorClasses = {
  primary: {
    icon: "text-primary",
    bg: "bg-primary/10",
    bullet: "bg-primary"
  },
  emerald: {
    icon: "text-emerald-500",
    bg: "bg-emerald-500/10",
    bullet: "bg-emerald-500"
  },
  amber: {
    icon: "text-amber-500",
    bg: "bg-amber-500/10",
    bullet: "bg-amber-500"
  },
  sky: {
    icon: "text-sky-500",
    bg: "bg-sky-500/10",
    bullet: "bg-sky-500"
  },
  eats: {
    icon: "text-eats",
    bg: "bg-eats/10",
    bullet: "bg-eats"
  }
};

export const FeatureHighlight = ({
  features,
  variant = "check",
  columns = 1,
  className,
  accentColor = "primary",
  animated = true,
}: FeatureHighlightProps) => {
  const colors = colorClasses[accentColor];

  const gridClasses = {
    1: "grid-cols-1",
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
  };

  const renderIndicator = (index: number) => {
    switch (variant) {
      case "check":
        return (
          <div className={cn(
            "w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0",
            colors.bg
          )}>
            <Check className={cn("w-3 h-3", colors.icon)} />
          </div>
        );
      case "bullet":
        return (
          <div className={cn(
            "w-2 h-2 rounded-full flex-shrink-0 mt-1.5",
            colors.bullet
          )} />
        );
      case "numbered":
        return (
          <div className={cn(
            "w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold",
            colors.bg,
            colors.icon
          )}>
            {index + 1}
          </div>
        );
    }
  };

  const FeatureItem = ({ feature, index }: { feature: string; index: number }) => {
    const content = (
      <div className="flex items-start gap-3">
        {renderIndicator(index)}
        <span className="text-sm">{feature}</span>
      </div>
    );

    if (!animated) return <div key={feature}>{content}</div>;

    return (
      <motion.div
        key={feature}
        initial={{ opacity: 0, x: -10 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ delay: index * 0.05 }}
      >
        {content}
      </motion.div>
    );
  };

  return (
    <div className={cn("grid gap-3", gridClasses[columns], className)}>
      {features.map((feature, index) => (
        <FeatureItem key={feature} feature={feature} index={index} />
      ))}
    </div>
  );
};

// Info card with icon and description
interface InfoCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  className?: string;
  variant?: "default" | "success" | "warning" | "info";
}

const variantClasses = {
  default: "border-border/50 bg-muted/30",
  success: "border-emerald-500/30 bg-emerald-500/10",
  warning: "border-amber-500/30 bg-amber-500/10",
  info: "border-sky-500/30 bg-sky-500/10",
};

export const InfoCard = ({
  icon,
  title,
  description,
  className,
  variant = "default",
}: InfoCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={cn(
        "flex items-start gap-4 p-4 rounded-xl border",
        variantClasses[variant],
        className
      )}
    >
      <div className="flex-shrink-0">{icon}</div>
      <div>
        <h4 className="font-semibold text-sm mb-1">{title}</h4>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </motion.div>
  );
};

export default FeatureHighlight;
