import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  UserPlus, TrendingUp, DollarSign, Clock, 
  MapPin, Target, BarChart3, Users
} from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, Legend } from "recharts";
import { Progress } from "@/components/ui/progress";

const acquisitionTrend = [
  { month: "Aug", signups: 120, activated: 85, retained: 68 },
  { month: "Sep", signups: 145, activated: 102, retained: 82 },
  { month: "Oct", signups: 168, activated: 118, retained: 95 },
  { month: "Nov", signups: 182, activated: 128, retained: 102 },
  { month: "Dec", signups: 210, activated: 147, retained: 118 },
  { month: "Jan", signups: 235, activated: 165, retained: 132 },
];

const sourceData = [
  { source: "Referral", signups: 450, cost: 4500, cpa: 10 },
  { source: "Facebook Ads", signups: 320, cost: 9600, cpa: 30 },
  { source: "Google Ads", signups: 280, cost: 7000, cpa: 25 },
  { source: "Job Boards", signups: 180, cost: 3600, cpa: 20 },
  { source: "Organic", signups: 150, cost: 0, cpa: 0 },
];

const cityTargets = [
  { city: "New York", target: 200, current: 175, progress: 87.5 },
  { city: "Los Angeles", target: 180, current: 145, progress: 80.6 },
  { city: "Chicago", target: 120, current: 112, progress: 93.3 },
  { city: "Houston", target: 100, current: 78, progress: 78 },
  { city: "Miami", target: 80, current: 82, progress: 102.5 },
];

export default function AdminDriverAcquisition() {
  const totalSignups = 1380;
  const activationRate = 70;
  const avgCPA = 18.50;
  const monthlyTarget = 1500;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <UserPlus className="h-6 w-6 text-primary" />
            Driver Acquisition
          </h2>
          <p className="text-muted-foreground">Track driver recruitment and onboarding</p>
        </div>
        <Button>
          <Target className="h-4 w-4 mr-2" />
          Set Targets
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <UserPlus className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Signups</p>
                <p className="text-2xl font-bold">{totalSignups.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <TrendingUp className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Activation Rate</p>
                <p className="text-2xl font-bold">{activationRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <DollarSign className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg CPA</p>
                <p className="text-2xl font-bold">${avgCPA}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Target className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Target Progress</p>
                <p className="text-2xl font-bold">{((totalSignups / monthlyTarget) * 100).toFixed(0)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Acquisition Funnel</CardTitle>
            <CardDescription>Monthly signup to retention flow</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={acquisitionTrend}>
                <defs>
                  <linearGradient id="signupGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="signups" name="Signups" stroke="hsl(var(--primary))" fill="url(#signupGrad)" strokeWidth={2} />
                <Area type="monotone" dataKey="activated" name="Activated" stroke="hsl(var(--chart-2))" fill="transparent" strokeWidth={2} />
                <Area type="monotone" dataKey="retained" name="Retained" stroke="hsl(var(--chart-3))" fill="transparent" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Acquisition by Source</CardTitle>
            <CardDescription>Signups and cost per channel</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={sourceData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis type="number" className="text-xs" />
                <YAxis dataKey="source" type="category" width={100} className="text-xs" />
                <Tooltip />
                <Bar dataKey="signups" name="Signups" fill="hsl(var(--primary))" radius={4} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>City Targets</CardTitle>
          <CardDescription>Progress toward recruitment goals by city</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {cityTargets.map((city) => (
            <div key={city.city} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{city.city}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground">{city.current} / {city.target}</span>
                  <Badge className={city.progress >= 100 ? "bg-green-500/10 text-green-500" : city.progress >= 80 ? "bg-blue-500/10 text-blue-500" : "bg-amber-500/10 text-amber-500"}>
                    {city.progress.toFixed(0)}%
                  </Badge>
                </div>
              </div>
              <Progress value={Math.min(city.progress, 100)} className="h-2" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
