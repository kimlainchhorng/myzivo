import { useParams } from "react-router-dom";
import { CarFront, Shield, Clock, CheckCircle, ExternalLink } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import TrustIndicators from "@/components/shared/TrustIndicators";
import TravelFAQ from "@/components/shared/TravelFAQ";
import UserTestimonials from "@/components/shared/UserTestimonials";
import VehicleTypeGallery from "@/components/shared/VehicleTypeGallery";
import PhotoDestinationGrid from "@/components/shared/PhotoDestinationGrid";
import PartnerLogosStrip from "@/components/shared/PartnerLogosStrip";
import GlobalTrustBar from "@/components/shared/GlobalTrustBar";
import { InternalLinkGrid } from "@/components/seo";
import { CarSearchFormPro } from "@/components/search";
import { cn } from "@/lib/utils";
import { heroPhotos, serviceOverlays } from "@/config/photos";

const trustBadges = [
  { icon: Shield, text: "Secure booking with partners" },
  { icon: CheckCircle, text: "No booking fees on ZIVO" },
  { icon: Clock, text: "Free cancellation available" },
];

export default function CarRentalLanding() {
  const { location } = useParams<{ location?: string }>();

  const formattedLocation = location?.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  
  const pageTitle = formattedLocation 
    ? `Car Rental in ${formattedLocation} - Compare Prices | ZIVO`
    : "Compare Car Rental Prices from Top Providers | ZIVO";
  
  const pageDescription = formattedLocation
    ? `Find the best car rental deals in ${formattedLocation}. Compare prices from Hertz, Enterprise, Avis and more. No booking fees on ZIVO.`
    : "Compare car rental prices from trusted providers. Find the best rates on rental cars worldwide. No booking fees on ZIVO.";

  const heroImage = heroPhotos.cars;

  return (
    <div className="min-h-screen bg-background">
      <SEOHead title={pageTitle} description={pageDescription} />
      <Header />
      
      <main className="pt-16">
        {/* Hero Section with Photo Background */}
        <section className="relative py-16 sm:py-24 overflow-hidden">
          {/* Background Image */}
          <div className="absolute inset-0">
            <img
              src={heroImage.src}
              alt={heroImage.alt}
              className="absolute inset-0 w-full h-full object-cover"
              loading="eager"
            />
            {/* Gradient Overlay */}
            <div className={cn("absolute inset-0 bg-gradient-to-b", serviceOverlays.cars)} />
            {/* Additional depth */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_0%,_rgba(0,0,0,0.4)_100%)]" />
            {/* Bottom fade */}
            <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-background via-background/80 to-transparent" />
          </div>
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-3xl mx-auto text-center mb-10">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-sm font-medium mb-6 text-white">
                <CarFront className="w-4 h-4 text-violet-400" />
                <span className="text-white/80">Compare car rental prices</span>
              </div>
              
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
                {formattedLocation ? (
                  <>Car Rental in <span className="text-violet-400">{formattedLocation}</span></>
                ) : (
                  <>Find the <span className="text-violet-400">Best Rental Car Deals</span></>
                )}
              </h1>
              
              <p className="text-lg text-white/80 mb-8">
                Compare prices from Hertz, Enterprise, Avis, Budget and more. No booking fees on ZIVO.
              </p>
            </div>

            {/* Professional Search Form */}
            <CarSearchFormPro className="max-w-4xl mx-auto" />

            {/* Trust Badges */}
            <div className="flex flex-wrap items-center justify-center gap-6 mt-8">
              {trustBadges.map((badge) => (
                <div key={badge.text} className="flex items-center gap-2 text-sm text-white/70">
                  <badge.icon className="w-4 h-4 text-violet-400" />
                  <span>{badge.text}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Trust Bar */}
        <GlobalTrustBar variant="compact" />

        {/* Partner Logos */}
        <PartnerLogosStrip service="cars" />

        {/* Car Types Gallery */}
        <VehicleTypeGallery 
          service="cars" 
          title="Browse by Car Type"
          subtitle="Find the perfect vehicle for your trip"
          className="bg-muted/20"
        />

        {/* Popular Destinations */}
        <PhotoDestinationGrid
          service="cars"
          title="Popular Rental Locations"
          subtitle="Pick up a car in these top destinations"
          limit={8}
        />

        <TrustIndicators />

        {/* Testimonials */}
        <UserTestimonials />

        {/* Internal Linking - Cross-sell Flights & Hotels */}
        <InternalLinkGrid currentService="cars" />

        {/* FAQ Section with Schema */}
        <TravelFAQ serviceType="cars" />

        {/* Redirect Notice */}
        <section className="py-6 bg-violet-500/5 border-y border-violet-500/20">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <ExternalLink className="w-4 h-4 text-violet-500" />
              <span>You will be redirected to our trusted travel partner to complete your booking.</span>
            </div>
          </div>
        </section>

        {/* Affiliate Disclaimer */}
        <section className="py-8 border-t border-border/50">
          <div className="container mx-auto px-4 text-center">
            <p className="text-xs text-muted-foreground max-w-2xl mx-auto">
              *Prices are indicative and subject to change. ZIVO may earn a commission when you book through our partner links at no extra cost to you. 
              ZIVO does not rent cars directly. All bookings are completed on partner websites.
            </p>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
