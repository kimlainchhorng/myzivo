import { useIsMobile } from "@/hooks/use-mobile";
import Footer from "@/components/Footer";
import { OGImageMeta } from "@/components/marketing";
import GlobalTrustBar from "@/components/shared/GlobalTrustBar";

// Desktop components
import NavBar from "@/components/home/NavBar";
import HeroSection from "@/components/home/HeroSection";
import ServicesGrid from "@/components/home/ServicesGrid";
import HowItWorksSimple from "@/components/home/HowItWorksSimple";
import PopularDestinations from "@/components/home/PopularDestinations";
import ExtrasSection from "@/components/home/ExtrasSection";
import TrustSection from "@/components/home/TrustSection";
import OneAppSection from "@/components/home/OneAppSection";

// Mobile app home
import AppHome from "@/pages/app/AppHome";

// Desktop version - Clean, premium layout
const DesktopHomePage = () => {
  return (
    <div className="min-h-screen bg-background">
      <OGImageMeta pageType="homepage" />
      
      <NavBar />
      
      <main className="pt-16">
        {/* 1. Hero Section - Split layout */}
        <HeroSection />
        
        {/* Trust Bar - Below hero */}
        <GlobalTrustBar />
        
        {/* 2. Services Grid (6 cards) */}
        <ServicesGrid />
        
        {/* 3. One App. Many Services. */}
        <OneAppSection />
        
        {/* 4. How It Works (3 steps) */}
        <HowItWorksSimple />
        
        {/* 4. Popular Destinations */}
        <PopularDestinations />
        
        {/* 5. ZIVO More / Extras */}
        <ExtrasSection />
        
        {/* 6. Trust Section (3 bullets) */}
        <TrustSection />
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
