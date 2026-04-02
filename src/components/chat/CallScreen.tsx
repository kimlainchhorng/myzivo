/**
 * CallScreen — Full-screen calling overlay for voice/video calls
 */
import { useState, useEffect, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Phone, PhoneOff, Mic, MicOff, Video, VideoOff, Volume2 } from "lucide-react";
import { motion } from "framer-motion";

interface CallScreenProps {
  recipientName: string;
  recipientAvatar?: string | null;
  callType: "voice" | "video";
  onEnd: () => void;
}

export default function CallScreen({ recipientName, recipientAvatar, callType, onEnd }: CallScreenProps) {
  const [callState, setCallState] = useState<"ringing" | "connected" | "ended">("ringing");
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [isSpeaker, setIsSpeaker] = useState(false);
  const [duration, setDuration] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval>>();

  const initials = (recipientName || "U").split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  // Simulate connecting after 2s
  useEffect(() => {
    const timeout = setTimeout(() => {
      setCallState("connected");
    }, 2000);
    return () => clearTimeout(timeout);
  }, []);

  // Timer when connected
  useEffect(() => {
    if (callState === "connected") {
      timerRef.current = setInterval(() => setDuration((d) => d + 1), 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [callState]);

  const formatDuration = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  const handleEnd = () => {
    setCallState("ended");
    if (timerRef.current) clearInterval(timerRef.current);
    setTimeout(onEnd, 300);
  };

  return (
    <motion.div
      className="fixed inset-0 z-[60] flex flex-col items-center justify-between bg-background"
      initial={{ opacity: 0, scale: 1.05 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.25 }}
      style={{ paddingTop: 'max(env(safe-area-inset-top, 0px), 3rem)', paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 2rem)' }}
    >
      {/* Top section - avatar & status */}
      <div className="flex flex-col items-center gap-3 mt-8">
        <Avatar className="h-24 w-24 border-4 border-primary/20">
          <AvatarImage src={recipientAvatar || undefined} />
          <AvatarFallback className="text-2xl font-bold bg-muted text-muted-foreground">{initials}</AvatarFallback>
        </Avatar>
        <h2 className="text-xl font-bold text-foreground">{recipientName}</h2>
        <p className="text-sm text-muted-foreground">
          {callState === "ringing" && (callType === "video" ? "Video calling..." : "Calling...")}
          {callState === "connected" && formatDuration(duration)}
          {callState === "ended" && "Call ended"}
        </p>
        {callState === "ringing" && (
          <div className="flex gap-1 mt-2">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="h-2 w-2 rounded-full bg-primary"
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.3 }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Middle - video placeholder */}
      {callType === "video" && callState === "connected" && !isCameraOff && (
        <div className="flex-1 w-full max-w-sm mx-auto my-6 rounded-2xl bg-muted/30 border border-border/20 flex items-center justify-center">
          <p className="text-xs text-muted-foreground">Camera preview</p>
        </div>
      )}

      {callType === "voice" && <div className="flex-1" />}

      {/* Controls */}
      <div className="flex items-center justify-center gap-5 pb-6">
        {/* Mute */}
        <button
          onClick={() => setIsMuted(!isMuted)}
          className={`h-14 w-14 rounded-full flex items-center justify-center transition-colors ${
            isMuted ? "bg-destructive/15 text-destructive" : "bg-muted text-foreground"
          }`}
        >
          {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
        </button>

        {/* End call */}
        <button
          onClick={handleEnd}
          className="h-16 w-16 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center active:scale-90 transition-transform"
        >
          <PhoneOff className="h-6 w-6" />
        </button>

        {/* Camera toggle (video) or Speaker (voice) */}
        {callType === "video" ? (
          <button
            onClick={() => setIsCameraOff(!isCameraOff)}
            className={`h-14 w-14 rounded-full flex items-center justify-center transition-colors ${
              isCameraOff ? "bg-destructive/15 text-destructive" : "bg-muted text-foreground"
            }`}
          >
            {isCameraOff ? <VideoOff className="h-5 w-5" /> : <Video className="h-5 w-5" />}
          </button>
        ) : (
          <button
            onClick={() => setIsSpeaker(!isSpeaker)}
            className={`h-14 w-14 rounded-full flex items-center justify-center transition-colors ${
              isSpeaker ? "bg-primary/15 text-primary" : "bg-muted text-foreground"
            }`}
          >
            <Volume2 className="h-5 w-5" />
          </button>
        )}
      </div>
    </motion.div>
  );
}
