import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  User, MapPin, ShoppingCart, Star, Clock, ArrowRight, 
  Smartphone, CreditCard, MessageSquare, Gift
} from "lucide-react";
import { Progress } from "@/components/ui/progress";

const journeySteps = [
  { step: "Discovery", users: 15000, dropoff: 0, icon: Smartphone, color: "bg-blue-500" },
  { step: "App Install", users: 12000, dropoff: 20, icon: Smartphone, color: "bg-cyan-500" },
  { step: "Registration", users: 10500, dropoff: 12.5, icon: User, color: "bg-teal-500" },
  { step: "First Search", users: 9200, dropoff: 12.4, icon: MapPin, color: "bg-green-500" },
  { step: "First Booking", users: 7500, dropoff: 18.5, icon: ShoppingCart, color: "bg-emerald-500" },
  { step: "Payment", users: 7200, dropoff: 4, icon: CreditCard, color: "bg-primary" },
  { step: "Completion", users: 6800, dropoff: 5.6, icon: Star, color: "bg-amber-500" },
  { step: "Review", users: 4200, dropoff: 38.2, icon: MessageSquare, color: "bg-orange-500" },
  { step: "Repeat User", users: 3500, dropoff: 16.7, icon: Gift, color: "bg-rose-500" },
];

const touchpoints = [
  { channel: "Mobile App", sessions: 45000, conversions: 3200, rate: 7.1 },
  { channel: "Web", sessions: 28000, conversions: 1800, rate: 6.4 },
  { channel: "Email", sessions: 12000, conversions: 960, rate: 8.0 },
  { channel: "Push Notification", sessions: 8500, conversions: 680, rate: 8.0 },
  { channel: "SMS", sessions: 3200, conversions: 288, rate: 9.0 },
];

export default function AdminCustomerJourney() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <MapPin className="h-6 w-6 text-primary" />
          Customer Journey Analytics
        </h2>
        <p className="text-muted-foreground">Track user progression through the conversion funnel</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Conversion Funnel</CardTitle>
          <CardDescription>User journey from discovery to repeat purchase</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {journeySteps.map((step, i) => (
              <div key={step.step} className="flex items-center gap-4">
                <div className={`p-2 rounded-lg ${step.color}/10`}>
                  <step.icon className={`h-5 w-5 ${step.color.replace('bg-', 'text-')}`} />
                </div>
                <div className="w-32">
                  <p className="font-medium text-sm">{step.step}</p>
                  <p className="text-xs text-muted-foreground">{step.users.toLocaleString()} users</p>
                </div>
                <div className="flex-1">
                  <Progress value={(step.users / journeySteps[0].users) * 100} className="h-3" />
                </div>
                <div className="w-20 text-right">
                  {step.dropoff > 0 && (
                    <Badge variant="outline" className="text-red-500">
                      -{step.dropoff}%
                    </Badge>
                  )}
                </div>
                {i < journeySteps.length - 1 && (
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Touchpoint Performance</CardTitle>
          <CardDescription>Conversion rates by channel</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {touchpoints.map((tp) => (
              <div key={tp.channel} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                <span className="font-medium">{tp.channel}</span>
                <div className="flex items-center gap-6 text-sm">
                  <span className="text-muted-foreground">{tp.sessions.toLocaleString()} sessions</span>
                  <span className="text-green-500">{tp.conversions.toLocaleString()} conversions</span>
                  <Badge className="bg-primary/10 text-primary">{tp.rate}% CVR</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
