/**
 * ChatContactInfo — Facebook Messenger-style contact info overlay
 * Opens when tapping the header / "Tap here for info" in PersonalChat
 */

import { useState } from "react";
import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import {
  ArrowLeft,
  Bell,
  BellOff,
  Eye,
  Search,
  Image as ImageIcon,
  FileText,
  Link2,
  Users,
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
} from "lucide-react";

interface ChatContactInfoProps {
  recipientId: string;
  recipientName: string;
  recipientAvatar?: string | null;
  isOnline?: boolean;
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
  recipientName,
  recipientAvatar,
  isOnline,
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

  const initials = (recipientName || "U")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  // Fake profile views count for display
  const profileViews = Math.floor(Math.random() * 30) + 5;

  return (
    <motion.div
      className="fixed inset-0 z-[60] bg-background flex flex-col"
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ type: "spring", damping: 25, stiffness: 300 }}
    >
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-2xl border-b border-border/8 safe-area-top">
        <div className="px-3 py-3 flex items-center gap-3">
          <button
            onClick={onClose}
            className="min-h-[44px] min-w-[36px] flex items-center justify-center active:scale-90 transition-transform"
          >
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </button>
          <p className="text-[16px] font-semibold text-foreground">Profile</p>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        {/* Profile hero */}
        <div className="flex flex-col items-center pt-8 pb-6 px-4">
          <div className="relative">
            <Avatar className="h-24 w-24 ring-4 ring-primary/10">
              <AvatarImage src={recipientAvatar || undefined} />
              <AvatarFallback className="text-2xl font-bold bg-primary/8 text-primary">
                {initials}
              </AvatarFallback>
            </Avatar>
            {isOnline && (
              <span className="absolute bottom-1 right-1 h-5 w-5 rounded-full bg-emerald-500 border-[3px] border-background" />
            )}
          </div>
          <h2 className="text-xl font-bold text-foreground mt-4">{recipientName}</h2>
          <p className="text-[13px] text-muted-foreground mt-0.5">
            {isOnline ? "Active now" : "Recently active"}
          </p>

          {/* Profile views badge */}
          <div className="mt-3 flex items-center gap-1.5 bg-muted/60 rounded-full px-3.5 py-1.5">
            <Eye className="h-3.5 w-3.5 text-primary" />
            <span className="text-[12px] font-semibold text-foreground">{profileViews}</span>
            <span className="text-[12px] text-muted-foreground">profile views</span>
          </div>
        </div>

        {/* Quick action buttons */}
        <div className="flex justify-center gap-4 px-6 pb-6">
          {[
            { icon: Phone, label: "Audio", action: () => onStartCall?.("voice") },
            { icon: Video, label: "Video", action: () => onStartCall?.("video") },
            { icon: Search, label: "Search", action: onOpenSearch },
            { icon: Users, label: "Profile", action: () => {} },
          ].map(({ icon: Icon, label, action }) => (
            <button
              key={label}
              onClick={action}
              className="flex flex-col items-center gap-1.5 min-w-[60px]"
            >
              <div className="h-10 w-10 rounded-full bg-muted/70 flex items-center justify-center active:scale-90 transition-transform">
                <Icon className="h-[18px] w-[18px] text-foreground" />
              </div>
              <span className="text-[11px] font-medium text-muted-foreground">{label}</span>
            </button>
          ))}
        </div>

        {/* Sections */}
        <div className="space-y-2 pb-20">
          {/* Media & Files section */}
          <Section title="Media, Files & Links">
            <SectionButton icon={ImageIcon} label="Media" chevron onClick={onOpenMediaGallery} />
            <SectionButton icon={FileText} label="Files" chevron />
            <SectionButton icon={Link2} label="Links" chevron />
          </Section>

          {/* Customize section */}
          <Section title="Customize Chat">
            <SectionButton icon={Palette} label="Theme & Wallpaper" chevron onClick={onOpenPersonalization} />
            <SectionButton icon={Zap} label="Mini Apps" chevron onClick={onOpenMiniApps} />
            <SectionButton icon={History} label="Call History" chevron onClick={onOpenCallHistory} />
          </Section>

          {/* Notifications */}
          <Section title="Notifications">
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-3">
                {muteNotifs ? (
                  <BellOff className="h-[18px] w-[18px] text-muted-foreground" />
                ) : (
                  <Bell className="h-[18px] w-[18px] text-muted-foreground" />
                )}
                <span className="text-[14px] font-medium text-foreground">
                  Mute Notifications
                </span>
              </div>
              <Switch
                checked={muteNotifs}
                onCheckedChange={(v) => {
                  setMuteNotifs(v);
                  onOpenNotifSettings?.();
                }}
              />
            </div>
          </Section>

          {/* Privacy & Safety */}
          <Section title="Privacy & Safety">
            <SectionButton icon={Shield} label="Privacy Settings" chevron onClick={onOpenSecurity} />
            <SectionButton icon={Ban} label="Block" className="text-destructive" />
            <SectionButton icon={Flag} label="Report" className="text-destructive" />
          </Section>

          {/* Danger zone */}
          <div className="px-4 pt-4">
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-destructive/5 active:bg-destructive/10 transition-colors">
              <Trash2 className="h-[18px] w-[18px] text-destructive" />
              <span className="text-[14px] font-medium text-destructive">Delete Conversation</span>
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
    <div>
      <p className="px-4 pt-4 pb-1.5 text-[12px] font-semibold text-muted-foreground uppercase tracking-wider">
        {title}
      </p>
      <div className="mx-3 bg-muted/30 rounded-xl overflow-hidden divide-y divide-border/10">
        {children}
      </div>
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
      className="w-full flex items-center gap-3 px-4 py-3 active:bg-muted/50 transition-colors"
    >
      <Icon className={`h-[18px] w-[18px] text-muted-foreground ${className || ""}`} />
      <span className={`text-[14px] font-medium flex-1 text-left ${className || "text-foreground"}`}>
        {label}
      </span>
      {chevron && <ChevronRight className="h-4 w-4 text-muted-foreground/50" />}
    </button>
  );
}
