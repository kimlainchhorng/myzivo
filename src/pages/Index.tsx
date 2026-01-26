import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import FeaturesSection from "@/components/FeaturesSection";
import RideOptionsSection from "@/components/RideOptionsSection";
import EatsSection from "@/components/EatsSection";
import DriverCTASection from "@/components/DriverCTASection";
import AppDownloadSection from "@/components/AppDownloadSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        <FeaturesSection />
        <RideOptionsSection />
        <EatsSection />
        <DriverCTASection />
        <AppDownloadSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
