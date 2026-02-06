import { Menu } from "lucide-react";
import { motion } from "framer-motion";
import ZivoLogo from "@/components/ZivoLogo";

interface RideAppBarProps {
  onMenuClick?: () => void;
}

const RideAppBar = ({ onMenuClick }: RideAppBarProps) => {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3 bg-transparent"
    >
      <ZivoLogo size="sm" showText={true} />
      
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={onMenuClick}
        className="p-2 rounded-full bg-white/10 backdrop-blur-xl border border-white/10"
        aria-label="Open menu"
      >
        <Menu className="w-5 h-5 text-white" />
      </motion.button>
    </motion.header>
  );
};

export default RideAppBar;
