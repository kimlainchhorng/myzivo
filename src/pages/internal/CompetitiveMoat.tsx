/**
 * COMPETITIVE MOAT PAGE
 * Internal page showcasing platform defensibility
 */

import { Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  MoatOverview,
  DataMoatCard,
  EcosystemMoatCard,
  SEOMoatCard,
} from "@/components/moat";
import { USER_LOCKIN_MOAT, PARTNER_MOAT, TRUST_MOAT, TECH_MOAT, AI_MOAT } from "@/config/platformMoat";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Handshake, Code2, Brain, CheckCircle2 } from "lucide-react";

export default function CompetitiveMoat() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="font-display text-xl font-bold">Competitive Moat</h1>
                <p className="text-xs text-muted-foreground">
                  Platform Defensibility Analysis
                </p>
              </div>
            </div>
            <Badge variant="outline" className="text-amber-500 border-amber-500/30">
              CONFIDENTIAL
            </Badge>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Overview */}
        <MoatOverview variant="full" />

        {/* Detailed Cards */}
        <div className="grid lg:grid-cols-2 gap-6">
          <DataMoatCard />
          <SEOMoatCard />
        </div>

        <EcosystemMoatCard />

        {/* Additional Moats */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* User Lock-in */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                {USER_LOCKIN_MOAT.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                {USER_LOCKIN_MOAT.description}
              </p>
              <div className="space-y-2">
                {USER_LOCKIN_MOAT.storedValue.map((item) => (
                  <div
                    key={item.type}
                    className="flex items-center justify-between p-2 rounded-lg bg-muted/30"
                  >
                    <div>
                      <p className="text-sm font-medium">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{item.description}</p>
                    </div>
                    <Badge
                      variant="outline"
                      className={
                        item.retentionImpact === 'critical'
                          ? 'text-red-500 border-red-500/30'
                          : item.retentionImpact === 'high'
                          ? 'text-amber-500 border-amber-500/30'
                          : 'text-muted-foreground'
                      }
                    >
                      {item.retentionImpact}
                    </Badge>
                  </div>
                ))}
              </div>
              <p className="text-sm text-primary font-medium mt-4">
                {USER_LOCKIN_MOAT.result}
              </p>
            </CardContent>
          </Card>

          {/* Partner Relationships */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Handshake className="w-5 h-5 text-primary" />
                {PARTNER_MOAT.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                {PARTNER_MOAT.description}
              </p>
              <div className="space-y-3 mb-4">
                {PARTNER_MOAT.advantages.map((adv, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">{adv.title}</p>
                      <p className="text-xs text-muted-foreground">{adv.description}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
                <p className="text-xs font-medium mb-2">Partners prefer ZIVO because:</p>
                <div className="flex flex-wrap gap-2">
                  {PARTNER_MOAT.partnerValue.map((pv, i) => (
                    <Badge key={i} variant="outline" className="text-xs">
                      {pv.reason}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Trust & Compliance */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                {TRUST_MOAT.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                {TRUST_MOAT.description}
              </p>
              <div className="grid grid-cols-2 gap-3">
                {TRUST_MOAT.pillars.map((pillar, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20"
                  >
                    <p className="text-sm font-medium text-emerald-600">{pillar.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {pillar.description}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Tech & Process */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code2 className="w-5 h-5 text-primary" />
                {TECH_MOAT.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                {TECH_MOAT.description}
              </p>
              <div className="space-y-2">
                {TECH_MOAT.advantages.map((adv, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2 p-2 rounded-lg bg-muted/30"
                  >
                    <CheckCircle2 className="w-4 h-4 text-primary mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">{adv.title}</p>
                      <p className="text-xs text-muted-foreground">{adv.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* AI Foundation */}
        <Card className="border-border/50 bg-gradient-to-br from-primary/5 to-transparent">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-primary" />
              {AI_MOAT.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-6">
              {AI_MOAT.description}
            </p>
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              {AI_MOAT.capabilities.map((cap, i) => (
                <div
                  key={i}
                  className="p-4 rounded-lg bg-card border border-border/50 hover:border-primary/20 hover:shadow-sm transition-all duration-200"
                >
                  <p className="font-medium mb-1">{cap.title}</p>
                  <p className="text-sm text-muted-foreground">{cap.description}</p>
                </div>
              ))}
            </div>
            <div className="p-4 rounded-lg bg-muted/30">
              <p className="text-sm font-medium mb-2">Future AI Applications</p>
              <div className="flex flex-wrap gap-2">
                {AI_MOAT.futureApplications.map((app, i) => (
                  <Badge key={i} variant="outline">
                    {app}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <footer className="pt-8 border-t border-border/50 text-center">
          <p className="text-xs text-muted-foreground">
            Competitive analysis for authorized parties only.
            <br />
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </footer>
      </main>
    </div>
  );
}
