import { Suspense, lazy, useEffect } from "react";
import { usePageViewTracker } from "@/hooks/usePageViewTracker";
import { useGeoDetect } from "@/hooks/useGeoDetect";
import { HelmetProvider } from "react-helmet-async";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/contexts/AuthContext";
import { RemoteConfigProvider } from "@/contexts/RemoteConfigContext";
import { ZivoPlusProvider } from "@/contexts/ZivoPlusContext";
import { UTMProvider } from "@/contexts/UTMContext";
import { CurrencyProvider } from "@/contexts/CurrencyContext";
import { CustomerCityProvider } from "@/contexts/CustomerCityContext";
import { BrandProvider } from "@/contexts/BrandContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import PhoneRequiredGate from "@/components/auth/PhoneRequiredGate";
import { ErrorBoundary } from "./components/shared/ErrorBoundary";
import { RouteErrorBoundary } from "./components/shared/RouteErrorBoundary";
import CookieConsent from "./components/common/CookieConsent";
import PreserveQueryRedirect from "./components/routing/PreserveQueryRedirect";
import LiveChatWidget from "./components/shared/LiveChatWidget";
import { PWAUpdatePrompt } from "./components/shared/PWAUpdatePrompt";
import { PWAInstallBanner } from "./components/shared/PWAInstallBanner";
import { ScrollToTopButton } from "./components/shared/ScrollToTopButton";
import { SkipToContent } from "./components/shared/SkipToContent";
import RoutePrefetcher from "./components/shared/RoutePrefetcher";
import { GlobalViewportMeta } from "@/components/shared/GlobalViewportMeta";
import IncomingCallListener from "@/components/chat/IncomingCallListener";
import { Loader2 } from "lucide-react";
import { categorizeError } from "@/lib/supabaseErrors";
import { SpatialCursor } from "./components/ui/SpatialCursor";
import { useBrand } from "@/hooks/useBrand";
import { applyBrandTheme, resetBrandTheme } from "@/lib/brandTheme";
import { lazyRetry } from "@/lib/lazyRetry";

// Eager load critical pages
import Login from "./pages/Login";
import Signup from "./pages/Signup";

const Index = lazy(() => import("./pages/Index"));

// App (mobile-first) pages
const AppHome = lazy(() => import("./pages/app/AppHome"));
const AppTravel = lazy(() => import("./pages/app/AppTravel"));
const AppMore = lazy(() => import("./pages/app/AppMore"));
const ServicesPage = lazy(() => import("./pages/app/ServicesPage"));
const UnifiedDashboard = lazy(() => import("./pages/app/UnifiedDashboard"));
const MyTripsPage = lazy(() => import("./pages/app/MyTripsPage"));
const WalletPage = lazy(() => import("./pages/app/WalletPage"));
const SupportCenterPage = lazy(() => import("./pages/app/SupportCenterPage"));
const RideTrackingPage = lazy(() => import("./pages/app/RideTrackingPage"));
const RideHubPage = lazy(() => import("./pages/app/RideHubPage"));
const EatsLanding = lazy(() => import("./pages/EatsLanding"));
const EatsTrackingPage = lazy(() => import("./pages/EatsTrackingPage"));
const EatsOrdersPage = lazy(() => import("./pages/EatsOrdersPage"));
const EatsRestaurantDashboard = lazy(() => import("./pages/EatsRestaurantDashboard"));
const EatsDriverDeliveryPage = lazy(() => import("./pages/EatsDriverDeliveryPage"));
const DeliveryPage = lazy(() => import("./pages/DeliveryPage"));
const GroceryMarketplace = lazy(() => import("./pages/GroceryMarketplace"));
const FeedPage = lazy(() => import("./pages/FeedPage"));
const ReelsFeedPage = lazy(() => import("./pages/ReelsFeedPage"));
const ChatHubPage = lazy(() => import("./pages/ChatHubPage"));
const ExplorePage = lazy(() => import("./pages/ExplorePage"));
const BookmarksPage = lazy(() => import("./pages/BookmarksPage"));
const PrivacySettingsPage = lazy(() => import("./pages/account/PrivacySettingsPage"));
const DraftsPage = lazy(() => import("./pages/DraftsPage"));
const AccountAnalyticsPage = lazy(() => import("./pages/account/AccountAnalyticsPage"));
const VerificationRequestPage = lazy(() => import("./pages/account/VerificationRequestPage"));
const ActivityLogPage = lazy(() => import("./pages/account/ActivityLogPage"));
const AccountExportPage = lazy(() => import("./pages/account/AccountExportPage"));
const GroceryStorePage = lazy(() => import("./pages/GroceryStorePage"));
const StoreProfilePage = lazy(() => import("./pages/StoreProfilePage"));
const StoreMapPage = lazy(() => import("./pages/StoreMapPage"));
const GroceryOrderPlaced = lazy(() => import("./pages/grocery/GroceryOrderPlaced"));
const GroceryOrderConfirmed = lazy(() => import("./pages/grocery/GroceryOrderConfirmed"));
const GroceryOrderHistory = lazy(() => import("./pages/GroceryOrderHistory"));
const GroceryOrderTracking = lazy(() => import("./pages/grocery/GroceryOrderTracking"));
const GroceryTerms = lazy(() => import("./pages/grocery/GroceryTerms"));
const GroceryReturns = lazy(() => import("./pages/grocery/GroceryReturns"));
const GroceryFees = lazy(() => import("./pages/grocery/GroceryFees"));
const ZivoPlusPage = lazy(() => import("./pages/ZivoPlusPage"));
const DrivePage = lazy(() => import("./pages/DrivePage"));
const DriverShoppingList = lazy(() => import("./pages/DriverShoppingList"));
const DriverOrdersPage = lazy(() => import("./pages/DriverOrdersPage"));
const AdminShoppingOrders = lazy(() => import("./pages/admin/AdminShoppingOrders"));
const AdminAnalyticsDashboard = lazy(() => import("./pages/admin/AdminAnalyticsDashboard"));
const AdminUsersPage = lazy(() => import("./pages/admin/AdminUsersPage"));
const AdminPricingPage = lazy(() => import("./pages/admin/AdminPricingPage"));
const AdminRemoteConfigPage = lazy(() => import("./pages/admin/AdminRemoteConfigPage"));
const AdminFlightOrders = lazy(() => import("./pages/admin/AdminFlightOrders"));
const AdminFlightSearchAnalytics = lazy(() => import("./pages/admin/AdminFlightSearchAnalytics"));
const AdminFlightApiMonitoring = lazy(() => import("./pages/admin/AdminFlightApiMonitoring"));
const AdminFlightPriceAlerts = lazy(() => import("./pages/admin/AdminFlightPriceAlerts"));
const AdminStoresPage = lazy(() => import("./pages/admin/AdminStoresPage"));
const AdminStoreEditPage = lazy(() => import("./pages/admin/AdminStoreEditPage"));
const StoreSetup = lazy(() => import("./pages/store/StoreSetup"));
const AdminEmployeesPage = lazy(() => import("./pages/admin/AdminEmployeesPage"));
const AdminSystemHealth = lazy(() => import("./pages/admin/AdminSystemHealth"));
const DriverHomePage = lazy(() => import("./pages/driver/DriverHomePage"));
const DriverEarningsPage = lazy(() => import("./pages/driver/DriverEarningsPage"));
const DriverPerformancePage = lazy(() => import("./pages/driver/DriverPerformancePage"));
const DriverMapPage = lazy(() => import("./pages/driver/DriverMapPage"));
const DriverShopPage = lazy(() => import("./pages/driver/DriverShopPage"));
const TripsListPage = lazy(() => import("./pages/trips/TripsListPage"));
const TripDetailPage = lazy(() => import("./pages/trips/TripDetailPage"));

// Auth & Account
const NotificationsPage = lazy(() => import("./pages/NotificationsPage"));
const PaymentMethodsPage = lazy(() => import("./pages/PaymentMethodsPage"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const AuthCallback = lazy(() => import("./pages/AuthCallback"));
const Onboarding = lazy(() => import("./pages/Onboarding"));

const VerifyOTP = lazy(() => lazyRetry(() => import("./pages/VerifyOTP")));
const Setup = lazy(() => lazyRetry(() => import("./pages/Setup")));
const Unsubscribe = lazy(() => import("./pages/Unsubscribe"));
const NotFound = lazy(() => import("./pages/NotFound"));

const Profile = lazy(() => import("./pages/Profile"));
const PublicProfilePage = lazy(() => import("./pages/PublicProfilePage"));
const DeleteAccountPage = lazy(() => import("./pages/profile/DeleteAccountPage"));

// Customer Loyalty
const LoyaltyPage = lazy(() => import("./pages/account/LoyaltyPage"));

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
const FlightBookingsPage = lazy(() => import("./pages/FlightBookingsPage"));
const FlightReview = lazy(() => import("./pages/FlightReview"));
// EmbeddedCheckout removed — partners block iframe embedding; use redirect model
// FlightDashboard removed

// Hotels
const HotelBooking = lazy(() => import("./pages/HotelBooking"));
const HotelLanding = lazy(() => import("./pages/HotelLanding"));
const HotelsPage = lazy(() => import("./pages/HotelsPage"));
// HotelDashboard removed
const HotelResultsPage = lazy(() => import("./pages/HotelResultsPage"));

// Car Rental
const CarRentalBooking = lazy(() => import("./pages/CarRentalBooking"));
const CarResultsPage = lazy(() => import("./pages/CarResultsPage"));
const CarRentalLanding = lazy(() => import("./pages/CarRentalLanding"));
const CarDetailPage = lazy(() => import("./pages/CarDetailPage"));
const CarTravelerInfoPage = lazy(() => import("./pages/CarTravelerInfoPage"));
const CarCheckoutPage = lazy(() => import("./pages/CarCheckoutPage"));
const CarConfirmationPage = lazy(() => import("./pages/CarConfirmationPage"));
// CarSearch removed
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
const TravelTripsPage = lazy(() => import("./pages/TravelTripsPage"));
const TravelOrderDetailPage = lazy(() => import("./pages/TravelOrderDetailPage"));
const TravelerDashboard = lazy(() => import("./pages/TravelerDashboard"));
const SavedSearchesPage = lazy(() => import("./pages/SavedSearchesPage"));

// Legal pages
const TermsOfService = lazy(() => import("./pages/legal/TermsOfService"));
const PrivacyPolicy = lazy(() => import("./pages/legal/PrivacyPolicy"));
const RefundPolicy = lazy(() => import("./pages/legal/RefundPolicy"));
const PartnerAgreement = lazy(() => import("./pages/legal/PartnerAgreement"));
const AccessibilityStatement = lazy(() => import("./pages/legal/AccessibilityStatement"));
const CookiePolicy = lazy(() => import("./pages/legal/CookiePolicy"));
const CancellationPolicy = lazy(() => import("./pages/legal/CancellationPolicy"));
const PartnerDisclosure = lazy(() => import("./pages/legal/PartnerDisclosure"));
const DoNotSell = lazy(() => import("./pages/legal/DoNotSell"));
const SecurityIncident = lazy(() => import("./pages/legal/SecurityIncident"));
const SellerOfTravel = lazy(() => import("./pages/legal/SellerOfTravel"));
const SocialMediaPolicy = lazy(() => import("./pages/legal/SocialMediaPolicy"));
const AcceptableUsePolicy = lazy(() => import("./pages/legal/AcceptableUsePolicy"));
const DataRetentionPolicy = lazy(() => import("./pages/legal/DataRetentionPolicy"));
const DMCACopyrightPolicy = lazy(() => import("./pages/legal/DMCACopyrightPolicy"));
const DisputeResolution = lazy(() => import("./pages/legal/DisputeResolution"));
const LimitationOfLiability = lazy(() => import("./pages/legal/LimitationOfLiability"));
const IndemnificationPolicy = lazy(() => import("./pages/legal/IndemnificationPolicy"));
const AgeRestrictionPolicy = lazy(() => import("./pages/legal/AgeRestrictionPolicy"));
const AssumptionOfRisk = lazy(() => import("./pages/legal/AssumptionOfRisk"));
const ElectronicConsent = lazy(() => import("./pages/legal/ElectronicConsent"));
const ForceMajeure = lazy(() => import("./pages/legal/ForceMajeure"));
const NoGuaranteeDisclaimer = lazy(() => import("./pages/legal/NoGuaranteeDisclaimer"));
const GoverningLaw = lazy(() => import("./pages/legal/GoverningLaw"));
const IntellectualProperty = lazy(() => import("./pages/legal/IntellectualProperty"));
const AccountTermination = lazy(() => import("./pages/legal/AccountTermination"));
const ThirdPartyLinks = lazy(() => import("./pages/legal/ThirdPartyLinks"));
const CommunicationConsent = lazy(() => import("./pages/legal/CommunicationConsent"));
const ModificationOfTerms = lazy(() => import("./pages/legal/ModificationOfTerms"));
const ClassActionWaiver = lazy(() => import("./pages/legal/ClassActionWaiver"));
const AntiMoneyLaundering = lazy(() => import("./pages/legal/AntiMoneyLaundering"));
const UserConduct = lazy(() => import("./pages/legal/UserConduct"));
const CaliforniaPrivacy = lazy(() => import("./pages/legal/CaliforniaPrivacy"));
const FraudPrevention = lazy(() => import("./pages/legal/FraudPrevention"));
const WarrantyDisclaimer = lazy(() => import("./pages/legal/WarrantyDisclaimer"));
const GDPRCompliance = lazy(() => import("./pages/legal/GDPRCompliance"));
const NonDiscrimination = lazy(() => import("./pages/legal/NonDiscrimination"));
const TransportationDisclaimer = lazy(() => import("./pages/legal/TransportationDisclaimer"));
const CarRentalDisclaimer = lazy(() => import("./pages/legal/CarRentalDisclaimer"));
const InsuranceDisclaimer = lazy(() => import("./pages/legal/InsuranceDisclaimer"));
const DamagePolicy = lazy(() => import("./pages/legal/DamagePolicy"));
const GenericLegalPage = lazy(() => import("./pages/legal/GenericLegalPage"));

const AffiliateDisclosure = lazy(() => import("./pages/AffiliateDisclosure"));
const About = lazy(() => import("./pages/About"));
const HowItWorks = lazy(() => import("./pages/HowItWorks"));
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
const MultiCityBuilder = lazy(() => import("./pages/MultiCityBuilder"));
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
const AccountSettingsPage = lazy(() => import("./pages/account/AccountSettingsPage"));
const LegalPoliciesPage = lazy(() => import("./pages/account/LegalPoliciesPage"));
const ProfileEditPage = lazy(() => import("./pages/account/ProfileEditPage"));
const AccountSecurity = lazy(() => import("./pages/account/AccountSecurity"));
const PreferencesPage = lazy(() => import("./pages/account/PreferencesPage"));
const PrivacyControls = lazy(() => import("./pages/account/PrivacyControls"));
const NotificationSettings = lazy(() => import("./pages/account/NotificationSettings"));
const AccountReferralsPage = lazy(() => import("./pages/account/ReferralsPage"));
const AccountWalletPage = lazy(() => import("./pages/account/WalletPage"));
const GiftCardsPage = lazy(() => import("./pages/account/GiftCardsPage"));
const GiftCardSuccessPage = lazy(() => import("./pages/account/GiftCardSuccessPage"));
const AccountAddressesPage = lazy(() => import("./pages/account/AddressesPage"));
const AccountFavoritesPage = lazy(() => import("./pages/account/FavoritesPage"));
const AccountInvoicesPage = lazy(() => import("./pages/account/BusinessInvoicesPage"));
const PromosPage = lazy(() => import("./pages/account/PromosPage"));
const TravelerProfilesPage = lazy(() => import("./pages/account/TravelerProfilesPage"));

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
const PartnerLogin = lazy(() => import("./pages/PartnerLogin"));
const CorporateTravel = lazy(() => import("./pages/business/CorporateTravel"));
const DataInsights = lazy(() => import("./pages/business/DataInsights"));

// Support pages
const TravelBookingsSupport = lazy(() => import("./pages/support/TravelBookings"));
const SiteIssuesSupport = lazy(() => import("./pages/support/SiteIssues"));
const UserSupportTicketsPage = lazy(() => import("./pages/support/UserSupportTicketsPage"));

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
    <div className="flex flex-col items-center gap-5 relative z-10 animate-fade-in">
      <div className="relative">
        {/* Pulsing ring behind the icon */}
        <div className="absolute inset-0 rounded-2xl bg-primary/20 animate-ping" style={{ animationDuration: "1.5s" }} />
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-teal-400 flex items-center justify-center shadow-xl shadow-primary/30 relative">
          <Loader2 className="w-8 h-8 text-primary-foreground animate-spin" />
        </div>
      </div>
      <div className="flex flex-col items-center gap-1.5">
        <p className="text-sm text-foreground font-semibold tracking-tight">ZIVO</p>
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-bounce"
              style={{ animationDelay: `${i * 150}ms`, animationDuration: "0.8s" }}
            />
          ))}
        </div>
      </div>
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

/** Auto-tracks page views on route change */
function PageViewTracker() {
  usePageViewTracker();
  return null;
}

/** Auto-detect country & language from IP on first visit */
function GeoDetector() {
  useGeoDetect();
  return null;
}

const App = () => (
  <ErrorBoundary>
    <HelmetProvider>
      <ThemeProvider attribute="class" defaultTheme="system" storageKey="hizovo-theme">
        <QueryClientProvider client={queryClient}>
          <BrandProvider>
            <TooltipProvider>
              <GlobalViewportMeta />
              <SkipToContent />
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <PageViewTracker />
                <GeoDetector />
                <RoutePrefetcher />
                <AuthProvider>
                   <RemoteConfigProvider>
                  <ZivoPlusProvider>
                  <CustomerCityProvider>
                    <CurrencyProvider>
                      <UTMProvider>
                        <Suspense fallback={<PageLoader />}>
                          <Routes>
                            <Route path="/" element={<Index />} />
                            <Route path="/login" element={<Login />} />
                            <Route path="/signup" element={<Signup />} />
                            <Route path="/unsubscribe" element={<Unsubscribe />} />

                {/* App Dashboard */}
                <Route path="/app" element={<ProtectedRoute><UnifiedDashboard /></ProtectedRoute>} />
                <Route path="/app/home" element={<ProtectedRoute><AppHome /></ProtectedRoute>} />
                <Route path="/my-trips" element={<ProtectedRoute><MyTripsPage /></ProtectedRoute>} />
                <Route path="/wallet" element={<ProtectedRoute><WalletPage /></ProtectedRoute>} />
                <Route path="/support" element={<ProtectedRoute><SupportCenterPage /></ProtectedRoute>} />
                <Route path="/travel" element={<ProtectedRoute><AppTravel /></ProtectedRoute>} />
                <Route path="/more" element={<ProtectedRoute><AppMore /></ProtectedRoute>} />
                <Route path="/services" element={<ProtectedRoute><ServicesPage /></ProtectedRoute>} />

                {/* Legacy redirects */}
                <Route path="/book-flight" element={<PreserveQueryRedirect to="/flights" />} />
                <Route path="/book-hotel" element={<PreserveQueryRedirect to="/hotels" />} />
                <Route path="/travel-extras" element={<PreserveQueryRedirect to="/extras" />} />
                <Route path="/rides" element={<PreserveQueryRedirect to="/rides/hub" />} />
                <Route path="/rides/track/:tripId" element={<ProtectedRoute><PhoneRequiredGate><RideTrackingPage /></PhoneRequiredGate></ProtectedRoute>} />
                <Route path="/rides/hub" element={<ProtectedRoute><PhoneRequiredGate><RideHubPage /></PhoneRequiredGate></ProtectedRoute>} />
                <Route path="/ride" element={<PreserveQueryRedirect to="/rides" />} />
                <Route path="/eats" element={<ProtectedRoute><PhoneRequiredGate><EatsLanding /></PhoneRequiredGate></ProtectedRoute>} />
                <Route path="/eats/restaurant/:id" element={<ProtectedRoute><EatsLanding /></ProtectedRoute>} />
                <Route path="/eats/track/:orderId" element={<ProtectedRoute><EatsTrackingPage /></ProtectedRoute>} />
                <Route path="/eats/orders" element={<ProtectedRoute><EatsOrdersPage /></ProtectedRoute>} />
                <Route path="/eats/restaurant-dashboard" element={<ProtectedRoute><EatsRestaurantDashboard /></ProtectedRoute>} />
                <Route path="/eats/driver-deliveries" element={<ProtectedRoute><EatsDriverDeliveryPage /></ProtectedRoute>} />
                <Route path="/food" element={<PreserveQueryRedirect to="/eats" />} />
                <Route path="/move" element={<PreserveQueryRedirect to="/rides" />} />
                <Route path="/search" element={<PreserveQueryRedirect to="/flights" />} />
                <Route path="/my-trips-legacy" element={<PreserveQueryRedirect to="/trips" />} />
                <Route path="/account" element={<PreserveQueryRedirect to="/profile" />} />
                <Route path="/alerts" element={<PreserveQueryRedirect to="/notifications" />} />
                <Route path="/delivery" element={<DeliveryPage />} />
                <Route path="/grocery" element={<GroceryMarketplace />} />
                <Route path="/feed" element={<FeedPage />} />
                <Route path="/reels" element={<ReelsFeedPage />} />
                <Route path="/chat" element={<ChatHubPage />} />
                <Route path="/explore" element={<ExplorePage />} />
                <Route path="/saved" element={<ProtectedRoute><BookmarksPage /></ProtectedRoute>} />
                <Route path="/account/privacy" element={<ProtectedRoute><PrivacySettingsPage /></ProtectedRoute>} />
                <Route path="/store-map" element={<StoreMapPage />} />
                <Route path="/grocery/store/:slug" element={<GroceryStorePage />} />
                <Route path="/grocery/shop/:slug" element={<StoreProfilePage />} />
                <Route path="/grocery/order-placed" element={<GroceryOrderPlaced />} />
                <Route path="/grocery/order-confirmed" element={<GroceryOrderConfirmed />} />
                <Route path="/grocery/orders" element={<GroceryOrderHistory />} />
                <Route path="/grocery/track/:orderId" element={<GroceryOrderTracking />} />
                <Route path="/grocery/terms" element={<GroceryTerms />} />
                <Route path="/grocery/returns" element={<GroceryReturns />} />
                <Route path="/grocery/fees" element={<GroceryFees />} />
                <Route path="/zivo-plus" element={<ZivoPlusPage />} />
                <Route path="/drive" element={<DrivePage />} />
                <Route path="/driver/orders" element={<DriverOrdersPage />} />
                <Route path="/driver/shopping/:orderId" element={<DriverShoppingList />} />
                <Route path="/driver/shop/:orderId" element={<DriverShopPage />} />
                <Route path="/driver/home" element={<DriverHomePage />} />
                <Route path="/driver/earnings" element={<DriverEarningsPage />} />
                <Route path="/driver/performance" element={<DriverPerformancePage />} />
                <Route path="/driver/map" element={<DriverMapPage />} />
                <Route path="/package-delivery" element={<PreserveQueryRedirect to="/delivery" />} />
                <Route path="/admin/shopping-orders" element={<AdminShoppingOrders />} />
                <Route path="/admin/analytics" element={<ProtectedRoute><AdminAnalyticsDashboard /></ProtectedRoute>} />
                <Route path="/admin/users" element={<ProtectedRoute><AdminUsersPage /></ProtectedRoute>} />
                <Route path="/admin/pricing" element={<ProtectedRoute><AdminPricingPage /></ProtectedRoute>} />
                <Route path="/admin/remote-config" element={<ProtectedRoute><AdminRemoteConfigPage /></ProtectedRoute>} />
                <Route path="/admin/flight-orders" element={<ProtectedRoute><AdminFlightOrders /></ProtectedRoute>} />
                <Route path="/admin/flight-searches" element={<ProtectedRoute><AdminFlightSearchAnalytics /></ProtectedRoute>} />
                <Route path="/admin/flight-api" element={<ProtectedRoute><AdminFlightApiMonitoring /></ProtectedRoute>} />
                <Route path="/admin/flight-price-alerts" element={<ProtectedRoute><AdminFlightPriceAlerts /></ProtectedRoute>} />
                <Route path="/admin/stores" element={<ProtectedRoute><AdminStoresPage /></ProtectedRoute>} />
                <Route path="/admin/stores/:storeId" element={<ProtectedRoute><AdminStoreEditPage /></ProtectedRoute>} />
                <Route path="/store/setup" element={<ProtectedRoute><StoreSetup /></ProtectedRoute>} />
                <Route path="/admin/employees" element={<ProtectedRoute><AdminEmployeesPage /></ProtectedRoute>} />
                <Route path="/admin/system-health" element={<ProtectedRoute><AdminSystemHealth /></ProtectedRoute>} />
                <Route path="/events" element={<PreserveQueryRedirect to="/things-to-do" />} />
                <Route path="/ground-transport" element={<PreserveQueryRedirect to="/car-rental" />} />
                <Route path="/insurance" element={<PreserveQueryRedirect to="/travel-insurance" />} />

                {/* Flights */}
                <Route path="/flights" element={<RouteErrorBoundary section="Flights"><FlightLanding /></RouteErrorBoundary>} />
                <Route path="/flights/from-:fromCity" element={<RouteErrorBoundary section="Flights"><FlightLanding /></RouteErrorBoundary>} />
                <Route path="/flights/to-:toCity" element={<RouteErrorBoundary section="Flights"><FlightLanding /></RouteErrorBoundary>} />
                <Route path="/flights/to/:citySlug" element={<RouteErrorBoundary section="Flights"><FlightToCity /></RouteErrorBoundary>} />
                <Route path="/flights/cities/:citySlug" element={<RouteErrorBoundary section="Flights"><FlightCityPage /></RouteErrorBoundary>} />
                <Route path="/flights/:origin-to-:destination" element={<RouteErrorBoundary section="Flights"><FlightRoutePage /></RouteErrorBoundary>} />
                <Route path="/flights/:route" element={<RouteErrorBoundary section="Flights"><FlightLanding /></RouteErrorBoundary>} />
                <Route path="/flights/results" element={<RouteErrorBoundary section="Flights"><FlightResults /></RouteErrorBoundary>} />
                <Route path="/flights/live" element={<RouteErrorBoundary section="Flights"><FlightLive /></RouteErrorBoundary>} />
                <Route path="/flights/details/review" element={<RouteErrorBoundary section="Flights"><FlightReview /></RouteErrorBoundary>} />
                <Route path="/flights/details/:id" element={<RouteErrorBoundary section="Flights"><FlightDetails /></RouteErrorBoundary>} />
                <Route path="/flights/traveler" element={<RouteErrorBoundary section="Flights"><FlightTravelerInfo /></RouteErrorBoundary>} />
                <Route path="/flights/traveler-info" element={<RouteErrorBoundary section="Flights"><FlightTravelerInfo /></RouteErrorBoundary>} />
                <Route path="/flights/checkout" element={<RouteErrorBoundary section="Flights"><PhoneRequiredGate><FlightCheckout /></PhoneRequiredGate></RouteErrorBoundary>} />
                <Route path="/flights/confirmation/:bookingId" element={<RouteErrorBoundary section="Flights"><FlightConfirmation /></RouteErrorBoundary>} />
                <Route path="/flights/bookings" element={<RouteErrorBoundary section="Flights"><FlightBookingsPage /></RouteErrorBoundary>} />
                {/* flights-dashboard removed */}
                <Route path="/airports/:iata" element={<RouteErrorBoundary section="Flights"><AirportPage /></RouteErrorBoundary>} />
                <Route path="/booking/duffel-checkout" element={<RouteErrorBoundary section="Checkout"><DuffelCheckout /></RouteErrorBoundary>} />
                {/* /checkout removed — partners block iframe; redirect model used instead */}

                {/* Hotels */}
                <Route path="/hotels" element={<RouteErrorBoundary section="Hotels"><HotelsPage /></RouteErrorBoundary>} />
                <Route path="/hotels/:city" element={<RouteErrorBoundary section="Hotels"><HotelCityLandingPage /></RouteErrorBoundary>} />
                <Route path="/hotels/in-:city" element={<RouteErrorBoundary section="Hotels"><HotelsPage /></RouteErrorBoundary>} />
                {/* hotels-dashboard removed */}

                {/* Car Rental */}
                <Route path="/car-rental" element={<RouteErrorBoundary section="Cars"><CarRentalLanding /></RouteErrorBoundary>} />
                <Route path="/car-rental/in-:location" element={<RouteErrorBoundary section="Cars"><CarRentalLanding /></RouteErrorBoundary>} />
                <Route path="/rent-car" element={<RouteErrorBoundary section="Cars"><CarRentalBooking /></RouteErrorBoundary>} />
                <Route path="/rent-car/results" element={<RouteErrorBoundary section="Cars"><CarResultsPage /></RouteErrorBoundary>} />
                <Route path="/rent-car/detail" element={<RouteErrorBoundary section="Cars"><CarDetailPage /></RouteErrorBoundary>} />
                <Route path="/rent-car/traveler-info" element={<RouteErrorBoundary section="Cars"><CarTravelerInfoPage /></RouteErrorBoundary>} />
                <Route path="/rent-car/checkout" element={<RouteErrorBoundary section="Cars"><CarCheckoutPage /></RouteErrorBoundary>} />
                <Route path="/rent-car/confirmation" element={<RouteErrorBoundary section="Cars"><CarConfirmationPage /></RouteErrorBoundary>} />
                <Route path="/rent-car/:city" element={<RouteErrorBoundary section="Cars"><CarRentalLanding /></RouteErrorBoundary>} />
                <Route path="/cars" element={<RouteErrorBoundary section="Cars"><Cars /></RouteErrorBoundary>} />
                <Route path="/cars/search" element={<RouteErrorBoundary section="Cars"><CarsSearchPage /></RouteErrorBoundary>} />
                <Route path="/cars/:id" element={<RouteErrorBoundary section="Cars"><CarsDetailPage /></RouteErrorBoundary>} />
                <Route path="/how-to-rent" element={<RouteErrorBoundary section="Cars"><HowToRent /></RouteErrorBoundary>} />

                {/* Travel Checkout */}
                <Route path="/travel/checkout" element={<RouteErrorBoundary section="Checkout"><PhoneRequiredGate><TravelCheckoutPage /></PhoneRequiredGate></RouteErrorBoundary>} />
                <Route path="/confirmation/:orderNumber" element={<RouteErrorBoundary section="Checkout"><TravelConfirmationPage /></RouteErrorBoundary>} />
                <Route path="/my-trips/:orderNumber" element={<RouteErrorBoundary section="Checkout"><TravelOrderDetailPage /></RouteErrorBoundary>} />

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
                <Route path="/onboarding" element={<Onboarding />} />
                
                <Route path="/verify-otp" element={<VerifyOTP />} />
                <Route path="/setup" element={<Setup />} />
                
                <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                <Route path="/profile/delete-account" element={<ProtectedRoute><DeleteAccountPage /></ProtectedRoute>} />
                <Route path="/user/:userId" element={<PublicProfilePage />} />
                <Route path="/traveler" element={<ProtectedRoute><TravelerDashboard /></ProtectedRoute>} />
                <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
                <Route path="/saved-searches" element={<ProtectedRoute><SavedSearchesPage /></ProtectedRoute>} />
                <Route path="/payment-methods" element={<ProtectedRoute><PaymentMethodsPage /></ProtectedRoute>} />

                {/* Account sub-pages */}
                <Route path="/account/settings" element={<ProtectedRoute><AccountSettingsPage /></ProtectedRoute>} />
                <Route path="/account/legal" element={<LegalPoliciesPage />} />
                <Route path="/account/profile-edit" element={<ProtectedRoute><ProfileEditPage /></ProtectedRoute>} />
                <Route path="/account/security" element={<ProtectedRoute><AccountSecurity /></ProtectedRoute>} />
                <Route path="/account/privacy" element={<ProtectedRoute><PrivacyControls /></ProtectedRoute>} />
                <Route path="/account/notifications" element={<ProtectedRoute><NotificationSettings /></ProtectedRoute>} />
                <Route path="/account/referrals" element={<ProtectedRoute><AccountReferralsPage /></ProtectedRoute>} />
                <Route path="/account/wallet" element={<ProtectedRoute><AccountWalletPage /></ProtectedRoute>} />
                <Route path="/account/gift-cards" element={<ProtectedRoute><GiftCardsPage /></ProtectedRoute>} />
                <Route path="/account/gift-cards/success" element={<ProtectedRoute><GiftCardSuccessPage /></ProtectedRoute>} />
                <Route path="/account/travelers" element={<ProtectedRoute><TravelerProfilesPage /></ProtectedRoute>} />
                <Route path="/account/addresses" element={<ProtectedRoute><AccountAddressesPage /></ProtectedRoute>} />
                <Route path="/account/saved-places" element={<ProtectedRoute><AccountAddressesPage /></ProtectedRoute>} />
                <Route path="/account/favorites" element={<ProtectedRoute><AccountFavoritesPage /></ProtectedRoute>} />
                <Route path="/account/loyalty" element={<ProtectedRoute><LoyaltyPage /></ProtectedRoute>} />
                <Route path="/account/preferences" element={<ProtectedRoute><PreferencesPage /></ProtectedRoute>} />
                <Route path="/account/promos" element={<ProtectedRoute><PromosPage /></ProtectedRoute>} />
                <Route path="/account/membership" element={<ProtectedRoute><MembershipPage /></ProtectedRoute>} />

                {/* Trip Itineraries */}
                <Route path="/trips" element={<ProtectedRoute><TripsListPage /></ProtectedRoute>} />
                <Route path="/trip/:id" element={<ProtectedRoute><TripDetailPage /></ProtectedRoute>} />

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
                <Route path="/legal/flight-terms" element={<FlightTerms />} />
                <Route path="/legal/social-media-policy" element={<SocialMediaPolicy />} />
                <Route path="/legal/acceptable-use" element={<AcceptableUsePolicy />} />
                <Route path="/legal/data-retention" element={<DataRetentionPolicy />} />
                <Route path="/legal/dmca" element={<DMCACopyrightPolicy />} />
                <Route path="/legal/dispute-resolution" element={<DisputeResolution />} />
                <Route path="/legal/limitation-of-liability" element={<LimitationOfLiability />} />
                <Route path="/legal/indemnification" element={<IndemnificationPolicy />} />
                <Route path="/legal/age-restriction" element={<AgeRestrictionPolicy />} />
                <Route path="/legal/assumption-of-risk" element={<AssumptionOfRisk />} />
                <Route path="/legal/electronic-consent" element={<ElectronicConsent />} />
                <Route path="/legal/force-majeure" element={<ForceMajeure />} />
                <Route path="/legal/no-guarantee" element={<NoGuaranteeDisclaimer />} />
                <Route path="/legal/governing-law" element={<GoverningLaw />} />
                <Route path="/legal/intellectual-property" element={<IntellectualProperty />} />
                <Route path="/legal/account-termination" element={<AccountTermination />} />
                <Route path="/legal/third-party-links" element={<ThirdPartyLinks />} />
                <Route path="/legal/communication-consent" element={<CommunicationConsent />} />
                <Route path="/legal/modification-of-terms" element={<ModificationOfTerms />} />
                <Route path="/legal/class-action-waiver" element={<ClassActionWaiver />} />
                <Route path="/legal/anti-money-laundering" element={<AntiMoneyLaundering />} />
                <Route path="/legal/user-conduct" element={<UserConduct />} />
                <Route path="/legal/california-privacy" element={<CaliforniaPrivacy />} />
                <Route path="/legal/fraud-prevention" element={<FraudPrevention />} />
                <Route path="/legal/warranty-disclaimer" element={<WarrantyDisclaimer />} />
                <Route path="/legal/gdpr" element={<GDPRCompliance />} />
                <Route path="/legal/non-discrimination" element={<NonDiscrimination />} />
                <Route path="/legal/transportation-disclaimer" element={<TransportationDisclaimer />} />
                <Route path="/legal/car-rental-disclaimer" element={<CarRentalDisclaimer />} />
                <Route path="/legal/insurance-disclaimer" element={<InsuranceDisclaimer />} />
                <Route path="/legal/damage-policy" element={<DamagePolicy />} />
                <Route path="/legal/*" element={<GenericLegalPage />} />
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
                <Route path="/multi-city-builder" element={<MultiCityBuilder />} />
                {/* /zivo-plus defined above */}
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
                <Route path="/deals" element={<Deals />} />
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
                <Route path="/partner-login" element={<PartnerLogin />} />
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
          </UTMProvider>
          </CurrencyProvider>
          </CustomerCityProvider>
          <CookieConsent />
          <PWAUpdatePrompt />
          <PWAInstallBanner />
          {/* ScrollToTopButton removed */}
          {/* LiveChatWidget removed */}
          <SpatialCursor />
          <BrandThemeApplicator />
          <IncomingCallListener />
        </ZivoPlusProvider>
        </RemoteConfigProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </BrandProvider>
  </QueryClientProvider>
  </ThemeProvider>
  </HelmetProvider>
  </ErrorBoundary>
);

export default App;
