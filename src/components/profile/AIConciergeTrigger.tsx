/**
 * AIConciergeTrigger Component
 * Context-aware floating chat button with alert indicators
 */
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Bot, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMyTrips } from "@/hooks/useMyTrips";

const quickReplies = [
  "Track my booking",
  "Change reservation",
  "Refund status",
  "Speak to agent",
];

export function AIConciergeTrigger() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, type: "bot", text: "Hi! 👋 I'm your ZIVO Concierge. How can I help you today?" },
  ]);
  const [input, setInput] = useState("");

  const { data: upcomingTrips } = useMyTrips("upcoming");
  const hasUpcomingTrips = upcomingTrips && upcomingTrips.length > 0;

  // Simulated alert count (could come from real notifications)
  const alertCount = hasUpcomingTrips ? 1 : 0;

  const sendMessage = (text: string) => {
    if (!text.trim()) return;

    setMessages((prev) => [
      ...prev,
      { id: Date.now(), type: "user", text },
    ]);
    setInput("");

    // Simulated AI response
    setTimeout(() => {
      let response = "Thanks for your message! A support agent will assist you shortly. Average wait time: 2 mins.";
      
      if (text.toLowerCase().includes("track") || text.toLowerCase().includes("booking")) {
        response = hasUpcomingTrips 
          ? `I can see you have ${upcomingTrips.length} upcoming trip(s). Would you like me to show you the details?`
          : "I don't see any active bookings. Would you like to search for a new trip?";
      }

      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, type: "bot", text: response },
      ]);
    }, 1000);
  };

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-foreground text-background rounded-full shadow-xl flex items-center justify-center group concierge-glow"
        >
          <MessageCircle className="w-6 h-6" />
          
          {/* Notification Badge */}
          {alertCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-background">
              {alertCount}
            </span>
          )}

          {/* Hover Tooltip */}
          <span className="absolute right-16 bg-card text-foreground text-xs font-medium px-3 py-2 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border border-border shadow-lg">
            {alertCount > 0 ? `${alertCount} trip update(s)` : "Need help?"}
          </span>
        </motion.button>
      )}

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 w-[360px] h-[500px] bg-card/95 backdrop-blur-xl border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-primary to-primary/80 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-foreground/20 rounded-full flex items-center justify-center">
                  <Bot className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <p className="font-bold text-primary-foreground">ZIVO Concierge</p>
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 bg-green-400 rounded-full" />
                    <span className="text-xs text-primary-foreground/80">Online</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)} 
                className="text-primary-foreground/80 hover:text-primary-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-2 ${msg.type === "user" ? "flex-row-reverse" : ""}`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.type === "bot" ? "bg-primary/20" : "bg-muted"}`}
                  >
                    {msg.type === "bot" ? (
                      <Bot className="w-4 h-4 text-primary" />
                    ) : (
                      <User className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>
                  <div
                    className={`max-w-[70%] p-3 rounded-2xl text-sm ${
                      msg.type === "bot"
                        ? "bg-muted rounded-tl-sm text-foreground"
                        : "bg-primary text-primary-foreground rounded-tr-sm"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Replies */}
            <div className="px-4 pb-2">
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {quickReplies.map((reply) => (
                  <button
                    key={reply}
                    onClick={() => sendMessage(reply)}
                    className="flex-shrink-0 px-3 py-1.5 text-xs bg-muted rounded-full hover:bg-muted/80 transition-colors text-foreground"
                  >
                    {reply}
                  </button>
                ))}
              </div>
            </div>

            {/* Input */}
            <div className="p-4 border-t border-border">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && sendMessage(input)}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2 bg-muted rounded-full text-sm outline-none focus:ring-2 focus:ring-primary/50 text-foreground placeholder:text-muted-foreground"
                />
                <Button
                  size="icon"
                  className="rounded-full"
                  onClick={() => sendMessage(input)}
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default AIConciergeTrigger;