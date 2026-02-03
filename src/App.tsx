import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { RealtimeSyncProvider } from "@/contexts/RealtimeSyncContext";
import { UTMProvider } from "@/contexts/UTMContext";
import { CurrencyProvider } from "@/contexts/CurrencyContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import CookieConsent from "./components/common/CookieConsent";
import PreserveQueryRedirect from "./components/routing/PreserveQueryRedirect";
import { PWAInstallPrompt } from "./components/mobile";
import { Loader2 } from "lucide-react";

// Eager load critical pages
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";

// App (mobile-first) pages - lazy load
const AppHome = lazy(() => import("./pages/app/AppHome"));
const AppTravel = lazy(() => import("./pages/app/AppTravel"));
const AppRides = lazy(() => import("./pages/app/AppRides"));
const AppEats = lazy(() => import("./pages/app/AppEats"));
const AppMore = lazy(() => import("./pages/app/AppMore"));
const UnifiedDashboard = lazy(() => import("./pages/app/UnifiedDashboard"));
const MyTripsPage = lazy(() => import("./pages/app/MyTripsPage"));
const WalletPage = lazy(() => import("./pages/app/WalletPage"));
const SupportCenterPage = lazy(() => import("./pages/app/SupportCenterPage"));
const RevenueDashboard = lazy(() => import("./pages/admin/RevenueDashboard"));
const CommissionsPage = lazy(() => import("./pages/admin/CommissionsPage"));
const GrowthDashboard = lazy(() => import("./pages/admin/GrowthDashboard"));
const SecurityDashboard = lazy(() => import("./pages/admin/SecurityDashboard"));
const GlobalDashboard = lazy(() => import("./pages/admin/GlobalDashboard"));
const AIInsightsDashboard = lazy(() => import("./pages/admin/AIInsightsDashboard"));
const RecoveryDashboard = lazy(() => import("./pages/admin/RecoveryDashboard"));
const LegalControlDashboard = lazy(() => import("./pages/admin/LegalControlDashboard"));

// Lazy load all other pages for faster initial load
const Rides = lazy(() => import("./pages/Rides"));
const Move = lazy(() => import("./pages/Move"));
const Eats = lazy(() => import("./pages/Eats"));
const EatsRestaurants = lazy(() => import("./pages/EatsRestaurants"));
const EatsRestaurantMenu = lazy(() => import("./pages/EatsRestaurantMenu"));
const EatsCheckout = lazy(() => import("./pages/EatsCheckout"));
const TripHistory = lazy(() => import("./pages/TripHistory"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const CustomerDashboard = lazy(() => import("./pages/CustomerDashboard"));
const RestaurantDashboard = lazy(() => import("./pages/RestaurantDashboard"));
const CarRentalDashboard = lazy(() => import("./pages/CarRentalDashboard"));
const FlightDashboard = lazy(() => import("./pages/FlightDashboard"));
const HotelDashboard = lazy(() => import("./pages/HotelDashboard"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const AuthCallback = lazy(() => import("./pages/AuthCallback"));
const NotFound = lazy(() => import("./pages/NotFound"));
const FoodOrdering = lazy(() => import("./pages/FoodOrdering"));
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
const Events = lazy(() => import("./pages/Events"));
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
// Admin car rental settings
const CarRentalSettingsPage = lazy(() => import("./pages/admin/CarRentalSettingsPage"));
const CarDamageClaimsPage = lazy(() => import("./pages/admin/CarDamageClaimsPage"));
const CarRevenueOverviewPage = lazy(() => import("./pages/admin/CarRevenueOverviewPage"));
const FleetOversightPage = lazy(() => import("./pages/admin/FleetOversightPage"));
// Owner Earnings
const OwnerEarningsPage = lazy(() => import("./pages/owner/OwnerEarningsPage"));
// Fleet pages
const FleetDashboard = lazy(() => import("./pages/fleet/FleetDashboard"));
const FleetOnboarding = lazy(() => import("./pages/fleet/FleetOnboarding"));
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
const CommunityGuidelines = lazy(() => import("./pages/legal/CommunityGuidelines"));
const InsurancePolicy = lazy(() => import("./pages/legal/InsurancePolicy"));
const AccessibilityStatement = lazy(() => import("./pages/legal/AccessibilityStatement"));
const CookiePolicy = lazy(() => import("./pages/legal/CookiePolicy"));
const CancellationPolicy = lazy(() => import("./pages/legal/CancellationPolicy"));
const PartnerDisclosure = lazy(() => import("./pages/legal/PartnerDisclosure"));
const AcceptableUsePolicy = lazy(() => import("./pages/legal/AcceptableUsePolicy"));
const CommunityStandards = lazy(() => import("./pages/legal/CommunityStandards"));
const LegalFAQ = lazy(() => import("./pages/legal/LegalFAQ"));
const VerificationPolicy = lazy(() => import("./pages/legal/VerificationPolicy"));
const AccountSecurityPolicy = lazy(() => import("./pages/legal/AccountSecurityPolicy"));
const LocationDisclosure = lazy(() => import("./pages/legal/LocationDisclosure"));
const CommunicationsPolicy = lazy(() => import("./pages/legal/CommunicationsPolicy"));
const PlatformAvailability = lazy(() => import("./pages/legal/PlatformAvailability"));
const ThirdPartyServices = lazy(() => import("./pages/legal/ThirdPartyServices"));
const SanctionsPolicy = lazy(() => import("./pages/legal/SanctionsPolicy"));
const AgePolicy = lazy(() => import("./pages/legal/AgePolicy"));
const ConsumerDisclosures = lazy(() => import("./pages/legal/ConsumerDisclosures"));
const PaymentProcessors = lazy(() => import("./pages/legal/PaymentProcessors"));
const AIDisclosure = lazy(() => import("./pages/legal/AIDisclosure"));
const InternationalPolicy = lazy(() => import("./pages/legal/InternationalPolicy"));
const FraudPolicy = lazy(() => import("./pages/legal/FraudPolicy"));
const ContractorStatus = lazy(() => import("./pages/legal/ContractorStatus"));
const PlatformNeutrality = lazy(() => import("./pages/legal/PlatformNeutrality"));
const DataPolicies = lazy(() => import("./pages/legal/DataPolicies"));
const AIBiasPolicy = lazy(() => import("./pages/legal/AIBiasPolicy"));
const DisputeProcess = lazy(() => import("./pages/legal/DisputeProcess"));
const PlatformGovernance = lazy(() => import("./pages/legal/PlatformGovernance"));
const GovernmentOrders = lazy(() => import("./pages/legal/GovernmentOrders"));
const EmergencyShutdown = lazy(() => import("./pages/legal/EmergencyShutdown"));
const ContentPolicy = lazy(() => import("./pages/legal/ContentPolicy"));
const SafetyDisclaimer = lazy(() => import("./pages/legal/SafetyDisclaimer"));
const MarketplaceDisclaimer = lazy(() => import("./pages/legal/MarketplaceDisclaimer"));
const EnforcementRights = lazy(() => import("./pages/legal/EnforcementRights"));
const BrandPolicy = lazy(() => import("./pages/legal/BrandPolicy"));
const DMCAPolicy = lazy(() => import("./pages/legal/DMCAPolicy"));
const LegalProcess = lazy(() => import("./pages/legal/LegalProcess"));
const RecordsPolicy = lazy(() => import("./pages/legal/RecordsPolicy"));
const WhistleblowerPolicy = lazy(() => import("./pages/legal/WhistleblowerPolicy"));
const CorporateProtection = lazy(() => import("./pages/legal/CorporateProtection"));
const PaymentFinality = lazy(() => import("./pages/legal/PaymentFinality"));
const DataResidency = lazy(() => import("./pages/legal/DataResidency"));
const TravelRules = lazy(() => import("./pages/legal/TravelRules"));
const RentalCompliance = lazy(() => import("./pages/legal/RentalCompliance"));
const PlatformReliancePolicy = lazy(() => import("./pages/legal/PlatformReliancePolicy"));
const TermsPrecedence = lazy(() => import("./pages/legal/TermsPrecedence"));
const CommunicationsConsent = lazy(() => import("./pages/legal/CommunicationsConsent"));
const DataBreachPolicy = lazy(() => import("./pages/legal/DataBreachPolicy"));
const SecurityIncident = lazy(() => import("./pages/legal/SecurityIncident"));
const ChildrenPrivacy = lazy(() => import("./pages/legal/ChildrenPrivacy"));
const InsuranceDisclaimer = lazy(() => import("./pages/legal/InsuranceDisclaimer"));
const LegalNoticesPolicy = lazy(() => import("./pages/legal/LegalNoticesPolicy"));
const ComplianceOperations = lazy(() => import("./pages/legal/ComplianceOperations"));
const RegulatoryResponse = lazy(() => import("./pages/legal/RegulatoryResponse"));
const ComplianceRecords = lazy(() => import("./pages/legal/ComplianceRecords"));
const KYCPolicy = lazy(() => import("./pages/legal/KYCPolicy"));
const AMLPolicy = lazy(() => import("./pages/legal/AMLPolicy"));
const ComplaintsPolicy = lazy(() => import("./pages/legal/ComplaintsPolicy"));
const FinancialRecords = lazy(() => import("./pages/legal/FinancialRecords"));
const Governance = lazy(() => import("./pages/legal/Governance"));
const EthicsPolicy = lazy(() => import("./pages/legal/EthicsPolicy"));
const RegulatorCommunications = lazy(() => import("./pages/legal/RegulatorCommunications"));
const LegalDocCenter = lazy(() => import("./pages/admin/LegalDocCenter"));
const EvidenceLogging = lazy(() => import("./pages/admin/EvidenceLogging"));
const CaseFileSystem = lazy(() => import("./pages/admin/CaseFileSystem"));
const LegalResponseProtocols = lazy(() => import("./pages/admin/LegalResponseProtocols"));
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
const PrivacyControls = lazy(() => import("./pages/account/PrivacyControls"));
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

// Support pages
const Help = lazy(() => import("./pages/Help"));
const TravelBookingsSupport = lazy(() => import("./pages/support/TravelBookings"));
const SiteIssuesSupport = lazy(() => import("./pages/support/SiteIssues"));
const PartnerOverview = lazy(() => import("./pages/partner/Overview"));

// Admin pages - lazy load
const ABTestingDashboard = lazy(() => import("./pages/admin/ABTestingDashboard"));
const ClicksAnalytics = lazy(() => import("./pages/admin/ClicksAnalytics"));
const TravelAdminDashboard = lazy(() => import("./pages/admin/TravelAdminDashboard"));
const TravelPartnersPage = lazy(() => import("./pages/admin/TravelPartnersPage"));
const TravelHandoffPage = lazy(() => import("./pages/admin/TravelHandoffPage"));
const TravelLogsPage = lazy(() => import("./pages/admin/TravelLogsPage"));
const AdminQA = lazy(() => import("./pages/admin/AdminQA"));
const AdminCompliance = lazy(() => import("./pages/admin/AdminCompliance"));
const AdminMobile = lazy(() => import("./pages/admin/AdminMobile"));
const AdminSecurity = lazy(() => import("./pages/admin/AdminSecurity"));
const AdminEmail = lazy(() => import("./pages/admin/AdminEmail"));
const AdminSupport = lazy(() => import("./pages/admin/AdminSupport"));
const FlightDebugPage = lazy(() => import("./pages/admin/FlightDebugPage"));
const FlightStatusPage = lazy(() => import("./pages/admin/FlightStatusPage"));
const FlightsLaunchControl = lazy(() => import("./pages/admin/FlightsLaunchControl"));
const FlightIncidentLog = lazy(() => import("./pages/admin/FlightIncidentLog"));
const FlightAnalyticsPage = lazy(() => import("./pages/admin/FlightAnalyticsPage"));
const FlightRefundsPage = lazy(() => import("./pages/admin/FlightRefundsPage"));
const FlightEmailLogsPage = lazy(() => import("./pages/admin/FlightEmailLogsPage"));
const FlightPerformancePage = lazy(() => import("./pages/admin/FlightPerformancePage"));
const SystemStatusPage = lazy(() => import("./pages/admin/SystemStatusPage"));
const SellerOfTravelSettings = lazy(() => import("./pages/admin/modules/SellerOfTravelSettings"));
const SellerOfTravel = lazy(() => import("./pages/legal/SellerOfTravel"));

// Outbound redirect page
const OutboundRedirect = lazy(() => import("./pages/OutboundRedirect"));
const TrackingTest = lazy(() => import("./pages/TrackingTest"));
const Offline = lazy(() => import("./pages/Offline"));

// Ad landing pages - lazy load
const FlightsAdLanding = lazy(() => import("./pages/ads/FlightsAdLanding"));
const HotelsAdLanding = lazy(() => import("./pages/ads/HotelsAdLanding"));
const CarsAdLanding = lazy(() => import("./pages/ads/CarsAdLanding"));
const TransfersAdLanding = lazy(() => import("./pages/ads/TransfersAdLanding"));
const ActivitiesAdLanding = lazy(() => import("./pages/ads/ActivitiesAdLanding"));

// Creator pages - lazy load
const Creators = lazy(() => import("./pages/Creators"));
const FlightsCreatorLanding = lazy(() => import("./pages/creators/FlightsCreatorLanding"));
const HotelsCreatorLanding = lazy(() => import("./pages/creators/HotelsCreatorLanding"));
const CarsCreatorLanding = lazy(() => import("./pages/creators/CarsCreatorLanding"));

// LP (Ad-safe landing pages) - lazy load
const FlightsLP = lazy(() => import("./pages/lp/FlightsLP"));
const HotelsLP = lazy(() => import("./pages/lp/HotelsLP"));
const CarsLP = lazy(() => import("./pages/lp/CarsLP"));
const ExtrasLP = lazy(() => import("./pages/lp/ExtrasLP"));
const ExtrasCreatorLanding = lazy(() => import("./pages/creators/ExtrasCreatorLanding"));

const queryClient = new QueryClient();

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

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <CurrencyProvider>
          <UTMProvider>
          <RealtimeSyncProvider>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                {/* Eager loaded routes */}
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                
                {/* App (Mobile-first) Routes */}
                <Route path="/app" element={<UnifiedDashboard />} />
                <Route path="/app/home" element={<AppHome />} />
                <Route path="/my-trips" element={<MyTripsPage />} />
                <Route path="/wallet" element={<WalletPage />} />
                <Route path="/support" element={<SupportCenterPage />} />
                <Route path="/travel" element={<AppTravel />} />
                <Route path="/rides" element={<Rides />} />
                <Route path="/ride" element={<Rides />} />
                <Route path="/eats" element={<Eats />} />
                <Route path="/food" element={<Eats />} />
                <Route path="/move" element={<Move />} />
                <Route path="/more" element={<AppMore />} />
                
                {/* Legacy routes - redirect with query params preserved */}
                <Route path="/book-flight" element={<PreserveQueryRedirect to="/flights" />} />
                <Route path="/book-hotel" element={<PreserveQueryRedirect to="/hotels" />} />
                <Route path="/zivo-rides" element={<PreserveQueryRedirect to="/rides" />} />
                <Route path="/zivo-eats" element={<PreserveQueryRedirect to="/eats" />} />
                <Route path="/travel-extras" element={<PreserveQueryRedirect to="/extras" />} />
                
                {/* Legacy deep links for Eats */}
                <Route path="/eats/restaurants" element={<EatsRestaurants />} />
                <Route path="/eats/restaurant/:id" element={<EatsRestaurantMenu />} />
                <Route path="/eats/checkout" element={<EatsCheckout />} />
                
                {/* SEO Flight Landing Pages */}
                <Route path="/flights" element={<FlightLanding />} />
                <Route path="/flights/from-:fromCity" element={<FlightLanding />} />
                <Route path="/flights/to-:toCity" element={<FlightLanding />} />
                <Route path="/flights/cities/:citySlug" element={<FlightCityPage />} />
                <Route path="/flights/:route" element={<FlightLanding />} />
                
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
                
                <Route path="/profile" element={<Profile />} />
                <Route path="/trips" element={<TripHistory />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/dashboard" element={<CustomerDashboard />} />
                <Route path="/restaurant" element={<RestaurantDashboard />} />
                <Route path="/car-rental-dashboard" element={<CarRentalDashboard />} />
                <Route path="/flights-dashboard" element={<FlightDashboard />} />
                <Route path="/hotels-dashboard" element={<HotelDashboard />} />
                <Route path="/auth-callback" element={<AuthCallback />} />
                <Route path="/terms-of-service" element={<TermsOfService />} />
                <Route path="/legal/terms" element={<TermsOfService />} />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/legal/privacy" element={<PrivacyPolicy />} />
                <Route path="/refund-policy" element={<RefundPolicy />} />
                <Route path="/legal/refunds" element={<RefundPolicy />} />
                <Route path="/partner-agreement" element={<PartnerAgreement />} />
                <Route path="/legal/acceptable-use" element={<AcceptableUsePolicy />} />
                <Route path="/legal/community-standards" element={<CommunityStandards />} />
                <Route path="/legal/faq" element={<LegalFAQ />} />
                <Route path="/legal/verification-policy" element={<VerificationPolicy />} />
                <Route path="/legal/account-security" element={<AccountSecurityPolicy />} />
                <Route path="/legal/location-disclosure" element={<LocationDisclosure />} />
                <Route path="/legal/communications" element={<CommunicationsPolicy />} />
                <Route path="/legal/platform-availability" element={<PlatformAvailability />} />
                <Route path="/legal/third-party-services" element={<ThirdPartyServices />} />
                <Route path="/legal/sanctions" element={<SanctionsPolicy />} />
                <Route path="/legal/age-policy" element={<AgePolicy />} />
                <Route path="/legal/consumer-disclosures" element={<ConsumerDisclosures />} />
                <Route path="/legal/payment-processors" element={<PaymentProcessors />} />
                <Route path="/legal/ai-disclosure" element={<AIDisclosure />} />
                <Route path="/legal/international" element={<InternationalPolicy />} />
                <Route path="/legal/fraud" element={<FraudPolicy />} />
                <Route path="/legal/contractor-status" element={<ContractorStatus />} />
                <Route path="/legal/platform-neutrality" element={<PlatformNeutrality />} />
                <Route path="/legal/accessibility" element={<AccessibilityStatement />} />
                <Route path="/legal/data-policies" element={<DataPolicies />} />
                <Route path="/legal/ai-bias" element={<AIBiasPolicy />} />
                <Route path="/legal/dispute-process" element={<DisputeProcess />} />
                <Route path="/legal/platform-governance" element={<PlatformGovernance />} />
                <Route path="/legal/government-orders" element={<GovernmentOrders />} />
                <Route path="/legal/emergency-shutdown" element={<EmergencyShutdown />} />
                <Route path="/legal/content-policy" element={<ContentPolicy />} />
                <Route path="/legal/safety-disclaimer" element={<SafetyDisclaimer />} />
                <Route path="/legal/marketplace-disclaimer" element={<MarketplaceDisclaimer />} />
                <Route path="/legal/enforcement-rights" element={<EnforcementRights />} />
                <Route path="/legal/brand-policy" element={<BrandPolicy />} />
                <Route path="/legal/dmca" element={<DMCAPolicy />} />
                <Route path="/legal/legal-process" element={<LegalProcess />} />
                <Route path="/legal/records" element={<RecordsPolicy />} />
                <Route path="/legal/whistleblower" element={<WhistleblowerPolicy />} />
                <Route path="/legal/corporate-protection" element={<CorporateProtection />} />
                <Route path="/legal/payment-finality" element={<PaymentFinality />} />
                <Route path="/legal/chargebacks" element={<PaymentFinality />} />
                <Route path="/legal/travel-rules" element={<TravelRules />} />
                <Route path="/legal/rental-compliance" element={<RentalCompliance />} />
                <Route path="/legal/platform-reliance" element={<PlatformReliancePolicy />} />
                <Route path="/legal/terms-precedence" element={<TermsPrecedence />} />
                <Route path="/legal/communications-consent" element={<CommunicationsConsent />} />
                <Route path="/legal/data-breach" element={<DataBreachPolicy />} />
                <Route path="/legal/children-privacy" element={<ChildrenPrivacy />} />
                <Route path="/legal/insurance-disclaimer" element={<InsuranceDisclaimer />} />
                <Route path="/legal/legal-notices" element={<LegalNoticesPolicy />} />
                <Route path="/legal/compliance-operations" element={<ComplianceOperations />} />
                <Route path="/legal/regulatory-response" element={<RegulatoryResponse />} />
                <Route path="/legal/compliance-records" element={<ComplianceRecords />} />
                <Route path="/legal/kyc-policy" element={<KYCPolicy />} />
                <Route path="/legal/aml" element={<AMLPolicy />} />
                <Route path="/legal/complaints" element={<ComplaintsPolicy />} />
                <Route path="/legal/financial-records" element={<FinancialRecords />} />
                <Route path="/legal/governance" element={<Governance />} />
                <Route path="/legal/ethics" element={<EthicsPolicy />} />
                <Route path="/legal/regulator-communications" element={<RegulatorCommunications />} />
                <Route path="/legal/data-residency" element={<DataResidency />} />
                <Route path="/admin/legal-docs" element={<LegalDocCenter />} />
                <Route path="/admin/evidence-logging" element={<EvidenceLogging />} />
                <Route path="/admin/case-files" element={<CaseFileSystem />} />
                <Route path="/admin/legal-response" element={<LegalResponseProtocols />} />
                <Route path="/help" element={<HelpCenter />} />
                <Route path="/promotions" element={<Promotions />} />
                <Route path="/restaurant-registration" element={<RestaurantRegistration />} />
                
                {/* P2P Car Rental - Owner Routes */}
                <Route path="/list-your-car" element={<ListYourCar />} />
                <Route path="/owner/apply" element={<ProtectedRoute><OwnerApply /></ProtectedRoute>} />
                <Route path="/owner/dashboard" element={<ProtectedRoute><OwnerDashboard /></ProtectedRoute>} />
                <Route path="/owner/profile" element={<ProtectedRoute><OwnerProfile /></ProtectedRoute>} />
                <Route path="/owner/cars" element={<ProtectedRoute><OwnerCars /></ProtectedRoute>} />
                <Route path="/owner/cars/new" element={<ProtectedRoute><AddVehicle /></ProtectedRoute>} />
                <Route path="/owner/cars/:id/edit" element={<ProtectedRoute><EditVehicle /></ProtectedRoute>} />
                <Route path="/owner/cars/:id/availability" element={<ProtectedRoute><VehicleAvailability /></ProtectedRoute>} />
                <Route path="/owner/bookings" element={<ProtectedRoute><OwnerBookings /></ProtectedRoute>} />
                <Route path="/owner/earnings" element={<ProtectedRoute><OwnerEarningsPage /></ProtectedRoute>} />
                <Route path="/owner/payouts" element={<ProtectedRoute><OwnerPayouts /></ProtectedRoute>} />
                <Route path="/owner/stripe-connect/return" element={<ProtectedRoute><StripeConnectReturn /></ProtectedRoute>} />
                <Route path="/owner/stripe-connect/refresh" element={<ProtectedRoute><StripeConnectReturn /></ProtectedRoute>} />
                
                {/* Public Car Routes */}
                <Route path="/cars" element={<Cars />} />
                <Route path="/rent" element={<HowToRent />} />
                
                {/* Renter Dashboard Routes */}
                <Route path="/renter/dashboard" element={<ProtectedRoute><RenterDashboard /></ProtectedRoute>} />
                <Route path="/renter/bookings" element={<ProtectedRoute><RenterBookings /></ProtectedRoute>} />
                <Route path="/renter/verification" element={<ProtectedRoute><RenterVerification /></ProtectedRoute>} />
                {/* P2P Car Rental - Renter Routes */}
                <Route path="/p2p/search" element={<P2PVehicleSearch />} />
                <Route path="/p2p/vehicle/:id" element={<P2PVehicleDetail />} />
                <Route path="/p2p/booking/:id/confirmation" element={<ProtectedRoute><P2PBookingConfirmation /></ProtectedRoute>} />
                <Route path="/p2p/my-trips" element={<ProtectedRoute><RenterTrips /></ProtectedRoute>} />
                
                {/* Renter Verification Routes */}
                <Route path="/verify/driver" element={<ProtectedRoute><RenterVerification /></ProtectedRoute>} />
                <Route path="/verify/status" element={<ProtectedRoute><VerificationStatus /></ProtectedRoute>} />
                
                {/* Beta Routes */}
                <Route path="/beta/waitlist" element={<RenterWaitlist />} />
                
                {/* Damage Report Routes */}
                <Route path="/booking/:bookingId/report-damage" element={<ProtectedRoute><ReportDamage /></ProtectedRoute>} />
                <Route path="/owner/booking/:bookingId/report-damage" element={<ProtectedRoute><ReportDamage /></ProtectedRoute>} />
                <Route path="/damage/:reportId/status" element={<ProtectedRoute><DamageReportStatus /></ProtectedRoute>} />
                
                <Route path="/community-guidelines" element={<CommunityGuidelines />} />
                <Route path="/insurance" element={<InsurancePolicy />} />
                {/* P2P Legal Pages */}
                <Route path="/terms/renter" element={<RenterTerms />} />
                <Route path="/terms/owner" element={<OwnerTerms />} />
                <Route path="/damage-policy" element={<DamagePolicy />} />
                <Route path="/accessibility" element={<AccessibilityStatement />} />
                <Route path="/affiliate-disclosure" element={<AffiliateDisclosure />} />
                <Route path="/partner-disclosure" element={<PartnerDisclosure />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/how-it-works" element={<HowItWorks />} />
                <Route path="/partners" element={<Partners />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/refunds" element={<Refunds />} />
                <Route path="/company" element={<Company />} />
                <Route path="/security" element={<Security />} />
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
                <Route path="/cookies" element={<CookiePolicy />} />
                <Route path="/cancellation-policy" element={<CancellationPolicy />} />
                <Route path="/legal/seller-of-travel" element={<SellerOfTravel />} />
                <Route path="/legal/security-incident" element={<SecurityIncident />} />
                <Route path="/faq" element={<FAQPage />} />
                <Route path="/booking/return" element={<BookingReturn />} />
                <Route path="/package-delivery" element={<PackageDelivery />} />
                <Route path="/ground-transport" element={<GroundTransport />} />
                <Route path="/events" element={<Events />} />
                <Route path="/things-to-do" element={<ThingsToDo />} />
                <Route path="/activities" element={<ThingsToDo />} />
                <Route path="/experiences" element={<ThingsToDo />} />
                <Route path="/travel-insurance" element={<TravelInsurance />} />
                <Route path="/extras" element={<TravelExtras />} />
                <Route path="/install" element={<Install />} />
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute requireAdmin>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/ab-testing"
                  element={
                    <ProtectedRoute requireAdmin>
                      <ABTestingDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/revenue"
                  element={
                    <ProtectedRoute requireAdmin>
                      <RevenueDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/growth"
                  element={
                    <ProtectedRoute requireAdmin>
                      <GrowthDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/clicks"
                  element={
                    <ProtectedRoute requireAdmin>
                      <ClicksAnalytics />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/travel"
                  element={
                    <ProtectedRoute requireAdmin>
                      <TravelAdminDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/travel/partners"
                  element={
                    <ProtectedRoute requireAdmin>
                      <TravelPartnersPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/travel/handoff"
                  element={
                    <ProtectedRoute requireAdmin>
                      <TravelHandoffPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/travel/logs"
                  element={
                    <ProtectedRoute requireAdmin>
                      <TravelLogsPage />
                    </ProtectedRoute>
                  }
                />
                {/* Flight Debug Panel */}
                <Route
                  path="/admin/flights/debug"
                  element={
                    <ProtectedRoute requireAdmin>
                      <FlightDebugPage />
                    </ProtectedRoute>
                  }
                />
                {/* Flight Status Dashboard */}
                <Route
                  path="/admin/flights/status"
                  element={
                    <ProtectedRoute requireAdmin>
                      <FlightStatusPage />
                    </ProtectedRoute>
                  }
                />
                {/* Flights Launch Control */}
                <Route
                  path="/admin/flights/launch"
                  element={
                    <ProtectedRoute requireAdmin>
                      <FlightsLaunchControl />
                    </ProtectedRoute>
                  }
                  />
                {/* Flights Incident Log */}
                <Route
                  path="/admin/flights/incidents"
                  element={
                    <ProtectedRoute requireAdmin>
                      <FlightIncidentLog />
                    </ProtectedRoute>
                  }
                />
                {/* Flight Analytics Dashboard */}
                <Route
                  path="/admin/flights/analytics"
                  element={
                    <ProtectedRoute requireAdmin>
                      <FlightAnalyticsPage />
                    </ProtectedRoute>
                  }
                />
                {/* Flight Refunds Admin */}
                <Route
                  path="/admin/flights/refunds"
                  element={
                    <ProtectedRoute requireAdmin>
                      <FlightRefundsPage />
                    </ProtectedRoute>
                  }
                />
                {/* Flight Email Logs */}
                <Route
                  path="/admin/flights/emails"
                  element={
                    <ProtectedRoute requireAdmin>
                      <FlightEmailLogsPage />
                    </ProtectedRoute>
                  }
                />
                {/* Flight Performance & Costs */}
                <Route
                  path="/admin/flights/performance"
                  element={
                    <ProtectedRoute requireAdmin>
                      <FlightPerformancePage />
                    </ProtectedRoute>
                  }
                />
{/* Car Rental Admin Settings */}
                <Route
                  path="/admin/cars/settings"
                  element={
                    <ProtectedRoute requireAdmin>
                      <CarRentalSettingsPage />
                    </ProtectedRoute>
                  }
                />
                {/* Car Damage Claims Admin */}
                <Route
                  path="/admin/cars/damage-claims"
                  element={
                    <ProtectedRoute requireAdmin>
                      <CarDamageClaimsPage />
                    </ProtectedRoute>
                  }
                />
                {/* Car Revenue Overview */}
                <Route
                  path="/admin/cars/revenue"
                  element={
                    <ProtectedRoute requireAdmin>
                      <CarRevenueOverviewPage />
                    </ProtectedRoute>
                  }
                />
                {/* Fleet Oversight */}
                <Route
                  path="/admin/fleets"
                  element={
                    <ProtectedRoute requireAdmin>
                      <FleetOversightPage />
                    </ProtectedRoute>
                  }
                />
                {/* Fleet Dashboard */}
                <Route path="/fleet/dashboard" element={<FleetDashboard />} />
                <Route path="/fleet/onboarding" element={<FleetOnboarding />} />
                {/* Business Account */}
                <Route path="/business/account" element={<BusinessAccountPage />} />
                {/* Seller of Travel Settings */}
                <Route
                  path="/admin/travel/seller-of-travel"
                  element={
                    <ProtectedRoute requireAdmin>
                      <SellerOfTravelSettings />
                    </ProtectedRoute>
                  }
                />
                {/* System Status Dashboard */}
                <Route
                  path="/admin/system/status"
                  element={
                    <ProtectedRoute requireAdmin>
                      <SystemStatusPage />
                    </ProtectedRoute>
                  }
                />
                {/* Admin QA & Compliance */}
                <Route
                  path="/admin/qa"
                  element={
                    <ProtectedRoute requireAdmin>
                      <AdminQA />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/compliance"
                  element={
                    <ProtectedRoute requireAdmin>
                      <AdminCompliance />
                    </ProtectedRoute>
                  }
                />
                {/* Enterprise Security Dashboard */}
                <Route
                  path="/admin/security"
                  element={
                    <ProtectedRoute requireAdmin>
                      <SecurityDashboard />
                    </ProtectedRoute>
                  }
                />
                {/* Global Dashboard */}
                <Route
                  path="/admin/global"
                  element={
                    <ProtectedRoute requireAdmin>
                      <GlobalDashboard />
                    </ProtectedRoute>
                  }
                />
                {/* AI Insights Dashboard */}
                <Route
                  path="/admin/ai-insights"
                  element={
                    <ProtectedRoute requireAdmin>
                      <AIInsightsDashboard />
                    </ProtectedRoute>
                  }
                />
                {/* Recovery Dashboard */}
                <Route
                  path="/admin/recovery"
                  element={
                    <ProtectedRoute requireAdmin>
                      <RecoveryDashboard />
                    </ProtectedRoute>
                  }
                />
                {/* Legal Control Dashboard */}
                <Route
                  path="/admin/legal-control"
                  element={
                    <ProtectedRoute requireAdmin>
                      <LegalControlDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/mobile"
                  element={
                    <ProtectedRoute requireAdmin>
                      <AdminMobile />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/email"
                  element={
                    <ProtectedRoute requireAdmin>
                      <AdminEmail />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/support"
                  element={
                    <ProtectedRoute requireAdmin>
                      <AdminSupport />
                    </ProtectedRoute>
                  }
                />
                {/* Public Support Pages */}
                <Route path="/help" element={<Help />} />
                <Route path="/support/travel-bookings" element={<TravelBookingsSupport />} />
                <Route path="/support/site-issues" element={<SiteIssuesSupport />} />
                <Route path="/partner/overview" element={<PartnerOverview />} />
                {/* Offline fallback page for PWA */}
                <Route path="/offline" element={<Offline />} />
                {/* Outbound redirect for affiliate tracking */}
                <Route path="/out" element={<OutboundRedirect />} />
                {/* Tracking test page (hidden from nav) */}
                <Route path="/tracking-test" element={<TrackingTest />} />
                {/* Ad Landing Pages - for paid traffic */}
                <Route path="/ads/flights" element={<FlightsAdLanding />} />
                <Route path="/ads/hotels" element={<HotelsAdLanding />} />
                <Route path="/ads/car-rental" element={<CarsAdLanding />} />
                <Route path="/ads/transfers" element={<TransfersAdLanding />} />
                <Route path="/ads/activities" element={<ActivitiesAdLanding />} />
                {/* Creator Pages - for influencer traffic */}
                <Route path="/creators" element={<Creators />} />
                <Route path="/creators/flights" element={<FlightsCreatorLanding />} />
                <Route path="/creators/hotels" element={<HotelsCreatorLanding />} />
                <Route path="/creators/car-rental" element={<CarsCreatorLanding />} />
                <Route path="/creators/extras" element={<ExtrasCreatorLanding />} />
                {/* LP Pages - Ad-safe landing pages for paid traffic */}
                <Route path="/lp/flights" element={<FlightsLP />} />
                <Route path="/lp/hotels" element={<HotelsLP />} />
                <Route path="/lp/cars" element={<CarsLP />} />
                <Route path="/lp/extras" element={<ExtrasLP />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </RealtimeSyncProvider>
          </UTMProvider>
          </CurrencyProvider>
          <CookieConsent />
          <PWAInstallPrompt />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
