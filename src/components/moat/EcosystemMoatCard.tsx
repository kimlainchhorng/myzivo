/**
 * Ecosystem Moat Card Component
 * Multi-vertical platform advantage visualization
 */

import { Layers, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ECOSYSTEM_MOAT } from "@/config/platformMoat";
import { cn } from "@/lib/utils";

interface EcosystemMoatCardProps {
  className?: string;
}

const statusColors = {
  live: "text-emerald-500 border-emerald-500/30 bg-emerald-500/5",
  beta: "text-amber-500 border-amber-500/30 bg-amber-500/5",
  planned: "text-blue-500 border-blue-500/30 bg-blue-500/5",
  roadmap: "text-muted-foreground border-border bg-muted/30",
};

export default function EcosystemMoatCard({ className }: EcosystemMoatCardProps) {
  return (
    <Card className={cn("border-border/50", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-primary" />
          {ECOSYSTEM_MOAT.title}
        </CardTitle>
        <p className="text-sm text-muted-foreground">{ECOSYSTEM_MOAT.description}</p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Verticals Grid */}
        <div>
          <p className="text-sm font-medium mb-3">Platform Verticals</p>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
            {ECOSYSTEM_MOAT.verticals.map((vertical) => (
              <div
                key={vertical.id}
                className={cn(
                  "p-3 rounded-lg border text-center",
                  statusColors[vertical.status as keyof typeof statusColors]
                )}
              >
                <span className="text-2xl block mb-1">{vertical.icon}</span>
                <p className="text-xs font-medium">{vertical.name}</p>
                <Badge
                  variant="outline"
                  className={cn(
                    "text-[10px] mt-1",
                    statusColors[vertical.status as keyof typeof statusColors]
                  )}
                >
                  {vertical.status}
                </Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Benefits */}
        <div>
          <p className="text-sm font-medium mb-3">Ecosystem Benefits</p>
          <div className="grid sm:grid-cols-3 gap-3">
            {ECOSYSTEM_MOAT.benefits.map((benefit, i) => (
              <div
                key={i}
                className="p-3 rounded-lg bg-primary/5 border border-primary/10"
              >
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  <p className="font-medium text-sm">{benefit.title}</p>
                </div>
                <p className="text-xs text-muted-foreground">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
