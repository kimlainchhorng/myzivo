/**
 * ChatAttachMenu — Bottom sheet for attachment options: image, video, location, disappearing
 * Lock & Unlock requires Chat+ or Pro ZIVO+ plan
 */
import React, { useRef, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ImagePlus from "lucide-react/dist/esm/icons/image-plus";
import Video from "lucide-react/dist/esm/icons/video";
import MapPin from "lucide-react/dist/esm/icons/map-pin";
import Timer from "lucide-react/dist/esm/icons/timer";
import Lock from "lucide-react/dist/esm/icons/lock";
import Gift from "lucide-react/dist/esm/icons/gift";
import Coins from "lucide-react/dist/esm/icons/coins";
import ScanLine from "lucide-react/dist/esm/icons/scan-line";
import FileUp from "lucide-react/dist/esm/icons/file-up";
import BarChart3 from "lucide-react/dist/esm/icons/bar-chart-3";
import UserSquare from "lucide-react/dist/esm/icons/user-square";
import { useZivoPlus } from "@/contexts/ZivoPlusContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { createPortal } from "react-dom";

interface ChatAttachMenuProps {
  open: boolean;
  onClose: () => void;
  onImageSelect: () => void;
  onVideoSelect: () => void;
  onLocationShare: () => void;
  onToggleDisappearing: () => void;
  onLockedImageSelect?: () => void;
  onSendGift?: () => void;
  onOpenWallet?: () => void;
  onScanDocument?: () => void;
  onFileSelect?: () => void;
  onCreatePoll?: () => void;
  onShareContact?: () => void;
  disappearingEnabled: boolean;
}

const menuItems = [
  { id: "image", label: "Photo", icon: ImagePlus, color: "bg-emerald-500" },
  { id: "video", label: "Video", icon: Video, color: "bg-violet-500" },
  { id: "file", label: "File", icon: FileUp, color: "bg-sky-500" },
  { id: "scan", label: "Scan", icon: ScanLine, color: "bg-cyan-500" },
  { id: "location", label: "Location", icon: MapPin, color: "bg-blue-500" },
  { id: "contact", label: "Contact", icon: UserSquare, color: "bg-indigo-500" },
  { id: "poll", label: "Poll", icon: BarChart3, color: "bg-fuchsia-500" },
  { id: "gift", label: "Gift", icon: Gift, color: "bg-gradient-to-br from-amber-500 to-pink-500" },
  { id: "money", label: "Money", icon: Coins, color: "bg-gradient-to-br from-emerald-500 to-teal-500" },
  { id: "locked", label: "Locked", icon: Lock, color: "bg-rose-500" },
  { id: "disappearing", label: "24h", icon: Timer, color: "bg-amber-500" },
] as const;

/** Plans that include Lock & Unlock */
const LOCK_UNLOCK_PLANS = new Set(["chat", "pro"]);

export default function ChatAttachMenu({
  open, onClose, onImageSelect, onVideoSelect, onLocationShare, onToggleDisappearing, onLockedImageSelect,
  onSendGift, onOpenWallet, onScanDocument, onFileSelect, onCreatePoll, onShareContact, disappearingEnabled,
}: ChatAttachMenuProps) {
  const { isPlus, plan } = useZivoPlus();
  const navigate = useNavigate();
  const triggerRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ left: number; bottom: number } | null>(null);

  // Calculate position relative to viewport when opening — clamp horizontally so
  // the wider tablet/desktop panel never overflows the right edge.
  useEffect(() => {
    if (!open) { setPos(null); return; }
    const el = document.querySelector('[data-attach-trigger]');
    if (el) {
      const rect = el.getBoundingClientRect();
      const vw = window.innerWidth;
      const panelWidth = vw >= 768 ? 460 : vw >= 640 ? 400 : 300;
      const margin = 12;
      const maxLeft = Math.max(margin, vw - panelWidth - margin);
      setPos({ left: Math.min(rect.left, maxLeft), bottom: window.innerHeight - rect.top + 10 });
    }
  }, [open]);

  const canUseLocked = isPlus && plan && LOCK_UNLOCK_PLANS.has(plan);

  const handleAction = (id: string) => {
    switch (id) {
      case "gift": onSendGift?.(); break;
      case "money": onOpenWallet?.(); break;
      case "scan":
        if (onScanDocument) {
          onScanDocument();
        } else {
          onImageSelect();
        }
        break;
      case "file": onFileSelect?.(); break;
      case "poll": onCreatePoll?.(); break;
      case "contact": onShareContact?.(); break;
      case "image": onImageSelect(); break;
      case "video": onVideoSelect(); break;
      case "location": onLocationShare(); break;
      case "locked":
        if (!canUseLocked) {
          toast("Lock & Unlock requires Chat+ or Pro plan", {
            action: { label: "Upgrade", onClick: () => navigate("/zivo-plus") },
          });
          onClose();
          return;
        }
        onLockedImageSelect?.();
        break;
      case "disappearing": onToggleDisappearing(); break;
    }
    onClose();
  };

  return createPortal(
    <AnimatePresence>
      {open && pos && (
        <>
          <motion.div
            key="attach-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[1400]"
            onClick={onClose}
          />
          <motion.div
            key="attach-panel"
            initial={{ y: 16, opacity: 0, scale: 0.92 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 12, opacity: 0, scale: 0.94 }}
            transition={{ type: "spring", damping: 26, stiffness: 420 }}
            className="fixed z-[1401] bg-background/95 backdrop-blur-xl border border-border/20 rounded-2xl shadow-2xl p-3 sm:p-4 w-[300px] sm:w-[400px] md:w-[460px]"
            style={{ left: pos.left, bottom: pos.bottom }}
          >
            <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2.5 sm:gap-3">
              {menuItems.map((item) => {
                const isLockedGated = item.id === "locked" && !canUseLocked;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleAction(item.id)}
                    className="flex flex-col items-center gap-2 group relative"
                  >
                    <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl ${item.color} flex items-center justify-center shadow-sm group-active:scale-90 transition-transform ${
                      item.id === "disappearing" && disappearingEnabled ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : ""
                    } ${isLockedGated ? "opacity-50" : ""}`}>
                      <item.icon className="w-[18px] h-[18px] sm:w-5 sm:h-5 text-white" />
                    </div>
                    <span className="text-[11px] font-medium text-muted-foreground group-hover:text-foreground transition-colors whitespace-nowrap">
                      {item.label}
                    </span>
                    {item.id === "disappearing" && disappearingEnabled && (
                      <span className="text-[8px] text-primary font-bold -mt-1">ON</span>
                    )}
                    {isLockedGated && (
                      <span className="absolute -top-1 -right-1 text-[7px] font-bold px-1 py-0.5 rounded-full bg-amber-500 text-white">PRO</span>
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
