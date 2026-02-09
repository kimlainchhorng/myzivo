/**
 * MembershipPage - ZIVO+ Subscription Management
 * Join, manage, and view membership benefits
 */
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Crown,
  Check,
  Truck,
  Percent,
  Headphones,
  Sparkles,
  ArrowLeft,
  Calendar,
  CreditCard,
  AlertCircle,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { 
  useMembership, 
  useMembershipPlans, 
  useCreateMembershipCheckout,
  useCancelMembership,
  useOpenCustomerPortal,
} from "@/hooks/useMembership";
import SEOHead from "@/components/SEOHead";
import NavBar from "@/components/home/NavBar";
import Footer from "@/components/Footer";
import { toast } from "sonner";
import { format } from "date-fns";
import { useMembershipSavings } from "@/hooks/useMembershipSavings";
import { Link } from "react-router-dom";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const benefits = [
  {
    icon: Truck,
    title: "Free Delivery",
    description: "Free delivery on orders $15+",
    highlight: true,
  },
  {
    icon: Percent,
    title: "Reduced Service Fees",
    description: "50% off service fees on every order",
    highlight: true,
  },
  {
    icon: Headphones,
    title: "Priority Support",
    description: "Skip the queue with dedicated support",
  },
  {
    icon: Sparkles,
    title: "Exclusive Deals",
    description: "Member-only promotions and early access",
  },
];

export default function MembershipPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, isLoading: authLoading } = useAuth();
  const [isAnnual, setIsAnnual] = useState(true);

  const { membership, isActive, isPastDue, isLoading: membershipLoading, refetch } = useMembership();
  const { data: plans, isLoading: plansLoading } = useMembershipPlans();
  const { data: savingsData } = useMembershipSavings();
  const createCheckout = useCreateMembershipCheckout();
  const cancelMembership = useCancelMembership();
  const openPortal = useOpenCustomerPortal();

  // Handle success/cancel from Stripe redirect
  useEffect(() => {
    if (searchParams.get("success") === "true") {
      toast.success("Welcome to ZIVO+! 🎉 Your membership is now active.");
      refetch();
    } else if (searchParams.get("cancelled") === "true") {
      toast.info("Checkout cancelled. No charges were made.");
    }
  }, [searchParams, refetch]);

  const plan = plans?.[0]; // Get first (and typically only) plan
  const monthlyPrice = plan?.price_monthly || 9.99;
  const annualPrice = plan?.price_yearly || 79.99;
  const annualSavings = Math.round((monthlyPrice * 12 - annualPrice) / (monthlyPrice * 12) * 100);

  const handleJoin = async () => {
    if (!user) {
      navigate("/login?redirect=/membership");
      return;
    }

    if (!plan) {
      toast.error("No plans available");
      return;
    }

    try {
      const result = await createCheckout.mutateAsync({
        planId: plan.id,
        billingCycle: isAnnual ? "yearly" : "monthly",
      });

      if (result.url) {
        window.location.href = result.url;
      }
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleCancel = async () => {
    try {
      await cancelMembership.mutateAsync();
      refetch();
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleManage = () => {
    openPortal.mutate();
  };

  const isLoading = authLoading || membershipLoading || plansLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <NavBar />
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4 max-w-2xl">
            <Skeleton className="h-48 rounded-2xl mb-6" />
            <Skeleton className="h-96 rounded-2xl" />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        title="ZIVO+ Membership" 
        description="Join ZIVO+ for free delivery, reduced fees, and priority support" 
      />
      <NavBar />
      
      <main className="pt-24 pb-16">
        {/* Back Button */}
        <div className="container mx-auto px-4 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back</span>
          </button>
        </div>

        {/* Hero */}
        <section className="container mx-auto px-4 text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 mb-6">
              <Crown className="w-4 h-4 text-amber-500" />
              <span className="text-sm font-medium text-amber-400">Premium Membership</span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl font-bold mb-3">ZIVO+</h1>
            <p className="text-muted-foreground">
              Free delivery, reduced fees, and exclusive perks
            </p>
          </motion.div>
        </section>

        <div className="container mx-auto px-4 max-w-2xl space-y-8">
          {/* Active Membership Card */}
          {isActive && membership && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="border-amber-500/30 bg-gradient-to-br from-amber-500/10 to-orange-500/10">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                      <Crown className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-xl font-bold">You're a ZIVO+ Member</h2>
                        {membership.cancelled_at && (
                          <Badge variant="secondary" className="text-xs">Cancelling</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {membership.plan?.name || "ZIVO+"}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3 mb-6">
                    {membership.current_period_end && (
                      <div className="flex items-center gap-3 text-sm">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">
                          {membership.cancelled_at ? "Access until" : "Next billing"}:
                        </span>
                        <span className="font-medium">
                          {format(new Date(membership.current_period_end), "MMM d, yyyy")}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={handleManage}
                      disabled={openPortal.isPending}
                    >
                      {openPortal.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <CreditCard className="w-4 h-4 mr-2" />
                          Manage Billing
                        </>
                      )}
                    </Button>

                    {!membership.cancelled_at && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" className="text-red-500 hover:text-red-400 hover:bg-red-500/10">
                            Cancel
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Cancel ZIVO+ Membership?</AlertDialogTitle>
                            <AlertDialogDescription>
                              You'll lose access to free delivery, reduced fees, and priority support at the end of your current billing period.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Keep Membership</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={handleCancel}
                              className="bg-red-500 hover:bg-red-600"
                              disabled={cancelMembership.isPending}
                            >
                              {cancelMembership.isPending ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                "Cancel Membership"
                              )}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Monthly Savings Card - Show for active members with savings */}
          {isActive && savingsData && savingsData.thisMonthCents > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
            >
              <Card className="border-amber-500/20 bg-gradient-to-br from-amber-500/10 to-orange-500/5 overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shrink-0">
                      <Sparkles className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground">Your savings this month</p>
                      <p className="text-2xl font-bold text-amber-400">
                        ${savingsData.thisMonthDollars.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-border/50 flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      {savingsData.orderCount} order{savingsData.orderCount !== 1 ? 's' : ''} with ZIVO+ benefits
                    </span>
                    <Link 
                      to="/eats/orders" 
                      className="text-sm text-amber-500 hover:text-amber-400 font-medium"
                    >
                      View Orders →
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Past Due Warning */}
          {isPastDue && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="border-red-500/30 bg-red-500/10">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <AlertCircle className="w-6 h-6 text-red-500 shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-bold text-red-400 mb-1">Payment Failed</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Your subscription payment failed. Please update your payment method to continue enjoying ZIVO+ benefits.
                      </p>
                      <Button onClick={handleManage} variant="outline" size="sm">
                        <CreditCard className="w-4 h-4 mr-2" />
                        Update Payment
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Join Card (show if not active) */}
          {!isActive && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-orange-500/5">
                <CardContent className="p-8">
                  {/* Toggle */}
                  <div className="flex items-center justify-center gap-4 mb-8">
                    <span className={cn("text-sm font-medium", !isAnnual && "text-foreground", isAnnual && "text-muted-foreground")}>
                      Monthly
                    </span>
                    <Switch checked={isAnnual} onCheckedChange={setIsAnnual} />
                    <span className={cn("text-sm font-medium flex items-center gap-2", isAnnual && "text-foreground", !isAnnual && "text-muted-foreground")}>
                      Annual
                      <Badge className="bg-emerald-500/20 text-emerald-400 text-xs">
                        Save {annualSavings}%
                      </Badge>
                    </span>
                  </div>

                  {/* Price */}
                  <div className="text-center mb-6">
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-5xl font-bold">
                        ${isAnnual ? annualPrice : monthlyPrice}
                      </span>
                      <span className="text-muted-foreground">
                        /{isAnnual ? "year" : "month"}
                      </span>
                    </div>
                    {isAnnual && (
                      <p className="text-sm text-muted-foreground mt-2">
                        That's just ${(annualPrice / 12).toFixed(2)}/month
                      </p>
                    )}
                  </div>

                  {/* CTA */}
                  <Button 
                    onClick={handleJoin}
                    disabled={createCheckout.isPending}
                    className="w-full h-14 text-lg bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 gap-2"
                  >
                    {createCheckout.isPending ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <Crown className="w-5 h-5" />
                        Join ZIVO+
                      </>
                    )}
                  </Button>
                  
                  <p className="text-xs text-muted-foreground text-center mt-4">
                    Cancel anytime. No commitment required.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Benefits Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h2 className="text-xl font-bold mb-4">Member Benefits</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {benefits.map((benefit, index) => (
                <Card key={benefit.title} className={cn(
                  "transition-all",
                  benefit.highlight && "border-amber-500/20 bg-amber-500/5"
                )}>
                  <CardContent className="p-4 flex items-start gap-3">
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                      benefit.highlight 
                        ? "bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30"
                        : "bg-muted"
                    )}>
                      <benefit.icon className={cn(
                        "w-5 h-5",
                        benefit.highlight ? "text-amber-500" : "text-muted-foreground"
                      )} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm">{benefit.title}</h3>
                      <p className="text-xs text-muted-foreground">{benefit.description}</p>
                    </div>
                    {isActive && (
                      <Check className="w-4 h-4 text-emerald-500 shrink-0 ml-auto" />
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>

          {/* Savings Calculator */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardContent className="p-6">
                <h3 className="font-bold mb-4">Example Savings</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>$30.00</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Delivery Fee</span>
                    <div className="flex items-center gap-2">
                      <span className="line-through text-muted-foreground">$3.99</span>
                      <span className="text-emerald-400 font-medium">$0.00</span>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Service Fee</span>
                    <div className="flex items-center gap-2">
                      <span className="line-through text-muted-foreground">$1.50</span>
                      <span className="text-emerald-400 font-medium">$0.75</span>
                    </div>
                  </div>
                  <div className="border-t border-border pt-3 flex justify-between font-bold">
                    <span>You Save</span>
                    <span className="text-amber-500">$4.74</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-4">
                  Order 3x per month and your membership pays for itself!
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
