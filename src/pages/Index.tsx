import { useIsMobile } from "@/hooks/use-mobile";
import Footer from "@/components/Footer";
import { OGImageMeta } from "@/components/marketing";

// Desktop components
import NavBar from "@/components/home/NavBar";
import HeroSection from "@/components/home/HeroSection";
import PrimaryServicesSection from "@/components/home/PrimaryServicesSection";
import HowItWorksSimple from "@/components/home/HowItWorksSimple";
import AirlineTrustSection from "@/components/home/AirlineTrustSection";
import PopularRoutesSection from "@/components/home/PopularRoutesSection";
import ExtrasSection from "@/components/home/ExtrasSection";
import SocialProofSection from "@/components/home/SocialProofSection";

// Mobile app home
import AppHome from "@/pages/app/AppHome";

// Desktop version - Clean, premium layout focused on Flights
const DesktopHomePage = () => {
  return (
    <div className="min-h-screen bg-background">
      <OGImageMeta pageType="homepage" />
      
      <NavBar />
      
      <main className="pt-16">
        {/* 1. Hero Section with Trust Bar built-in */}
        <HeroSection />
        
        {/* 2. Primary Services (Flights, Hotels, Cars) */}
        <PrimaryServicesSection />
        
        {/* 3. How ZIVO Works (3 steps) */}
        <HowItWorksSimple />
        
        {/* 4. Social Proof / Platform Trust */}
        <SocialProofSection />
        
        {/* 5. Popular Flight Routes */}
        <PopularRoutesSection />
        
        {/* 6. Airline Trust Section */}
        <AirlineTrustSection />
        
        {/* 7. ZIVO Extras */}
        <ExtrasSection />
      </main>
      
      <Footer />
    </div>
  );
};

const Index = () => {
  const isMobile = useIsMobile();

  // Render mobile layout for mobile devices
  if (isMobile) {
    return <AppHome />;
  }

  // Render desktop layout for larger screens
  return <DesktopHomePage />;
};

export default Index;
