import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Gift, Ticket, Users, Star, Copy, Check, Share2, Clock, TrendingUp, Award, Sparkles, Zap, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";

const Promotions = () => {
  const navigate = useNavigate();
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
      gradient: "from-primary to-teal-400",
    },
    {
      title: "Late Night Eats",
      discount: "Free Delivery",
      description: "Orders after 10 PM",
      validUntil: "Ongoing",
      code: "LATENIGHT",
      gradient: "from-eats to-orange-500",
    },
    {
      title: "Luxury Car Rental",
      discount: "$50 OFF",
      description: "Premium vehicle rentals 3+ days",
      validUntil: "Limited time",
      code: "LUXURY50",
      gradient: "from-violet-500 to-purple-500",
    },
    {
      title: "Hotel + Flight Bundle",
      discount: "20% OFF",
      description: "Book together and save",
      validUntil: "Mar 2026",
      code: "BUNDLE20",
      gradient: "from-sky-500 to-blue-500",
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
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Enhanced Background effects */}
      <div className="absolute inset-0 bg-gradient-radial from-eats/12 via-transparent to-transparent opacity-50" />
      <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-eats/20 to-orange-500/15 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-primary/12 to-teal-500/8 rounded-full blur-3xl" />
      <div className="absolute top-1/2 left-1/3 w-[300px] h-[300px] bg-gradient-radial from-amber-500/8 to-transparent rounded-full blur-3xl" />
      
      {/* Floating emojis */}
      <motion.div
        animate={{ y: [0, -15, 0], rotate: [0, 10, 0] }}
        transition={{ duration: 5, repeat: Infinity }}
        className="absolute top-32 left-[8%] text-5xl hidden lg:block opacity-40"
      >
        🎁
      </motion.div>
      <motion.div
        animate={{ y: [0, 12, 0], rotate: [0, -8, 0] }}
        transition={{ duration: 6, repeat: Infinity }}
        className="absolute bottom-1/3 right-[10%] text-4xl hidden lg:block opacity-30"
      >
        💰
      </motion.div>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-xl">
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-eats to-orange-500 flex items-center justify-center shadow-lg shadow-eats/30">
              <Gift className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="font-display font-bold text-xl">Promotions & Rewards</h1>
              <p className="text-sm text-muted-foreground">Save more, earn more</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-5xl relative z-10">
        {/* Apply Promo Code */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="mb-8 border-0 bg-gradient-to-br from-card/90 to-card shadow-xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-eats/5 to-orange-500/5" />
            <CardContent className="p-6 relative">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-eats" />
                Have a promo code?
              </h3>
              <div className="flex gap-3">
                <Input
                  placeholder="Enter code (e.g., SAVE20)"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                  className="flex-1 h-12 rounded-xl bg-muted/30 border-border/50"
                />
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button className="h-12 px-6 rounded-xl bg-gradient-to-r from-eats to-orange-500 text-white font-bold shadow-lg shadow-eats/30">
                    Apply
                  </Button>
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Tabs defaultValue="coupons" className="mb-8">
            <TabsList className="grid w-full grid-cols-4 bg-muted/50 p-1.5 rounded-xl h-auto">
              <TabsTrigger value="coupons" className="rounded-lg py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-eats data-[state=active]:to-orange-500 data-[state=active]:text-white">
                <Ticket className="h-4 w-4 mr-1.5 hidden sm:inline" />
                Coupons
              </TabsTrigger>
              <TabsTrigger value="offers" className="rounded-lg py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-eats data-[state=active]:to-orange-500 data-[state=active]:text-white">
                <Gift className="h-4 w-4 mr-1.5 hidden sm:inline" />
                Offers
              </TabsTrigger>
              <TabsTrigger value="referral" className="rounded-lg py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-eats data-[state=active]:to-orange-500 data-[state=active]:text-white">
                <Users className="h-4 w-4 mr-1.5 hidden sm:inline" />
                Referral
              </TabsTrigger>
              <TabsTrigger value="loyalty" className="rounded-lg py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-eats data-[state=active]:to-orange-500 data-[state=active]:text-white">
                <Star className="h-4 w-4 mr-1.5 hidden sm:inline" />
                Loyalty
              </TabsTrigger>
            </TabsList>

            {/* Coupons Tab */}
            <TabsContent value="coupons" className="mt-6">
              <div className="space-y-4">
                <h3 className="font-display font-bold text-xl flex items-center gap-2">
                  <Ticket className="w-5 h-5 text-eats" />
                  Your Active Coupons
                </h3>
                {activeCoupons.length > 0 ? (
                  <div className="grid md:grid-cols-2 gap-4">
                    {activeCoupons.map((coupon, index) => (
                      <motion.div
                        key={coupon.code}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ y: -4 }}
                      >
                        <Card className="overflow-hidden border-0 bg-gradient-to-br from-card/90 to-card shadow-xl">
                          <div className={`h-1.5 ${
                            coupon.service === 'rides' ? 'bg-gradient-to-r from-primary to-teal-400' :
                            coupon.service === 'eats' ? 'bg-gradient-to-r from-eats to-orange-500' : 'bg-gradient-to-r from-violet-500 to-purple-500'
                          }`} />
                          <CardContent className="p-5">
                            <div className="flex justify-between items-start mb-4">
                              <div>
                                <p className="text-3xl font-bold bg-gradient-to-r from-eats to-orange-500 bg-clip-text text-transparent">{coupon.discount}</p>
                                <p className="text-muted-foreground">{coupon.description}</p>
                              </div>
                              <Badge variant="outline" className="shrink-0 font-semibold">
                                {coupon.service === 'all' ? 'All Services' : coupon.service.toUpperCase()}
                              </Badge>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="text-sm text-muted-foreground">
                                <p>Min: {coupon.minOrder}</p>
                                <p className="flex items-center gap-1.5">
                                  <Clock className="h-3.5 w-3.5" />
                                  Expires: {coupon.expires}
                                </p>
                              </div>
                              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => copyCode(coupon.code)}
                                  className="rounded-xl font-semibold"
                                >
                                  {copiedCode === coupon.code ? (
                                    <Check className="h-4 w-4 mr-1.5 text-emerald-500" />
                                  ) : (
                                    <Copy className="h-4 w-4 mr-1.5" />
                                  )}
                                  {coupon.code}
                                </Button>
                              </motion.div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <Card className="border-0 bg-gradient-to-br from-card/90 to-card shadow-xl">
                    <CardContent className="p-10 text-center">
                      <Ticket className="h-14 w-14 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-muted-foreground text-lg">No active coupons. Check out our offers!</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            {/* Offers Tab */}
            <TabsContent value="offers" className="mt-6">
              <div className="space-y-4">
                <h3 className="font-display font-bold text-xl flex items-center gap-2">
                  <Zap className="w-5 h-5 text-eats" />
                  Available Offers
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {availableOffers.map((offer, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      whileHover={{ y: -4 }}
                    >
                      <Card className="border-0 bg-gradient-to-br from-card/90 to-card shadow-xl hover:shadow-2xl transition-all overflow-hidden">
                        <CardContent className="p-5">
                          <div className="flex justify-between items-start mb-3">
                            <h4 className="font-bold text-lg">{offer.title}</h4>
                            <Badge className={`bg-gradient-to-r ${offer.gradient} text-white border-0 font-semibold px-3`}>
                              {offer.discount}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-4">{offer.description}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">{offer.validUntil}</span>
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => copyCode(offer.code)}
                                className="rounded-xl font-semibold"
                              >
                                {copiedCode === offer.code ? (
                                  <Check className="h-4 w-4 mr-1.5 text-emerald-500" />
                                ) : (
                                  <Copy className="h-4 w-4 mr-1.5" />
                                )}
                                Get Code
                              </Button>
                            </motion.div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* Referral Tab */}
            <TabsContent value="referral" className="mt-6">
              <div className="space-y-6">
                {/* Referral Banner */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card className="border-0 bg-gradient-to-r from-primary/20 to-eats/20 shadow-xl overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-eats/10" />
                    <CardContent className="p-8 text-center relative">
                      <h3 className="font-display font-bold text-3xl mb-3">
                        Give ${referralStats.refereeDiscount}, Get ${referralStats.referrerReward}
                      </h3>
                      <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                        Share your code with friends. They get ${referralStats.refereeDiscount} off their first ride, 
                        you get ${referralStats.referrerReward} credit when they complete it.
                      </p>
                      <div className="flex items-center justify-center gap-3 p-4 bg-background/80 backdrop-blur-sm rounded-2xl max-w-sm mx-auto">
                        <code className="text-xl font-mono font-bold">{referralStats.code}</code>
                        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                          <Button size="icon" onClick={() => copyCode(referralStats.code)} className="rounded-xl">
                            {copiedCode === referralStats.code ? (
                              <Check className="h-4 w-4" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        </motion.div>
                        <Button size="icon" variant="outline" className="rounded-xl">
                          <Share2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Referral Stats */}
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { value: referralStats.totalReferrals, label: "Total Referrals", gradient: "from-primary to-teal-400" },
                    { value: `$${referralStats.pendingCredits}`, label: "Pending Credits", gradient: "from-amber-500 to-orange-500" },
                    { value: `$${referralStats.earnedTotal}`, label: "Total Earned", gradient: "from-emerald-500 to-green-500" },
                  ].map((stat, index) => (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className="border-0 bg-gradient-to-br from-card/90 to-card shadow-xl">
                        <CardContent className="p-5 text-center">
                          <p className={`text-3xl font-bold bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent`}>{stat.value}</p>
                          <p className="text-sm text-muted-foreground">{stat.label}</p>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>

                {/* How It Works */}
                <Card className="border-0 bg-gradient-to-br from-card/90 to-card shadow-xl">
                  <CardHeader>
                    <CardTitle className="text-xl">How It Works</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-3 gap-6">
                      {[
                        { step: 1, title: "Share Your Code", desc: "Send your unique code to friends via text, email, or social media" },
                        { step: 2, title: "Friend Signs Up", desc: `They enter your code and get $${referralStats.refereeDiscount} off their first ride` },
                        { step: 3, title: "You Both Win", desc: `After their first ride, you get $${referralStats.referrerReward} credit` },
                      ].map((item) => (
                        <div key={item.step} className="text-center">
                          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-teal-400 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/30">
                            <span className="font-bold text-xl text-white">{item.step}</span>
                          </div>
                          <h4 className="font-bold mb-2">{item.title}</h4>
                          <p className="text-sm text-muted-foreground">{item.desc}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Loyalty Tab */}
            <TabsContent value="loyalty" className="mt-6">
              <div className="space-y-6">
                {/* Points Overview */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card className="border-0 bg-gradient-to-br from-card/90 to-card shadow-xl overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-orange-500/5" />
                    <CardContent className="p-6 relative">
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Your Points</p>
                          <p className="text-5xl font-bold bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">{loyaltyPoints.current.toLocaleString()}</p>
                        </div>
                        <div className="text-right">
                          <Badge className="text-lg px-4 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 font-bold shadow-lg shadow-amber-500/30">
                            <Award className="h-4 w-4 mr-1.5" />
                            {loyaltyPoints.tier}
                          </Badge>
                          <p className="text-sm text-muted-foreground mt-2">
                            {loyaltyPoints.multiplier}x points multiplier
                          </p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium">Progress to {loyaltyPoints.nextTier}</span>
                          <span className="text-muted-foreground">{loyaltyPoints.pointsToNext} points to go</span>
                        </div>
                        <Progress 
                          value={((3000 - loyaltyPoints.pointsToNext) / 3000) * 100} 
                          className="h-3 rounded-full"
                        />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Tier Benefits */}
                <Card className="border-0 bg-gradient-to-br from-card/90 to-card shadow-xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <TrendingUp className="h-5 w-5 text-amber-500" />
                      Tier Benefits
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-4 gap-3 text-center">
                      {[
                        { name: "Silver", points: "1x", active: false },
                        { name: "Gold", points: "1.5x", active: true },
                        { name: "Platinum", points: "2x", active: false },
                        { name: "Diamond", points: "3x", active: false },
                      ].map((tier) => (
                        <div 
                          key={tier.name}
                          className={`p-4 rounded-2xl transition-all ${
                            tier.active 
                              ? "bg-gradient-to-br from-amber-500/20 to-orange-500/20 ring-2 ring-amber-500" 
                              : "bg-muted/50"
                          }`}
                        >
                          <p className={`font-bold ${tier.active ? "text-amber-500" : ""}`}>{tier.name}</p>
                          <p className="text-sm text-muted-foreground">{tier.points} points</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Redeem Rewards */}
                <Card className="border-0 bg-gradient-to-br from-card/90 to-card shadow-xl">
                  <CardHeader>
                    <CardTitle className="text-xl">Redeem Rewards</CardTitle>
                    <CardDescription>Use your points for free rides, credits, and more</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {rewards.map((reward, index) => (
                        <motion.div
                          key={reward.name}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className={`flex items-center justify-between p-4 rounded-2xl transition-all ${
                            reward.available && loyaltyPoints.current >= reward.points
                              ? "bg-muted/50 hover:bg-muted cursor-pointer"
                              : "bg-muted/20 opacity-60"
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                              reward.available && loyaltyPoints.current >= reward.points
                                ? "bg-gradient-to-br from-amber-500 to-orange-500 shadow-lg shadow-amber-500/30"
                                : "bg-muted"
                            }`}>
                              <Star className={`h-6 w-6 ${
                                reward.available && loyaltyPoints.current >= reward.points
                                  ? "text-white"
                                  : "text-muted-foreground"
                              }`} />
                            </div>
                            <div>
                              <p className="font-semibold">{reward.name}</p>
                              <p className="text-sm text-muted-foreground">{reward.points.toLocaleString()} points</p>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            disabled={!reward.available || loyaltyPoints.current < reward.points}
                            className="rounded-xl font-semibold"
                          >
                            Redeem
                          </Button>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </main>
    </div>
  );
};

export default Promotions;