/**
 * ZIVO Mobile Account Screen
 * Streamlined account settings and profile
 */
import { useNavigate, Navigate, Link } from "react-router-dom";
import { 
  ArrowLeft, User, Users, Mail, Bell, CreditCard, Gift, 
  HelpCircle, FileText, Shield, ChevronRight, LogOut, 
  Settings, Star, ExternalLink, Crown, Tag
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import { useMembership } from "@/hooks/useMembership";
import { ZivoPlusBadge } from "@/components/premium/ZivoPlusBadge";
import ZivoMobileNav from "@/components/app/ZivoMobileNav";
import { cn } from "@/lib/utils";

interface MenuItem {
  icon: typeof User;
  label: string;
  path: string;
  badge?: string;
  external?: boolean;
}

export default function MobileAccount() {
  const navigate = useNavigate();
  const { user, isLoading: authLoading, signOut } = useAuth();
  const { isActive: isMember } = useMembership();

  // Redirect to login if not authenticated
  if (!authLoading && !user) {
    return <Navigate to="/login" replace />;
  }

  const userInitials = user?.user_metadata?.full_name
    ?.split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U';

  const accountItems: MenuItem[] = [
    { icon: Crown, label: isMember ? "ZIVO+ Member" : "Join ZIVO+", path: "/account/membership" },
    { icon: Tag, label: "My Promos", path: "/account/promos" },
    { icon: Bell, label: "Push Notifications", path: "/account/notifications" },
    { icon: Users, label: "Saved Travelers", path: "/profile#travelers" },
    { icon: Mail, label: "Email Preferences", path: "/profile#notifications" },
    { icon: CreditCard, label: "Payment Methods", path: "/profile#payment" },
    { icon: Gift, label: "ZIVO Rewards", path: "/wallet", badge: "New" },
  ];

  const supportItems: MenuItem[] = [
    { icon: HelpCircle, label: "Support & Help", path: "/support" },
    { icon: FileText, label: "Terms of Service", path: "/terms-of-service" },
    { icon: Shield, label: "Privacy Policy", path: "/privacy-policy" },
    { icon: FileText, label: "Partner Disclosure", path: "/partner-disclosure" },
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const MenuItem = ({ item }: { item: MenuItem }) => {
    const isMembershipItem = item.path === "/account/membership";
    const shouldHighlight = isMembershipItem && isMember;
    
    return (
      <button
        onClick={() => {
          if (item.external) {
            window.open(item.path, '_blank');
          } else {
            navigate(item.path);
          }
        }}
        className={cn(
          "flex items-center justify-between w-full py-3 px-1 rounded-lg transition-colors touch-manipulation",
          shouldHighlight 
            ? "bg-amber-500/10 hover:bg-amber-500/15" 
            : "hover:bg-muted/50"
        )}
      >
        <div className="flex items-center gap-3">
          <item.icon className={cn(
            "w-5 h-5",
            shouldHighlight ? "text-amber-500" : "text-muted-foreground"
          )} />
          <span className={cn(
            "text-sm font-medium",
            shouldHighlight && "text-amber-500"
          )}>
            {item.label}
          </span>
          {item.badge && (
            <Badge variant="default" className="h-5 px-1.5 text-xs">
              {item.badge}
            </Badge>
          )}
          {shouldHighlight && (
            <ZivoPlusBadge variant="small" className="w-4 h-4" />
          )}
        </div>
        {item.external ? (
          <ExternalLink className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronRight className={cn(
            "w-4 h-4",
            shouldHighlight ? "text-amber-500" : "text-muted-foreground"
          )} />
        )}
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b">
        <div className="flex items-center gap-3 px-4 py-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 rounded-full hover:bg-muted touch-manipulation active:scale-95"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-semibold">Account</h1>
        </div>
      </div>

      {/* Profile Card */}
      <div className="px-4 py-4">
        <Card 
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => navigate("/profile")}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <Avatar className="w-16 h-16 border-2 border-primary/20">
                <AvatarImage src={user?.user_metadata?.avatar_url} />
                <AvatarFallback className="bg-primary/10 text-primary text-lg font-bold">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <h2 className="font-semibold text-lg truncate">
                  {user?.user_metadata?.full_name || 'ZIVO User'}
                </h2>
                <p className="text-sm text-muted-foreground truncate">
                  {user?.email}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                  <span className="text-sm font-medium">Gold Member</span>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Account Settings */}
      <div className="px-4">
        <h3 className="text-sm font-medium text-muted-foreground mb-2 px-1">
          Account Settings
        </h3>
        <Card>
          <CardContent className="p-2">
            {accountItems.map((item, i) => (
              <div key={item.path}>
                <MenuItem item={item} />
                {i < accountItems.length - 1 && <Separator className="my-1" />}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Support & Legal */}
      <div className="px-4 mt-6">
        <h3 className="text-sm font-medium text-muted-foreground mb-2 px-1">
          Support & Legal
        </h3>
        <Card>
          <CardContent className="p-2">
            {supportItems.map((item, i) => (
              <div key={item.path}>
                <MenuItem item={item} />
                {i < supportItems.length - 1 && <Separator className="my-1" />}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Log Out */}
      <div className="px-4 mt-6">
        <Button
          variant="outline"
          className="w-full h-12 text-destructive hover:text-destructive hover:bg-destructive/5"
          onClick={handleSignOut}
        >
          <LogOut className="w-5 h-5 mr-2" />
          Log Out
        </Button>
      </div>

      {/* App Version */}
      <div className="px-4 mt-6 pb-4">
        <p className="text-center text-xs text-muted-foreground">
          ZIVO v1.0.0 · Made with ❤️ for travelers
        </p>
      </div>

      {/* Bottom Navigation */}
      <ZivoMobileNav />
    </div>
  );
}
