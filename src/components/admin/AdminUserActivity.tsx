import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Users,
  UserPlus,
  UserCheck,
  LogIn,
  ShoppingCart,
  Car,
  Plane,
  Building2,
  CreditCard,
  Star
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

interface UserActivityItem {
  id: string;
  type: "signup" | "login" | "booking" | "trip" | "flight" | "hotel" | "payment" | "review";
  user: {
    name: string;
    email: string;
    avatar?: string;
  };
  description: string;
  timestamp: Date;
  metadata?: {
    amount?: number;
    rating?: number;
  };
}

const mockActivities: UserActivityItem[] = [
  {
    id: "1",
    type: "signup",
    user: { name: "Alex Johnson", email: "alex@example.com" },
    description: "Created a new account",
    timestamp: new Date(Date.now() - 2 * 60 * 1000),
  },
  {
    id: "2",
    type: "booking",
    user: { name: "Sarah Miller", email: "sarah@example.com" },
    description: "Booked a Premium ride",
    timestamp: new Date(Date.now() - 5 * 60 * 1000),
    metadata: { amount: 45.50 },
  },
  {
    id: "3",
    type: "flight",
    user: { name: "Michael Brown", email: "michael@example.com" },
    description: "Booked flight NYC → LAX",
    timestamp: new Date(Date.now() - 12 * 60 * 1000),
    metadata: { amount: 299.00 },
  },
  {
    id: "4",
    type: "review",
    user: { name: "Emily Davis", email: "emily@example.com" },
    description: "Left a 5-star review",
    timestamp: new Date(Date.now() - 18 * 60 * 1000),
    metadata: { rating: 5 },
  },
  {
    id: "5",
    type: "hotel",
    user: { name: "David Wilson", email: "david@example.com" },
    description: "Checked into Grand Hotel",
    timestamp: new Date(Date.now() - 25 * 60 * 1000),
    metadata: { amount: 189.00 },
  },
  {
    id: "6",
    type: "login",
    user: { name: "Lisa Anderson", email: "lisa@example.com" },
    description: "Signed in from mobile",
    timestamp: new Date(Date.now() - 32 * 60 * 1000),
  },
  {
    id: "7",
    type: "payment",
    user: { name: "James Taylor", email: "james@example.com" },
    description: "Added new payment method",
    timestamp: new Date(Date.now() - 45 * 60 * 1000),
  },
  {
    id: "8",
    type: "trip",
    user: { name: "Jennifer Lee", email: "jennifer@example.com" },
    description: "Completed trip to Airport",
    timestamp: new Date(Date.now() - 55 * 60 * 1000),
    metadata: { amount: 38.75 },
  },
];

const activityConfig = {
  signup: {
    icon: UserPlus,
    color: "text-green-500",
    bg: "bg-green-500/10",
    label: "New User",
  },
  login: {
    icon: LogIn,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    label: "Login",
  },
  booking: {
    icon: Car,
    color: "text-primary",
    bg: "bg-primary/10",
    label: "Ride",
  },
  trip: {
    icon: UserCheck,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    label: "Trip",
  },
  flight: {
    icon: Plane,
    color: "text-sky-500",
    bg: "bg-sky-500/10",
    label: "Flight",
  },
  hotel: {
    icon: Building2,
    color: "text-amber-500",
    bg: "bg-amber-500/10",
    label: "Hotel",
  },
  payment: {
    icon: CreditCard,
    color: "text-violet-500",
    bg: "bg-violet-500/10",
    label: "Payment",
  },
  review: {
    icon: Star,
    color: "text-yellow-500",
    bg: "bg-yellow-500/10",
    label: "Review",
  },
};

const AdminUserActivity = () => {
  const recentSignups = mockActivities.filter(a => a.type === "signup").length;

  return (
    <Card className="border-0 bg-card/50 backdrop-blur-xl">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            User Activity
          </CardTitle>
          <Badge variant="secondary" className="bg-green-500/10 text-green-500">
            +{recentSignups} new users
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <ScrollArea className="h-[380px] pr-3">
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-[23px] top-2 bottom-2 w-px bg-border" />
            
            <div className="space-y-1">
              {mockActivities.map((activity, index) => {
                const config = activityConfig[activity.type];
                const Icon = config.icon;
                
                return (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="relative flex gap-3 py-2 group"
                  >
                    {/* Timeline Node */}
                    <div className={cn(
                      "relative z-10 p-2 rounded-full shrink-0 transition-transform group-hover:scale-110",
                      config.bg
                    )}>
                      <Icon className={cn("h-3.5 w-3.5", config.color)} />
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0 pt-0.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Avatar className="h-5 w-5">
                          <AvatarImage src={activity.user.avatar} />
                          <AvatarFallback className="text-[10px] bg-muted">
                            {activity.user.name.split(" ").map(n => n[0]).join("")}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium text-sm truncate">
                          {activity.user.name}
                        </span>
                        <Badge variant="outline" className={cn("text-[10px] h-5 px-1.5", config.bg, config.color)}>
                          {config.label}
                        </Badge>
                      </div>
                      
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {activity.description}
                        {activity.metadata?.amount && (
                          <span className="ml-1 text-foreground font-medium">
                            ${activity.metadata.amount.toFixed(2)}
                          </span>
                        )}
                        {activity.metadata?.rating && (
                          <span className="ml-1 text-yellow-500">
                            {"★".repeat(activity.metadata.rating)}
                          </span>
                        )}
                      </p>
                      
                      <span className="text-[10px] text-muted-foreground/70">
                        {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default AdminUserActivity;
