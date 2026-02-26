/**
 * TravelerDashboard Page
 * Premium 2026-era traveler profile with glassmorphism
 */
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { TripTimeline, AIConciergeTrigger } from "@/components/profile";
import MobileBottomNav from "@/components/shared/MobileBottomNav";
import { motion } from "framer-motion";

export default function TravelerDashboard() {
  const { user, isLoading } = useAuth();

  if (!isLoading && !user) {
    return <Navigate to="/login" replace />;
  }

  const firstName = user?.user_metadata?.full_name?.split(" ")[0] || user?.email?.split("@")[0] || "Traveler";

  return (
    <div className="min-h-screen bg-background pb-24 relative overflow-hidden">
      {/* Subtle background accents */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[radial-gradient(circle,hsl(142_71%_45%/0.04)_0%,transparent_70%)] pointer-events-none" />

      {/* Main Content */}
      <div className="pt-20 px-4 sm:px-6 pb-32 relative z-10">
        {/* Welcome greeting */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="max-w-7xl mx-auto mb-6"
        >
          <h1 className="text-2xl sm:text-3xl font-bold">
            Welcome back, <span className="text-primary">{firstName}</span>
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Here's your travel overview.</p>
        </motion.div>

        {/* Holographic Passport Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* TravelerPassport removed */}
        </motion.div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 max-w-7xl mx-auto">
          <motion.div
            className="lg:col-span-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
          >
            <TripTimeline />
          </motion.div>

          <motion.div
            className="lg:col-span-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            {/* SavedForLater removed */}
          </motion.div>
        </div>
      </div>

      <AIConciergeTrigger />
      <MobileBottomNav />
    </div>
  );
}
