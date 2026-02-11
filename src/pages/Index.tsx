import { useEffect, lazy, Suspense, useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import SetupRequiredRoute from "@/components/auth/SetupRequiredRoute";
import Footer from "@/components/Footer";
import { OGImageMeta } from "@/components/marketing";
import { WinBackBanner } from "@/components/home/WinBackBanner";
import { motion } from "framer-motion";
import { Plane } from "lucide-react";
import { useNavigate } from "react-router-dom";
import HomepageAdBanner from "@/components/ads/HomepageAdBanner";

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
import TestimonialsCarousel from "@/components/home/TestimonialsCarousel";
import AppDownloadCTA from "@/components/home/AppDownloadCTA";
import DestinationShowcase from "@/components/home/DestinationShowcase";

// Mobile app home - lazy load to match App.tsx pattern
const AppHome = lazy(() => import("@/pages/app/AppHome"));

// Scroll animation wrapper
const FadeInSection = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-80px" }}
    transition={{ duration: 0.5, ease: "easeOut" }}
    className={className}
  >
    {children}
  </motion.div>
);

// Desktop version - Clean, premium layout focused on Flights
const DesktopHomePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showStickyCTA, setShowStickyCTA] = useState(false);

  // Show sticky CTA after scrolling past hero
  useEffect(() => {
    const handleScroll = () => {
      setShowStickyCTA(window.scrollY > 600);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
        <FadeInSection>
          <WhyBookWithZivo />
        </FadeInSection>

        {/* 2.5. Bento Grid Features (Technology Trust) */}
        <FadeInSection>
          <BentoFeatures />
        </FadeInSection>

        {/* 3. Primary Services (Flights, Hotels, Cars) */}
        <FadeInSection>
          <PrimaryServicesSection />
        </FadeInSection>

        {/* 4. How ZIVO Works (3 steps) */}
        <FadeInSection>
          <HowItWorksSimple />
        </FadeInSection>

        {/* Sponsored Ad Banner */}
        <FadeInSection className="container mx-auto px-4 py-6">
          <HomepageAdBanner
            headline="Fly smarter with ZIVO+"
            description="Members save up to 20% on flights, hotels, and car rentals."
            ctaText="Learn More"
            ctaHref="/membership"
          />
        </FadeInSection>

        {/* 5. Popular Routes */}
        <FadeInSection>
          <PopularRoutesSection />
        </FadeInSection>

        {/* Second Sponsored Ad Banner */}
        <FadeInSection className="container mx-auto px-4 py-6">
          <HomepageAdBanner
            headline="Summer travel deals 🌊"
            description="Exclusive fares to beach destinations — book before they're gone."
            ctaText="View Deals"
            ctaHref="/flights"
          />
        </FadeInSection>

        {/* 5.5. Smart Offers (signed-in) / Recommended Deals (signed-out) */}
        <FadeInSection>
          {user ? <SmartOffersSection /> : <RecommendedDealsSection />}
        </FadeInSection>

        {/* 6. Price Alert Promo */}
        <FadeInSection>
          <PriceAlertPromo />
        </FadeInSection>

        {/* 7. Social Proof / Platform Trust */}
        <FadeInSection>
          <SocialProofSection />
        </FadeInSection>

        {/* 8. Airline Trust Section */}
        <FadeInSection>
          <AirlineTrustSection />
        </FadeInSection>

        {/* 9. Destination Showcase */}
        <FadeInSection>
          <DestinationShowcase />
        </FadeInSection>

        {/* 10. Testimonials */}
        <FadeInSection>
          <TestimonialsCarousel />
        </FadeInSection>

        {/* 11. ZIVO Extras */}
        <FadeInSection>
          <ExtrasSection />
        </FadeInSection>

        {/* 12. App Download CTA */}
        <FadeInSection>
          <AppDownloadCTA />
        </FadeInSection>
      </main>

      {/* Sticky Search Flights CTA */}
      <motion.div
        initial={false}
        animate={{ y: showStickyCTA ? 0 : 100, opacity: showStickyCTA ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40"
      >
        <button
          onClick={() => navigate("/flights")}
          className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-full shadow-xl font-semibold text-sm hover:scale-105 transition-transform"
        >
          <Plane className="w-4 h-4" />
          Search Flights
        </button>
      </motion.div>

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
