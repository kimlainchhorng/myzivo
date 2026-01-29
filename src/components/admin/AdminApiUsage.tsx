import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Activity, 
  Zap, 
  Clock,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Server,
  Globe,
  Key
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar } from "recharts";

const usageData = [
  { hour: "00:00", requests: 12500 },
  { hour: "04:00", requests: 8200 },
  { hour: "08:00", requests: 45600 },
  { hour: "12:00", requests: 62000 },
  { hour: "16:00", requests: 58400 },
  { hour: "20:00", requests: 41200 },
  { hour: "23:00", requests: 28900 },
];

const endpointUsage = [
  { endpoint: "/rides", calls: 125000, latency: 45, errors: 0.2 },
  { endpoint: "/orders", calls: 89000, latency: 52, errors: 0.3 },
  { endpoint: "/users", calls: 67000, latency: 38, errors: 0.1 },
  { endpoint: "/payments", calls: 45000, latency: 120, errors: 0.5 },
  { endpoint: "/drivers", calls: 34000, latency: 41, errors: 0.2 },
  { endpoint: "/restaurants", calls: 28000, latency: 55, errors: 0.4 },
];

const apiKeys = [
  { name: "Mobile App (iOS)", key: "pk_live_...x4k2", usage: 78, limit: 100000 },
  { name: "Mobile App (Android)", key: "pk_live_...m8n3", usage: 65, limit: 100000 },
  { name: "Web Dashboard", key: "pk_live_...p2j1", usage: 42, limit: 50000 },
  { name: "Partner API", key: "pk_live_...k9l4", usage: 23, limit: 25000 },
];

const AdminApiUsage = () => {
  const totalRequests = 256800;
  const avgLatency = 48;
  const errorRate = 0.28;
  const uptime = 99.97;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/10">
          <Activity className="h-6 w-6 text-cyan-500" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">API Usage & Analytics</h1>
          <p className="text-muted-foreground">Monitor API performance and usage patterns</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Today's Requests", value: totalRequests.toLocaleString(), icon: Zap, color: "text-blue-500", bg: "bg-blue-500/10" },
          { label: "Avg Latency", value: `${avgLatency}ms`, icon: Clock, color: "text-amber-500", bg: "bg-amber-500/10" },
          { label: "Error Rate", value: `${errorRate}%`, icon: AlertTriangle, color: "text-red-500", bg: "bg-red-500/10" },
          { label: "Uptime", value: `${uptime}%`, icon: CheckCircle, color: "text-green-500", bg: "bg-green-500/10" },
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

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Request Volume Chart */}
        <Card className="border-0 bg-card/50 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-500" />
              Request Volume (24h)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={usageData}>
                  <defs>
                    <linearGradient id="requestGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                  <XAxis dataKey="hour" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                    formatter={(value: number) => [value.toLocaleString(), "Requests"]}
                  />
                  <Area
                    type="monotone"
                    dataKey="requests"
                    stroke="#0ea5e9"
                    fill="url(#requestGradient)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* API Keys */}
        <Card className="border-0 bg-card/50 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Key className="h-5 w-5 text-amber-500" />
              API Key Usage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {apiKeys.map((key) => (
                <div key={key.key} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">{key.name}</p>
                      <p className="text-xs text-muted-foreground font-mono">{key.key}</p>
                    </div>
                    <Badge variant={key.usage > 80 ? "destructive" : key.usage > 60 ? "default" : "secondary"}>
                      {key.usage}%
                    </Badge>
                  </div>
                  <Progress value={key.usage} className="h-2" />
                  <p className="text-xs text-muted-foreground text-right">
                    {Math.round(key.limit * key.usage / 100).toLocaleString()} / {key.limit.toLocaleString()} requests
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Endpoint Performance */}
        <Card className="border-0 bg-card/50 backdrop-blur-xl lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Server className="h-5 w-5 text-violet-500" />
              Endpoint Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/50">
                    <th className="text-left p-3 text-sm font-medium text-muted-foreground">Endpoint</th>
                    <th className="text-right p-3 text-sm font-medium text-muted-foreground">Calls (24h)</th>
                    <th className="text-right p-3 text-sm font-medium text-muted-foreground">Avg Latency</th>
                    <th className="text-right p-3 text-sm font-medium text-muted-foreground">Error Rate</th>
                    <th className="text-right p-3 text-sm font-medium text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {endpointUsage.map((endpoint) => (
                    <tr key={endpoint.endpoint} className="border-b border-border/30 hover:bg-muted/20">
                      <td className="p-3">
                        <code className="text-sm font-mono text-primary">{endpoint.endpoint}</code>
                      </td>
                      <td className="p-3 text-right font-medium">{endpoint.calls.toLocaleString()}</td>
                      <td className="p-3 text-right">
                        <span className={cn(
                          "font-medium",
                          endpoint.latency < 50 ? "text-green-500" :
                          endpoint.latency < 100 ? "text-amber-500" : "text-red-500"
                        )}>
                          {endpoint.latency}ms
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <span className={cn(
                          "font-medium",
                          endpoint.errors < 0.3 ? "text-green-500" :
                          endpoint.errors < 0.5 ? "text-amber-500" : "text-red-500"
                        )}>
                          {endpoint.errors}%
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <Badge className={cn(
                          endpoint.errors < 0.3 && endpoint.latency < 100
                            ? "bg-green-500/10 text-green-500 border-green-500/20"
                            : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                        )}>
                          {endpoint.errors < 0.3 && endpoint.latency < 100 ? "Healthy" : "Warning"}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminApiUsage;
