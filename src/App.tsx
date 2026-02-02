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

// Lazy load all other pages for faster initial load
const Rides = lazy(() => import("./pages/Rides"));
const Eats = lazy(() => import("./pages/Eats"));
const EatsRestaurants = lazy(() => import("./pages/EatsRestaurants"));
const EatsRestaurantMenu = lazy(() => import("./pages/EatsRestaurantMenu"));
const EatsCheckout = lazy(() => import("./pages/EatsCheckout"));
const TripHistory = lazy(() => import("./pages/TripHistory"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const DriverRegistration = lazy(() => import("./pages/DriverRegistration"));
const DriverApp = lazy(() => import("./pages/DriverApp"));
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
const DuffelCheckout = lazy(() => import("./pages/DuffelCheckout"));
const HotelBooking = lazy(() => import("./pages/HotelBooking"));
const HotelLanding = lazy(() => import("./pages/HotelLanding"));
const HotelsPage = lazy(() => import("./pages/HotelsPage"));
const CarRentalBooking = lazy(() => import("./pages/CarRentalBooking"));
const CarResultsPage = lazy(() => import("./pages/CarResultsPage"));
const CarRentalLanding = lazy(() => import("./pages/CarRentalLanding"));
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

// Legal pages - lazy load
const TermsOfService = lazy(() => import("./pages/legal/TermsOfService"));
const PrivacyPolicy = lazy(() => import("./pages/legal/PrivacyPolicy"));
const RefundPolicy = lazy(() => import("./pages/legal/RefundPolicy"));
const PartnerAgreement = lazy(() => import("./pages/legal/PartnerAgreement"));
const CommunityGuidelines = lazy(() => import("./pages/legal/CommunityGuidelines"));
const InsurancePolicy = lazy(() => import("./pages/legal/InsurancePolicy"));
const AccessibilityStatement = lazy(() => import("./pages/legal/AccessibilityStatement"));
const CookiePolicy = lazy(() => import("./pages/legal/CookiePolicy"));
const PartnerDisclosure = lazy(() => import("./pages/legal/PartnerDisclosure"));
const AffiliateDisclosure = lazy(() => import("./pages/AffiliateDisclosure"));
const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Contact"));
const HowItWorks = lazy(() => import("./pages/HowItWorks"));
const Partners = lazy(() => import("./pages/Partners"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Terms = lazy(() => import("./pages/Terms"));
const BookingReturn = lazy(() => import("./pages/BookingReturnPage"));

// Support pages
const Help = lazy(() => import("./pages/Help"));
const TravelBookingsSupport = lazy(() => import("./pages/support/TravelBookings"));
const SiteIssuesSupport = lazy(() => import("./pages/support/SiteIssues"));
const PartnerOverview = lazy(() => import("./pages/partner/Overview"));

// Admin pages - lazy load
const ABTestingDashboard = lazy(() => import("./pages/admin/ABTestingDashboard"));
const RevenueDashboard = lazy(() => import("./pages/admin/RevenueDashboard"));
const ClicksAnalytics = lazy(() => import("./pages/admin/ClicksAnalytics"));
const TravelAdminDashboard = lazy(() => import("./pages/admin/TravelAdminDashboard"));
const TravelPartnersPage = lazy(() => import("./pages/admin/TravelPartnersPage"));
const TravelHandoffPage = lazy(() => import("./pages/admin/TravelHandoffPage"));
const TravelLogsPage = lazy(() => import("./pages/admin/TravelLogsPage"));
const AdminQA = lazy(() => import("./pages/admin/AdminQA"));
const AdminCompliance = lazy(() => import("./pages/admin/AdminCompliance"));
const AdminMobile = lazy(() => import("./pages/admin/AdminMobile"));

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
                <Route path="/app" element={<AppHome />} />
                <Route path="/travel" element={<AppTravel />} />
                <Route path="/rides" element={<AppRides />} />
                <Route path="/ride" element={<AppRides />} />
                <Route path="/eats" element={<AppEats />} />
                <Route path="/food" element={<AppEats />} />
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
                <Route path="/flights/:route" element={<FlightLanding />} />
                
                <Route path="/flights/results" element={<FlightResults />} />
                <Route path="/flights/live" element={<FlightLive />} />
                <Route path="/flights/details/:id" element={<FlightDetails />} />
                <Route path="/flights/traveler" element={<FlightTravelerInfo />} />
                <Route path="/booking/duffel-checkout" element={<DuffelCheckout />} />
                
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
                <Route path="/rent-car/:city" element={<CarRentalLanding />} />
                
                <Route path="/profile" element={<Profile />} />
                <Route path="/trips" element={<TripHistory />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/drive" element={<DriverRegistration />} />
                <Route path="/driver" element={<DriverApp />} />
                <Route path="/dashboard" element={<CustomerDashboard />} />
                <Route path="/restaurant" element={<RestaurantDashboard />} />
                <Route path="/car-rental-dashboard" element={<CarRentalDashboard />} />
                <Route path="/flights-dashboard" element={<FlightDashboard />} />
                <Route path="/hotels-dashboard" element={<HotelDashboard />} />
                <Route path="/auth-callback" element={<AuthCallback />} />
                <Route path="/terms-of-service" element={<TermsOfService />} />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/refund-policy" element={<RefundPolicy />} />
                <Route path="/partner-agreement" element={<PartnerAgreement />} />
                <Route path="/help" element={<HelpCenter />} />
                <Route path="/promotions" element={<Promotions />} />
                <Route path="/restaurant-registration" element={<RestaurantRegistration />} />
                <Route path="/community-guidelines" element={<CommunityGuidelines />} />
                <Route path="/insurance" element={<InsurancePolicy />} />
                <Route path="/accessibility" element={<AccessibilityStatement />} />
                <Route path="/affiliate-disclosure" element={<AffiliateDisclosure />} />
                <Route path="/partner-disclosure" element={<PartnerDisclosure />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/how-it-works" element={<HowItWorks />} />
                <Route path="/partners" element={<Partners />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/cookies" element={<CookiePolicy />} />
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
                <Route
                  path="/admin/mobile"
                  element={
                    <ProtectedRoute requireAdmin>
                      <AdminMobile />
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
