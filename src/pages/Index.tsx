import { useEffect, lazy, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import SetupRequiredRoute from "@/components/auth/SetupRequiredRoute";
import Footer from "@/components/Footer";
import { OGImageMeta } from "@/components/marketing";
import { WinBackBanner } from "@/components/home/WinBackBanner";
import LazySection from "@/components/shared/LazySection";
import { OrganizationSchema, WebsiteSearchSchema } from "@/components/seo/StructuredData";
import {
  CardGridSkeleton,
  RoutesSkeleton,
  StepsSkeleton,
  TestimonialsSkeleton,
  BannerSkeleton,
  LogosSkeleton,
} from "@/components/shared/SectionSkeleton";
import { lazyRetry } from "@/lib/lazyRetry";

// Above-fold components (eager loaded for fast LCP)
import NavBar from "@/components/home/NavBar";
import HeroSection from "@/components/home/HeroSection";
import HeroSearchCard from "@/components/home/HeroSearchCard";
import ServicesShowcase from "@/components/home/ServicesShowcase";
import StatsSection from "@/components/home/StatsSection";

// Below-fold components (lazy loaded with retry for chunk resilience)
const DestinationShowcase = lazy(() => lazyRetry(() => import("@/components/home/DestinationShowcase")));
const PopularRoutesSection = lazy(() => lazyRetry(() => import("@/components/home/PopularRoutesSection")));
const FeaturedCarsSection = lazy(() => lazyRetry(() => import("@/components/home/FeaturedCarsSection")));
const FeaturedHotelsSection = lazy(() => lazyRetry(() => import("@/components/home/FeaturedHotelsSection")));
const FeaturedEatsSection = lazy(() => lazyRetry(() => import("@/components/home/FeaturedEatsSection")));
const HowItWorksSection = lazy(() => lazyRetry(() => import("@/components/home/HowItWorksSection")));
const TestimonialsSection = lazy(() => lazyRetry(() => import("@/components/home/TestimonialsSection")));
const PartnerLogosSection = lazy(() => lazyRetry(() => import("@/components/home/PartnerLogosSection")));
const DownloadAppSection = lazy(() => lazyRetry(() => import("@/components/home/DownloadAppSection")));
const NewsletterSection = lazy(() => lazyRetry(() => import("@/components/home/NewsletterSection")));
const VideoAdsSection = lazy(() => lazyRetry(() => import("@/components/home/VideoAdsSection")));
const ServiceFlowBanner = lazy(() => lazyRetry(() => import("@/components/home/ServiceFlowBanner")));

// Mobile app home
const AppHome = lazy(() => lazyRetry(() => import("@/pages/app/AppHome")));

// Desktop version - Premium layout with lazy-loaded below-fold sections
const DesktopHomePage = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background perspective-container">
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

        {/* Below-fold: Lazy loaded with content-aware skeletons */}
        <LazySection><Suspense fallback={<BannerSkeleton />}><VideoAdsSection /></Suspense></LazySection>
        <LazySection><Suspense fallback={<RoutesSkeleton />}><PopularRoutesSection /></Suspense></LazySection>
        <LazySection><Suspense fallback={<BannerSkeleton />}><ServiceFlowBanner /></Suspense></LazySection>
        <LazySection><Suspense fallback={<LogosSkeleton />}><PartnerLogosSection /></Suspense></LazySection>
        <LazySection><Suspense fallback={<CardGridSkeleton />}><DestinationShowcase /></Suspense></LazySection>
        <LazySection><Suspense fallback={<CardGridSkeleton />}><FeaturedCarsSection /></Suspense></LazySection>
        <LazySection><Suspense fallback={<CardGridSkeleton />}><FeaturedHotelsSection /></Suspense></LazySection>
        <LazySection><Suspense fallback={<CardGridSkeleton />}><FeaturedEatsSection /></Suspense></LazySection>
        <LazySection><Suspense fallback={<StepsSkeleton />}><HowItWorksSection /></Suspense></LazySection>
        <LazySection><Suspense fallback={<TestimonialsSkeleton />}><TestimonialsSection /></Suspense></LazySection>
        <LazySection><Suspense fallback={<BannerSkeleton />}><DownloadAppSection /></Suspense></LazySection>
        <LazySection><Suspense fallback={<BannerSkeleton />}><NewsletterSection /></Suspense></LazySection>
      </main>

      <Footer />
    </div>
  );
};

const Index = () => {
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const navigate = useNavigate();
  
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
