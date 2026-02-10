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
import SmartOffersSection from "@/components/home/SmartOffersSection";
import { HomepageAdBanner } from "@/components/ads/HomepageAdBanner";
import { AsSeenOnSection } from "@/components/marketing/AsSeenOnSection";
import { motion } from "framer-motion";

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
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
          <WhyBookWithZivo />
        </motion.div>

        {/* 2.5. Bento Grid Features (Technology Trust) */}
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.1 }}>
          <BentoFeatures />
        </motion.div>

        {/* 3. Primary Services (Flights, Hotels, Cars) */}
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
          <PrimaryServicesSection />
        </motion.div>

        {/* 4. How ZIVO Works (3 steps) */}
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
          <HowItWorksSimple />
        </motion.div>

        {/* 5. Popular Routes */}
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
          <PopularRoutesSection />
        </motion.div>

        {/* Ad Banner */}
        <HomepageAdBanner />

        {/* 5.5. Smart Offers (signed-in) / Recommended Deals (signed-out) */}
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
          {user ? <SmartOffersSection /> : <RecommendedDealsSection />}
        </motion.div>

        {/* 6. Price Alert Promo */}
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
          <PriceAlertPromo />
        </motion.div>

        {/* 7. Social Proof / Platform Trust */}
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
          <SocialProofSection />
        </motion.div>

        {/* 7.5. As Seen On */}
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
          <AsSeenOnSection variant="compact" />
        </motion.div>

        {/* 8. Airline Trust Section */}
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
          <AirlineTrustSection />
        </motion.div>

        {/* 9. ZIVO Extras */}
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
          <ExtrasSection />
        </motion.div>
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
