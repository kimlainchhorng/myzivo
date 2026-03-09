import { Plane, Clock, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";

const FlightLanding = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Flights Coming Soon – ZIVO"
        description="ZIVO Flights is launching soon. Compare and book flights from 500+ airlines."
      />
      <Header />

      <main className="pt-24 pb-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-lg mx-auto text-center py-20"
          >
            <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <Plane className="w-10 h-10 text-primary" />
            </div>

            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 mb-6">
              <Clock className="w-4 h-4 text-amber-500" />
              <span className="text-sm font-medium text-amber-500">Coming Soon</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-bold mb-4">
              Flights Are Coming Soon
            </h1>
            <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
              We're working on bringing you the best flight deals from 500+ airlines.
              Stay tuned for launch!
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild size="lg" variant="outline" className="gap-2">
                <Link to="/">
                  <ArrowLeft className="w-4 h-4" />
                  Back to Home
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default FlightLanding;
