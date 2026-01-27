import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import FeaturesSection from "@/components/FeaturesSection";
import TrustSection from "@/components/TrustSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import DriverCTASection from "@/components/DriverCTASection";
import AppDownloadSection from "@/components/AppDownloadSection";
import Footer from "@/components/Footer";
import StatsSection from "@/components/StatsSection";
import { QuickActionsSection, TrendingSection, LiveStatsSection, AllServicesSection } from "@/components/home/HomeSections";
import PromoBanner from "@/components/home/PromoBanner";
import HowItWorks from "@/components/home/HowItWorks";
import PartnersSection from "@/components/home/PartnersSection";
import CTASection from "@/components/home/CTASection";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        <PromoBanner />
        <QuickActionsSection />
        <TrendingSection />
        <StatsSection />
        <LiveStatsSection />
        <FeaturesSection />
        <HowItWorks />
        <AllServicesSection />
        <TrustSection />
        <TestimonialsSection />
        <PartnersSection />
        <DriverCTASection />
        <CTASection />
        <AppDownloadSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
