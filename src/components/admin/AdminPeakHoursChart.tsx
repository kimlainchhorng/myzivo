import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Clock, 
  TrendingUp,
  Sun,
  Moon,
  Sunrise,
  Sunset
} from "lucide-react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  ReferenceLine
} from "recharts";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const hourlyData = [
  { hour: "12am", rides: 45, food: 20, combined: 65 },
  { hour: "1am", rides: 32, food: 15, combined: 47 },
  { hour: "2am", rides: 28, food: 12, combined: 40 },
  { hour: "3am", rides: 22, food: 8, combined: 30 },
  { hour: "4am", rides: 18, food: 5, combined: 23 },
  { hour: "5am", rides: 25, food: 8, combined: 33 },
  { hour: "6am", rides: 65, food: 35, combined: 100 },
  { hour: "7am", rides: 120, food: 85, combined: 205 },
  { hour: "8am", rides: 180, food: 145, combined: 325 },
  { hour: "9am", rides: 150, food: 95, combined: 245 },
  { hour: "10am", rides: 110, food: 75, combined: 185 },
  { hour: "11am", rides: 135, food: 120, combined: 255 },
  { hour: "12pm", rides: 165, food: 210, combined: 375 },
  { hour: "1pm", rides: 155, food: 185, combined: 340 },
  { hour: "2pm", rides: 125, food: 95, combined: 220 },
  { hour: "3pm", rides: 140, food: 85, combined: 225 },
  { hour: "4pm", rides: 175, food: 105, combined: 280 },
  { hour: "5pm", rides: 220, food: 125, combined: 345 },
  { hour: "6pm", rides: 245, food: 195, combined: 440 },
  { hour: "7pm", rides: 210, food: 235, combined: 445 },
  { hour: "8pm", rides: 185, food: 215, combined: 400 },
  { hour: "9pm", rides: 165, food: 175, combined: 340 },
  { hour: "10pm", rides: 120, food: 95, combined: 215 },
  { hour: "11pm", rides: 75, food: 45, combined: 120 },
];

const peakPeriods = [
  { name: "Morning Rush", time: "7-9 AM", icon: Sunrise, activity: "high", color: "text-amber-500" },
  { name: "Lunch Peak", time: "12-2 PM", icon: Sun, activity: "very high", color: "text-orange-500" },
  { name: "Evening Rush", time: "5-8 PM", icon: Sunset, activity: "highest", color: "text-red-500" },
  { name: "Late Night", time: "10 PM-12 AM", icon: Moon, activity: "moderate", color: "text-blue-500" },
];

const AdminPeakHoursChart = () => {
  const maxCombined = Math.max(...hourlyData.map(d => d.combined));
  const peakHour = hourlyData.find(d => d.combined === maxCombined);

  return (
    <Card className="border-0 bg-card/50 backdrop-blur-xl">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Peak Hours Analysis
          </CardTitle>
          <Badge variant="secondary" className="bg-primary/10 text-primary">
            Peak: {peakHour?.hour}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Chart */}
        <div className="h-[200px] mb-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={hourlyData}>
              <defs>
                <linearGradient id="colorRides" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorFood" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis 
                dataKey="hour" 
                stroke="hsl(var(--muted-foreground))" 
                fontSize={10}
                tickLine={false}
                interval={2}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))" 
                fontSize={10}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{ 
                  backgroundColor: "hsl(var(--card))", 
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  fontSize: "12px"
                }}
              />
              <Area
                type="monotone"
                dataKey="rides"
                stackId="1"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                fill="url(#colorRides)"
                name="Rides"
              />
              <Area
                type="monotone"
                dataKey="food"
                stackId="1"
                stroke="#f59e0b"
                strokeWidth={2}
                fill="url(#colorFood)"
                name="Food Orders"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        
        {/* Peak Periods */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {peakPeriods.map((period, index) => {
            const Icon = period.icon;
            return (
              <motion.div
                key={period.name}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-2.5 rounded-xl bg-muted/30 text-center"
              >
                <Icon className={cn("h-4 w-4 mx-auto mb-1", period.color)} />
                <p className="text-xs font-medium">{period.name}</p>
                <p className="text-[10px] text-muted-foreground">{period.time}</p>
                <Badge variant="outline" className={cn(
                  "text-[10px] h-4 px-1.5 mt-1 capitalize",
                  period.activity === "highest" && "bg-red-500/10 text-red-500",
                  period.activity === "very high" && "bg-orange-500/10 text-orange-500",
                  period.activity === "high" && "bg-amber-500/10 text-amber-500",
                  period.activity === "moderate" && "bg-blue-500/10 text-blue-500"
                )}>
                  {period.activity}
                </Badge>
              </motion.div>
            );
          })}
        </div>
        
        {/* Legend */}
        <div className="flex items-center justify-center gap-6 mt-4 pt-3 border-t border-border/50">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-primary" />
            <span className="text-xs text-muted-foreground">Rides</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-amber-500" />
            <span className="text-xs text-muted-foreground">Food Orders</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminPeakHoursChart;
