/**
 * InRideChat - Real-time driver chat with quick replies, photo sharing, and pin drop
 */
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, Send, Camera, MapPin, Smile, X, Phone, ChevronDown, Mic, Image } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface ChatMessage {
  id: string;
  sender: "user" | "driver";
  text: string;
  type: "text" | "location" | "photo";
  timestamp: Date;
}

interface InRideChatProps {
  driverName?: string;
  driverRating?: number;
  onClose?: () => void;
  onCall?: () => void;
}

const quickReplies = [
  "I'm here",
  "On my way",
  "5 minutes",
  "I'm wearing a blue jacket",
  "Can you wait?",
  "Thanks!",
];

export default function InRideChat({
  driverName = "Marcus T.",
  driverRating = 4.92,
  onClose,
  onCall,
}: InRideChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: "1", sender: "driver", text: "Hi! I'm on my way to pick you up.", type: "text", timestamp: new Date(Date.now() - 120000) },
    { id: "2", sender: "driver", text: "I'll be there in about 5 minutes.", type: "text", timestamp: new Date(Date.now() - 60000) },
  ]);
  const [input, setInput] = useState("");
  const [showQuickReplies, setShowQuickReplies] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = (text: string, type: "text" | "location" | "photo" = "text") => {
    if (!text.trim() && type === "text") return;
    const msg: ChatMessage = {
      id: Date.now().toString(),
      sender: "user",
      text,
      type,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, msg]);
    setInput("");
    setShowQuickReplies(false);

    // Simulate driver reply
    setTimeout(() => {
      const replies = ["Got it!", "See you soon!", "No problem 👍", "Understood!"];
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        sender: "driver",
        text: replies[Math.floor(Math.random() * replies.length)],
        type: "text",
        timestamp: new Date(),
      }]);
    }, 2000 + Math.random() * 3000);
  };

  const sendLocation = () => {
    sendMessage("📍 Shared my exact location", "location");
    toast.success("Location pin sent to driver");
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  };

  return (
    <div className="rounded-2xl bg-card border border-border/40 overflow-hidden flex flex-col h-[500px]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/30 bg-card shrink-0">
        <div className="flex items-center gap-3">
          <Avatar className="w-9 h-9 border-2 border-primary/20">
            <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
              {driverName.split(" ").map(n => n[0]).join("")}
            </AvatarFallback>
          </Avatar>
          <div>
            <span className="text-sm font-bold text-foreground">{driverName}</span>
            <p className="text-[10px] text-muted-foreground">⭐ {driverRating} • Usually responds instantly</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onCall} className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center">
            <Phone className="w-3.5 h-3.5 text-emerald-500" />
          </button>
          {onClose && (
            <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center">
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 scroll-momentum">
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn("flex", msg.sender === "user" ? "justify-end" : "justify-start")}
          >
            <div className={cn(
              "max-w-[80%] rounded-2xl px-3 py-2",
              msg.sender === "user"
                ? "bg-primary text-primary-foreground rounded-br-md"
                : "bg-muted/40 text-foreground rounded-bl-md"
            )}>
              {msg.type === "location" && (
                <div className="flex items-center gap-1.5 mb-1">
                  <MapPin className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-bold">Location shared</span>
                </div>
              )}
              <p className="text-xs">{msg.text}</p>
              <p className={cn(
                "text-[9px] mt-1",
                msg.sender === "user" ? "text-primary-foreground/60" : "text-muted-foreground"
              )}>
                {formatTime(msg.timestamp)}
              </p>
            </div>
          </motion.div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick replies */}
      <AnimatePresence>
        {showQuickReplies && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="px-4 overflow-hidden shrink-0"
          >
            <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-none">
              {quickReplies.map((reply) => (
                <button
                  key={reply}
                  onClick={() => sendMessage(reply)}
                  className="px-3 py-1.5 rounded-full bg-muted/30 text-xs font-medium text-muted-foreground hover:bg-muted/50 whitespace-nowrap shrink-0 transition-all"
                >
                  {reply}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input bar */}
      <div className="px-4 py-3 border-t border-border/30 bg-card shrink-0">
        <div className="flex items-center gap-2">
          <button onClick={sendLocation} className="w-9 h-9 rounded-full bg-muted/30 flex items-center justify-center shrink-0 hover:bg-muted/50">
            <MapPin className="w-4 h-4 text-muted-foreground" />
          </button>
          <button className="w-9 h-9 rounded-full bg-muted/30 flex items-center justify-center shrink-0 hover:bg-muted/50"
            onClick={() => toast.info("Camera opening...")}>
            <Camera className="w-4 h-4 text-muted-foreground" />
          </button>
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
            placeholder="Type a message..."
            className="h-9 text-xs flex-1"
          />
          <Button
            size="sm"
            onClick={() => sendMessage(input)}
            disabled={!input.trim()}
            className="w-9 h-9 rounded-full p-0 shrink-0"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
