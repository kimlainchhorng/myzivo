import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  MapPin, 
  Car, 
  Utensils,
  CreditCard,
  Star,
  Shield,
  Activity,
  Clock,
  TrendingUp,
  Ban,
  CheckCircle,
  History,
  Plane,
  Hotel
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import type { Profile } from "@/hooks/useProfiles";

interface AdminEnhancedUserProfileProps {
  user: Profile | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userRoles?: string[];
  onSuspend?: () => void;
  onActivate?: () => void;
}

// User activity and stats will be loaded from real database queries
const emptyBookings: { id: string; type: string; title: string; date: Date; amount: number; status: string }[] = [];

const defaultStats = {
  totalRides: 0,
  totalOrders: 0,
  totalSpent: 0,
  avgRating: 0,
  memberSince: "—",
  lastActive: "—",
  preferredPayment: "—",
  favoriteRestaurant: "—",
};

const bookingIcons: Record<string, React.ElementType> = {
  ride: Car,
  food: Utensils,
  hotel: Hotel,
  flight: Plane,
};

const bookingColors: Record<string, string> = {
  ride: "text-primary bg-primary/10",
  food: "text-eats bg-eats/10",
  hotel: "text-amber-500 bg-amber-500/10",
  flight: "text-sky-500 bg-sky-500/10",
};

const AdminEnhancedUserProfile = ({ 
  user, 
  open, 
  onOpenChange, 
  userRoles = [],
  onSuspend,
  onActivate
}: AdminEnhancedUserProfileProps) => {
  if (!user) return null;

  const isActive = user.status === "active";
  const isSuspended = user.status === "suspended";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl border-0 bg-card/95 backdrop-blur-xl p-0 overflow-hidden">
        {/* Header Banner */}
        <div className="relative h-24 bg-gradient-to-r from-primary/20 via-teal-500/20 to-blue-500/20">
          <div className="absolute -bottom-10 left-6">
            <Avatar className="h-20 w-20 border-4 border-background shadow-lg">
              <AvatarImage src={user.avatar_url || undefined} />
              <AvatarFallback className="text-xl bg-gradient-to-br from-primary/20 to-blue-500/20">
                {user.full_name?.split(" ").map(n => n[0]).join("") || "U"}
              </AvatarFallback>
            </Avatar>
          </div>
          
          {/* Status Badge */}
          <div className="absolute top-4 right-4">
            <Badge className={cn(
              "gap-1",
              isActive && "bg-green-500/10 text-green-500 border-green-500/20",
              isSuspended && "bg-red-500/10 text-red-500 border-red-500/20",
              !isActive && !isSuspended && "bg-slate-500/10 text-slate-500 border-slate-500/20"
            )}>
              {isActive ? <CheckCircle className="h-3 w-3" /> : <Ban className="h-3 w-3" />}
              {user.status || "Unknown"}
            </Badge>
          </div>
        </div>
        
        <div className="pt-12 px-6 pb-6">
          {/* User Info */}
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold">{user.full_name || "Unnamed User"}</h2>
              <p className="text-muted-foreground flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5" />
                {user.email || "No email"}
              </p>
              <div className="flex gap-1 mt-2">
                {userRoles.map(role => (
                  <Badge 
                    key={role} 
                    variant="outline" 
                    className={cn(
                      "text-xs",
                      role === "admin" && "bg-amber-500/10 text-amber-500 border-amber-500/20",
                      role === "moderator" && "bg-blue-500/10 text-blue-500 border-blue-500/20"
                    )}
                  >
                    {role}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              {isActive ? (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={onSuspend}
                  className="gap-1.5 text-destructive hover:text-destructive"
                >
                  <Ban className="h-4 w-4" />
                  Suspend
                </Button>
              ) : (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={onActivate}
                  className="gap-1.5 text-green-600 hover:text-green-600"
                >
                  <CheckCircle className="h-4 w-4" />
                  Activate
                </Button>
              )}
            </div>
          </div>
          
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="w-full grid grid-cols-3 bg-muted/30">
              <TabsTrigger value="overview" className="gap-1.5">
                <User className="h-4 w-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="activity" className="gap-1.5">
                <Activity className="h-4 w-4" />
                Activity
              </TabsTrigger>
              <TabsTrigger value="history" className="gap-1.5">
                <History className="h-4 w-4" />
                Bookings
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="mt-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-muted/30">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <Phone className="h-3.5 w-3.5" />
                    <span className="text-xs">Phone</span>
                  </div>
                  <p className="font-medium">{user.phone || "Not provided"}</p>
                </div>
                <div className="p-3 rounded-xl bg-muted/30">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <Calendar className="h-3.5 w-3.5" />
                    <span className="text-xs">Member Since</span>
                  </div>
                  <p className="font-medium">{format(new Date(user.created_at), "MMM d, yyyy")}</p>
                </div>
                <div className="p-3 rounded-xl bg-muted/30">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <CreditCard className="h-3.5 w-3.5" />
                    <span className="text-xs">Payment Method</span>
                  </div>
                  <p className="font-medium">{defaultStats.preferredPayment}</p>
                </div>
                <div className="p-3 rounded-xl bg-muted/30">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <Clock className="h-3.5 w-3.5" />
                    <span className="text-xs">Last Active</span>
                  </div>
                  <p className="font-medium">{defaultStats.lastActive}</p>
                </div>
              </div>
              
              {/* Stats Cards */}
              <div className="grid grid-cols-4 gap-3 mt-4">
                <div className="p-3 rounded-xl bg-primary/5 text-center">
                  <Car className="h-5 w-5 mx-auto text-primary mb-1" />
                  <p className="text-lg font-bold">{defaultStats.totalRides}</p>
                  <p className="text-[10px] text-muted-foreground">Rides</p>
                </div>
                <div className="p-3 rounded-xl bg-eats/5 text-center">
                  <Utensils className="h-5 w-5 mx-auto text-eats mb-1" />
                  <p className="text-lg font-bold">{defaultStats.totalOrders}</p>
                  <p className="text-[10px] text-muted-foreground">Orders</p>
                </div>
                <div className="p-3 rounded-xl bg-green-500/5 text-center">
                  <TrendingUp className="h-5 w-5 mx-auto text-green-500 mb-1" />
                  <p className="text-lg font-bold">${defaultStats.totalSpent.toFixed(0)}</p>
                  <p className="text-[10px] text-muted-foreground">Spent</p>
                </div>
                <div className="p-3 rounded-xl bg-amber-500/5 text-center">
                  <Star className="h-5 w-5 mx-auto text-amber-500 mb-1" />
                  <p className="text-lg font-bold">{defaultStats.avgRating}</p>
                  <p className="text-[10px] text-muted-foreground">Rating</p>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="activity" className="mt-4">
              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-muted/30">
                  <p className="text-sm font-medium mb-2">Engagement Score</p>
                  <div className="flex items-center gap-3">
                    <Progress value={78} className="flex-1 h-2" />
                    <span className="text-sm font-semibold text-primary">78%</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Based on booking frequency and ratings</p>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-muted/30">
                    <p className="text-xs text-muted-foreground mb-1">This Month</p>
                    <p className="text-lg font-bold">12 bookings</p>
                    <p className="text-xs text-green-500">↑ 25% vs last month</p>
                  </div>
                  <div className="p-3 rounded-xl bg-muted/30">
                    <p className="text-xs text-muted-foreground mb-1">Avg. Order Value</p>
                    <p className="text-lg font-bold">$32.50</p>
                    <p className="text-xs text-green-500">↑ 8% vs average</p>
                  </div>
                </div>
                
                <div className="p-3 rounded-xl bg-muted/30">
                  <p className="text-sm font-medium mb-2">Favorite Services</p>
                  <div className="flex gap-2">
                    <Badge variant="outline" className="bg-primary/10 text-primary">Rides (47)</Badge>
                    <Badge variant="outline" className="bg-eats/10 text-eats">Food (23)</Badge>
                    <Badge variant="outline" className="bg-amber-500/10 text-amber-500">Hotels (3)</Badge>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="history" className="mt-4">
              <ScrollArea className="h-[220px] pr-4">
                <div className="space-y-2">
                  {emptyBookings.map((booking) => {
                    const Icon = bookingIcons[booking.type];
                    const colorClass = bookingColors[booking.type];
                    
                    return (
                      <div 
                        key={booking.id}
                        className="flex items-center gap-3 p-3 rounded-xl bg-muted/20 hover:bg-muted/30 transition-colors"
                      >
                        <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center", colorClass)}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{booking.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {format(booking.date, "MMM d, yyyy")}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-sm">${booking.amount.toFixed(2)}</p>
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 bg-green-500/10 text-green-500 border-green-500/20">
                            {booking.status}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AdminEnhancedUserProfile;
