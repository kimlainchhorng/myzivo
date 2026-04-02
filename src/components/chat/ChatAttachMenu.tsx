/**
 * ChatAttachMenu — Bottom sheet for attachment options: image, video, location, disappearing
 */
import { motion, AnimatePresence } from "framer-motion";
import { ImagePlus, Video, MapPin, Timer, X } from "lucide-react";

interface ChatAttachMenuProps {
  open: boolean;
  onClose: () => void;
  onImageSelect: () => void;
  onVideoSelect: () => void;
  onLocationShare: () => void;
  onToggleDisappearing: () => void;
  disappearingEnabled: boolean;
}

const menuItems = [
  { id: "image", label: "Photo", icon: ImagePlus, color: "bg-green-500" },
  { id: "video", label: "Video / GIF", icon: Video, color: "bg-purple-500" },
  { id: "location", label: "Location", icon: MapPin, color: "bg-blue-500" },
  { id: "disappearing", label: "Disappearing", icon: Timer, color: "bg-amber-500" },
] as const;

export default function ChatAttachMenu({
  open, onClose, onImageSelect, onVideoSelect, onLocationShare, onToggleDisappearing, disappearingEnabled,
}: ChatAttachMenuProps) {
  if (!open) return null;

  const handleAction = (id: string) => {
    switch (id) {
      case "image": onImageSelect(); break;
      case "video": onVideoSelect(); break;
      case "location": onLocationShare(); break;
      case "disappearing": onToggleDisappearing(); break;
    }
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            className="absolute bottom-full mb-2 left-0 z-50 bg-background border border-border/40 rounded-2xl shadow-xl p-3 min-w-[200px]"
          >
            <div className="grid grid-cols-4 gap-3">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleAction(item.id)}
                  className="flex flex-col items-center gap-1.5 py-2 rounded-xl hover:bg-muted/60 transition-colors"
                >
                  <div className={`w-10 h-10 rounded-full ${item.color} flex items-center justify-center ${
                    item.id === "disappearing" && disappearingEnabled ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : ""
                  }`}>
                    <item.icon className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-[10px] font-medium text-foreground">{item.label}</span>
                  {item.id === "disappearing" && disappearingEnabled && (
                    <span className="text-[8px] text-primary font-bold">ON</span>
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
