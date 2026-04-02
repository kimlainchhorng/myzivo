/**
 * ChatAttachMenu — Bottom sheet for attachment options: image, video, location, disappearing
 */
import React, { forwardRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ImagePlus, Video, MapPin, Timer } from "lucide-react";

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
  { id: "image", label: "Photo", icon: ImagePlus, color: "bg-emerald-500" },
  { id: "video", label: "Video", icon: Video, color: "bg-violet-500" },
  { id: "location", label: "Location", icon: MapPin, color: "bg-blue-500" },
  { id: "disappearing", label: "24h Mode", icon: Timer, color: "bg-amber-500" },
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
    <>
      <div
        className="fixed inset-0 z-40"
        onClick={onClose}
      />
      <motion.div
        key="attach-panel"
        initial={{ y: 16, opacity: 0, scale: 0.92 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 16, opacity: 0, scale: 0.92 }}
        transition={{ type: "spring", damping: 24, stiffness: 400 }}
        className="absolute bottom-full mb-2.5 left-0 z-50 bg-background border border-border/30 rounded-2xl shadow-2xl p-4"
      >
        <div className="flex gap-5">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleAction(item.id)}
              className="flex flex-col items-center gap-2 group"
            >
              <div className={`w-12 h-12 rounded-2xl ${item.color} flex items-center justify-center shadow-sm group-active:scale-90 transition-transform ${
                item.id === "disappearing" && disappearingEnabled ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : ""
              }`}>
                <item.icon className="w-5 h-5 text-white" />
              </div>
              <span className="text-[11px] font-medium text-muted-foreground group-hover:text-foreground transition-colors whitespace-nowrap">
                {item.label}
              </span>
              {item.id === "disappearing" && disappearingEnabled && (
                <span className="text-[8px] text-primary font-bold -mt-1">ON</span>
              )}
            </button>
          ))}
        </div>
      </motion.div>
    </>
  );
}
