/**
 * SEO Moat Card Component
 * SEO footprint competitive advantage
 */

import { Globe, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { SEO_MOAT } from "@/config/platformMoat";
import { cn } from "@/lib/utils";

interface SEOMoatCardProps {
  className?: string;
}

export default function SEOMoatCard({ className }: SEOMoatCardProps) {
  return (
    <Card className={cn("border-border/50", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="w-5 h-5 text-primary" />
          {SEO_MOAT.title}
        </CardTitle>
        <p className="text-sm text-muted-foreground">{SEO_MOAT.description}</p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* SEO Assets */}
        <div className="grid sm:grid-cols-2 gap-3">
          {SEO_MOAT.assets.map((asset) => (
            <div
              key={asset.type}
              className="p-4 rounded-xl bg-muted/30 border border-border/50 hover:border-primary/20 hover:shadow-sm transition-all duration-200"
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium">{asset.label}</p>
                <Badge className="bg-primary/10 text-primary border-0">
                  {asset.count}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">{asset.description}</p>
            </div>
          ))}
        </div>

        {/* Metrics */}
        <div>
          <p className="text-sm font-medium mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            SEO Metrics
          </p>
          <div className="space-y-3">
            <MetricBar
              label="Indexed Pages"
              value={SEO_MOAT.metrics.indexedPages}
              max={50000}
              suffix=" pages"
            />
            <MetricBar
              label="Organic Traffic Share"
              value={SEO_MOAT.metrics.organicTrafficShare}
              max={100}
              suffix="%"
            />
            <MetricBar
              label="Domain Authority"
              value={SEO_MOAT.metrics.domainAuthority}
              max={100}
              suffix="/100"
            />
            <MetricBar
              label="Keywords Ranking"
              value={SEO_MOAT.metrics.keywordsRanking}
              max={25000}
              suffix=" keywords"
            />
          </div>
        </div>

        {/* Barrier */}
        <div className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
          <p className="text-sm text-emerald-600 font-medium">
            {SEO_MOAT.competitorBarrier}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function MetricBar({
  label,
  value,
  max,
  suffix,
}: {
  label: string;
  value: number;
  max: number;
  suffix: string;
}) {
  const percentage = Math.min((value / max) * 100, 100);
  
  return (
    <div>
      <div className="flex items-center justify-between text-sm mb-1">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">
          {value.toLocaleString()}{suffix}
        </span>
      </div>
      <Progress value={percentage} className="h-2" />
    </div>
  );
}
