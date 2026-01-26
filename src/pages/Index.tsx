import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import StatsSection from "@/components/StatsSection";
import FeaturesSection from "@/components/FeaturesSection";
import ServicesShowcase from "@/components/ServicesShowcase";
import TrustSection from "@/components/TrustSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import DriverCTASection from "@/components/DriverCTASection";
import AppDownloadSection from "@/components/AppDownloadSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        <StatsSection />
        <FeaturesSection />
        <ServicesShowcase />
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
