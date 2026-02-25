import { Suspense, lazy, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/contexts/AuthContext";
import { RealtimeSyncProvider } from "@/contexts/RealtimeSyncContext";
import { UTMProvider } from "@/contexts/UTMContext";
import { CurrencyProvider } from "@/contexts/CurrencyContext";
import { CustomerCityProvider } from "@/contexts/CustomerCityContext";
import { BrandProvider } from "@/contexts/BrandContext";
import { RideStoreProvider } from "@/stores/rideStore";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import SetupRequiredRoute from "@/components/auth/SetupRequiredRoute";
import CookieConsent from "./components/common/CookieConsent";
import PreserveQueryRedirect from "./components/routing/PreserveQueryRedirect";
import { PWAInstallPrompt } from "./components/mobile";
import { PWAUpdatePrompt } from "./components/shared/PWAUpdatePrompt";
import { Loader2 } from "lucide-react";
import { categorizeError } from "@/lib/supabaseErrors";
import { SpatialCursor } from "./components/ui/SpatialCursor";
import { PreferencesSync } from "./components/shared/PreferencesSync";
import { GoogleMapProvider } from "./components/maps";
import { useBrand } from "@/hooks/useBrand";
import { applyBrandTheme, resetBrandTheme } from "@/lib/brandTheme";

// Eager load critical pages
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";

// App (mobile-first) pages - lazy load
const AppHome = lazy(() => import("./pages/app/AppHome"));
const ScheduledBookingsPage = lazy(() => import("./pages/ScheduledBookingsPage"));
const AppTravel = lazy(() => import("./pages/app/AppTravel"));
const AppRides = lazy(() => import("./pages/app/AppRides"));
const AppEats = lazy(() => import("./pages/app/AppEats"));
const AppMore = lazy(() => import("./pages/app/AppMore"));
const UnifiedDashboard = lazy(() => import("./pages/app/UnifiedDashboard"));
const MyTripsPage = lazy(() => import("./pages/app/MyTripsPage"));
const WalletPage = lazy(() => import("./pages/app/WalletPage"));
const SupportCenterPage = lazy(() => import("./pages/app/SupportCenterPage"));
const RequestServicePage = lazy(() => import("./pages/app/RequestServicePage"));
const RequestRidePage = lazy(() => import("./pages/app/RequestRidePage"));
const TripStatusPage = lazy(() => import("./pages/app/TripStatusPage"));
const ReceiptPage = lazy(() => import("./pages/app/ReceiptPage"));

// New Mobile-first pages (5-tab nav: Home, Search, Trips, Alerts, Account)
const MobileHome = lazy(() => import("./pages/mobile/MobileHome"));
const MobileSearch = lazy(() => import("./pages/mobile/MobileSearch"));
const MobileTrips = lazy(() => import("./pages/mobile/MobileTrips"));
const MobileAlerts = lazy(() => import("./pages/mobile/MobileAlerts"));
const MobileAccount = lazy(() => import("./pages/mobile/MobileAccount"));

// Lazy load all other pages for faster initial load
const Rides = lazy(() => import("./pages/Rides"));
const RidePage = lazy(() => import("./pages/ride/RidePage"));
const RideConfirmPage = lazy(() => import("./pages/ride/RideConfirmPage"));
const RideSearchingPage = lazy(() => import("./pages/ride/RideSearchingPage"));
const RideDriverPage = lazy(() => import("./pages/ride/RideDriverPage"));
const RideTripPage = lazy(() => import("./pages/ride/RideTripPage"));

// Rider Help & Support pages
const RiderHelpPage = lazy(() => import("./pages/help/RiderHelpPage"));
const NewTicketPage = lazy(() => import("./pages/help/NewTicketPage"));
const MyTicketsPage = lazy(() => import("./pages/help/MyTicketsPage"));

// Driver App pages
const DriverHomePage = lazy(() => import("./pages/driver/DriverHomePage"));
const DriverLoginPage = lazy(() => import("./pages/driver/DriverLoginPage"));
const DriverTripsPage = lazy(() => import("./pages/driver/DriverTripsPage"));
const DriverAccountPage = lazy(
  () => import("./pages/driver/DriverAccountPage")
);
const DriverOrderChatPage = lazy(() => import("./pages/driver/DriverOrderChatPage"));
const DriverAnalyticsPage = lazy(() => import("./pages/driver/DriverAnalyticsPage"));
const DriverActivityPage = lazy(() => import("./pages/driver/DriverActivityPage"));

// Customer Loyalty
const LoyaltyPage = lazy(() => import("./pages/account/LoyaltyPage"));
const AchievementsPage = lazy(() => import("./pages/account/AchievementsPage"));
const AccountRewardsPage = lazy(() => import("./pages/account/AccountRewardsPage"));

// Merchant Ads
const MerchantAdsPage = lazy(() => import("./pages/merchant/MerchantAdsPage"));
const MerchantReviewsPage = lazy(() => import("./pages/merchant/MerchantReviewsPage"));

const Move = lazy(() => import("./pages/Move"));
const Eats = lazy(() => import("./pages/Eats"));
const EatsRestaurants = lazy(() => import("./pages/EatsRestaurants"));
const EatsRestaurantMenu = lazy(() => import("./pages/EatsRestaurantMenu"));
const EatsCheckout = lazy(() => import("./pages/EatsCheckout"));
const EatsCart = lazy(() => import("./pages/EatsCart"));
const EatsOrders = lazy(() => import("./pages/EatsOrders"));
const EatsOrderDetail = lazy(() => import("./pages/EatsOrderDetail"));
const EatsDeliveryReplay = lazy(() => import("./pages/EatsDeliveryReplay"));
const EatsAddress = lazy(() => import("./pages/EatsAddress"));
const EatsReceipt = lazy(() => import("./pages/EatsReceipt"));
const EatsAlerts = lazy(() => import("./pages/EatsAlerts"));
const EatsGroupOrder = lazy(() => import("./pages/EatsGroupOrder"));
const EatsFavorites = lazy(() => import("./pages/EatsFavorites"));
const EatsOrderChatPage = lazy(() => import("./pages/eats/EatsOrderChatPage"));
const NotificationsPage = lazy(() => import("./pages/NotificationsPage"));
const TripHistory = lazy(() => import("./pages/TripHistory"));
const PaymentMethodsPage = lazy(() => import("./pages/PaymentMethodsPage"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const CustomerDashboard = lazy(() => import("./pages/CustomerDashboard"));
const RestaurantDashboard = lazy(() => import("./pages/RestaurantDashboard"));
const CarRentalDashboard = lazy(() => import("./pages/CarRentalDashboard"));
const MerchantOrderChatPage = lazy(() => import("./pages/merchant/MerchantOrderChatPage"));
const FlightDashboard = lazy(() => import("./pages/FlightDashboard"));
const HotelDashboard = lazy(() => import("./pages/HotelDashboard"));
const AuthCallback = lazy(() => import("./pages/AuthCallback"));
const Setup = lazy(() => import("./pages/Setup"));
const Onboarding = lazy(() => import("./pages/Onboarding"));
const VerifyEmail = lazy(() => import("./pages/VerifyEmail"));
const VerifyOTP = lazy(() => import("./pages/VerifyOTP"));
const NotFound = lazy(() => import("./pages/NotFound"));
// FoodOrdering removed — was duplicate of Eats
const FlightBooking = lazy(() => import("./pages/FlightBooking"));
const FlightLanding = lazy(() => import("./pages/FlightLanding"));
const FlightResults = lazy(() => import("./pages/FlightResults"));
const FlightDetails = lazy(() => import("./pages/FlightDetails"));
const FlightLive = lazy(() => import("./pages/FlightLive"));
const FlightTravelerInfo = lazy(() => import("./pages/FlightTravelerInfo"));
const FlightCheckout = lazy(() => import("./pages/FlightCheckout"));
const FlightConfirmation = lazy(() => import("./pages/FlightConfirmation"));
const FlightTerms = lazy(() => import("./pages/legal/FlightTerms"));
// New SEO pages for flights
const AirportPage = lazy(() => import("./pages/AirportPage"));
const FlightCityPage = lazy(() => import("./pages/FlightCityPage"));
const DuffelCheckout = lazy(() => import("./pages/DuffelCheckout"));
const EmbeddedCheckout = lazy(() => import("./pages/EmbeddedCheckout"));
const HotelBooking = lazy(() => import("./pages/HotelBooking"));
const HotelLanding = lazy(() => import("./pages/HotelLanding"));
const HotelsPage = lazy(() => import("./pages/HotelsPage"));
const CarRentalBooking = lazy(() => import("./pages/CarRentalBooking"));
const CarResultsPage = lazy(() => import("./pages/CarResultsPage"));
const CarRentalLanding = lazy(() => import("./pages/CarRentalLanding"));
const CarDetailPage = lazy(() => import("./pages/CarDetailPage"));
const CarTravelerInfoPage = lazy(() => import("./pages/CarTravelerInfoPage"));
const CarCheckoutPage = lazy(() => import("./pages/CarCheckoutPage"));
const CarConfirmationPage = lazy(() => import("./pages/CarConfirmationPage"));
const CarSearch = lazy(() => import("./pages/CarSearch"));
const Profile = lazy(() => import("./pages/Profile"));
const PackageDelivery = lazy(() => import("./pages/PackageDelivery"));
const GroundTransport = lazy(() => import("./pages/GroundTransport"));
// Events removed — no events system
const ThingsToDo = lazy(() => import("./pages/ThingsToDo"));
const TravelInsurance = lazy(() => import("./pages/TravelInsurance"));
const TravelExtras = lazy(() => import("./pages/TravelExtras"));
const Install = lazy(() => import("./pages/Install"));
const HelpCenter = lazy(() => import("./pages/HelpCenter"));
const Promotions = lazy(() => import("./pages/Promotions"));
const RestaurantRegistration = lazy(() => import("./pages/RestaurantRegistration"));
const ListYourCar = lazy(() => import("./pages/ListYourCar"));
const OwnerApply = lazy(() => import("./pages/owner/OwnerApply"));
const OwnerDashboard = lazy(() => import("./pages/owner/OwnerDashboard"));
const OwnerProfile = lazy(() => import("./pages/owner/OwnerProfile"));
const OwnerCars = lazy(() => import("./pages/owner/OwnerCars"));
const AddVehicle = lazy(() => import("./pages/owner/AddVehicle"));
const EditVehicle = lazy(() => import("./pages/owner/EditVehicle"));
const VehicleAvailability = lazy(() => import("./pages/owner/VehicleAvailability"));
const OwnerBookings = lazy(() => import("./pages/owner/OwnerBookings"));
const OwnerPayouts = lazy(() => import("./pages/owner/OwnerPayouts"));
const StripeConnectReturn = lazy(() => import("./pages/owner/StripeConnectReturn"));
// P2P Renter pages
const P2PVehicleSearch = lazy(() => import("./pages/p2p/P2PVehicleSearch"));
const P2PVehicleDetail = lazy(() => import("./pages/p2p/P2PVehicleDetail"));
const P2PBookingConfirmation = lazy(() => import("./pages/p2p/P2PBookingConfirmation"));
const RenterTrips = lazy(() => import("./pages/p2p/RenterTrips"));
// Renter Dashboard pages
const RenterDashboard = lazy(() => import("./pages/renter/RenterDashboard"));
const RenterBookings = lazy(() => import("./pages/renter/RenterBookings"));
// Public pages
const Cars = lazy(() => import("./pages/Cars"));
const CarsSearchPage = lazy(() => import("./pages/cars/CarsSearchPage"));
const CarsDetailPage = lazy(() => import("./pages/cars/CarDetailPage"));
const HowToRent = lazy(() => import("./pages/HowToRent"));
// Owner Earnings
const OwnerEarningsPage = lazy(() => import("./pages/owner/OwnerEarningsPage"));
// Fleet pages
const FleetDashboard = lazy(() => import("./pages/fleet/FleetDashboard"));
const FleetOnboarding = lazy(() => import("./pages/fleet/FleetOnboarding"));
// Travel Checkout pages
const TravelCheckoutPage = lazy(() => import("./pages/TravelCheckoutPage"));
const TravelConfirmationPage = lazy(() => import("./pages/TravelConfirmationPage"));
const MyOrdersPage = lazy(() => import("./pages/MyOrdersPage"));
// Enhanced Travel Trips pages
const TravelTripsPage = lazy(() => import("./pages/TravelTripsPage"));
const TravelOrderDetailPage = lazy(() => import("./pages/TravelOrderDetailPage"));
const TravelerDashboard = lazy(() => import("./pages/TravelerDashboard"));
// Business pages
const BusinessAccountPage = lazy(() => import("./pages/business/BusinessAccountPage"));
// Renter Verification pages
const RenterVerification = lazy(() => import("./pages/verify/RenterVerification"));
const VerificationStatus = lazy(() => import("./pages/verify/VerificationStatus"));
// Beta pages
const RenterWaitlist = lazy(() => import("./pages/beta/RenterWaitlist"));
// Damage Report pages
const ReportDamage = lazy(() => import("./pages/damage/ReportDamage"));
const DamageReportStatus = lazy(() => import("./pages/damage/DamageReportStatus"));
// Legal pages - lazy load
const TermsOfService = lazy(() => import("./pages/legal/TermsOfService"));
const PrivacyPolicy = lazy(() => import("./pages/legal/PrivacyPolicy"));
const RefundPolicy = lazy(() => import("./pages/legal/RefundPolicy"));
const PartnerAgreement = lazy(() => import("./pages/legal/PartnerAgreement"));
const InsurancePolicy = lazy(() => import("./pages/legal/InsurancePolicy"));
const AccessibilityStatement = lazy(() => import("./pages/legal/AccessibilityStatement"));
const CookiePolicy = lazy(() => import("./pages/legal/CookiePolicy"));
const CancellationPolicy = lazy(() => import("./pages/legal/CancellationPolicy"));
const PartnerDisclosure = lazy(() => import("./pages/legal/PartnerDisclosure"));
const DoNotSell = lazy(() => import("./pages/legal/DoNotSell"));
// Legal micro-pages removed — catch-all handles them
const SecurityIncident = lazy(() => import("./pages/legal/SecurityIncident"));
const InsuranceDisclaimer = lazy(() => import("./pages/legal/InsuranceDisclaimer"));
// P2P Legal pages
const RenterTerms = lazy(() => import("./pages/legal/RenterTerms"));
const OwnerTerms = lazy(() => import("./pages/legal/OwnerTerms"));
const DamagePolicy = lazy(() => import("./pages/legal/DamagePolicy"));
const AffiliateDisclosure = lazy(() => import("./pages/AffiliateDisclosure"));
const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Contact"));
const HowItWorks = lazy(() => import("./pages/HowItWorks"));
const Partners = lazy(() => import("./pages/Partners"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Terms = lazy(() => import("./pages/Terms"));
const Refunds = lazy(() => import("./pages/Refunds"));
const Company = lazy(() => import("./pages/Company"));
const Security = lazy(() => import("./pages/Security"));
const PrivacySecurity = lazy(() => import("./pages/PrivacySecurity"));
const AccountSecurity = lazy(() => import("./pages/account/AccountSecurity"));
const PreferencesPage = lazy(() => import("./pages/account/PreferencesPage"));
const PrivacyControls = lazy(() => import("./pages/account/PrivacyControls"));
const NotificationSettings = lazy(() => import("./pages/account/NotificationSettings"));
const AccountReferralsPage = lazy(() => import("./pages/account/ReferralsPage"));
const AccountWalletPage = lazy(() => import("./pages/account/WalletPage"));
const MyReviewsPage = lazy(() => import("./pages/account/MyReviewsPage"));
const GiftCardsPage = lazy(() => import("./pages/account/GiftCardsPage"));
const GiftCardSuccessPage = lazy(() => import("./pages/account/GiftCardSuccessPage"));
const AccountAddressesPage = lazy(() => import("./pages/account/AddressesPage"));
const AccountFavoritesPage = lazy(() => import("./pages/account/FavoritesPage"));
const AccountBusinessPage = lazy(() => import("./pages/account/BusinessAccountPage"));
const AccountInvoicesPage = lazy(() => import("./pages/account/BusinessInvoicesPage"));
const AccountVerificationPage = lazy(() => import("./pages/account/VerificationPage"));
const TrustLevelPage = lazy(() => import("./pages/account/TrustLevelPage"));
const SecurityReport = lazy(() => import("./pages/security/SecurityReport"));
const ZeroTrustPolicy = lazy(() => import("./pages/security/ZeroTrustPolicy"));
const ScaleProtection = lazy(() => import("./pages/security/ScaleProtection"));
const RealtimeMonitoring = lazy(() => import("./pages/security/RealtimeMonitoring"));
const DataProtection = lazy(() => import("./pages/security/DataProtection"));
const PrivacyCompliance = lazy(() => import("./pages/security/PrivacyCompliance"));
const TrustCertification = lazy(() => import("./pages/security/TrustCertification"));
const ScamPrevention = lazy(() => import("./pages/security/ScamPrevention"));
const SecurityOperations = lazy(() => import("./pages/security/SecurityOperations"));
const DisasterRecovery = lazy(() => import("./pages/security/DisasterRecovery"));
const VulnerabilityDisclosure = lazy(() => import("./pages/security/VulnerabilityDisclosure"));
const Status = lazy(() => import("./pages/Status"));
const FAQPage = lazy(() => import("./pages/FAQPage"));
const BookingReturn = lazy(() => import("./pages/BookingReturnPage"));
const Feedback = lazy(() => import("./pages/Feedback"));
const Roadmap = lazy(() => import("./pages/Roadmap"));
const APIPartners = lazy(() => import("./pages/business/APIPartners"));
const BusinessDashboard = lazy(() => import("./pages/business/BusinessDashboard"));
const BusinessLandingPage = lazy(() => import("./pages/business/BusinessLandingPage"));
const AITripPlanner = lazy(() => import("./pages/AITripPlanner"));
const ZivoPlus = lazy(() => import("./pages/ZivoPlus"));
const MembershipPage = lazy(() => import("./pages/MembershipPage"));
const PromosPage = lazy(() => import("./pages/account/PromosPage"));
const Vision = lazy(() => import("./pages/Vision"));
// Corporate & Brand pages
const BrandMission = lazy(() => import("./pages/BrandMission"));
const CompanyProfile = lazy(() => import("./pages/CompanyProfile"));
// InvestorRelations, StrategicPartnerships, FinancialTransparency, EcosystemMap, StrategicRoadmap removed — use catch-all
const Careers = lazy(() => import("./pages/Careers"));
const ForCustomers = lazy(() => import("./pages/ForCustomers"));
const Drive = lazy(() => import("./pages/Drive"));
const ForRestaurants = lazy(() => import("./pages/ForRestaurants"));
const Reliability = lazy(() => import("./pages/Reliability"));
const PartnerAuditDocs = lazy(() => import("./pages/business/PartnerAuditDocs"));
const EnterpriseReady = lazy(() => import("./pages/business/EnterpriseReady"));
const TrustStatement = lazy(() => import("./pages/TrustStatement"));

// Support pages
const Help = lazy(() => import("./pages/Help"));
const TravelBookingsSupport = lazy(() => import("./pages/support/TravelBookings"));
const SiteIssuesSupport = lazy(() => import("./pages/support/SiteIssues"));
const UserSupportTicketsPage = lazy(() => import("./pages/support/UserSupportTicketsPage"));
const LiveSupportChatPage = lazy(() => import("./pages/support/LiveSupportChatPage"));
const PartnerOverview = lazy(() => import("./pages/partner/Overview"));

const VerifyPhonePage = lazy(() => import("./pages/VerifyPhonePage"));

const SellerOfTravel = lazy(() => import("./pages/legal/SellerOfTravel"));

const TicketDetailPage = lazy(() => import("./pages/support/TicketDetailPage"));

// Driver batch page
const DriverBatchPage = lazy(() => import("./pages/driver/DriverBatchPage"));
// Accept Invitation
const AcceptInvite = lazy(() => import("./pages/AcceptInvite"));

// Public Rating Page
const RateOrderPage = lazy(() => import("./pages/rate/RateOrderPage"));

// Order Tracking
const OrderTrackingPage = lazy(() => import("./pages/track/OrderTrackingPage"));

// Outbound redirect page
const OutboundRedirect = lazy(() => import("./pages/OutboundRedirect"));
// TrackingTest removed
const Offline = lazy(() => import("./pages/Offline"));
const DeleteAccountPage = lazy(() => import("./pages/profile/DeleteAccountPage"));

// SEO pages
const FlightToCity = lazy(() => import("./pages/seo/FlightToCity"));
const FlightRoutePage = lazy(() => import("./pages/seo/FlightRoutePage"));
const DealsPage = lazy(() => import("./pages/seo/DealsPage"));
const SeasonalDealPage = lazy(() => import("./pages/seo/SeasonalDealPage"));
const CountryHubPage = lazy(() => import("./pages/seo/CountryHubPage"));
const LocalizedFlightRoutePage = lazy(() => import("./pages/seo/LocalizedFlightRoutePage"));
const CityLandingPage = lazy(() => import("./pages/seo/CityLandingPage"));
const HotelCityLandingPage = lazy(() => import("./pages/seo/HotelCityLandingPage"));

// Rewards/Loyalty
const RewardsPage = lazy(() => import("./pages/RewardsPage"));
const SpendingPage = lazy(() => import("./pages/account/SpendingPage"));
const ActivityPage = lazy(() => import("./pages/account/ActivityPage"));
const CustomerDisputesPage = lazy(() => import("./pages/CustomerDisputesPage"));

const PartnerWithZivo = lazy(() => import("./pages/business/PartnerWithZivo"));
const CorporateTravel = lazy(() => import("./pages/business/CorporateTravel"));

// Guide pages
const GuidesIndex = lazy(() => import("./pages/guides/GuidesIndex"));
const CheapFlightsGuide = lazy(() => import("./pages/guides/CheapFlightsGuide"));
const CityGuide = lazy(() => import("./pages/guides/CityGuide"));
const BestTimeToBook = lazy(() => import("./pages/guides/BestTimeToBook"));

// Referral program
const ReferralProgram = lazy(() => import("./pages/ReferralProgram"));

// Operations & Launch pages
const BookingManagement = lazy(() => import("./pages/BookingManagement"));
// HowZivoMakesMoney removed
const Press = lazy(() => import("./pages/Press"));

// Internal investor pages removed

// Ad landing pages - lazy load
const FlightsAdLanding = lazy(() => import("./pages/ads/FlightsAdLanding"));
const HotelsAdLanding = lazy(() => import("./pages/ads/HotelsAdLanding"));
const CarsAdLanding = lazy(() => import("./pages/ads/CarsAdLanding"));
const TransfersAdLanding = lazy(() => import("./pages/ads/TransfersAdLanding"));
const ActivitiesAdLanding = lazy(() => import("./pages/ads/ActivitiesAdLanding"));

// Creator pages - lazy load
// Creators index removed
const CreatorDashboard = lazy(() => import("./pages/creators/CreatorDashboard"));
const FlightsCreatorLanding = lazy(() => import("./pages/creators/FlightsCreatorLanding"));
const HotelsCreatorLanding = lazy(() => import("./pages/creators/HotelsCreatorLanding"));
const CarsCreatorLanding = lazy(() => import("./pages/creators/CarsCreatorLanding"));

// Monetization pages - lazy load
const Deals = lazy(() => import("./pages/Deals"));
const LastMinute = lazy(() => import("./pages/LastMinute"));
const TravelWallet = lazy(() => import("./pages/TravelWallet"));
const DataInsights = lazy(() => import("./pages/business/DataInsights"));

// Compliance & Enterprise Trust pages - lazy load
const ComplianceCenter = lazy(() => import("./pages/ComplianceCenter"));
const EnterpriseTrust = lazy(() => import("./pages/security/EnterpriseTrust"));
// PaymentTransparency, RegulatoryStatus removed — use catch-all

// LP (Ad-safe landing pages) - lazy load
const FlightsLP = lazy(() => import("./pages/lp/FlightsLP"));
const HotelsLP = lazy(() => import("./pages/lp/HotelsLP"));
const CarsLP = lazy(() => import("./pages/lp/CarsLP"));
const ExtrasLP = lazy(() => import("./pages/lp/ExtrasLP"));
const ExtrasCreatorLanding = lazy(() => import("./pages/creators/ExtrasCreatorLanding"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: (failureCount, error) => {
        const info = categorizeError(error);
        if (info.type === "auth") return false;
        return failureCount < 2;
      },
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 8000),
    },
    mutations: {
      retry: (failureCount, error) => {
        const info = categorizeError(error);
        return info.type === "network" && failureCount < 1;
      },
    },
  },
});

// Premium loading fallback
const PageLoader = () => (
  <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden">
    {/* Background decoration */}
    <div className="absolute inset-0 bg-gradient-radial from-primary/8 via-transparent to-transparent opacity-60" />
    <div className="absolute top-1/4 right-0 w-[400px] h-[400px] bg-gradient-to-bl from-primary/10 to-teal-500/5 rounded-full blur-3xl" />
    <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-gradient-to-tr from-violet-500/8 to-purple-500/5 rounded-full blur-3xl" />
    
    <div className="flex flex-col items-center gap-4 relative z-10">
      <div className="relative">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-teal-400 flex items-center justify-center shadow-xl shadow-primary/30 animate-pulse">
          <Loader2 className="w-8 h-8 text-white animate-spin" />
        </div>
        {/* Glow ring */}
        <div className="absolute inset-0 rounded-2xl bg-primary/20 blur-xl animate-pulse" />
      </div>
      <p className="text-sm text-muted-foreground font-medium">Loading...</p>
    </div>
  </div>
);

// Component that applies brand theme when brand changes
function BrandThemeApplicator() {
  const { brand } = useBrand();

  useEffect(() => {
    if (brand.primaryColor) {
      applyBrandTheme(brand.primaryColor);
    } else {
      resetBrandTheme();
    }
  }, [brand.primaryColor]);

  return null;
}

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="system" storageKey="hizovo-theme">
  <QueryClientProvider client={queryClient}>
  <BrandProvider>
    <GoogleMapProvider>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <CustomerCityProvider>
          <CurrencyProvider>
          <UTMProvider>
          <RealtimeSyncProvider>
          <RideStoreProvider>
            <PreferencesSync />
            <Suspense fallback={<PageLoader />}>
              <Routes>
                {/* Eager loaded routes */}
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />

                {/* App (Mobile-first) Routes */}
                <Route path="/app" element={<SetupRequiredRoute><UnifiedDashboard /></SetupRequiredRoute>} />
                <Route path="/app/home" element={<SetupRequiredRoute><AppHome /></SetupRequiredRoute>} />
                <Route path="/my-trips" element={<SetupRequiredRoute><MyTripsPage /></SetupRequiredRoute>} />
                <Route path="/wallet" element={<SetupRequiredRoute><WalletPage /></SetupRequiredRoute>} />
                <Route path="/support" element={<SetupRequiredRoute><SupportCenterPage /></SetupRequiredRoute>} />
                <Route path="/travel" element={<SetupRequiredRoute><AppTravel /></SetupRequiredRoute>} />
                <Route path="/rides" element={<SetupRequiredRoute><Rides /></SetupRequiredRoute>} />
                
                <Route path="/eats" element={<SetupRequiredRoute><Eats /></SetupRequiredRoute>} />
                <Route path="/food" element={<SetupRequiredRoute><Eats /></SetupRequiredRoute>} />
                <Route path="/move" element={<SetupRequiredRoute><Move /></SetupRequiredRoute>} />
                <Route path="/more" element={<SetupRequiredRoute><AppMore /></SetupRequiredRoute>} />
                <Route path="/scheduled" element={<SetupRequiredRoute><ScheduledBookingsPage /></SetupRequiredRoute>} />
                <Route path="/request-service" element={<SetupRequiredRoute><RequestServicePage /></SetupRequiredRoute>} />
                <Route path="/request-ride" element={<SetupRequiredRoute><RequestRidePage /></SetupRequiredRoute>} />
                <Route path="/verify-phone" element={<ProtectedRoute><VerifyPhonePage /></ProtectedRoute>} />
                <Route path="/trip-status/:jobId" element={<SetupRequiredRoute><TripStatusPage /></SetupRequiredRoute>} />
                <Route path="/receipt/:jobId" element={<SetupRequiredRoute><ReceiptPage /></SetupRequiredRoute>} />

                {/* New Mobile App Routes (5-tab nav) */}
                <Route path="/search" element={<SetupRequiredRoute><MobileSearch /></SetupRequiredRoute>} />
                <Route path="/trips" element={<SetupRequiredRoute><MobileTrips /></SetupRequiredRoute>} />
                <Route path="/alerts" element={<SetupRequiredRoute><MobileAlerts /></SetupRequiredRoute>} />
                <Route path="/account" element={<SetupRequiredRoute><MobileAccount /></SetupRequiredRoute>} />
                
                {/* Legacy routes - redirect with query params preserved */}
                <Route path="/book-flight" element={<PreserveQueryRedirect to="/flights" />} />
                <Route path="/book-hotel" element={<PreserveQueryRedirect to="/hotels" />} />
                <Route path="/zivo-rides" element={<PreserveQueryRedirect to="/rides" />} />
                <Route path="/zivo-eats" element={<PreserveQueryRedirect to="/eats" />} />
                <Route path="/travel-extras" element={<PreserveQueryRedirect to="/extras" />} />
                
                {/* ZIVO Eats Routes */}
                <Route path="/eats/restaurants" element={<EatsRestaurants />} />
                <Route path="/eats/restaurant/:id" element={<EatsRestaurantMenu />} />
                <Route path="/eats/cart" element={<EatsCart />} />
                <Route path="/eats/checkout" element={<EatsCheckout />} />
                <Route path="/eats/address" element={<EatsAddress />} />
                <Route path="/eats/orders" element={<EatsOrders />} />
                <Route path="/eats/orders/:id" element={<EatsOrderDetail />} />
                <Route path="/eats/orders/:id/replay" element={<EatsDeliveryReplay />} />
                <Route path="/eats/orders/:id/chat" element={<ProtectedRoute><EatsOrderChatPage /></ProtectedRoute>} />
                <Route path="/eats/orders/:id/receipt" element={<EatsReceipt />} />
                <Route path="/eats/group/:inviteCode" element={<EatsGroupOrder />} />
                <Route path="/eats/alerts" element={<EatsAlerts />} />
                <Route path="/eats/favorites" element={<EatsFavorites />} />
                
                {/* Unified Notifications Center */}
                <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
                
                {/* Driver Chat Route */}
                <Route path="/driver/orders/:id/chat" element={<ProtectedRoute><DriverOrderChatPage /></ProtectedRoute>} />
                
                {/* Merchant Chat Route */}
                <Route path="/merchant/orders/:id/chat" element={<ProtectedRoute><MerchantOrderChatPage /></ProtectedRoute>} />
                
                {/* SEO Flight Landing Pages */}
                <Route path="/flights" element={<FlightLanding />} />
                <Route path="/flights/from-:fromCity" element={<FlightLanding />} />
                <Route path="/flights/to-:toCity" element={<FlightLanding />} />
                <Route path="/flights/to/:citySlug" element={<FlightToCity />} />
                <Route path="/flights/cities/:citySlug" element={<FlightCityPage />} />
                <Route path="/flights/:origin-to-:destination" element={<FlightRoutePage />} />
                <Route path="/flights/:route" element={<FlightLanding />} />
                
                {/* City SEO Landing Pages */}
                <Route path="/city/:citySlug" element={<CityLandingPage />} />
                <Route path="/hotels/:city" element={<HotelCityLandingPage />} />
                
                {/* Business pages */}
                <Route path="/partner-with-zivo" element={<PartnerWithZivo />} />
                <Route path="/partners" element={<PartnerWithZivo />} />
                
                {/* Airport Pages - SEO */}
                <Route path="/airports/:iata" element={<AirportPage />} />
                
                <Route path="/flights/results" element={<FlightResults />} />
                <Route path="/flights/live" element={<FlightLive />} />
                <Route path="/flights/details/:id" element={<FlightDetails />} />
                <Route path="/flights/traveler" element={<FlightTravelerInfo />} />
                <Route path="/flights/traveler-info" element={<FlightTravelerInfo />} />
                <Route path="/flights/checkout" element={<FlightCheckout />} />
                <Route path="/flights/confirmation/:bookingId" element={<FlightConfirmation />} />
                <Route path="/legal/flight-terms" element={<FlightTerms />} />
                <Route path="/booking/duffel-checkout" element={<DuffelCheckout />} />
                <Route path="/checkout" element={<EmbeddedCheckout />} />
                
                {/* Travel Checkout (Hotels/Activities/Transfers) */}
                <Route path="/travel/checkout" element={<TravelCheckoutPage />} />
                <Route path="/confirmation/:orderNumber" element={<TravelConfirmationPage />} />
                <Route path="/my-orders" element={<MyOrdersPage />} />
                
                {/* Enhanced My Trips (Travel Bookings Dashboard) */}
                <Route path="/my-trips" element={<TravelTripsPage />} />
                <Route path="/my-trips/:orderNumber" element={<TravelOrderDetailPage />} />
                
                {/* Hotels Pages */}
                <Route path="/hotels" element={<HotelsPage />} />
                <Route path="/hotels/:city" element={<HotelsPage />} />
                <Route path="/hotels/in-:city" element={<HotelsPage />} />
                <Route path="/book-hotel" element={<PreserveQueryRedirect to="/hotels" />} />
                
                {/* SEO Car Rental Landing Pages */}
                <Route path="/car-rental" element={<CarRentalLanding />} />
                <Route path="/car-rental/in-:location" element={<CarRentalLanding />} />
                <Route path="/rent-car" element={<CarRentalBooking />} />
                <Route path="/rent-car/results" element={<CarResultsPage />} />
                <Route path="/rent-car/detail" element={<CarDetailPage />} />
                <Route path="/rent-car/traveler-info" element={<CarTravelerInfoPage />} />
                <Route path="/rent-car/checkout" element={<CarCheckoutPage />} />
                <Route path="/rent-car/confirmation" element={<CarConfirmationPage />} />
                <Route path="/rent-car/:city" element={<CarRentalLanding />} />
                <Route path="/cars/search" element={<CarSearch />} />
                
                {/* ZIVO Ride - Premium Rider Flow */}
                <Route path="/ride" element={<RidePage />} />
                <Route path="/ride/confirm" element={<RideConfirmPage />} />
                <Route path="/ride/searching" element={<RideSearchingPage />} />
                <Route path="/ride/driver" element={<RideDriverPage />} />
                <Route path="/ride/trip" element={<RideTripPage />} />
                <Route path="/rides/history" element={<SetupRequiredRoute><TripHistory /></SetupRequiredRoute>} />
                <Route path="/payment-methods" element={<SetupRequiredRoute><PaymentMethodsPage /></SetupRequiredRoute>} />
                
                {/* Rider Help & Support */}
                <Route path="/help" element={<SetupRequiredRoute><RiderHelpPage /></SetupRequiredRoute>} />
                <Route path="/help/new" element={<SetupRequiredRoute><NewTicketPage /></SetupRequiredRoute>} />
                <Route path="/help/tickets" element={<SetupRequiredRoute><MyTicketsPage /></SetupRequiredRoute>} />
                <Route path="/support/chat" element={<SetupRequiredRoute><LiveSupportChatPage /></SetupRequiredRoute>} />
                
                {/* ZIVO Driver App Routes */}
                <Route path="/driver" element={<DriverHomePage />} />
                <Route path="/driver/login" element={<DriverLoginPage />} />
                <Route path="/driver/trips" element={<DriverTripsPage />} />
                <Route path="/driver/account" element={<DriverAccountPage />} />
                
                <Route path="/profile" element={<SetupRequiredRoute><Profile /></SetupRequiredRoute>} />
                <Route path="/traveler" element={<ProtectedRoute><TravelerDashboard /></ProtectedRoute>} />
                <Route path="/profile/delete-account" element={<ProtectedRoute><DeleteAccountPage /></ProtectedRoute>} />
                <Route path="/trips" element={<SetupRequiredRoute><TripHistory /></SetupRequiredRoute>} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/dashboard" element={<SetupRequiredRoute><CustomerDashboard /></SetupRequiredRoute>} />
                <Route path="/restaurant" element={<RestaurantDashboard />} />
                <Route path="/car-rental-dashboard" element={<CarRentalDashboard />} />
                <Route path="/flights-dashboard" element={<FlightDashboard />} />
                <Route path="/hotels-dashboard" element={<HotelDashboard />} />
                <Route path="/auth-callback" element={<AuthCallback />} />
                <Route path="/setup" element={<Setup />} />
                <Route path="/onboarding" element={<Onboarding />} />
                <Route path="/verify-email" element={<VerifyEmail />} />
                <Route path="/verify-otp" element={<VerifyOTP />} />
                <Route path="/terms-of-service" element={<TermsOfService />} />
                <Route path="/legal/terms" element={<TermsOfService />} />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/legal/privacy" element={<PrivacyPolicy />} />
                <Route path="/refund-policy" element={<RefundPolicy />} />
                <Route path="/legal/refunds" element={<RefundPolicy />} />
                <Route path="/partner-agreement" element={<PartnerAgreement />} />
                {/* Removed legal micro-pages — all handled by catch-all NotFound */}
                <Route path="/legal/accessibility" element={<AccessibilityStatement />} />
                <Route path="/legal/do-not-sell" element={<DoNotSell />} />
                <Route path="/legal/partner-disclosure" element={<PartnerDisclosure />} />
                <Route path="/legal/cancellation" element={<CancellationPolicy />} />
                <Route path="/legal/security-incident" element={<SecurityIncident />} />
                <Route path="/legal/seller-of-travel" element={<SellerOfTravel />} />
                <Route path="/legal/renter-terms" element={<RenterTerms />} />
                <Route path="/legal/owner-terms" element={<OwnerTerms />} />
                <Route path="/legal/damage-policy" element={<DamagePolicy />} />
                <Route path="/affiliate-disclosure" element={<AffiliateDisclosure />} />

                {/* Public Pages */}
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/how-it-works" element={<HowItWorks />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/refunds" element={<Refunds />} />
                <Route path="/company" element={<Company />} />
                <Route path="/security" element={<Security />} />
                <Route path="/ai-trip-planner" element={<AITripPlanner />} />
                <Route path="/zivo-plus" element={<ZivoPlus />} />
                <Route path="/vision" element={<Vision />} />
                <Route path="/press" element={<Press />} />
                {/* how-zivo-makes-money removed */}
                <Route path="/for-customers" element={<ForCustomers />} />
                <Route path="/drive" element={<Drive />} />
                <Route path="/for-restaurants" element={<ForRestaurants />} />
                <Route path="/promotions" element={<Promotions />} />
                <Route path="/help-center" element={<HelpCenter />} />
                <Route path="/compliance" element={<ComplianceCenter />} />
                <Route path="/enterprise-trust" element={<EnterpriseTrust />} />
                {/* payment-transparency removed */}
                <Route path="/partner-audit-docs" element={<PartnerAuditDocs />} />
                <Route path="/reliability" element={<Reliability />} />
                <Route path="/enterprise-ready" element={<EnterpriseReady />} />
                {/* regulatory-status removed */}
                <Route path="/restaurant-registration" element={<RestaurantRegistration />} />
                <Route path="/list-your-car" element={<ListYourCar />} />

                {/* Security Pages */}
                <Route path="/security/report" element={<SecurityReport />} />
                <Route path="/security/zero-trust" element={<ZeroTrustPolicy />} />
                <Route path="/security/scale-protection" element={<ScaleProtection />} />
                <Route path="/security/monitoring" element={<RealtimeMonitoring />} />
                <Route path="/security/data-protection" element={<DataProtection />} />
                <Route path="/security/privacy-compliance" element={<PrivacyCompliance />} />
                <Route path="/security/trust" element={<TrustCertification />} />
                <Route path="/security/scams" element={<ScamPrevention />} />
                <Route path="/security/operations" element={<SecurityOperations />} />
                <Route path="/security/disaster-recovery" element={<DisasterRecovery />} />
                <Route path="/security/vulnerability-disclosure" element={<VulnerabilityDisclosure />} />
                <Route path="/status" element={<Status />} />
                <Route path="/privacy-security" element={<PrivacySecurity />} />
                <Route path="/account/security" element={<ProtectedRoute><AccountSecurity /></ProtectedRoute>} />
                <Route path="/account/privacy" element={<ProtectedRoute><PrivacyControls /></ProtectedRoute>} />
                <Route path="/account/notifications" element={<ProtectedRoute><NotificationSettings /></ProtectedRoute>} />
                <Route path="/account/referrals" element={<ProtectedRoute><AccountReferralsPage /></ProtectedRoute>} />
                <Route path="/account/wallet" element={<ProtectedRoute><AccountWalletPage /></ProtectedRoute>} />
                <Route path="/account/reviews" element={<ProtectedRoute><MyReviewsPage /></ProtectedRoute>} />
                <Route path="/account/gift-cards" element={<ProtectedRoute><GiftCardsPage /></ProtectedRoute>} />
                <Route path="/account/gift-cards/success" element={<ProtectedRoute><GiftCardSuccessPage /></ProtectedRoute>} />
                <Route path="/account/addresses" element={<ProtectedRoute><AccountAddressesPage /></ProtectedRoute>} />
                <Route path="/account/saved-places" element={<ProtectedRoute><AccountAddressesPage /></ProtectedRoute>} />
                <Route path="/account/favorites" element={<ProtectedRoute><AccountFavoritesPage /></ProtectedRoute>} />
                <Route path="/account/spending" element={<ProtectedRoute><SpendingPage /></ProtectedRoute>} />
                <Route path="/account/activity" element={<ProtectedRoute><ActivityPage /></ProtectedRoute>} />
                <Route path="/cookies" element={<CookiePolicy />} />
                <Route path="/cancellation-policy" element={<CancellationPolicy />} />
                <Route path="/faq" element={<FAQPage />} />
                <Route path="/booking/return" element={<BookingReturn />} />
                <Route path="/package-delivery" element={<PackageDelivery />} />
                <Route path="/ground-transport" element={<GroundTransport />} />
                {/* events removed */}
                <Route path="/things-to-do" element={<ThingsToDo />} />
                <Route path="/activities" element={<ThingsToDo />} />
                <Route path="/experiences" element={<ThingsToDo />} />
                <Route path="/travel-insurance" element={<TravelInsurance />} />
                <Route path="/extras" element={<TravelExtras />} />
                <Route path="/deals" element={<DealsPage />} />
                <Route path="/deals/:slug" element={<SeasonalDealPage />} />
                
                {/* Country Hub Pages - International SEO */}
                <Route path="/:countrySlug" element={<CountryHubPage />} />
                <Route path="/:countrySlug/flights/:routeSlug" element={<LocalizedFlightRoutePage />} />
                
                <Route path="/install" element={<Install />} />
                
                {/* Rewards / Loyalty */}
                <Route path="/rewards" element={<RewardsPage />} />
                <Route path="/rewards/redeem" element={<RewardsPage />} />
                
                {/* ZIVO+ Membership */}
                <Route path="/membership" element={<MembershipPage />} />
                <Route path="/account/membership" element={<ProtectedRoute><MembershipPage /></ProtectedRoute>} />
                
                {/* Business Account */}
                <Route path="/account/business" element={<ProtectedRoute><AccountBusinessPage /></ProtectedRoute>} />
                <Route path="/account/invoices" element={<ProtectedRoute><AccountInvoicesPage /></ProtectedRoute>} />
                
                {/* Identity Verification */}
                <Route path="/account/verification" element={<ProtectedRoute><AccountVerificationPage /></ProtectedRoute>} />
                
                {/* Account Trust Level */}
                <Route path="/account/trust" element={<ProtectedRoute><TrustLevelPage /></ProtectedRoute>} />

                {/* Promo Codes */}
                <Route path="/account/promos" element={<ProtectedRoute><PromosPage /></ProtectedRoute>} />
                <Route path="/account/disputes" element={<ProtectedRoute><CustomerDisputesPage /></ProtectedRoute>} />
                
                {/* Driver Analytics & Activity */}
                <Route path="/driver/analytics" element={<DriverAnalyticsPage />} />
                <Route path="/driver/activity" element={<DriverActivityPage />} />
                
                {/* Cars Pages */}
                <Route path="/cars" element={<Cars />} />
                <Route path="/cars/search" element={<CarsSearchPage />} />
                <Route path="/cars/:id" element={<CarsDetailPage />} />
                <Route path="/how-to-rent" element={<HowToRent />} />
                
                {/* Owner Dashboard Routes */}
                <Route path="/owner/apply" element={<OwnerApply />} />
                <Route path="/owner/dashboard" element={<ProtectedRoute><OwnerDashboard /></ProtectedRoute>} />
                <Route path="/owner/profile" element={<ProtectedRoute><OwnerProfile /></ProtectedRoute>} />
                <Route path="/owner/cars" element={<ProtectedRoute><OwnerCars /></ProtectedRoute>} />
                <Route path="/owner/cars/add" element={<ProtectedRoute><AddVehicle /></ProtectedRoute>} />
                <Route path="/owner/cars/:id/edit" element={<ProtectedRoute><EditVehicle /></ProtectedRoute>} />
                <Route path="/owner/cars/:id/availability" element={<ProtectedRoute><VehicleAvailability /></ProtectedRoute>} />
                <Route path="/owner/bookings" element={<ProtectedRoute><OwnerBookings /></ProtectedRoute>} />
                <Route path="/owner/payouts" element={<ProtectedRoute><OwnerPayouts /></ProtectedRoute>} />
                <Route path="/owner/earnings" element={<ProtectedRoute><OwnerEarningsPage /></ProtectedRoute>} />
                <Route path="/owner/stripe-return" element={<StripeConnectReturn />} />
                
                {/* P2P Car Rental Routes */}
                <Route path="/p2p/search" element={<P2PVehicleSearch />} />
                <Route path="/p2p/vehicle/:id" element={<P2PVehicleDetail />} />
                <Route path="/p2p/confirmation/:id" element={<P2PBookingConfirmation />} />
                <Route path="/p2p/trips" element={<ProtectedRoute><RenterTrips /></ProtectedRoute>} />
                
                {/* Renter Dashboard */}
                <Route path="/renter/dashboard" element={<ProtectedRoute><RenterDashboard /></ProtectedRoute>} />
                <Route path="/renter/bookings" element={<ProtectedRoute><RenterBookings /></ProtectedRoute>} />
                
                {/* Renter Verification */}
                <Route path="/verify/renter" element={<ProtectedRoute><RenterVerification /></ProtectedRoute>} />
                <Route path="/verify/status" element={<ProtectedRoute><VerificationStatus /></ProtectedRoute>} />
                
                {/* Beta / Waitlist */}
                <Route path="/beta/renter-waitlist" element={<RenterWaitlist />} />
                
                {/* Damage Reports */}
                <Route path="/damage/report" element={<ProtectedRoute><ReportDamage /></ProtectedRoute>} />
                <Route path="/damage/status/:id" element={<ProtectedRoute><DamageReportStatus /></ProtectedRoute>} />
                
                {/* Fleet Dashboard */}
                <Route path="/fleet/dashboard" element={<FleetDashboard />} />
                <Route path="/fleet/onboarding" element={<FleetOnboarding />} />
                {/* Business Account */}
                <Route path="/business/account" element={<BusinessAccountPage />} />
                
                {/* Customer Loyalty */}
                <Route path="/account/loyalty" element={<ProtectedRoute><LoyaltyPage /></ProtectedRoute>} />
                <Route path="/account/achievements" element={<ProtectedRoute><AchievementsPage /></ProtectedRoute>} />
                <Route path="/account/rewards" element={<ProtectedRoute><AccountRewardsPage /></ProtectedRoute>} />
                <Route path="/account/preferences" element={<ProtectedRoute><PreferencesPage /></ProtectedRoute>} />
                
                {/* Merchant Pages */}
                <Route path="/merchant/ads" element={<ProtectedRoute><MerchantAdsPage /></ProtectedRoute>} />
                <Route path="/merchant/reviews" element={<ProtectedRoute><MerchantReviewsPage /></ProtectedRoute>} />

                {/* Booking Management */}
                <Route path="/booking-management" element={<ProtectedRoute><BookingManagement /></ProtectedRoute>} />
                
                {/* Public Support Pages */}
                <Route path="/help" element={<Help />} />
                <Route path="/support/travel-bookings" element={<TravelBookingsSupport />} />
                <Route path="/support/site-issues" element={<SiteIssuesSupport />} />
                <Route path="/support/tickets" element={<ProtectedRoute><UserSupportTicketsPage /></ProtectedRoute>} />
                <Route path="/partner/overview" element={<PartnerOverview />} />
                {/* Offline fallback page for PWA */}
                <Route path="/offline" element={<Offline />} />
                {/* Outbound redirect for affiliate tracking */}
                <Route path="/out" element={<OutboundRedirect />} />
                {/* tracking-test removed */}
                {/* Ad Landing Pages - for paid traffic */}
                <Route path="/ads/flights" element={<FlightsAdLanding />} />
                <Route path="/ads/hotels" element={<HotelsAdLanding />} />
                <Route path="/ads/car-rental" element={<CarsAdLanding />} />
                <Route path="/ads/transfers" element={<TransfersAdLanding />} />
                <Route path="/ads/activities" element={<ActivitiesAdLanding />} />
                {/* Creator Pages - for influencer traffic */}
                {/* creators index falls through to catch-all */}
                <Route path="/creators/dashboard" element={<ProtectedRoute><CreatorDashboard /></ProtectedRoute>} />
                <Route path="/creators/flights" element={<FlightsCreatorLanding />} />
                <Route path="/creators/hotels" element={<HotelsCreatorLanding />} />
                <Route path="/creators/car-rental" element={<CarsCreatorLanding />} />
                <Route path="/creators/extras" element={<ExtrasCreatorLanding />} />
                {/* Monetization Pages */}
                <Route path="/last-minute" element={<LastMinute />} />
                <Route path="/wallet" element={<ProtectedRoute><TravelWallet /></ProtectedRoute>} />
                <Route path="/business/insights" element={<DataInsights />} />
                <Route path="/data-insights" element={<DataInsights />} />
                {/* LP Pages - Ad-safe landing pages for paid traffic */}
                <Route path="/lp/flights" element={<FlightsLP />} />
                <Route path="/lp/hotels" element={<HotelsLP />} />
                <Route path="/lp/cars" element={<CarsLP />} />
                <Route path="/lp/extras" element={<ExtrasLP />} />
                {/* Guide Pages */}
                <Route path="/guides" element={<GuidesIndex />} />
                <Route path="/guides/cheap-flights" element={<CheapFlightsGuide />} />
                <Route path="/guides/best-time-to-book" element={<BestTimeToBook />} />
                <Route path="/guides/:citySlug" element={<CityGuide />} />
                {/* Referral & Corporate */}
                <Route path="/referrals" element={<ReferralProgram />} />
                <Route path="/invite" element={<ReferralProgram />} />
                <Route path="/corporate" element={<CorporateTravel />} />
                <Route path="/business-travel" element={<CorporateTravel />} />
                {/* Business & Enterprise */}
                <Route path="/business" element={<BusinessLandingPage />} />
                <Route path="/api-partners" element={<APIPartners />} />
                <Route path="/developers" element={<APIPartners />} />
                <Route path="/business/dashboard" element={<ProtectedRoute><BusinessDashboard /></ProtectedRoute>} />
                {/* Feedback & Roadmap */}
                <Route path="/feedback" element={<Feedback />} />
                <Route path="/roadmap" element={<Roadmap />} />
                {/* Corporate & Brand Pages */}
                <Route path="/brand" element={<BrandMission />} />
                <Route path="/mission" element={<BrandMission />} />
                <Route path="/company-profile" element={<CompanyProfile />} />
                {/* investors, strategic-partnerships, financial-transparency removed */}
                {/* Internal pages removed */}
                <Route path="/careers" element={<Careers />} />
                <Route path="/jobs" element={<Careers />} />
                {/* ecosystem, platform, strategic-roadmap removed */}
                <Route path="/trust-statement" element={<TrustStatement />} />
                {/* Accept Team Invitation */}
                <Route path="/accept-invite" element={<AcceptInvite />} />
                {/* User Ticket Detail Page */}
                <Route path="/support/tickets/:id" element={<ProtectedRoute><TicketDetailPage /></ProtectedRoute>} />
                {/* Public Rating Page - no auth required */}
                <Route path="/rate/:code" element={<RateOrderPage />} />
                {/* Order Tracking - Customer */}
                <Route path="/track/:orderId" element={<OrderTrackingPage />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </RideStoreProvider>
          </RealtimeSyncProvider>
          </UTMProvider>
          </CurrencyProvider>
          </CustomerCityProvider>
          <CookieConsent />
          <PWAInstallPrompt />
          <PWAUpdatePrompt />
          <SpatialCursor />
          <BrandThemeApplicator />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
    </GoogleMapProvider>
  </BrandProvider>
  </QueryClientProvider>
  </ThemeProvider>
);

export default App;
