/**
 * Business Model Advantages
 * "Why ZIVO Scales" section for investor and transparency pages
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Package, 
  Shield, 
  Lock, 
  TrendingUp, 
  Users, 
  Cloud,
  CheckCircle2,
  Zap
} from "lucide-react";
import { BUSINESS_MODEL_ADVANTAGES } from "@/config/revenueAssumptions";
import { cn } from "@/lib/utils";

const iconMap = {
  'package': Package,
  'shield': Shield,
  'lock': Lock,
  'trending-up': TrendingUp,
  'users': Users,
  'cloud': Cloud,
};

interface BusinessModelAdvantagesProps {
  className?: string;
  variant?: 'default' | 'compact' | 'list';
  title?: string;
}

export const BusinessModelAdvantages = ({ 
  className, 
  variant = 'default',
  title = 'Why This Business Model Scales'
}: BusinessModelAdvantagesProps) => {
  if (variant === 'list') {
    return (
      <div className={cn("space-y-3", className)}>
        <h3 className="font-semibold flex items-center gap-2">
          <Zap className="w-5 h-5 text-primary" />
          {title}
        </h3>
        <ul className="space-y-2">
          {BUSINESS_MODEL_ADVANTAGES.map((advantage) => (
            <li key={advantage.title} className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
              <span className="text-sm text-muted-foreground">
                <strong className="text-foreground">{advantage.title}:</strong>{' '}
                {advantage.description}
              </span>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={cn("p-6 rounded-xl bg-gradient-to-br from-emerald-500/10 to-primary/10 border border-emerald-500/20", className)}>
        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-emerald-500" />
          {title}
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {BUSINESS_MODEL_ADVANTAGES.map((advantage) => {
            const Icon = iconMap[advantage.icon as keyof typeof iconMap] || CheckCircle2;
            return (
              <div key={advantage.title} className="flex items-center gap-2">
                <Icon className="w-4 h-4 text-emerald-500 shrink-0" />
                <span className="text-sm">{advantage.title}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-primary" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {BUSINESS_MODEL_ADVANTAGES.map((advantage) => {
            const Icon = iconMap[advantage.icon as keyof typeof iconMap] || CheckCircle2;
            return (
              <div 
                key={advantage.title}
                className="p-4 rounded-xl bg-muted/30 border border-border/50"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-emerald-500" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">{advantage.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      {advantage.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Tagline */}
        <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-primary/10 to-emerald-500/10 border border-primary/20 text-center">
          <p className="text-sm font-medium text-muted-foreground italic">
            "ZIVO is a high-margin, low-risk, commission-driven travel platform 
            designed to scale with user growth."
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default BusinessModelAdvantages;
