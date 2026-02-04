/**
 * Moat Overview Component
 * Visualizes ZIVO's competitive moat for investors
 */

import {
  Brain,
  Code2,
  Database,
  Globe,
  Handshake,
  Layers,
  Shield,
  User,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ALL_MOATS, MOAT_SUMMARY } from "@/config/platformMoat";
import { cn } from "@/lib/utils";

const iconMap: Record<string, any> = {
  database: Database,
  globe: Globe,
  layers: Layers,
  user: User,
  handshake: Handshake,
  shield: Shield,
  code: Code2,
  brain: Brain,
};

interface MoatOverviewProps {
  variant?: 'full' | 'compact' | 'grid';
  className?: string;
}

export default function MoatOverview({ variant = 'full', className }: MoatOverviewProps) {
  if (variant === 'compact') {
    return (
      <div className={cn("space-y-4", className)}>
        <div className="text-center">
          <Badge className="mb-2 bg-primary/10 text-primary border-0">
            Competitive Moat
          </Badge>
          <p className="text-sm text-muted-foreground max-w-lg mx-auto">
            {MOAT_SUMMARY.headline}
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-2">
          {ALL_MOATS.map((moat) => {
            const Icon = iconMap[moat.icon] || Database;
            return (
              <Badge
                key={moat.id}
                variant="outline"
                className="flex items-center gap-1.5 px-3 py-1.5"
              >
                <Icon className="w-3.5 h-3.5 text-primary" />
                {moat.title.split(' ')[0]}
              </Badge>
            );
          })}
        </div>
      </div>
    );
  }

  if (variant === 'grid') {
    return (
      <div className={cn("grid md:grid-cols-2 lg:grid-cols-4 gap-4", className)}>
        {ALL_MOATS.map((moat) => {
          const Icon = iconMap[moat.icon] || Database;
          return (
            <Card key={moat.id} className="border-border/50">
              <CardContent className="pt-6">
                <Icon className="w-8 h-8 text-primary mb-3" />
                <h3 className="font-semibold text-sm mb-1">{moat.title}</h3>
                <p className="text-xs text-muted-foreground">{moat.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  }

  return (
    <div className={cn("space-y-8", className)}>
      {/* Header */}
      <div className="text-center">
        <Badge className="mb-4 bg-primary/10 text-primary border-0">
          Platform Defensibility
        </Badge>
        <h2 className="font-display text-3xl font-bold mb-4">
          Competitive Moat
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          {MOAT_SUMMARY.headline}
        </p>
      </div>

      {/* Key Points */}
      <div className="flex flex-wrap justify-center gap-3">
        {MOAT_SUMMARY.keyPoints.map((point, i) => (
          <Badge
            key={i}
            variant="outline"
            className="px-4 py-2 text-sm bg-emerald-500/5 text-emerald-600 border-emerald-500/20"
          >
            ✓ {point}
          </Badge>
        ))}
      </div>

      {/* Moat Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        {ALL_MOATS.map((moat) => {
          const Icon = iconMap[moat.icon] || Database;
          return (
            <Card key={moat.id} className="border-border/50">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{moat.title}</h3>
                      {'subtitle' in moat && moat.subtitle && (
                        <Badge variant="outline" className="text-xs">
                          {moat.subtitle as string}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {moat.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
