/**
 * TravelerDashboard Page
 * Premium 2026-era traveler profile with glassmorphism
 */
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { TravelerPassport, TripTimeline, AIConciergeTrigger, SavedForLater } from "@/components/profile";
import MobileBottomNav from "@/components/shared/MobileBottomNav";
import { motion } from "framer-motion";

export default function TravelerDashboard() {
  const { user, isLoading } = useAuth();

  if (!isLoading && !user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-background pb-24 relative overflow-hidden">
      {/* Background accents */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[radial-gradient(circle,hsl(142_71%_45%/0.06)_0%,transparent_70%)] pointer-events-none" />
      <div className="absolute bottom-1/3 left-0 w-[400px] h-[400px] bg-[radial-gradient(circle,hsl(221_83%_53%/0.04)_0%,transparent_70%)] pointer-events-none" />

      {/* Main Content */}
      <div className="pt-20 px-4 sm:px-6 pb-32 relative z-10">
        {/* Holographic Passport Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <TravelerPassport />
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
            <SavedForLater />
          </motion.div>
        </div>
      </div>

      <AIConciergeTrigger />
      <MobileBottomNav />
    </div>
  );
}
