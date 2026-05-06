import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { Home, Search, Compass, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import SEOHead from "@/components/SEOHead";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    if (import.meta.env.DEV) console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background safe-area-top safe-area-bottom">
      <SEOHead
        title="Page Not Found | ZIVO"
        description="The page you're looking for doesn't exist. Explore flights, hotels, and car rentals on ZIVO."
        noIndex
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-center px-4 max-w-md"
      >
        {/* Bold 404 — IG-mono */}
        <h1 className="font-display text-[88px] sm:text-[112px] font-black leading-none tracking-tight text-foreground mb-2">
          404
        </h1>

        {/* Compass tile — clean secondary bg with hairline border */}
        <div className="flex justify-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-secondary border border-border flex items-center justify-center">
            <Compass className="w-7 h-7 text-foreground" />
          </div>
        </div>

        {/* Message */}
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3">
          Lost in the <span className="text-accent-foreground">journey?</span>
        </h2>
        <p className="text-base text-muted-foreground mb-8">
          The page you're looking for has taken a detour. Let's get you back on track.
        </p>

        {/* Buttons — solid black primary + outlined secondary */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-12">
          <Button asChild size="lg" className="h-12 px-6 text-base font-bold rounded-full gap-2 touch-manipulation active:scale-[0.98]">
            <Link to="/">
              <Home className="w-4 h-4" />
              Go Home
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="h-12 px-6 text-base font-bold rounded-full gap-2 touch-manipulation active:scale-[0.98]">
            <Link to="/help">
              <Search className="w-4 h-4" />
              Get Help
            </Link>
          </Button>
        </div>

        {/* Quick Links */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center justify-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            Popular destinations
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            {[
              { label: "Find Flights", href: "/flights" },
              { label: "Hotels", href: "/hotels" },
              { label: "Rent a Car", href: "/cars" },
              { label: "Help Center", href: "/help" },
            ].map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className="px-3.5 py-1.5 rounded-full bg-secondary border border-border text-[13px] font-medium text-foreground hover:bg-muted transition-colors touch-manipulation active:scale-95"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default NotFound;
