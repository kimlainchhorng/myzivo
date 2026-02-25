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

// Desktop components
import NavBar from "@/components/home/NavBar";
import HeroSection from "@/components/home/HeroSection";
import WhyBookWithZivo from "@/components/home/WhyBookWithZivo";
import RecommendedDealsSection from "@/components/home/RecommendedDealsSection";
import SmartOffersSection from "@/components/home/SmartOffersSection";
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

// Desktop version - Clean, premium layout
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

        {/* 1. Hero Section */}
        <HeroSection />

        {/* 2. Popular Destinations */}
        <FadeInSection>
          <DestinationShowcase />
        </FadeInSection>

        {/* 3. Best Deals / Smart Offers */}
        <FadeInSection>
          {user ? <SmartOffersSection /> : <RecommendedDealsSection />}
        </FadeInSection>

        {/* 4. Why ZIVO */}
        <FadeInSection>
          <WhyBookWithZivo />
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
          className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-full shadow-xl font-semibold text-sm hover:scale-105 transition-transform glow-green-btn"
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

      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

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

    return (
      <Suspense fallback={<div className="min-h-screen bg-background" />}>
        <AppHome />
      </Suspense>
    );
  }

  return <DesktopHomePage />;
};

export default Index;
