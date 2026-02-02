/**
 * Owner Dashboard
 * Main dashboard for car owners with stats, quick actions, and activity
 */

import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useCarOwnerProfile, useOwnerStats } from "@/hooks/useCarOwner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ArrowLeft, Car, Plus, Settings, Wallet, Calendar, TrendingUp, 
  AlertCircle, Clock, CheckCircle, Loader2, ArrowRight
} from "lucide-react";
import ZivoLogo from "@/components/ZivoLogo";
import OwnerStatusBadge from "@/components/owner/OwnerStatusBadge";
import OwnerStatsCards from "@/components/owner/OwnerStatsCards";

export default function OwnerDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: profile, isLoading: loadingProfile } = useCarOwnerProfile();
  const { data: stats, isLoading: loadingStats } = useOwnerStats();

  if (loadingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // No profile yet - redirect to apply
  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Car className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <CardTitle>Not a Host Yet?</CardTitle>
            <CardDescription>
              Apply to become a car host and start earning money with your vehicle.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <Button onClick={() => navigate("/owner/apply")}>
              Apply to Become a Host
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button variant="outline" onClick={() => navigate("/list-your-car")}>
              Learn More
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isVerified = profile.status === "verified";
  const isPending = profile.status === "pending";
  const isRejected = profile.status === "rejected";

  const quickActions = [
    {
      label: "Add Vehicle",
      icon: Plus,
      href: "/owner/cars/new",
      disabled: !isVerified,
      disabledReason: "Complete verification to add vehicles",
    },
    {
      label: "My Vehicles",
      icon: Car,
      href: "/owner/cars",
      disabled: !isVerified,
    },
    {
      label: "Earnings",
      icon: Wallet,
      href: "/owner/earnings",
      disabled: !isVerified,
    },
    {
      label: "Bookings",
      icon: Calendar,
      href: "/owner/bookings",
      disabled: !isVerified,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <ZivoLogo size="sm" />
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/owner/profile")}>
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Welcome Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold mb-1">
              Welcome back, {profile.full_name.split(" ")[0]}!
            </h1>
            <div className="flex items-center gap-3">
              <OwnerStatusBadge status={profile.status} />
              {profile.documents_verified && (
                <span className="text-sm text-emerald-600 flex items-center gap-1">
                  <CheckCircle className="h-4 w-4" />
                  Documents Verified
                </span>
              )}
            </div>
          </div>
          
          {isVerified && (
            <Button onClick={() => navigate("/owner/cars/new")}>
              <Plus className="h-4 w-4 mr-2" />
              Add Vehicle
            </Button>
          )}
        </div>

        {/* Status Alerts */}
        {isPending && (
          <Card className="border-amber-500/30 bg-amber-500/5">
            <CardContent className="flex items-start gap-4 py-4">
              <Clock className="h-6 w-6 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-medium text-amber-700">Application Under Review</h3>
                <p className="text-sm text-muted-foreground">
                  Our team is reviewing your application. This usually takes 1-2 business days.
                  You'll receive an email once your account is verified.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {isRejected && (
          <Card className="border-destructive/30 bg-destructive/5">
            <CardContent className="flex items-start gap-4 py-4">
              <AlertCircle className="h-6 w-6 text-destructive shrink-0 mt-0.5" />
              <div>
                <h3 className="font-medium text-destructive">Application Not Approved</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Unfortunately, your application wasn't approved. Please check your documents and reapply.
                </p>
                <Button size="sm" variant="outline" onClick={() => navigate("/owner/profile")}>
                  Review Documents
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Cards */}
        {isVerified && (
          <OwnerStatsCards stats={stats} isLoading={loadingStats} />
        )}

        {/* Quick Actions */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickActions.map((action) => (
              <Card 
                key={action.label} 
                className={`cursor-pointer transition-all ${
                  action.disabled 
                    ? "opacity-50 cursor-not-allowed" 
                    : "hover:shadow-md hover:border-primary/30"
                }`}
                onClick={() => !action.disabled && navigate(action.href)}
              >
                <CardContent className="flex flex-col items-center justify-center py-6">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${
                    action.disabled ? "bg-muted" : "bg-primary/10"
                  }`}>
                    <action.icon className={`h-6 w-6 ${action.disabled ? "text-muted-foreground" : "text-primary"}`} />
                  </div>
                  <span className="font-medium text-sm">{action.label}</span>
                  {action.disabled && action.disabledReason && (
                    <span className="text-xs text-muted-foreground text-center mt-1">
                      {action.disabledReason}
                    </span>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Getting Started (for new verified owners) */}
        {isVerified && stats?.totalVehicles === 0 && (
          <Card className="border-primary/30 bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Get Started
              </CardTitle>
              <CardDescription>
                You're all set! Here's how to start earning with your car.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold shrink-0">
                  1
                </div>
                <div>
                  <h4 className="font-medium">Add your first vehicle</h4>
                  <p className="text-sm text-muted-foreground">
                    Upload photos, set your daily rate, and define availability.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-sm font-bold shrink-0">
                  2
                </div>
                <div>
                  <h4 className="font-medium text-muted-foreground">Wait for approval</h4>
                  <p className="text-sm text-muted-foreground">
                    Our team will review your vehicle listing (usually same day).
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-sm font-bold shrink-0">
                  3
                </div>
                <div>
                  <h4 className="font-medium text-muted-foreground">Start earning</h4>
                  <p className="text-sm text-muted-foreground">
                    Accept bookings and watch the money roll in!
                  </p>
                </div>
              </div>
              
              <Button onClick={() => navigate("/owner/cars/new")} className="w-full mt-4">
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Vehicle
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Recent Activity Placeholder */}
        {isVerified && stats && stats.totalTrips > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your latest bookings and earnings</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground text-center py-8">
                Activity feed coming soon...
              </p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
