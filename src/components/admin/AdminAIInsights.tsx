import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Brain, 
  TrendingUp, 
  TrendingDown,
  Lightbulb,
  AlertTriangle,
  Target,
  Zap,
  ArrowRight,
  Sparkles,
  BarChart3,
  Users,
  DollarSign
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface AIInsight {
  id: string;
  title: string;
  description: string;
  type: "opportunity" | "warning" | "recommendation" | "prediction";
  impact: "high" | "medium" | "low";
  confidence: number;
  metric?: {
    label: string;
    value: string;
    change: number;
  };
  action?: string;
}

const insights: AIInsight[] = [
  {
    id: "1",
    title: "Revenue Surge Predicted",
    description: "Based on historical patterns, expect 35% higher demand this weekend due to local events.",
    type: "prediction",
    impact: "high",
    confidence: 87,
    metric: { label: "Predicted Revenue", value: "$125K", change: 35 },
    action: "Increase driver availability",
  },
  {
    id: "2",
    title: "Driver Shortage Alert",
    description: "Downtown area showing 23% longer wait times. Consider surge incentives for drivers.",
    type: "warning",
    impact: "high",
    confidence: 92,
    metric: { label: "Avg Wait Time", value: "8.2 min", change: 45 },
    action: "Enable surge pricing",
  },
  {
    id: "3",
    title: "Churn Risk Detected",
    description: "142 users haven't ordered in 30+ days. Personalized offers could recover 60%.",
    type: "opportunity",
    impact: "medium",
    confidence: 78,
    metric: { label: "At-Risk Users", value: "142", change: -12 },
    action: "Launch win-back campaign",
  },
  {
    id: "4",
    title: "Optimize Delivery Routes",
    description: "AI routing could reduce delivery times by 12% in South district.",
    type: "recommendation",
    impact: "medium",
    confidence: 85,
    metric: { label: "Time Savings", value: "4.5 min", change: -12 },
    action: "Apply optimization",
  },
  {
    id: "5",
    title: "Peak Hours Expansion",
    description: "Lunch rush extending 30min earlier. Adjust restaurant prep schedules.",
    type: "prediction",
    impact: "low",
    confidence: 73,
    action: "Notify partners",
  },
];

const getTypeIcon = (type: AIInsight["type"]) => {
  switch (type) {
    case "prediction":
      return <Sparkles className="h-5 w-5" />;
    case "warning":
      return <AlertTriangle className="h-5 w-5" />;
    case "opportunity":
      return <Target className="h-5 w-5" />;
    case "recommendation":
      return <Lightbulb className="h-5 w-5" />;
  }
};

const getTypeColor = (type: AIInsight["type"]) => {
  switch (type) {
    case "prediction":
      return "text-violet-500 bg-violet-500/10";
    case "warning":
      return "text-amber-500 bg-amber-500/10";
    case "opportunity":
      return "text-green-500 bg-green-500/10";
    case "recommendation":
      return "text-blue-500 bg-blue-500/10";
  }
};

const getImpactBadge = (impact: AIInsight["impact"]) => {
  switch (impact) {
    case "high":
      return <Badge className="bg-red-500/10 text-red-500 border-red-500/20">High Impact</Badge>;
    case "medium":
      return <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20">Medium Impact</Badge>;
    case "low":
      return <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20">Low Impact</Badge>;
  }
};

const AdminAIInsights = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/10">
            <Brain className="h-6 w-6 text-violet-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">AI-Powered Insights</h1>
            <p className="text-muted-foreground">Intelligent recommendations and predictions</p>
          </div>
        </div>
        <Button variant="outline" className="gap-2">
          <Zap className="h-4 w-4" /> Refresh Analysis
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Active Insights", value: insights.length.toString(), icon: Brain, color: "text-violet-500", bg: "bg-violet-500/10" },
          { label: "High Priority", value: insights.filter(i => i.impact === "high").length.toString(), icon: AlertTriangle, color: "text-red-500", bg: "bg-red-500/10" },
          { label: "Opportunities", value: insights.filter(i => i.type === "opportunity").length.toString(), icon: Target, color: "text-green-500", bg: "bg-green-500/10" },
          { label: "Avg Confidence", value: `${Math.round(insights.reduce((a, b) => a + b.confidence, 0) / insights.length)}%`, icon: BarChart3, color: "text-blue-500", bg: "bg-blue-500/10" },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="border-0 bg-card/50 backdrop-blur-xl">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={cn("p-2 rounded-lg", stat.bg)}>
                    <stat.icon className={cn("h-5 w-5", stat.color)} />
                  </div>
                  <div>
                    <p className="text-xl font-bold">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Insights List */}
      <div className="space-y-4">
        {insights.map((insight, index) => {
          const typeColor = getTypeColor(insight.type);
          
          return (
            <motion.div
              key={insight.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="border-0 bg-card/50 backdrop-blur-xl hover:shadow-lg transition-all">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* Main Content */}
                    <div className="flex-1">
                      <div className="flex items-start gap-4">
                        <div className={cn("p-3 rounded-xl shrink-0", typeColor)}>
                          {getTypeIcon(insight.type)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <h3 className="font-semibold text-lg">{insight.title}</h3>
                            {getImpactBadge(insight.impact)}
                          </div>
                          <p className="text-muted-foreground">{insight.description}</p>
                          
                          {/* Confidence Bar */}
                          <div className="mt-4 flex items-center gap-3">
                            <span className="text-xs text-muted-foreground">Confidence</span>
                            <Progress value={insight.confidence} className="h-2 flex-1 max-w-[200px]" />
                            <span className="text-sm font-medium">{insight.confidence}%</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Metric & Action */}
                    <div className="flex flex-col gap-3 lg:items-end lg:min-w-[200px]">
                      {insight.metric && (
                        <div className="p-4 rounded-xl bg-muted/20 text-right">
                          <div className="flex items-center justify-end gap-2 mb-1">
                            {insight.metric.change >= 0 ? (
                              <TrendingUp className="h-4 w-4 text-green-500" />
                            ) : (
                              <TrendingDown className="h-4 w-4 text-red-500" />
                            )}
                            <span className={cn(
                              "text-sm font-medium",
                              insight.metric.change >= 0 ? "text-green-500" : "text-red-500"
                            )}>
                              {insight.metric.change >= 0 ? "+" : ""}{insight.metric.change}%
                            </span>
                          </div>
                          <p className="text-2xl font-bold">{insight.metric.value}</p>
                          <p className="text-xs text-muted-foreground">{insight.metric.label}</p>
                        </div>
                      )}
                      
                      {insight.action && (
                        <Button className="gap-2 w-full lg:w-auto">
                          {insight.action} <ArrowRight className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default AdminAIInsights;
