/**
 * Data Moat Card Component
 * Detailed view of ZIVO's data competitive advantage
 */

import { Database, Lock, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DATA_MOAT } from "@/config/platformMoat";
import { cn } from "@/lib/utils";

interface DataMoatCardProps {
  className?: string;
  showApplications?: boolean;
}

export default function DataMoatCard({ className, showApplications = true }: DataMoatCardProps) {
  return (
    <Card className={cn("border-border/50", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="w-5 h-5 text-primary" />
          {DATA_MOAT.title}
          <Badge className="ml-2 bg-emerald-500/10 text-emerald-500 border-0">
            Core Advantage
          </Badge>
        </CardTitle>
        <p className="text-sm text-muted-foreground">{DATA_MOAT.description}</p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Data Assets */}
        <div>
          <p className="text-sm font-medium mb-3">Proprietary Data Assets</p>
          <div className="grid sm:grid-cols-2 gap-3">
            {DATA_MOAT.dataAssets.map((asset) => (
              <div
                key={asset.type}
                className="p-3 rounded-lg bg-muted/30 border border-border/50"
              >
                <p className="font-medium text-sm mb-1">{asset.label}</p>
                <p className="text-xs text-muted-foreground mb-2">
                  {asset.description}
                </p>
                <Badge variant="outline" className="text-xs">
                  {asset.value}
                </Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Applications */}
        {showApplications && (
          <div>
            <p className="text-sm font-medium mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              Data Applications
            </p>
            <ul className="space-y-2">
              {DATA_MOAT.applications.map((app, i) => (
                <li
                  key={i}
                  className="text-sm text-muted-foreground flex items-center gap-2"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  {app}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Disclosure */}
        <div className="p-3 rounded-lg bg-muted/20 flex items-center gap-2">
          <Lock className="w-4 h-4 text-muted-foreground" />
          <p className="text-xs text-muted-foreground">{DATA_MOAT.disclosure}</p>
        </div>
      </CardContent>
    </Card>
  );
}
