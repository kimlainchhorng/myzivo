import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { RealtimeSyncProvider } from "@/contexts/RealtimeSyncContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import CookieConsent from "./components/common/CookieConsent";
import { Loader2 } from "lucide-react";

// Eager load critical pages
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";

// Lazy load all other pages for faster initial load
const RiderApp = lazy(() => import("./pages/RiderApp"));
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
const HotelBooking = lazy(() => import("./pages/HotelBooking"));
const CarRentalBooking = lazy(() => import("./pages/CarRentalBooking"));
const Profile = lazy(() => import("./pages/Profile"));
const PackageDelivery = lazy(() => import("./pages/PackageDelivery"));
const GroundTransport = lazy(() => import("./pages/GroundTransport"));
const Events = lazy(() => import("./pages/Events"));
const TravelInsurance = lazy(() => import("./pages/TravelInsurance"));
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
          <RealtimeSyncProvider>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                {/* Eager loaded routes */}
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                
                {/* Lazy loaded routes */}
                <Route path="/food" element={<FoodOrdering />} />
                <Route path="/ride" element={<RiderApp />} />
                <Route path="/book-flight" element={<FlightBooking />} />
                <Route path="/book-hotel" element={<HotelBooking />} />
                <Route path="/rent-car" element={<CarRentalBooking />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/trips" element={<TripHistory />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/drive" element={<DriverRegistration />} />
                <Route path="/driver" element={<DriverApp />} />
                <Route path="/dashboard" element={<CustomerDashboard />} />
                <Route path="/restaurant" element={<RestaurantDashboard />} />
                <Route path="/car-rental" element={<CarRentalDashboard />} />
                <Route path="/flights" element={<FlightDashboard />} />
                <Route path="/hotels" element={<HotelDashboard />} />
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
                <Route path="/package-delivery" element={<PackageDelivery />} />
                <Route path="/ground-transport" element={<GroundTransport />} />
                <Route path="/events" element={<Events />} />
                <Route path="/travel-insurance" element={<TravelInsurance />} />
                <Route path="/install" element={<Install />} />
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute requireAdmin>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </RealtimeSyncProvider>
          <CookieConsent />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
