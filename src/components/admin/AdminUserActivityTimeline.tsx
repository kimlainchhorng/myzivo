import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Activity, 
  Car, 
  Utensils, 
  CreditCard, 
  MapPin, 
  Star, 
  UserPlus, 
  LogIn,
  Shield,
  MessageSquare,
  Phone
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

interface ActivityItem {
  id: string;
  type: 'ride' | 'order' | 'payment' | 'login' | 'signup' | 'review' | 'support' | 'role_change';
  user: {
    name: string;
    email: string;
    avatar?: string;
  };
  description: string;
  timestamp: Date;
  metadata?: Record<string, string | number>;
}

const activityIcons = {
  ride: { icon: Car, color: "text-primary", bg: "bg-primary/10" },
  order: { icon: Utensils, color: "text-eats", bg: "bg-eats/10" },
  payment: { icon: CreditCard, color: "text-green-500", bg: "bg-green-500/10" },
  login: { icon: LogIn, color: "text-blue-500", bg: "bg-blue-500/10" },
  signup: { icon: UserPlus, color: "text-purple-500", bg: "bg-purple-500/10" },
  review: { icon: Star, color: "text-amber-500", bg: "bg-amber-500/10" },
  support: { icon: MessageSquare, color: "text-cyan-500", bg: "bg-cyan-500/10" },
  role_change: { icon: Shield, color: "text-rose-500", bg: "bg-rose-500/10" },
};

// Activity loaded from database — no hardcoded data
const activities: ActivityItem[] = [];

const AdminUserActivityTimeline = () => {
  return (
    <Card className="border-0 bg-card/50 backdrop-blur-xl h-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Activity className="h-5 w-5 text-primary" />
          Live Activity
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[400px] px-6 pb-6">
          <div className="space-y-1">
            {activities.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Activity className="h-10 w-10 mx-auto mb-3 opacity-50" />
                <p className="text-sm">No recent activity</p>
              </div>
            ) : activities.map((activity, index) => {
              const config = activityIcons[activity.type];
              const Icon = config.icon;
              
              return (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="relative pl-8 pb-4 last:pb-0"
                >
                  {/* Timeline line */}
                  {index < activities.length - 1 && (
                    <div className="absolute left-3 top-8 bottom-0 w-px bg-border/50" />
                  )}
                  
                  {/* Icon */}
                  <div className={cn(
                    "absolute left-0 w-6 h-6 rounded-full flex items-center justify-center",
                    config.bg
                  )}>
                    <Icon className={cn("h-3 w-3", config.color)} />
                  </div>
                  
                  {/* Content */}
                  <div className="group p-3 rounded-xl hover:bg-muted/30 transition-colors -ml-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <Avatar className="h-6 w-6 border border-border/50">
                          <AvatarImage src={activity.user.avatar} />
                          <AvatarFallback className="text-[10px] bg-muted">
                            {activity.user.name.split(" ").map(n => n[0]).join("")}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium text-sm truncate">
                          {activity.user.name}
                        </span>
                      </div>
                      <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                        {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1 ml-8">
                      {activity.description}
                    </p>
                    {activity.metadata && (
                      <div className="flex flex-wrap gap-1.5 mt-2 ml-8">
                        {Object.entries(activity.metadata).map(([key, value]) => (
                          <Badge 
                            key={key} 
                            variant="outline" 
                            className="text-[10px] px-1.5 py-0 h-5 bg-background/50"
                          >
                            {typeof value === 'number' && (key === 'fare' || key === 'total')
                              ? `$${value.toFixed(2)}` 
                              : value}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
          
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default AdminUserActivityTimeline;
