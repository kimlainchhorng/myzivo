import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import FeaturesSection from "@/components/FeaturesSection";
import TrustSection from "@/components/TrustSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import DriverCTASection from "@/components/DriverCTASection";
import AppDownloadSection from "@/components/AppDownloadSection";
import Footer from "@/components/Footer";
import { QuickActionsSection, TrendingSection, LiveStatsSection, AllServicesSection } from "@/components/home/HomeSections";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        <QuickActionsSection />
        <TrendingSection />
        <LiveStatsSection />
        <FeaturesSection />
        <AllServicesSection />
        <TrustSection />
        <TestimonialsSection />
        <DriverCTASection />
        <AppDownloadSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
