import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { Home, ArrowLeft, Search, Compass, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background relative overflow-hidden">
      {/* Enhanced background effects */}
      <div className="absolute inset-0 bg-gradient-radial from-primary/10 via-transparent to-transparent opacity-40" />
      <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] bg-gradient-to-bl from-eats/10 to-orange-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 left-1/4 w-[300px] h-[300px] bg-gradient-to-tr from-primary/10 to-teal-500/5 rounded-full blur-3xl" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-radial from-violet-500/5 to-transparent rounded-full blur-3xl" />

      <div className="text-center px-4 relative z-10">
        {/* Animated 404 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", duration: 0.8 }}
          className="mb-8"
        >
          <h1 className="font-display text-[150px] sm:text-[200px] font-bold leading-none bg-gradient-to-r from-primary via-eats to-primary bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">
            404
          </h1>
        </motion.div>

        {/* Icon */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex justify-center mb-6"
        >
          <motion.div
            animate={{ 
              rotate: [0, 10, -10, 0],
              y: [0, -5, 0]
            }}
            transition={{ 
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary to-teal-400 flex items-center justify-center shadow-2xl shadow-primary/30"
          >
            <Compass className="w-10 h-10 text-white" />
          </motion.div>
        </motion.div>

        {/* Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="font-display text-3xl sm:text-4xl font-bold mb-4">
            Lost in the{" "}
            <span className="bg-gradient-to-r from-primary to-teal-400 bg-clip-text text-transparent">
              journey?
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-md mx-auto mb-10">
            The page you're looking for has taken a detour. Let's get you back on track!
          </p>
        </motion.div>

        {/* Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
            <Button asChild size="lg" className="h-14 px-8 text-lg font-bold rounded-xl bg-gradient-to-r from-primary to-teal-400 text-white shadow-lg shadow-primary/30 hover:opacity-90 gap-2">
              <Link to="/">
                <Home className="w-5 h-5" />
                Go Home
              </Link>
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
            <Button asChild variant="outline" size="lg" className="h-14 px-8 text-lg font-bold rounded-xl border-2 gap-2">
              <Link to="/help">
                <Search className="w-5 h-5" />
                Get Help
              </Link>
            </Button>
          </motion.div>
        </motion.div>

        {/* Quick Links */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-16"
        >
          <p className="text-sm text-muted-foreground mb-4 flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            Popular destinations
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            {[
              { label: "Book a Ride", href: "/ride" },
              { label: "Order Food", href: "/food" },
              { label: "Find Flights", href: "/book-flight" },
              { label: "Hotels", href: "/book-hotel" },
            ].map((link) => (
              <motion.div key={link.href} whileHover={{ y: -2 }}>
                <Link
                  to={link.href}
                  className="px-4 py-2 rounded-full bg-muted/50 hover:bg-muted text-sm font-medium transition-colors hover:text-primary"
                >
                  {link.label}
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>
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