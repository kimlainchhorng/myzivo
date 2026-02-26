import { useEffect, lazy, Suspense } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import SetupRequiredRoute from "@/components/auth/SetupRequiredRoute";
import Footer from "@/components/Footer";
import { OGImageMeta } from "@/components/marketing";
import { WinBackBanner } from "@/components/home/WinBackBanner";
import LazySection from "@/components/shared/LazySection";
import { OrganizationSchema, WebsiteSearchSchema } from "@/components/seo/StructuredData";

// Above-fold components (eager loaded for fast LCP)
import NavBar from "@/components/home/NavBar";
import HeroSection from "@/components/home/HeroSection";
import HeroSearchCard from "@/components/home/HeroSearchCard";
import ServicesShowcase from "@/components/home/ServicesShowcase";
import StatsSection from "@/components/home/StatsSection";

// Below-fold components (lazy loaded for performance)
const DestinationShowcase = lazy(() => import("@/components/home/DestinationShowcase"));
const FeaturedCarsSection = lazy(() => import("@/components/home/FeaturedCarsSection"));
const FeaturedHotelsSection = lazy(() => import("@/components/home/FeaturedHotelsSection"));
const FeaturedEatsSection = lazy(() => import("@/components/home/FeaturedEatsSection"));
const HowItWorksSection = lazy(() => import("@/components/home/HowItWorksSection"));
const TestimonialsSection = lazy(() => import("@/components/home/TestimonialsSection"));
const PartnerLogosSection = lazy(() => import("@/components/home/PartnerLogosSection"));
const DownloadAppSection = lazy(() => import("@/components/home/DownloadAppSection"));
const NewsletterSection = lazy(() => import("@/components/home/NewsletterSection"));
const VideoAdsSection = lazy(() => import("@/components/home/VideoAdsSection"));
const ServiceFlowBanner = lazy(() => import("@/components/home/ServiceFlowBanner"));

// Mobile app home
const AppHome = lazy(() => import("@/pages/app/AppHome"));

const SectionFallback = () => (
  <div className="min-h-[250px] flex items-center justify-center">
    <div className="w-7 h-7 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
  </div>
);

// Desktop version - Premium layout with lazy-loaded below-fold sections
const DesktopHomePage = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <OGImageMeta pageType="homepage" />
      <OrganizationSchema />
      <WebsiteSearchSchema />
      <NavBar />

      <main id="main-content" className="pt-16">
        {user && <WinBackBanner className="mx-auto max-w-5xl mt-4 mx-4 sm:mx-8" />}

        {/* Above-fold: Eager loaded */}
        <HeroSection />
        <HeroSearchCard />
        <ServicesShowcase />
        <StatsSection />

        {/* Below-fold: Lazy loaded with IntersectionObserver */}
        <LazySection><Suspense fallback={<SectionFallback />}><VideoAdsSection /></Suspense></LazySection>
        <LazySection><Suspense fallback={<SectionFallback />}><ServiceFlowBanner /></Suspense></LazySection>
        <LazySection><Suspense fallback={<SectionFallback />}><PartnerLogosSection /></Suspense></LazySection>
        <LazySection><Suspense fallback={<SectionFallback />}><DestinationShowcase /></Suspense></LazySection>
        <LazySection><Suspense fallback={<SectionFallback />}><FeaturedCarsSection /></Suspense></LazySection>
        <LazySection><Suspense fallback={<SectionFallback />}><FeaturedHotelsSection /></Suspense></LazySection>
        <LazySection><Suspense fallback={<SectionFallback />}><FeaturedEatsSection /></Suspense></LazySection>
        <LazySection><Suspense fallback={<SectionFallback />}><HowItWorksSection /></Suspense></LazySection>
        <LazySection><Suspense fallback={<SectionFallback />}><TestimonialsSection /></Suspense></LazySection>
        <LazySection><Suspense fallback={<SectionFallback />}><DownloadAppSection /></Suspense></LazySection>
        <LazySection><Suspense fallback={<SectionFallback />}><NewsletterSection /></Suspense></LazySection>
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
