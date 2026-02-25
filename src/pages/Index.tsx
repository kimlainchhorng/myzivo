import { useEffect, lazy, Suspense, useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import SetupRequiredRoute from "@/components/auth/SetupRequiredRoute";
import Footer from "@/components/Footer";
import { OGImageMeta } from "@/components/marketing";
import { WinBackBanner } from "@/components/home/WinBackBanner";
import { useNavigate } from "react-router-dom";

// Desktop components
import NavBar from "@/components/home/NavBar";
import HeroSection from "@/components/home/HeroSection";
import HeroSearchCard from "@/components/home/HeroSearchCard";
import ServicesShowcase from "@/components/home/ServicesShowcase";
import StatsSection from "@/components/home/StatsSection";
import DestinationShowcase from "@/components/home/DestinationShowcase";
import FeaturedCarsSection from "@/components/home/FeaturedCarsSection";
import FeaturedHotelsSection from "@/components/home/FeaturedHotelsSection";
import FeaturedEatsSection from "@/components/home/FeaturedEatsSection";
import HowItWorksSection from "@/components/home/HowItWorksSection";
import WhyBookWithZivo from "@/components/home/WhyBookWithZivo";
import TestimonialsSection from "@/components/home/TestimonialsSection";
import PartnerLogosShowcase from "@/components/home/PartnerLogosShowcase";
import DownloadAppSection from "@/components/home/DownloadAppSection";
import NewsletterSection from "@/components/home/NewsletterSection";

// Mobile app home - lazy load
const AppHome = lazy(() => import("@/pages/app/AppHome"));

// Desktop version - Clean, premium layout
const DesktopHomePage = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <OGImageMeta pageType="homepage" />
      <NavBar />

      <main className="pt-16">
        {user && <WinBackBanner className="mx-auto max-w-5xl mt-4 mx-4 sm:mx-8" />}

        {/* 1. Hero */}
        <HeroSection />

        {/* 2. Floating Search Card */}
        <HeroSearchCard />

        {/* 3. Services Grid */}
        <ServicesShowcase />

        {/* 4. Stats */}
        <StatsSection />

        {/* 5. Partner Logos */}
        <PartnerLogosShowcase />

        {/* 6. Popular Destinations */}
        <DestinationShowcase />

        {/* 7. Featured Car Rentals */}
        <FeaturedCarsSection />

        {/* 8. Featured Hotels */}
        <FeaturedHotelsSection />

        {/* 9. Featured Eats */}
        <FeaturedEatsSection />

        {/* 10. How It Works */}
        <HowItWorksSection />

        {/* 11. Why ZIVO */}
        <WhyBookWithZivo />

        {/* 12. Testimonials */}
        <TestimonialsSection />

        {/* 13. Download App */}
        <DownloadAppSection />

        {/* 14. Newsletter */}
        <NewsletterSection />
      </main>

      <Footer />
    </div>
  );
};

const Index = () => {
  const isMobile = useIsMobile();
  const { user } = useAuth();

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
      toast({ title: "Sign-up blocked", description: message, variant: "destructive" });
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
