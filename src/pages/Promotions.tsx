import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Gift, Ticket, Users, Star, Copy, Check, Share2, Clock, TrendingUp, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";

const Promotions = () => {
  const { toast } = useToast();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [promoCode, setPromoCode] = useState("");

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast({
      title: "Code copied!",
      description: `${code} has been copied to your clipboard.`,
    });
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const activeCoupons = [
    {
      code: "RIDE10",
      discount: "10% OFF",
      description: "Your next ride",
      expires: "Feb 15, 2026",
      service: "rides",
      minOrder: "$15",
    },
    {
      code: "EATS5",
      discount: "$5 OFF",
      description: "Food orders over $25",
      expires: "Feb 28, 2026",
      service: "eats",
      minOrder: "$25",
    },
    {
      code: "NEWUSER25",
      discount: "25% OFF",
      description: "First booking (any service)",
      expires: "Mar 31, 2026",
      service: "all",
      minOrder: "None",
    },
  ];

  const availableOffers = [
    {
      title: "Weekend Rides Special",
      discount: "15% OFF",
      description: "All rides on weekends",
      validUntil: "Every Sat-Sun",
      code: "WEEKEND15",
    },
    {
      title: "Late Night Eats",
      discount: "Free Delivery",
      description: "Orders after 10 PM",
      validUntil: "Ongoing",
      code: "LATENIGHT",
    },
    {
      title: "Luxury Car Rental",
      discount: "$50 OFF",
      description: "Premium vehicle rentals 3+ days",
      validUntil: "Limited time",
      code: "LUXURY50",
    },
    {
      title: "Hotel + Flight Bundle",
      discount: "20% OFF",
      description: "Book together and save",
      validUntil: "Mar 2026",
      code: "BUNDLE20",
    },
  ];

  const referralStats = {
    code: "ZIVO-JOHN123",
    totalReferrals: 12,
    pendingCredits: 45,
    earnedTotal: 180,
    referrerReward: 15,
    refereeDiscount: 20,
  };

  const loyaltyPoints = {
    current: 2450,
    tier: "Gold",
    nextTier: "Platinum",
    pointsToNext: 550,
    multiplier: 1.5,
  };

  const rewards = [
    { name: "Free Ride (up to $15)", points: 500, available: true },
    { name: "$10 Eats Credit", points: 400, available: true },
    { name: "Car Rental Upgrade", points: 1000, available: true },
    { name: "Airport Lounge Pass", points: 2000, available: true },
    { name: "Free Hotel Night", points: 5000, available: false },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Link to="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-eats flex items-center justify-center">
              <Gift className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-display font-bold text-xl">Promotions & Rewards</h1>
              <p className="text-sm text-muted-foreground">Save more, earn more</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Apply Promo Code */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-3">Have a promo code?</h3>
            <div className="flex gap-3">
              <Input
                placeholder="Enter code (e.g., SAVE20)"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                className="flex-1"
              />
              <Button>Apply</Button>
            </div>
          </CardContent>
        </Card>

        {/* Main Tabs */}
        <Tabs defaultValue="coupons" className="mb-8">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="coupons">
              <Ticket className="h-4 w-4 mr-1 hidden sm:inline" />
              Coupons
            </TabsTrigger>
            <TabsTrigger value="offers">
              <Gift className="h-4 w-4 mr-1 hidden sm:inline" />
              Offers
            </TabsTrigger>
            <TabsTrigger value="referral">
              <Users className="h-4 w-4 mr-1 hidden sm:inline" />
              Referral
            </TabsTrigger>
            <TabsTrigger value="loyalty">
              <Star className="h-4 w-4 mr-1 hidden sm:inline" />
              Loyalty
            </TabsTrigger>
          </TabsList>

          {/* Coupons Tab */}
          <TabsContent value="coupons" className="mt-6">
            <div className="space-y-4">
              <h3 className="font-display font-bold text-lg">Your Active Coupons</h3>
              {activeCoupons.length > 0 ? (
                <div className="grid md:grid-cols-2 gap-4">
                  {activeCoupons.map((coupon) => (
                    <Card key={coupon.code} className="overflow-hidden">
                      <div className={`h-2 ${
                        coupon.service === 'rides' ? 'bg-rides' :
                        coupon.service === 'eats' ? 'bg-eats' : 'bg-primary'
                      }`} />
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <p className="text-2xl font-bold text-primary">{coupon.discount}</p>
                            <p className="text-muted-foreground">{coupon.description}</p>
                          </div>
                          <Badge variant="outline" className="shrink-0">
                            {coupon.service === 'all' ? 'All Services' : coupon.service.toUpperCase()}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="text-sm text-muted-foreground">
                            <p>Min: {coupon.minOrder}</p>
                            <p className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              Expires: {coupon.expires}
                            </p>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyCode(coupon.code)}
                          >
                            {copiedCode === coupon.code ? (
                              <Check className="h-4 w-4 mr-1" />
                            ) : (
                              <Copy className="h-4 w-4 mr-1" />
                            )}
                            {coupon.code}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Ticket className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">No active coupons. Check out our offers!</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Offers Tab */}
          <TabsContent value="offers" className="mt-6">
            <div className="space-y-4">
              <h3 className="font-display font-bold text-lg">Available Offers</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {availableOffers.map((offer, i) => (
                  <Card key={i} className="hover:border-primary/50 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold">{offer.title}</h4>
                        <Badge className="bg-primary">{offer.discount}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{offer.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">{offer.validUntil}</span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyCode(offer.code)}
                        >
                          {copiedCode === offer.code ? (
                            <Check className="h-4 w-4 mr-1" />
                          ) : (
                            <Copy className="h-4 w-4 mr-1" />
                          )}
                          Get Code
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Referral Tab */}
          <TabsContent value="referral" className="mt-6">
            <div className="space-y-6">
              {/* Referral Banner */}
              <Card className="bg-gradient-to-r from-primary/20 to-eats/20 border-0">
                <CardContent className="p-6 text-center">
                  <h3 className="font-display font-bold text-2xl mb-2">
                    Give ${referralStats.refereeDiscount}, Get ${referralStats.referrerReward}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Share your code with friends. They get ${referralStats.refereeDiscount} off their first ride, 
                    you get ${referralStats.referrerReward} credit when they complete it.
                  </p>
                  <div className="flex items-center justify-center gap-3 p-4 bg-background/80 rounded-lg max-w-sm mx-auto">
                    <code className="text-lg font-mono font-bold">{referralStats.code}</code>
                    <Button size="sm" onClick={() => copyCode(referralStats.code)}>
                      {copiedCode === referralStats.code ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                    <Button size="sm" variant="outline">
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Referral Stats */}
              <div className="grid grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-3xl font-bold text-primary">{referralStats.totalReferrals}</p>
                    <p className="text-sm text-muted-foreground">Total Referrals</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-3xl font-bold text-warning">${referralStats.pendingCredits}</p>
                    <p className="text-sm text-muted-foreground">Pending Credits</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-3xl font-bold text-success">${referralStats.earnedTotal}</p>
                    <p className="text-sm text-muted-foreground">Total Earned</p>
                  </CardContent>
                </Card>
              </div>

              {/* How It Works */}
              <Card>
                <CardHeader>
                  <CardTitle>How It Works</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                        <span className="font-bold text-primary">1</span>
                      </div>
                      <h4 className="font-semibold mb-1">Share Your Code</h4>
                      <p className="text-sm text-muted-foreground">Send your unique code to friends via text, email, or social media</p>
                    </div>
                    <div className="text-center">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                        <span className="font-bold text-primary">2</span>
                      </div>
                      <h4 className="font-semibold mb-1">Friend Signs Up</h4>
                      <p className="text-sm text-muted-foreground">They enter your code and get ${referralStats.refereeDiscount} off their first ride</p>
                    </div>
                    <div className="text-center">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                        <span className="font-bold text-primary">3</span>
                      </div>
                      <h4 className="font-semibold mb-1">You Both Win</h4>
                      <p className="text-sm text-muted-foreground">After their first ride, you get ${referralStats.referrerReward} credit</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Loyalty Tab */}
          <TabsContent value="loyalty" className="mt-6">
            <div className="space-y-6">
              {/* Points Overview */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Your Points</p>
                      <p className="text-4xl font-bold">{loyaltyPoints.current.toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <Badge className="text-lg px-3 py-1 bg-amber-500">
                        <Award className="h-4 w-4 mr-1" />
                        {loyaltyPoints.tier}
                      </Badge>
                      <p className="text-sm text-muted-foreground mt-1">
                        {loyaltyPoints.multiplier}x points multiplier
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress to {loyaltyPoints.nextTier}</span>
                      <span>{loyaltyPoints.pointsToNext} points to go</span>
                    </div>
                    <Progress 
                      value={((3000 - loyaltyPoints.pointsToNext) / 3000) * 100} 
                      className="h-2"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Tier Benefits */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Tier Benefits
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-4 gap-2 text-center text-sm">
                    <div className="p-3 rounded-lg bg-muted">
                      <p className="font-semibold">Silver</p>
                      <p className="text-muted-foreground">1x points</p>
                    </div>
                    <div className="p-3 rounded-lg bg-amber-500/20 border-2 border-amber-500">
                      <p className="font-semibold text-amber-500">Gold</p>
                      <p className="text-muted-foreground">1.5x points</p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted">
                      <p className="font-semibold">Platinum</p>
                      <p className="text-muted-foreground">2x points</p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted">
                      <p className="font-semibold">Diamond</p>
                      <p className="text-muted-foreground">3x points</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Redeem Rewards */}
              <Card>
                <CardHeader>
                  <CardTitle>Redeem Rewards</CardTitle>
                  <CardDescription>Use your points for free rides, credits, and more</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {rewards.map((reward, i) => (
                      <div
                        key={i}
                        className={`flex items-center justify-between p-4 rounded-lg ${
                          loyaltyPoints.current >= reward.points
                            ? 'bg-primary/5 border border-primary/20'
                            : 'bg-muted opacity-60'
                        }`}
                      >
                        <div>
                          <p className="font-medium">{reward.name}</p>
                          <p className="text-sm text-muted-foreground">{reward.points.toLocaleString()} points</p>
                        </div>
                        <Button
                          size="sm"
                          disabled={loyaltyPoints.current < reward.points}
                        >
                          {loyaltyPoints.current >= reward.points ? 'Redeem' : 'Locked'}
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* How to Earn */}
              <Card>
                <CardHeader>
                  <CardTitle>How to Earn Points</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-rides/10 flex items-center justify-center">
                        <span className="font-bold text-rides">1pt</span>
                      </div>
                      <div>
                        <p className="font-medium">Rides</p>
                        <p className="text-sm text-muted-foreground">$1 spent = 1 point</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-eats/10 flex items-center justify-center">
                        <span className="font-bold text-eats">2pt</span>
                      </div>
                      <div>
                        <p className="font-medium">Eats Orders</p>
                        <p className="text-sm text-muted-foreground">$1 spent = 2 points</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <span className="font-bold text-primary">5pt</span>
                      </div>
                      <div>
                        <p className="font-medium">Car Rentals & Flights</p>
                        <p className="text-sm text-muted-foreground">$1 spent = 5 points</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                        <span className="font-bold text-amber-500">50pt</span>
                      </div>
                      <div>
                        <p className="font-medium">Successful Referral</p>
                        <p className="text-sm text-muted-foreground">Bonus when friend takes first ride</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Promotions;
