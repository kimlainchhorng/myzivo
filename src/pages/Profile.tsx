import { useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import SEOHead from "@/components/SEOHead";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  User, 
  Camera, 
  ArrowLeft, 
  Mail, 
  Phone, 
  Loader2,
  Save,
  Sparkles,
  Shield,
  Star,
  Clock,
  ChevronRight,
  Settings,
  CreditCard,
  Bell,
  Lock,
  Plane,
  Gift,
  Wallet,
  Store,
  ExternalLink,
  Users,
  TrendingUp,
  Trophy,
  Globe
} from "lucide-react";
import { StatusTiersDashboard } from "@/components/flight/StatusTiersDashboard";
import ReferralCenter from "@/components/flight/ReferralCenter";
import GiftCardsCredits from "@/components/flight/GiftCardsCredits";
import FlightLoyaltyIntegration from "@/components/flight/FlightLoyaltyIntegration";
import PayLater from "@/components/flight/PayLater";
import FlightBookings from "@/components/flight/FlightBookings";
import ZivoMilesProgram from "@/components/flight/ZivoMilesProgram";
import TravelAlerts from "@/components/flight/TravelAlerts";
import MyTripsDashboard from "@/components/flight/MyTripsDashboard";
import PriceAlertsDashboard from "@/components/flight/PriceAlertsDashboard";
import ItineraryBuilder from "@/components/flight/ItineraryBuilder";
import TravelDocuments from "@/components/flight/TravelDocuments";
import AirlinePartnersHub from "@/components/flight/AirlinePartnersHub";
import TripSharing from "@/components/flight/TripSharing";
import TravelCompanionFinder from "@/components/flight/TravelCompanionFinder";
import FlightTracker from "@/components/flight/FlightTracker";
import FlightPriceAlert from "@/components/flight/FlightPriceAlert";
import GroundTransportBooking from "@/components/flight/GroundTransportBooking";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useUserProfile, useUpdateUserProfile, useUploadAvatar } from "@/hooks/useUserProfile";
import { useMerchantRole } from "@/hooks/useMerchantRole";
import { useAffiliateAttribution } from "@/hooks/useAffiliateAttribution";
import { MERCHANT_APP_URL } from "@/lib/eatsTables";

const profileSchema = z.object({
  full_name: z.string().min(2, "Name must be at least 2 characters").optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
});

type ProfileFormData = z.infer<typeof profileSchema>;

const Profile = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { data: profile, isLoading: profileLoading } = useUserProfile();
  const { data: merchantData } = useMerchantRole();
  const affiliateAttribution = useAffiliateAttribution();
  const updateProfile = useUpdateUserProfile();
  const uploadAvatar = useUploadAvatar();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: "",
      phone: "",
    },
    values: {
      full_name: profile?.full_name || "",
      phone: profile?.phone || "",
    },
  });

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show preview immediately
    const reader = new FileReader();
    reader.onload = (e) => {
      setAvatarPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload file
    await uploadAvatar.mutateAsync(file);
    setAvatarPreview(null);
  };

  const onSubmit = async (data: ProfileFormData) => {
    await updateProfile.mutateAsync({
      full_name: data.full_name || null,
      phone: data.phone || null,
    });
  };

  const getInitials = () => {
    if (profile?.full_name) {
      return profile.full_name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
    }
    if (user?.email) {
      return user.email[0].toUpperCase();
    }
    return "U";
  };

  const quickLinks = [
    { icon: TrendingUp, label: "Spending", href: "/account/spending", description: "View spending history" },
    { icon: Sparkles, label: "Loyalty", href: "/account/loyalty", description: "Points & tier perks" },
    { icon: Trophy, label: "Achievements", href: "/account/achievements", description: "Badges & rewards" },
    { icon: Sparkles, label: "Activity", href: "/account/activity", description: "Your personal stats" },
    { icon: Globe, label: "Language & Currency", href: "/account/preferences", description: "Display preferences" },
    { icon: Gift, label: "Gift Cards", href: "/account/gift-cards", description: "Buy, send, or redeem" },
    { icon: User, label: "Saved Travelers", href: "#travelers", description: "Manage traveler profiles" },
    { icon: CreditCard, label: "Payment Methods", href: "/wallet", description: "Manage cards & wallets" },
    { icon: Bell, label: "Notifications", href: "/dashboard", description: "Preferences & alerts" },
    { icon: Lock, label: "Security", href: "/dashboard", description: "Password & 2FA" },
    { icon: Settings, label: "Settings", href: "/dashboard", description: "App preferences" },
  ];

  return (
    <div className="min-h-screen bg-background relative overflow-hidden pb-20 safe-area-top safe-area-bottom">
      <SEOHead title="Profile Settings – ZIVO" description="Manage your ZIVO account, profile, and travel preferences." noIndex={true} />
      {/* Background effects - simplified for mobile */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-radial from-primary/10 via-transparent to-transparent opacity-50" />
      <div className="pointer-events-none absolute top-1/4 right-0 w-[200px] sm:w-[300px] h-[200px] sm:h-[300px] bg-gradient-to-bl from-primary/15 to-teal-500/10 rounded-full blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-0 w-[150px] sm:w-[200px] h-[150px] sm:h-[200px] bg-gradient-to-tr from-violet-500/10 to-purple-500/5 rounded-full blur-3xl" />

      <div className="relative z-10 container max-w-lg mx-auto px-4 pt-4 pb-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6 animate-in fade-in slide-in-from-top-2 duration-300">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/")}
            className="rounded-xl hover:bg-muted/50 -ml-2 touch-manipulation active:scale-95"
            aria-label="Go back"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="font-display text-xl sm:text-2xl lg:text-3xl font-bold">Profile Settings</h1>
            <p className="text-muted-foreground text-xs sm:text-sm">Manage your account information</p>
          </div>
        </div>

        {profileLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-5 sm:space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Profile Card */}
            <Card className="relative border-0 bg-gradient-to-br from-card/90 to-card shadow-2xl overflow-hidden">
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/5 to-teal-500/5" />
              <CardHeader className="text-center pb-2 relative">
                <div className="flex justify-center mb-4">
                  <div className="relative group">
                    <div className="absolute -inset-2 bg-gradient-to-r from-primary to-teal-400 rounded-full blur-lg opacity-30 group-hover:opacity-50 transition-opacity" />
                    <Avatar className="relative h-24 w-24 sm:h-28 sm:w-28 ring-4 ring-background shadow-2xl">
                      <AvatarImage 
                        src={avatarPreview || profile?.avatar_url || undefined} 
                        alt="Profile"
                      />
                      <AvatarFallback className="bg-gradient-to-br from-primary to-teal-400 text-primary-foreground text-2xl sm:text-3xl font-bold">
                        {getInitials()}
                      </AvatarFallback>
                    </Avatar>
                    <button
                      onClick={handleAvatarClick}
                      disabled={uploadAvatar.isPending}
                      className="absolute bottom-0 right-0 p-2 sm:p-2.5 bg-gradient-to-br from-primary to-teal-400 text-primary-foreground rounded-full shadow-lg hover:opacity-90 transition-opacity disabled:opacity-50 touch-manipulation active:scale-95"
                    >
                      {uploadAvatar.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Camera className="h-4 w-4" />
                      )}
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </div>
                </div>
                <CardTitle className="flex items-center justify-center gap-2 text-xl sm:text-2xl">
                  <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  {profile?.full_name || "Set your name"}
                </CardTitle>
                <CardDescription className="text-sm sm:text-base">{user?.email}</CardDescription>
                <Badge className="mt-3 bg-gradient-to-r from-primary/20 to-teal-400/20 text-primary border-primary/30 font-semibold">
                  <Star className="w-3 h-3 mr-1 fill-primary" />
                  {profile?.status || "Active"} Member
                </Badge>
              </CardHeader>

              <CardContent className="pt-6 relative">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="full_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2 font-semibold">
                            <User className="h-4 w-4 text-primary" />
                            Full Name
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter your full name"
                              className="h-12 rounded-xl bg-muted/30 border-border/50 focus:border-primary/50"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-semibold">
                        <Mail className="h-4 w-4 text-primary" />
                        Email
                      </label>
                      <Input
                        value={user?.email || ""}
                        disabled
                        className="h-12 rounded-xl bg-muted/50 border-border/50 text-muted-foreground"
                      />
                      <p className="text-xs text-muted-foreground">
                        Email cannot be changed here
                      </p>
                    </div>

                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2 font-semibold">
                            <Phone className="h-4 w-4 text-primary" />
                            Phone Number
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter your phone number"
                              type="tel"
                              className="h-12 rounded-xl bg-muted/30 border-border/50 focus:border-primary/50"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      className="w-full h-12 sm:h-14 text-base sm:text-lg font-bold rounded-xl bg-gradient-to-r from-primary to-teal-400 text-primary-foreground shadow-lg shadow-primary/30 hover:opacity-90 touch-manipulation active:scale-[0.98]"
                      disabled={updateProfile.isPending || !form.formState.isDirty}
                    >
                      {updateProfile.isPending ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin mr-2" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-5 w-5 mr-2" />
                          Save Changes
                        </>
                      )}
                    </Button>

                    {user ? (
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full h-12 sm:h-14 text-base sm:text-lg font-semibold rounded-xl touch-manipulation active:scale-[0.98]"
                        onClick={async () => {
                          await signOut();
                          navigate("/");
                        }}
                      >
                        Sign out
                      </Button>
                    ) : (
                      <div className="flex gap-3">
                        <Button
                          type="button"
                          variant="outline"
                          className="flex-1 h-12 sm:h-14 text-base sm:text-lg font-semibold rounded-xl touch-manipulation active:scale-[0.98]"
                          onClick={() => navigate("/login")}
                        >
                          Log in
                        </Button>
                        <Button
                          type="button"
                          variant="hero"
                          className="flex-1 h-12 sm:h-14 text-base sm:text-lg font-semibold rounded-xl touch-manipulation active:scale-[0.98]"
                          onClick={() => navigate("/signup")}
                        >
                          Sign up
                        </Button>
                      </div>
                    )}
                  </form>
                </Form>
              </CardContent>
            </Card>

            {/* Quick Links */}
            <div>
              <h3 className="font-display font-bold text-base sm:text-lg mb-3 sm:mb-4">Quick Access</h3>
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                {quickLinks.map((link) => (
                  <Link key={link.label} to={link.href}>
                    <Card className="border-0 bg-gradient-to-br from-card/90 to-card shadow-xl hover:shadow-2xl transition-all cursor-pointer group overflow-hidden touch-manipulation active:scale-[0.98]">
                      <CardContent className="p-3 sm:p-4 flex items-center gap-3 sm:gap-4">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-primary/20 to-teal-400/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <link.icon className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm sm:text-base truncate">{link.label}</p>
                          <p className="text-xs text-muted-foreground truncate">{link.description}</p>
                        </div>
                        <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all flex-shrink-0" />
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>

            {/* Merchant Dashboard Link - only shown if user has merchant role */}
            {merchantData?.isMerchant && (
              <a 
                href={MERCHANT_APP_URL} 
                target="_blank" 
                rel="noopener noreferrer"
                className="block"
              >
                <Card className="relative border-0 bg-gradient-to-br from-orange-500/10 to-amber-500/10 shadow-xl overflow-hidden hover:shadow-2xl transition-all cursor-pointer group touch-manipulation active:scale-[0.98]">
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-orange-500/5 to-amber-500/5" />
                  <CardContent className="p-4 sm:p-5 relative">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 sm:gap-4">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-500/30">
                          <Store className="w-5 h-5 sm:w-6 sm:h-6 text-primary-foreground" />
                        </div>
                        <div>
                          <p className="font-semibold text-sm sm:text-base">Merchant Dashboard</p>
                          <p className="text-xs sm:text-sm text-muted-foreground">
                            Manage your restaurant & orders
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-gradient-to-r from-orange-500/20 to-amber-500/20 text-orange-500 border-orange-500/30 font-semibold px-2 sm:px-3 py-1 text-xs">
                          Partner
                        </Badge>
                        <ExternalLink className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground group-hover:text-orange-500 transition-colors" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </a>
            )}

            {/* Account Status */}
            <Card className="relative border-0 bg-gradient-to-br from-card/90 to-card shadow-xl overflow-hidden">
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-green-500/5" />
              <CardContent className="p-4 sm:p-5 relative">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                      <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-primary-foreground" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm sm:text-base">Account Status</p>
                      <p className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1.5">
                        <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                        Member since {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : "recently"}
                      </p>
                    </div>
                  </div>
                  <Badge className="bg-gradient-to-r from-emerald-500/20 to-green-500/20 text-emerald-500 border-emerald-500/30 font-semibold px-3 sm:px-4 py-1 sm:py-1.5 text-xs sm:text-sm">
                    Active
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Partner Attribution Card - shown if user was referred by affiliate */}
            {affiliateAttribution.hasAffiliateAttribution && (
              <Card className="relative border-0 bg-gradient-to-br from-card/90 to-card shadow-xl overflow-hidden">
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-violet-500/5 to-purple-500/5" />
                <CardContent className="p-4 sm:p-5 relative">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center shadow-lg shadow-violet-500/30">
                      <Users className="w-5 h-5 sm:w-6 sm:h-6 text-primary-foreground" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm sm:text-base">Referred by Partner</p>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        You joined through {affiliateAttribution.partnerName}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            <div>
              <h3 className="font-display font-bold text-base sm:text-lg mb-3 sm:mb-4 flex items-center gap-2">
                <Plane className="w-4 h-4 text-primary" />
                ZIVO Miles Status
              </h3>
              <StatusTiersDashboard />
            </div>

            {/* Gift Cards & Credits */}
            <div>
              <h3 className="font-display font-bold text-base sm:text-lg mb-3 sm:mb-4 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-primary" />
                Gift Cards & Credits
              </h3>
              <GiftCardsCredits />
            </div>

            {/* Referral Center */}
            <div>
              <h3 className="font-display font-bold text-base sm:text-lg mb-3 sm:mb-4 flex items-center gap-2">
                <Gift className="w-4 h-4 text-primary" />
                Refer & Earn
              </h3>
              <ReferralCenter />
            </div>

            {/* Frequent Flyer Programs */}
            <div>
              <h3 className="font-display font-bold text-base sm:text-lg mb-3 sm:mb-4 flex items-center gap-2">
                <Star className="w-4 h-4 text-primary" />
                Frequent Flyer Programs
              </h3>
              <FlightLoyaltyIntegration />
            </div>

            {/* Pay Later */}
            <div>
              <h3 className="font-display font-bold text-base sm:text-lg mb-3 sm:mb-4 flex items-center gap-2">
                <Wallet className="w-4 h-4 text-primary" />
                Pay Later Options
              </h3>
              <PayLater totalAmount={599} />
            </div>

            {/* My Bookings */}
            <div>
              <FlightBookings />
            </div>

            {/* ZIVO Miles Program */}
            <div>
              <ZivoMilesProgram />
            </div>

            {/* Travel Alerts */}
            <div>
              <TravelAlerts />
            </div>

            {/* My Trips */}
            <div>
              <MyTripsDashboard />
            </div>

            {/* Price Alerts */}
            <div>
              <PriceAlertsDashboard />
            </div>

            {/* Itinerary Builder */}
            <div>
              <ItineraryBuilder tripName="My Trip" />
            </div>

            {/* Travel Documents */}
            <div>
              <TravelDocuments />
            </div>

            {/* Airline Partners */}
            <div>
              <AirlinePartnersHub />
            </div>

            {/* Trip Sharing */}
            <div>
              <TripSharing tripId="my-trips" tripName="My Trip" />
            </div>

            {/* Travel Companion Finder */}
            <div>
              <TravelCompanionFinder
                flightNumber="ZV-1234"
                currentSeat="15A"
                departureDate={new Date()}
                route={{ from: "LAX", to: "JFK" }}
              />
            </div>

            {/* Flight Tracker */}
            <div>
              <FlightTracker
                flightNumber="ZV-1234"
                airline="ZIVO Airways"
                departure={{
                  code: "LAX",
                  city: "Los Angeles",
                  time: "08:00",
                  date: new Date(),
                  terminal: "T4",
                  gate: "B12",
                }}
                arrival={{
                  code: "JFK",
                  city: "New York",
                  time: "16:30",
                  date: new Date(),
                }}
                duration="5h 30m"
                aircraft="Boeing 787-9 Dreamliner"
              />
            </div>

            {/* Flight Price Alerts */}
            <div>
              <FlightPriceAlert
                route={{ from: "Los Angeles", fromCode: "LAX", to: "New York", toCode: "JFK" }}
                currentPrice={299}
                historicalLow={249}
              />
            </div>

            {/* Ground Transport */}
            <div>
              <GroundTransportBooking
                arrivalAirport="JFK"
                arrivalTime={new Date()}
                destination="New York"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;