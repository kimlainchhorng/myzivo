import { useEffect, lazy, Suspense } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import SetupRequiredRoute from "@/components/auth/SetupRequiredRoute";
import Footer from "@/components/Footer";
import { OGImageMeta } from "@/components/marketing";
import { WinBackBanner } from "@/components/home/WinBackBanner";

// Desktop components
import NavBar from "@/components/home/NavBar";
import HeroSection from "@/components/home/HeroSection";
import PrimaryServicesSection from "@/components/home/PrimaryServicesSection";
import HowItWorksSimple from "@/components/home/HowItWorksSimple";
import AirlineTrustSection from "@/components/home/AirlineTrustSection";
import PopularRoutesSection from "@/components/home/PopularRoutesSection";
import ExtrasSection from "@/components/home/ExtrasSection";
import SocialProofSection from "@/components/home/SocialProofSection";
import WhyBookWithZivo from "@/components/home/WhyBookWithZivo";
import PriceAlertPromo from "@/components/home/PriceAlertPromo";
import BentoFeatures from "@/components/home/BentoFeatures";
import RecommendedDealsSection from "@/components/home/RecommendedDealsSection";

// Mobile app home - lazy load to match App.tsx pattern
const AppHome = lazy(() => import("@/pages/app/AppHome"));

// Desktop version - Clean, premium layout focused on Flights
const DesktopHomePage = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <OGImageMeta pageType="homepage" />

      <NavBar />

      <main className="pt-16">
        {/* Win-Back Banner for returning users */}
        {user && <WinBackBanner className="mx-auto max-w-5xl mt-4 mx-4 sm:mx-8" />}

        {/* 1. Hero Section with Trust Bar built-in */}
        <HeroSection />

        {/* 2. Why Compare with ZIVO (3 value props) */}
        <WhyBookWithZivo />

        {/* 2.5. Bento Grid Features (Technology Trust) */}
        <BentoFeatures />

        {/* 3. Primary Services (Flights, Hotels, Cars) */}
        <PrimaryServicesSection />

        {/* 4. How ZIVO Works (3 steps) */}
        <HowItWorksSimple />

        {/* 5. Popular Routes */}
        <PopularRoutesSection />

        {/* 5.5. Recommended Deals */}
        <RecommendedDealsSection />

        {/* 6. Price Alert Promo */}
        <PriceAlertPromo />

        {/* 7. Social Proof / Platform Trust */}
        <SocialProofSection />

        {/* 8. Airline Trust Section */}
        <AirlineTrustSection />

        {/* 9. ZIVO Extras */}
        <ExtrasSection />
      </main>

      <Footer />
    </div>
  );
};

const Index = () => {
  const isMobile = useIsMobile();
  const { user } = useAuth();

  // Detect OAuth errors that land on homepage (e.g., allowlist rejection)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const hashParams = new URLSearchParams(window.location.hash.substring(1));

    const error = params.get("error") || hashParams.get("error");
    const errorDesc = params.get("error_description") || hashParams.get("error_description");

    if (error) {
      // Parse user-friendly message
      let message = "Authentication failed. Please try again.";
      if (
        errorDesc?.toLowerCase().includes("database error") ||
        errorDesc?.toLowerCase().includes("saving new user") ||
        errorDesc?.toLowerCase().includes("not on allowlist")
      ) {
        message = "This email is not authorized to sign up. Please request an invitation to join ZIVO.";
      }

      toast({
        title: "Sign-up blocked",
        description: message,
        variant: "destructive",
      });

      // Clean URL without reloading page
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  // Mobile: only enforce setup gate when a user is signed in.
  // This prevents "new Google account" users from bypassing /setup after OAuth.
  if (isMobile) {
    if (user) {
      return (
        <SetupRequiredRoute>
          <Suspense fallback={<div className="min-h-screen bg-background" />}>
            <AppHome />
          </Suspense>
        </SetupRequiredRoute>
      );
    }

    // Keep current public mobile experience for signed-out visitors.
    return (
      <Suspense fallback={<div className="min-h-screen bg-background" />}>
        <AppHome />
      </Suspense>
    );
  }

  // Desktop version
  return <DesktopHomePage />;
};

export default Index;
