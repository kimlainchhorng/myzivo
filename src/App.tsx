import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { RealtimeSyncProvider } from "@/contexts/RealtimeSyncContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import AdminDashboard from "./pages/AdminDashboard";
import RiderApp from "./pages/RiderApp";
import TripHistory from "./pages/TripHistory";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import DriverRegistration from "./pages/DriverRegistration";
import DriverApp from "./pages/DriverApp";
import CustomerDashboard from "./pages/CustomerDashboard";
import RestaurantDashboard from "./pages/RestaurantDashboard";
import CarRentalDashboard from "./pages/CarRentalDashboard";
import FlightDashboard from "./pages/FlightDashboard";
import HotelDashboard from "./pages/HotelDashboard";
import AuthCallback from "./pages/AuthCallback";
import NotFound from "./pages/NotFound";
import TermsOfService from "./pages/legal/TermsOfService";
import PrivacyPolicy from "./pages/legal/PrivacyPolicy";
import RefundPolicy from "./pages/legal/RefundPolicy";
import PartnerAgreement from "./pages/legal/PartnerAgreement";
import CommunityGuidelines from "./pages/legal/CommunityGuidelines";
import InsurancePolicy from "./pages/legal/InsurancePolicy";
import AccessibilityStatement from "./pages/legal/AccessibilityStatement";
import HelpCenter from "./pages/HelpCenter";
import Promotions from "./pages/Promotions";
import RestaurantRegistration from "./pages/RestaurantRegistration";
import CookieConsent from "./components/common/CookieConsent";
import FoodOrdering from "./pages/FoodOrdering";
import FlightBooking from "./pages/FlightBooking";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <RealtimeSyncProvider>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/food" element={<FoodOrdering />} />
              <Route path="/ride" element={<RiderApp />} />
              <Route path="/book-flight" element={<FlightBooking />} />
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
          </RealtimeSyncProvider>
          <CookieConsent />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
