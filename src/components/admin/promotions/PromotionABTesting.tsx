import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  FlaskConical, 
  Plus, 
  Play, 
  Pause, 
  Trophy, 
  TrendingUp, 
  Users,
  BarChart3,
  CheckCircle,
  Clock,
  Percent
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ABTest {
  id: string;
  name: string;
  status: "draft" | "running" | "completed" | "paused";
  variantA: { code: string; discount: number; conversions: number; impressions: number };
  variantB: { code: string; discount: number; conversions: number; impressions: number };
  winner: "A" | "B" | null;
  startDate: Date | null;
  endDate: Date | null;
  trafficSplit: number;
}

const PromotionABTesting = () => {
  const [tests, setTests] = useState<ABTest[]>([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newTest, setNewTest] = useState({
    name: "",
    variantACode: "",
    variantADiscount: 10,
    variantBCode: "",
    variantBDiscount: 15,
    trafficSplit: 50,
  });

  const getConversionRate = (conversions: number, impressions: number) => {
    return impressions > 0 ? ((conversions / impressions) * 100).toFixed(1) : "0";
  };

  const getStatusColor = (status: ABTest["status"]) => {
    switch (status) {
      case "running": return "bg-green-500/10 text-green-500";
      case "completed": return "bg-blue-500/10 text-blue-500";
      case "paused": return "bg-amber-500/10 text-amber-500";
      default: return "bg-slate-500/10 text-slate-500";
    }
  };

  const handleCreateTest = () => {
    const test: ABTest = {
      id: Date.now().toString(),
      name: newTest.name,
      status: "draft",
      variantA: { code: newTest.variantACode, discount: newTest.variantADiscount, conversions: 0, impressions: 0 },
      variantB: { code: newTest.variantBCode, discount: newTest.variantBDiscount, conversions: 0, impressions: 0 },
      winner: null,
      startDate: null,
      endDate: null,
      trafficSplit: newTest.trafficSplit,
    };
    setTests([test, ...tests]);
    setIsCreateOpen(false);
    setNewTest({ name: "", variantACode: "", variantADiscount: 10, variantBCode: "", variantBDiscount: 15, trafficSplit: 50 });
  };

  const runningTests = tests.filter(t => t.status === "running").length;
  const completedTests = tests.filter(t => t.status === "completed").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/10">
            <FlaskConical className="h-5 w-5 text-purple-500" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">A/B Testing</h2>
            <p className="text-sm text-muted-foreground">Compare promotion performance</p>
          </div>
        </div>
        <Button onClick={() => setIsCreateOpen(true)} size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          New Test
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-muted/30 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-green-500/10">
            <Play className="h-4 w-4 text-green-500" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Running</p>
            <p className="text-xl font-bold">{runningTests}</p>
          </div>
        </div>
        <div className="p-4 rounded-xl bg-muted/30 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-500/10">
            <CheckCircle className="h-4 w-4 text-blue-500" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Completed</p>
            <p className="text-xl font-bold">{completedTests}</p>
          </div>
        </div>
        <div className="p-4 rounded-xl bg-muted/30 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-purple-500/10">
            <BarChart3 className="h-4 w-4 text-purple-500" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Tests</p>
            <p className="text-xl font-bold">{tests.length}</p>
          </div>
        </div>
      </div>

      {/* Tests List */}
      <div className="space-y-4">
        {tests.map((test) => {
          const convRateA = parseFloat(getConversionRate(test.variantA.conversions, test.variantA.impressions));
          const convRateB = parseFloat(getConversionRate(test.variantB.conversions, test.variantB.impressions));
          const leadingVariant = convRateA > convRateB ? "A" : convRateB > convRateA ? "B" : null;
          
          return (
            <Card key={test.id} className="border-0 bg-card/50 backdrop-blur-xl">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{test.name}</h3>
                      <Badge className={cn("text-xs", getStatusColor(test.status))}>
                        {test.status === "running" && <Play className="h-3 w-3 mr-1" />}
                        {test.status === "paused" && <Pause className="h-3 w-3 mr-1" />}
                        {test.status === "completed" && <CheckCircle className="h-3 w-3 mr-1" />}
                        {test.status.charAt(0).toUpperCase() + test.status.slice(1)}
                      </Badge>
                      {test.winner && (
                        <Badge className="bg-amber-500/10 text-amber-500 text-xs gap-1">
                          <Trophy className="h-3 w-3" />
                          Variant {test.winner} Won
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Traffic split: {test.trafficSplit}% / {100 - test.trafficSplit}%
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {test.status === "running" && (
                      <Button variant="outline" size="sm">
                        <Pause className="h-4 w-4 mr-1" />
                        Pause
                      </Button>
                    )}
                    {test.status === "paused" && (
                      <Button variant="outline" size="sm">
                        <Play className="h-4 w-4 mr-1" />
                        Resume
                      </Button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Variant A */}
                  <div className={cn(
                    "p-4 rounded-xl border-2 transition-colors",
                    leadingVariant === "A" ? "border-green-500/50 bg-green-500/5" : "border-border/50"
                  )}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">Variant A</span>
                        {leadingVariant === "A" && <TrendingUp className="h-4 w-4 text-green-500" />}
                      </div>
                      <code className="px-2 py-0.5 rounded bg-muted text-sm">{test.variantA.code}</code>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground flex items-center gap-1">
                          <Percent className="h-3 w-3" />
                          Discount
                        </span>
                        <span className="font-medium">{test.variantA.discount}%</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          Impressions
                        </span>
                        <span className="font-medium">{test.variantA.impressions.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Conversions</span>
                        <span className="font-medium">{test.variantA.conversions.toLocaleString()}</span>
                      </div>
                      <div className="pt-2 border-t border-border/50">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Conversion Rate</span>
                          <span className={cn(
                            "text-lg font-bold",
                            leadingVariant === "A" ? "text-green-500" : "text-foreground"
                          )}>
                            {convRateA}%
                          </span>
                        </div>
                        <Progress value={convRateA * 3} className="h-1.5 mt-2" />
                      </div>
                    </div>
                  </div>

                  {/* Variant B */}
                  <div className={cn(
                    "p-4 rounded-xl border-2 transition-colors",
                    leadingVariant === "B" ? "border-green-500/50 bg-green-500/5" : "border-border/50"
                  )}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">Variant B</span>
                        {leadingVariant === "B" && <TrendingUp className="h-4 w-4 text-green-500" />}
                      </div>
                      <code className="px-2 py-0.5 rounded bg-muted text-sm">{test.variantB.code}</code>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground flex items-center gap-1">
                          <Percent className="h-3 w-3" />
                          Discount
                        </span>
                        <span className="font-medium">{test.variantB.discount}%</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          Impressions
                        </span>
                        <span className="font-medium">{test.variantB.impressions.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Conversions</span>
                        <span className="font-medium">{test.variantB.conversions.toLocaleString()}</span>
                      </div>
                      <div className="pt-2 border-t border-border/50">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Conversion Rate</span>
                          <span className={cn(
                            "text-lg font-bold",
                            leadingVariant === "B" ? "text-green-500" : "text-foreground"
                          )}>
                            {convRateB}%
                          </span>
                        </div>
                        <Progress value={convRateB * 3} className="h-1.5 mt-2" />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Create Test Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="border-0 bg-card/95 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FlaskConical className="h-5 w-5 text-primary" />
              Create A/B Test
            </DialogTitle>
            <DialogDescription>Set up a new promotion comparison test</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Test Name</Label>
              <Input 
                placeholder="e.g., Summer Discount Test"
                value={newTest.name}
                onChange={(e) => setNewTest({ ...newTest, name: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3 p-3 rounded-lg bg-muted/30">
                <Label>Variant A</Label>
                <Input 
                  placeholder="Promo code"
                  value={newTest.variantACode}
                  onChange={(e) => setNewTest({ ...newTest, variantACode: e.target.value })}
                />
                <div className="flex items-center gap-2">
                  <Input 
                    type="number"
                    value={newTest.variantADiscount}
                    onChange={(e) => setNewTest({ ...newTest, variantADiscount: parseInt(e.target.value) || 0 })}
                    className="w-20"
                  />
                  <span className="text-sm text-muted-foreground">% off</span>
                </div>
              </div>
              <div className="space-y-3 p-3 rounded-lg bg-muted/30">
                <Label>Variant B</Label>
                <Input 
                  placeholder="Promo code"
                  value={newTest.variantBCode}
                  onChange={(e) => setNewTest({ ...newTest, variantBCode: e.target.value })}
                />
                <div className="flex items-center gap-2">
                  <Input 
                    type="number"
                    value={newTest.variantBDiscount}
                    onChange={(e) => setNewTest({ ...newTest, variantBDiscount: parseInt(e.target.value) || 0 })}
                    className="w-20"
                  />
                  <span className="text-sm text-muted-foreground">% off</span>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Traffic Split ({newTest.trafficSplit}% / {100 - newTest.trafficSplit}%)</Label>
              <Input 
                type="range"
                min="10"
                max="90"
                value={newTest.trafficSplit}
                onChange={(e) => setNewTest({ ...newTest, trafficSplit: parseInt(e.target.value) })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateTest} disabled={!newTest.name || !newTest.variantACode || !newTest.variantBCode}>
              Create Test
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PromotionABTesting;
