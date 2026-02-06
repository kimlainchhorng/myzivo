import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import RideAppBar from "@/components/ride/RideAppBar";
import RideLocationCard from "@/components/ride/RideLocationCard";
import RideSegmentTabs, { RideCategory } from "@/components/ride/RideSegmentTabs";
import RideGrid from "@/components/ride/RideGrid";
import RideStickyCTA from "@/components/ride/RideStickyCTA";
import RideBottomNav from "@/components/ride/RideBottomNav";
import { RideOption } from "@/components/ride/RideCard";
import { rideOptions } from "@/components/ride/rideData";

const CITY_BG = "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=1920&h=1080&fit=crop";

const RidePage = () => {
  const navigate = useNavigate();
  const [pickup, setPickup] = useState("109 Hickory Street, Denha…");
  const [destination, setDestination] = useState("");
  const [activeTab, setActiveTab] = useState<RideCategory>("economy");
  const [selectedRide, setSelectedRide] = useState<RideOption | null>(null);

  const handleConfirm = () => {
    if (selectedRide) {
      navigate("/ride/confirm", {
        state: {
          ride: selectedRide,
          pickup,
          destination,
        },
      });
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 z-0">
        <img
          src={CITY_BG}
          alt="City skyline"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-zinc-950" />
      </div>

      {/* App Bar */}
      <RideAppBar />

      {/* Content */}
      <div className="relative z-10 pt-20 px-4 pb-36">
        {/* Drivers Nearby Pill */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center mb-4"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-xl rounded-full border border-white/10">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs font-semibold tracking-wide text-white/80">
              35 DRIVERS NEARBY
            </span>
          </div>
        </motion.div>

        {/* Where to? Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold text-center mb-4"
        >
          Where to?
        </motion.h1>

        {/* Location Card */}
        <div className="mb-6">
          <RideLocationCard
            pickup={pickup}
            destination={destination}
            onPickupChange={setPickup}
            onDestinationChange={setDestination}
          />
        </div>

        {/* Choose Your Ride Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-lg font-semibold mb-3 text-center">
            Choose Your <span className="text-primary">Ride</span>
          </h2>

          {/* Segment Tabs */}
          <div className="mb-4">
            <RideSegmentTabs
              activeTab={activeTab}
              onTabChange={(tab) => {
                setActiveTab(tab);
                setSelectedRide(null);
              }}
            />
          </div>

          {/* Ride Grid */}
          <RideGrid
            rides={rideOptions[activeTab]}
            selectedRideId={selectedRide?.id || null}
            onSelectRide={setSelectedRide}
          />
        </motion.div>
      </div>

      {/* Sticky CTA */}
      <RideStickyCTA selectedRide={selectedRide} onConfirm={handleConfirm} />

      {/* Bottom Nav */}
      <RideBottomNav />
    </div>
  );
};

export default RidePage;
