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

// App (mobile-first) pages
const AppHome = lazy(() => import("./pages/app/AppHome"));
const ScheduledBookingsPage = lazy(() => import("./pages/ScheduledBookingsPage"));
const AppTravel = lazy(() => import("./pages/app/AppTravel"));
const AppMore = lazy(() => import("./pages/app/AppMore"));
const UnifiedDashboard = lazy(() => import("./pages/app/UnifiedDashboard"));
const MyTripsPage = lazy(() => import("./pages/app/MyTripsPage"));
const WalletPage = lazy(() => import("./pages/app/WalletPage"));
const SupportCenterPage = lazy(() => import("./pages/app/SupportCenterPage"));

// Auth & Account
const NotificationsPage = lazy(() => import("./pages/NotificationsPage"));
const PaymentMethodsPage = lazy(() => import("./pages/PaymentMethodsPage"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const CustomerDashboard = lazy(() => import("./pages/CustomerDashboard"));
const AuthCallback = lazy(() => import("./pages/AuthCallback"));
const Setup = lazy(() => import("./pages/Setup"));
const Onboarding = lazy(() => import("./pages/Onboarding"));
const VerifyEmail = lazy(() => import("./pages/VerifyEmail"));
const VerifyOTP = lazy(() => import("./pages/VerifyOTP"));
const NotFound = lazy(() => import("./pages/NotFound"));
const VerifyPhonePage = lazy(() => import("./pages/VerifyPhonePage"));
const Profile = lazy(() => import("./pages/Profile"));
const DeleteAccountPage = lazy(() => import("./pages/profile/DeleteAccountPage"));

// Customer Loyalty
const LoyaltyPage = lazy(() => import("./pages/account/LoyaltyPage"));
const AchievementsPage = lazy(() => import("./pages/account/AchievementsPage"));
const AccountRewardsPage = lazy(() => import("./pages/account/AccountRewardsPage"));

// Flights
const FlightBooking = lazy(() => import("./pages/FlightBooking"));
const FlightLanding = lazy(() => import("./pages/FlightLanding"));
const FlightResults = lazy(() => import("./pages/FlightResults"));
const FlightDetails = lazy(() => import("./pages/FlightDetails"));
const FlightLive = lazy(() => import("./pages/FlightLive"));
const FlightTravelerInfo = lazy(() => import("./pages/FlightTravelerInfo"));
const FlightCheckout = lazy(() => import("./pages/FlightCheckout"));
const FlightConfirmation = lazy(() => import("./pages/FlightConfirmation"));
const FlightTerms = lazy(() => import("./pages/legal/FlightTerms"));
const AirportPage = lazy(() => import("./pages/AirportPage"));
const FlightCityPage = lazy(() => import("./pages/FlightCityPage"));
const DuffelCheckout = lazy(() => import("./pages/DuffelCheckout"));
const EmbeddedCheckout = lazy(() => import("./pages/EmbeddedCheckout"));
const FlightDashboard = lazy(() => import("./pages/FlightDashboard"));

// Hotels
const HotelBooking = lazy(() => import("./pages/HotelBooking"));
const HotelLanding = lazy(() => import("./pages/HotelLanding"));
const HotelsPage = lazy(() => import("./pages/HotelsPage"));
const HotelDashboard = lazy(() => import("./pages/HotelDashboard"));
const HotelResultsPage = lazy(() => import("./pages/HotelResultsPage"));

// Car Rental
const CarRentalBooking = lazy(() => import("./pages/CarRentalBooking"));
const CarResultsPage = lazy(() => import("./pages/CarResultsPage"));
const CarRentalLanding = lazy(() => import("./pages/CarRentalLanding"));
const CarDetailPage = lazy(() => import("./pages/CarDetailPage"));
const CarTravelerInfoPage = lazy(() => import("./pages/CarTravelerInfoPage"));
const CarCheckoutPage = lazy(() => import("./pages/CarCheckoutPage"));
const CarConfirmationPage = lazy(() => import("./pages/CarConfirmationPage"));
const CarSearch = lazy(() => import("./pages/CarSearch"));
const Cars = lazy(() => import("./pages/Cars"));
const CarsSearchPage = lazy(() => import("./pages/cars/CarsSearchPage"));
const CarsDetailPage = lazy(() => import("./pages/cars/CarDetailPage"));
const HowToRent = lazy(() => import("./pages/HowToRent"));

// Travel Extras & Checkout
const ThingsToDo = lazy(() => import("./pages/ThingsToDo"));
const TravelInsurance = lazy(() => import("./pages/TravelInsurance"));
const TravelExtras = lazy(() => import("./pages/TravelExtras"));
const TravelCheckoutPage = lazy(() => import("./pages/TravelCheckoutPage"));
const TravelConfirmationPage = lazy(() => import("./pages/TravelConfirmationPage"));
const MyOrdersPage = lazy(() => import("./pages/MyOrdersPage"));
const TravelTripsPage = lazy(() => import("./pages/TravelTripsPage"));
const TravelOrderDetailPage = lazy(() => import("./pages/TravelOrderDetailPage"));
const TravelerDashboard = lazy(() => import("./pages/TravelerDashboard"));

// Legal pages
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
const SecurityIncident = lazy(() => import("./pages/legal/SecurityIncident"));
const InsuranceDisclaimer = lazy(() => import("./pages/legal/InsuranceDisclaimer"));
const RenterTerms = lazy(() => import("./pages/legal/RenterTerms"));
const OwnerTerms = lazy(() => import("./pages/legal/OwnerTerms"));
const DamagePolicy = lazy(() => import("./pages/legal/DamagePolicy"));
const SellerOfTravel = lazy(() => import("./pages/legal/SellerOfTravel"));

// Public pages
const AffiliateDisclosure = lazy(() => import("./pages/AffiliateDisclosure"));
const About = lazy(() => import("./pages/About"));
const HowItWorks = lazy(() => import("./pages/HowItWorks"));
const Partners = lazy(() => import("./pages/Partners"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Terms = lazy(() => import("./pages/Terms"));
const Refunds = lazy(() => import("./pages/Refunds"));
const Company = lazy(() => import("./pages/Company"));
const Security = lazy(() => import("./pages/Security"));
const PrivacySecurity = lazy(() => import("./pages/PrivacySecurity"));
const Install = lazy(() => import("./pages/Install"));
const HelpCenter = lazy(() => import("./pages/HelpCenter"));
const Promotions = lazy(() => import("./pages/Promotions"));
const ForCustomers = lazy(() => import("./pages/ForCustomers"));
const Reliability = lazy(() => import("./pages/Reliability"));
const TrustStatement = lazy(() => import("./pages/TrustStatement"));
const Status = lazy(() => import("./pages/Status"));
const FAQPage = lazy(() => import("./pages/FAQPage"));
const BookingReturn = lazy(() => import("./pages/BookingReturnPage"));
const Feedback = lazy(() => import("./pages/Feedback"));
const Roadmap = lazy(() => import("./pages/Roadmap"));
const AITripPlanner = lazy(() => import("./pages/AITripPlanner"));
const ZivoPlus = lazy(() => import("./pages/ZivoPlus"));
const MembershipPage = lazy(() => import("./pages/MembershipPage"));
const Vision = lazy(() => import("./pages/Vision"));
const BrandMission = lazy(() => import("./pages/BrandMission"));
const CompanyProfile = lazy(() => import("./pages/CompanyProfile"));
const Careers = lazy(() => import("./pages/Careers"));
const Press = lazy(() => import("./pages/Press"));
const Offline = lazy(() => import("./pages/Offline"));
const OutboundRedirect = lazy(() => import("./pages/OutboundRedirect"));
const BookingManagement = lazy(() => import("./pages/BookingManagement"));
const Deals = lazy(() => import("./pages/Deals"));
const ComplianceCenter = lazy(() => import("./pages/ComplianceCenter"));
const RewardsPage = lazy(() => import("./pages/RewardsPage"));
const ReferralProgram = lazy(() => import("./pages/ReferralProgram"));
const Help = lazy(() => import("./pages/Help"));

// Account pages
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
const PromosPage = lazy(() => import("./pages/account/PromosPage"));
const SpendingPage = lazy(() => import("./pages/account/SpendingPage"));
const ActivityPage = lazy(() => import("./pages/account/ActivityPage"));

// Security pages
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
const EnterpriseTrust = lazy(() => import("./pages/security/EnterpriseTrust"));

// Business pages
const APIPartners = lazy(() => import("./pages/business/APIPartners"));
const BusinessDashboard = lazy(() => import("./pages/business/BusinessDashboard"));
const BusinessLandingPage = lazy(() => import("./pages/business/BusinessLandingPage"));
const BusinessAccountPage = lazy(() => import("./pages/business/BusinessAccountPage"));
const PartnerAuditDocs = lazy(() => import("./pages/business/PartnerAuditDocs"));
const EnterpriseReady = lazy(() => import("./pages/business/EnterpriseReady"));
const PartnerWithZivo = lazy(() => import("./pages/business/PartnerWithZivo"));
const CorporateTravel = lazy(() => import("./pages/business/CorporateTravel"));
const DataInsights = lazy(() => import("./pages/business/DataInsights"));

// Support pages
const TravelBookingsSupport = lazy(() => import("./pages/support/TravelBookings"));
const SiteIssuesSupport = lazy(() => import("./pages/support/SiteIssues"));
const UserSupportTicketsPage = lazy(() => import("./pages/support/UserSupportTicketsPage"));
const LiveSupportChatPage = lazy(() => import("./pages/support/LiveSupportChatPage"));
const TicketDetailPage = lazy(() => import("./pages/support/TicketDetailPage"));

// SEO pages
const FlightToCity = lazy(() => import("./pages/seo/FlightToCity"));
const FlightRoutePage = lazy(() => import("./pages/seo/FlightRoutePage"));
const DealsPage = lazy(() => import("./pages/seo/DealsPage"));
const SeasonalDealPage = lazy(() => import("./pages/seo/SeasonalDealPage"));
const CountryHubPage = lazy(() => import("./pages/seo/CountryHubPage"));
const LocalizedFlightRoutePage = lazy(() => import("./pages/seo/LocalizedFlightRoutePage"));
const CityLandingPage = lazy(() => import("./pages/seo/CityLandingPage"));
const HotelCityLandingPage = lazy(() => import("./pages/seo/HotelCityLandingPage"));

// Guide pages
const GuidesIndex = lazy(() => import("./pages/guides/GuidesIndex"));
const CheapFlightsGuide = lazy(() => import("./pages/guides/CheapFlightsGuide"));
const CityGuide = lazy(() => import("./pages/guides/CityGuide"));
const BestTimeToBook = lazy(() => import("./pages/guides/BestTimeToBook"));

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

const PageLoader = () => (
  <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden">
    <div className="absolute inset-0 bg-gradient-radial from-primary/8 via-transparent to-transparent opacity-60" />
    <div className="flex flex-col items-center gap-4 relative z-10">
      <div className="relative">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-teal-400 flex items-center justify-center shadow-xl shadow-primary/30 animate-pulse">
          <Loader2 className="w-8 h-8 text-white animate-spin" />
        </div>
      </div>
      <p className="text-sm text-muted-foreground font-medium">Loading...</p>
    </div>
  </div>
);

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
            <PreferencesSync />
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />

                {/* App Dashboard */}
                <Route path="/app" element={<SetupRequiredRoute><UnifiedDashboard /></SetupRequiredRoute>} />
                <Route path="/app/home" element={<SetupRequiredRoute><AppHome /></SetupRequiredRoute>} />
                <Route path="/my-trips" element={<SetupRequiredRoute><MyTripsPage /></SetupRequiredRoute>} />
                <Route path="/wallet" element={<SetupRequiredRoute><WalletPage /></SetupRequiredRoute>} />
                <Route path="/support" element={<SetupRequiredRoute><SupportCenterPage /></SetupRequiredRoute>} />
                <Route path="/travel" element={<SetupRequiredRoute><AppTravel /></SetupRequiredRoute>} />
                <Route path="/more" element={<SetupRequiredRoute><AppMore /></SetupRequiredRoute>} />
                <Route path="/scheduled" element={<SetupRequiredRoute><ScheduledBookingsPage /></SetupRequiredRoute>} />

                {/* Legacy redirects */}
                <Route path="/book-flight" element={<PreserveQueryRedirect to="/flights" />} />
                <Route path="/book-hotel" element={<PreserveQueryRedirect to="/hotels" />} />
                <Route path="/travel-extras" element={<PreserveQueryRedirect to="/extras" />} />

                {/* Flights */}
                <Route path="/flights" element={<FlightLanding />} />
                <Route path="/flights/from-:fromCity" element={<FlightLanding />} />
                <Route path="/flights/to-:toCity" element={<FlightLanding />} />
                <Route path="/flights/to/:citySlug" element={<FlightToCity />} />
                <Route path="/flights/cities/:citySlug" element={<FlightCityPage />} />
                <Route path="/flights/:origin-to-:destination" element={<FlightRoutePage />} />
                <Route path="/flights/:route" element={<FlightLanding />} />
                <Route path="/flights/results" element={<FlightResults />} />
                <Route path="/flights/live" element={<FlightLive />} />
                <Route path="/flights/details/:id" element={<FlightDetails />} />
                <Route path="/flights/traveler" element={<FlightTravelerInfo />} />
                <Route path="/flights/traveler-info" element={<FlightTravelerInfo />} />
                <Route path="/flights/checkout" element={<FlightCheckout />} />
                <Route path="/flights/confirmation/:bookingId" element={<FlightConfirmation />} />
                <Route path="/flights-dashboard" element={<FlightDashboard />} />
                <Route path="/airports/:iata" element={<AirportPage />} />
                <Route path="/booking/duffel-checkout" element={<DuffelCheckout />} />
                <Route path="/checkout" element={<EmbeddedCheckout />} />

                {/* Hotels */}
                <Route path="/hotels" element={<HotelsPage />} />
                <Route path="/hotels/:city" element={<HotelCityLandingPage />} />
                <Route path="/hotels/in-:city" element={<HotelsPage />} />
                <Route path="/hotels-dashboard" element={<HotelDashboard />} />

                {/* Car Rental */}
                <Route path="/car-rental" element={<CarRentalLanding />} />
                <Route path="/car-rental/in-:location" element={<CarRentalLanding />} />
                <Route path="/rent-car" element={<CarRentalBooking />} />
                <Route path="/rent-car/results" element={<CarResultsPage />} />
                <Route path="/rent-car/detail" element={<CarDetailPage />} />
                <Route path="/rent-car/traveler-info" element={<CarTravelerInfoPage />} />
                <Route path="/rent-car/checkout" element={<CarCheckoutPage />} />
                <Route path="/rent-car/confirmation" element={<CarConfirmationPage />} />
                <Route path="/rent-car/:city" element={<CarRentalLanding />} />
                <Route path="/cars" element={<Cars />} />
                <Route path="/cars/search" element={<CarsSearchPage />} />
                <Route path="/cars/:id" element={<CarsDetailPage />} />
                <Route path="/how-to-rent" element={<HowToRent />} />

                {/* Travel Checkout */}
                <Route path="/travel/checkout" element={<TravelCheckoutPage />} />
                <Route path="/confirmation/:orderNumber" element={<TravelConfirmationPage />} />
                <Route path="/my-orders" element={<MyOrdersPage />} />
                <Route path="/my-trips/:orderNumber" element={<TravelOrderDetailPage />} />

                {/* Extras */}
                <Route path="/things-to-do" element={<ThingsToDo />} />
                <Route path="/activities" element={<ThingsToDo />} />
                <Route path="/experiences" element={<ThingsToDo />} />
                <Route path="/travel-insurance" element={<TravelInsurance />} />
                <Route path="/extras" element={<TravelExtras />} />

                {/* Auth & Account */}
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/auth-callback" element={<AuthCallback />} />
                <Route path="/setup" element={<Setup />} />
                <Route path="/onboarding" element={<Onboarding />} />
                <Route path="/verify-email" element={<VerifyEmail />} />
                <Route path="/verify-otp" element={<VerifyOTP />} />
                <Route path="/verify-phone" element={<ProtectedRoute><VerifyPhonePage /></ProtectedRoute>} />
                <Route path="/profile" element={<SetupRequiredRoute><Profile /></SetupRequiredRoute>} />
                <Route path="/profile/delete-account" element={<ProtectedRoute><DeleteAccountPage /></ProtectedRoute>} />
                <Route path="/dashboard" element={<SetupRequiredRoute><CustomerDashboard /></SetupRequiredRoute>} />
                <Route path="/traveler" element={<ProtectedRoute><TravelerDashboard /></ProtectedRoute>} />
                <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
                <Route path="/payment-methods" element={<SetupRequiredRoute><PaymentMethodsPage /></SetupRequiredRoute>} />

                {/* Account sub-pages */}
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
                <Route path="/account/loyalty" element={<ProtectedRoute><LoyaltyPage /></ProtectedRoute>} />
                <Route path="/account/achievements" element={<ProtectedRoute><AchievementsPage /></ProtectedRoute>} />
                <Route path="/account/rewards" element={<ProtectedRoute><AccountRewardsPage /></ProtectedRoute>} />
                <Route path="/account/preferences" element={<ProtectedRoute><PreferencesPage /></ProtectedRoute>} />
                <Route path="/account/business" element={<ProtectedRoute><AccountBusinessPage /></ProtectedRoute>} />
                <Route path="/account/invoices" element={<ProtectedRoute><AccountInvoicesPage /></ProtectedRoute>} />
                <Route path="/account/verification" element={<ProtectedRoute><AccountVerificationPage /></ProtectedRoute>} />
                <Route path="/account/trust" element={<ProtectedRoute><TrustLevelPage /></ProtectedRoute>} />
                <Route path="/account/promos" element={<ProtectedRoute><PromosPage /></ProtectedRoute>} />
                <Route path="/account/membership" element={<ProtectedRoute><MembershipPage /></ProtectedRoute>} />

                {/* Legal */}
                <Route path="/terms-of-service" element={<TermsOfService />} />
                <Route path="/legal/terms" element={<TermsOfService />} />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/legal/privacy" element={<PrivacyPolicy />} />
                <Route path="/refund-policy" element={<RefundPolicy />} />
                <Route path="/legal/refunds" element={<RefundPolicy />} />
                <Route path="/partner-agreement" element={<PartnerAgreement />} />
                <Route path="/legal/accessibility" element={<AccessibilityStatement />} />
                <Route path="/legal/do-not-sell" element={<DoNotSell />} />
                <Route path="/legal/partner-disclosure" element={<PartnerDisclosure />} />
                <Route path="/legal/cancellation" element={<CancellationPolicy />} />
                <Route path="/legal/security-incident" element={<SecurityIncident />} />
                <Route path="/legal/seller-of-travel" element={<SellerOfTravel />} />
                <Route path="/legal/renter-terms" element={<RenterTerms />} />
                <Route path="/legal/owner-terms" element={<OwnerTerms />} />
                <Route path="/legal/damage-policy" element={<DamagePolicy />} />
                <Route path="/legal/flight-terms" element={<FlightTerms />} />
                <Route path="/affiliate-disclosure" element={<AffiliateDisclosure />} />
                <Route path="/cookies" element={<CookiePolicy />} />
                <Route path="/cancellation-policy" element={<CancellationPolicy />} />

                {/* Public */}
                <Route path="/about" element={<About />} />
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
                <Route path="/for-customers" element={<ForCustomers />} />
                <Route path="/promotions" element={<Promotions />} />
                <Route path="/help-center" element={<HelpCenter />} />
                <Route path="/compliance" element={<ComplianceCenter />} />
                <Route path="/enterprise-trust" element={<EnterpriseTrust />} />
                <Route path="/partner-audit-docs" element={<PartnerAuditDocs />} />
                <Route path="/reliability" element={<Reliability />} />
                <Route path="/enterprise-ready" element={<EnterpriseReady />} />
                <Route path="/install" element={<Install />} />
                <Route path="/status" element={<Status />} />
                <Route path="/privacy-security" element={<PrivacySecurity />} />
                <Route path="/faq" element={<FAQPage />} />
                <Route path="/booking/return" element={<BookingReturn />} />
                <Route path="/membership" element={<MembershipPage />} />
                <Route path="/rewards" element={<RewardsPage />} />
                <Route path="/rewards/redeem" element={<RewardsPage />} />
                <Route path="/deals" element={<DealsPage />} />
                <Route path="/deals/:slug" element={<SeasonalDealPage />} />
                <Route path="/brand" element={<BrandMission />} />
                <Route path="/mission" element={<BrandMission />} />
                <Route path="/company-profile" element={<CompanyProfile />} />
                <Route path="/careers" element={<Careers />} />
                <Route path="/jobs" element={<Careers />} />
                <Route path="/trust-statement" element={<TrustStatement />} />
                <Route path="/help" element={<Help />} />
                <Route path="/offline" element={<Offline />} />
                <Route path="/out" element={<OutboundRedirect />} />

                {/* Security */}
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

                {/* Business */}
                <Route path="/partner-with-zivo" element={<PartnerWithZivo />} />
                <Route path="/partners" element={<PartnerWithZivo />} />
                <Route path="/business" element={<BusinessLandingPage />} />
                <Route path="/api-partners" element={<APIPartners />} />
                <Route path="/developers" element={<APIPartners />} />
                <Route path="/business/dashboard" element={<ProtectedRoute><BusinessDashboard /></ProtectedRoute>} />
                <Route path="/business/account" element={<BusinessAccountPage />} />
                <Route path="/business/insights" element={<DataInsights />} />
                <Route path="/data-insights" element={<DataInsights />} />
                <Route path="/corporate" element={<CorporateTravel />} />
                <Route path="/business-travel" element={<CorporateTravel />} />
                <Route path="/booking-management" element={<ProtectedRoute><BookingManagement /></ProtectedRoute>} />

                {/* Support */}
                <Route path="/support/travel-bookings" element={<TravelBookingsSupport />} />
                <Route path="/support/site-issues" element={<SiteIssuesSupport />} />
                <Route path="/support/tickets" element={<ProtectedRoute><UserSupportTicketsPage /></ProtectedRoute>} />
                <Route path="/support/tickets/:id" element={<ProtectedRoute><TicketDetailPage /></ProtectedRoute>} />
                <Route path="/support/chat" element={<SetupRequiredRoute><LiveSupportChatPage /></SetupRequiredRoute>} />

                {/* Referrals & Feedback */}
                <Route path="/referrals" element={<ReferralProgram />} />
                <Route path="/invite" element={<ReferralProgram />} />
                <Route path="/feedback" element={<Feedback />} />
                <Route path="/roadmap" element={<Roadmap />} />

                {/* Guides */}
                <Route path="/guides" element={<GuidesIndex />} />
                <Route path="/guides/cheap-flights" element={<CheapFlightsGuide />} />
                <Route path="/guides/best-time-to-book" element={<BestTimeToBook />} />
                <Route path="/guides/:citySlug" element={<CityGuide />} />

                {/* City SEO */}
                <Route path="/city/:citySlug" element={<CityLandingPage />} />

                {/* Country Hub */}
                <Route path="/:countrySlug" element={<CountryHubPage />} />
                <Route path="/:countrySlug/flights/:routeSlug" element={<LocalizedFlightRoutePage />} />

                {/* Catch-all */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
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
