import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Home, Search, Compass, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import SEOHead from "@/components/SEOHead";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background relative overflow-hidden safe-area-top safe-area-bottom">
      <SEOHead title="Page Not Found | ZIVO" description="The page you're looking for doesn't exist. Explore flights, hotels, and car rentals on ZIVO." />
      {/* Enhanced background effects */}
      <div className="absolute inset-0 bg-gradient-radial from-primary/10 via-transparent to-transparent opacity-40" />
      <div className="absolute top-1/4 right-1/4 w-[250px] sm:w-[400px] h-[250px] sm:h-[400px] bg-gradient-to-bl from-eats/10 to-orange-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 left-1/4 w-[200px] sm:w-[300px] h-[200px] sm:h-[300px] bg-gradient-to-tr from-primary/10 to-teal-500/5 rounded-full blur-3xl" />

      <div className="text-center px-4 relative z-10">
        {/* Animated 404 */}
        <div className="mb-6 sm:mb-8 animate-in fade-in zoom-in-95 duration-500">
          <h1 className="font-display text-[100px] sm:text-[150px] lg:text-[200px] font-bold leading-none bg-gradient-to-r from-primary via-eats to-primary bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">
            404
          </h1>
        </div>

        {/* Icon */}
        <div className="flex justify-center mb-6 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-150">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-br from-primary to-teal-400 flex items-center justify-center shadow-2xl shadow-primary/30">
            <Compass className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
          </div>
        </div>

        {/* Message */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
          <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold mb-4">
            Lost in the{" "}
            <span className="bg-gradient-to-r from-primary to-teal-400 bg-clip-text text-transparent">
              journey?
            </span>
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-md mx-auto mb-8 sm:mb-10">
            The page you're looking for has taken a detour. Let's get you back on track!
          </p>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">
          <Button asChild size="lg" className="h-12 sm:h-14 px-6 sm:px-8 text-base sm:text-lg font-bold rounded-xl bg-gradient-to-r from-primary to-teal-400 text-white shadow-lg shadow-primary/30 hover:opacity-90 gap-2 touch-manipulation active:scale-[0.98]">
            <Link to="/">
              <Home className="w-5 h-5" />
              Go Home
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="h-12 sm:h-14 px-6 sm:px-8 text-base sm:text-lg font-bold rounded-xl border-2 gap-2 touch-manipulation active:scale-[0.98]">
            <Link to="/help">
              <Search className="w-5 h-5" />
              Get Help
            </Link>
          </Button>
        </div>

        {/* Quick Links */}
        <div className="mt-12 sm:mt-16 animate-in fade-in duration-500 delay-500">
          <p className="text-sm text-muted-foreground mb-4 flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            Popular destinations
          </p>
          <div className="flex flex-wrap gap-2 sm:gap-3 justify-center">
            {[
              { label: "Find Flights", href: "/flights" },
              { label: "Hotels", href: "/hotels" },
              { label: "Rent a Car", href: "/cars" },
              { label: "Help Center", href: "/help" },
            ].map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className="px-3 sm:px-4 py-2 rounded-full bg-muted/50 hover:bg-muted text-sm font-medium transition-colors hover:text-primary touch-manipulation active:scale-95"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* CSS for gradient animation */}
      <style>{`
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient {
          animation: gradient 3s ease infinite;
        }
      `}</style>
    </div>
  );
};

export default NotFound;