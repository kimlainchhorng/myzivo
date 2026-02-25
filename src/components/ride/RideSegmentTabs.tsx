import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export type RideCategory = "economy" | "premium" | "elite";

interface RideSegmentTabsProps {
  activeTab: RideCategory;
  onTabChange: (tab: RideCategory) => void;
}

const tabs: { id: RideCategory; label: string }[] = [
  { id: "economy", label: "ECONOMY" },
  { id: "premium", label: "PREMIUM" },
  { id: "elite", label: "ELITE" },
];

const RideSegmentTabs = ({ activeTab, onTabChange }: RideSegmentTabsProps) => {
  return (
    <div className="flex bg-white/10 backdrop-blur-xl rounded-full p-1 border border-white/10">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={cn(
            "relative flex-1 py-2 px-4 text-xs font-semibold tracking-wide transition-all duration-200 rounded-full touch-manipulation active:scale-[0.97]",
            activeTab === tab.id ? "text-white" : "text-white/50"
          )}
        >
          {activeTab === tab.id && (
            <motion.div
              layoutId="activeTab"
              className="absolute inset-0 bg-primary rounded-full"
              transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
            />
          )}
          <span className="relative z-10">{tab.label}</span>
        </button>
      ))}
    </div>
  );
};

export default RideSegmentTabs;
