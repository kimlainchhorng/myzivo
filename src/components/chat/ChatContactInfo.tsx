/**
 * ChatContactInfo — Facebook Messenger-style contact info overlay
 * Opens when tapping the header / "Tap here for info" in PersonalChat
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import {
  ArrowLeft,
  Bell,
  BellOff,
  Search,
  Image as ImageIcon,
  FileText,
  Link2,
  UserRound,
  Palette,
  Shield,
  Ban,
  Flag,
  Trash2,
  Phone,
  Video,
  ChevronRight,
  History,
  Zap,
  Clock,
  MessageCircle,
} from "lucide-react";
import { toast } from "sonner";

interface ChatContactInfoProps {
  recipientId: string;
  recipientName: string;
  recipientAvatar?: string | null;
  isOnline?: boolean;
  lastSeen?: string | null;
  onClose: () => void;
  onStartCall?: (type: "voice" | "video") => void;
  onOpenMediaGallery?: () => void;
  onOpenSearch?: () => void;
  onOpenCallHistory?: () => void;
  onOpenPersonalization?: () => void;
  onOpenSecurity?: () => void;
  onOpenMiniApps?: () => void;
  onOpenNotifSettings?: () => void;
}

export default function ChatContactInfo({
  recipientId,
  recipientName,
  recipientAvatar,
  isOnline,
  lastSeen,
  onClose,
  onStartCall,
  onOpenMediaGallery,
  onOpenSearch,
  onOpenCallHistory,
  onOpenPersonalization,
  onOpenSecurity,
  onOpenMiniApps,
  onOpenNotifSettings,
}: ChatContactInfoProps) {
  const [muteNotifs, setMuteNotifs] = useState(false);
  const navigate = useNavigate();

  const initials = (recipientName || "U")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const handleViewProfile = () => {
    onClose();
    navigate(`/user/${recipientId}`);
  };

  const handleBlock = () => {
    toast.info(`Block ${recipientName}?`, {
      action: { label: "Block", onClick: () => toast.success(`${recipientName} blocked`) },
    });
  };

  const handleReport = () => {
    toast.info(`Report ${recipientName}?`, {
      action: { label: "Report", onClick: () => toast.success("Report submitted") },
    });
  };

  const handleDeleteConversation = () => {
    toast.info("Delete this entire conversation?", {
      action: {
        label: "Delete",
        onClick: () => {
          toast.success("Conversation deleted");
          onClose();
        },
      },
    });
  };

  return (
    <motion.div
      className="fixed inset-0 z-[60] bg-background flex flex-col"
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ type: "spring", damping: 25, stiffness: 300 }}
    >
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-2xl border-b border-border/40 safe-area-top">
        <div className="px-2 py-2.5 flex items-center gap-3">
          <button
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center active:scale-90 transition-transform rounded-full hover:bg-muted/50"
          >
            <ArrowLeft className="h-[22px] w-[22px] text-foreground" />
          </button>
          <p className="text-[17px] font-bold text-foreground tracking-tight">Contact Info</p>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto scrollbar-hide overscroll-contain">
        {/* Profile hero */}
        <div className="flex flex-col items-center pt-10 pb-5 px-4">
          <div className="relative">
            <div className="rounded-full p-[3px] bg-gradient-to-br from-primary/20 via-primary/5 to-transparent">
              <Avatar className="h-[100px] w-[100px] ring-[3px] ring-background">
                <AvatarImage src={recipientAvatar || undefined} className="object-cover" />
                <AvatarFallback className="text-[28px] font-bold bg-primary/8 text-primary">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </div>
            {isOnline && (
              <span className="absolute bottom-1.5 right-1.5 h-[18px] w-[18px] rounded-full bg-emerald-500 border-[3px] border-background shadow-sm" />
            )}
          </div>
          <h2 className="text-[22px] font-bold text-foreground mt-4 text-center leading-tight">
            {recipientName}
          </h2>
          <div className="flex items-center gap-1.5 mt-1.5">
            {isOnline ? (
              <>
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                <span className="text-[13px] font-medium text-emerald-600">Active now</span>
              </>
            ) : lastSeen ? (
              <>
                <Clock className="h-3 w-3 text-muted-foreground" />
                <span className="text-[13px] text-muted-foreground">Last seen {lastSeen}</span>
              </>
            ) : (
              <>
                <Clock className="h-3 w-3 text-muted-foreground" />
                <span className="text-[13px] text-muted-foreground">Offline</span>
              </>
            )}
          </div>
        </div>

        {/* Quick action buttons row */}
        <div className="flex justify-center gap-5 px-8 pb-7">
          {[
            { icon: Phone, label: "Audio", action: () => onStartCall?.("voice") },
            { icon: Video, label: "Video", action: () => onStartCall?.("video") },
            { icon: Search, label: "Search", action: onOpenSearch },
            { icon: UserRound, label: "Profile", action: handleViewProfile },
          ].map(({ icon: Icon, label, action }) => (
            <button
              key={label}
              onClick={action}
              className="flex flex-col items-center gap-2 min-w-[56px] group"
            >
              <div className="h-11 w-11 rounded-full bg-muted/60 flex items-center justify-center active:scale-90 transition-all group-hover:bg-muted/80">
                <Icon className="h-[19px] w-[19px] text-foreground/80" />
              </div>
              <span className="text-[11px] font-semibold text-muted-foreground tracking-wide">
                {label}
              </span>
            </button>
          ))}
        </div>

        {/* Divider */}
        <div className="h-[6px] bg-muted/30" />

        {/* Sections */}
        <div className="pb-24">
          {/* Media & Files section */}
          <Section title="Media, Files & Links">
            <SectionButton icon={ImageIcon} label="Media" chevron onClick={onOpenMediaGallery} />
            <SectionButton icon={FileText} label="Files" chevron onClick={() => toast.info("No files shared yet")} />
            <SectionButton icon={Link2} label="Links" chevron onClick={() => toast.info("No links shared yet")} />
          </Section>

          <div className="h-[6px] bg-muted/30" />

          {/* Customize section */}
          <Section title="Customize Chat">
            <SectionButton icon={Palette} label="Theme & Wallpaper" chevron onClick={onOpenPersonalization} />
            <SectionButton icon={Zap} label="Mini Apps" chevron onClick={onOpenMiniApps} />
            <SectionButton icon={History} label="Call History" chevron onClick={onOpenCallHistory} />
          </Section>

          <div className="h-[6px] bg-muted/30" />

          {/* Notifications */}
          <Section title="Notifications">
            <div className="flex items-center justify-between px-4 py-3.5">
              <div className="flex items-center gap-3.5">
                <div className="h-8 w-8 rounded-full bg-muted/50 flex items-center justify-center">
                  {muteNotifs ? (
                    <BellOff className="h-[16px] w-[16px] text-muted-foreground" />
                  ) : (
                    <Bell className="h-[16px] w-[16px] text-muted-foreground" />
                  )}
                </div>
                <span className="text-[14.5px] font-medium text-foreground">
                  Mute Notifications
                </span>
              </div>
              <Switch
                checked={muteNotifs}
                onCheckedChange={(v) => {
                  setMuteNotifs(v);
                  toast.success(v ? "Notifications muted" : "Notifications unmuted");
                }}
              />
            </div>
            <SectionButton
              icon={MessageCircle}
              label="Notification Settings"
              chevron
              onClick={onOpenNotifSettings}
            />
          </Section>

          <div className="h-[6px] bg-muted/30" />

          {/* Privacy & Safety */}
          <Section title="Privacy & Safety">
            <SectionButton icon={Shield} label="Privacy Settings" chevron onClick={onOpenSecurity} />
            <SectionButton icon={Ban} label="Block" className="text-destructive" onClick={handleBlock} />
            <SectionButton icon={Flag} label="Report" className="text-destructive" onClick={handleReport} />
          </Section>

          <div className="h-[6px] bg-muted/30" />

          {/* Delete conversation */}
          <div className="py-2">
            <button
              onClick={handleDeleteConversation}
              className="w-full flex items-center gap-3.5 px-4 py-3.5 active:bg-destructive/5 transition-colors"
            >
              <div className="h-8 w-8 rounded-full bg-destructive/8 flex items-center justify-center">
                <Trash2 className="h-[16px] w-[16px] text-destructive" />
              </div>
              <span className="text-[14.5px] font-medium text-destructive">
                Delete Conversation
              </span>
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Helpers ─── */

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="py-1">
      <p className="px-4 pt-3 pb-2 text-[11.5px] font-bold text-muted-foreground/70 uppercase tracking-[0.08em]">
        {title}
      </p>
      <div>{children}</div>
    </div>
  );
}

function SectionButton({
  icon: Icon,
  label,
  chevron,
  className,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  chevron?: boolean;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3.5 px-4 py-3.5 active:bg-muted/40 transition-colors"
    >
      <div className={`h-8 w-8 rounded-full flex items-center justify-center ${className ? "bg-destructive/8" : "bg-muted/50"}`}>
        <Icon className={`h-[16px] w-[16px] ${className || "text-muted-foreground"}`} />
      </div>
      <span className={`text-[14.5px] font-medium flex-1 text-left ${className || "text-foreground"}`}>
        {label}
      </span>
      {chevron && <ChevronRight className="h-[18px] w-[18px] text-muted-foreground/40" />}
    </button>
  );
}
