/**
 * AIConciergeTrigger Component
 * Premium 2026-era floating AI concierge with context awareness
 */
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Bot, User } from "lucide-react";
import { useMyTrips } from "@/hooks/useMyTrips";

const ChatIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
  </svg>
);

const quickReplies = [
  "Track my booking",
  "Change reservation",
  "Refund status",
  "Speak to agent",
];

export function AIConciergeTrigger() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, type: "bot", text: "Hi! I'm your ZIVO Concierge. I see you're flying to London tomorrow. How can I help?" },
  ]);
  const [input, setInput] = useState("");

  const { data: upcomingTrips } = useMyTrips("upcoming");
  const hasUpcomingTrips = upcomingTrips && upcomingTrips.length > 0;

  // Simulated alert count (flight delay alert)
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
          ? `I can see you have ${upcomingTrips.length} upcoming trip(s). Your flight BA-112 to London departs tomorrow at 08:30 AM. Would you like me to show you the details?`
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
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(true)}
          className="fixed bottom-8 right-8 w-14 h-14 bg-white text-black rounded-full shadow-[0_0_30px_rgba(255,255,255,0.3)] flex items-center justify-center z-50 group"
        >
          {/* Notification Badge */}
          {alertCount > 0 && (
            <span className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 rounded-full border-2 border-black" />
          )}
          
          <ChatIcon className="w-6 h-6" />
          
          {/* Tooltip */}
          <span className="absolute right-16 bg-zinc-900 text-white text-xs font-bold px-3 py-2 rounded-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border border-white/10">
            {alertCount > 0 ? "Flight delay alert (1)" : "Need help?"}
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
          className="fixed bottom-6 right-6 z-50 w-[360px] h-[500px] bg-zinc-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
          <div className="p-4 bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-between">
              <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                <p className="font-bold text-white">ZIVO Concierge</p>
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 bg-green-400 rounded-full" />
                  <span className="text-xs text-white/80">Online</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)} 
              className="text-white/80 hover:text-white transition-colors"
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
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.type === "bot" ? "bg-blue-600/20" : "bg-zinc-800"}`}
                  >
                    {msg.type === "bot" ? (
                      <Bot className="w-4 h-4 text-blue-400" />
                    ) : (
                      <User className="w-4 h-4 text-zinc-400" />
                    )}
                  </div>
                  <div
                    className={`max-w-[70%] p-3 rounded-2xl text-sm ${
                      msg.type === "bot"
                        ? "bg-zinc-800 rounded-tl-sm text-white"
                        : "bg-blue-600 text-white rounded-tr-sm"
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
                    className="flex-shrink-0 px-3 py-1.5 text-xs bg-zinc-800 rounded-full hover:bg-zinc-700 transition-colors text-white"
                  >
                    {reply}
                  </button>
                ))}
              </div>
            </div>

            {/* Input */}
          <div className="p-4 border-t border-white/10">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && sendMessage(input)}
                  placeholder="Type a message..."
                className="flex-1 px-4 py-2 bg-zinc-800 rounded-full text-sm outline-none focus:ring-2 focus:ring-blue-500/50 text-white placeholder:text-zinc-500"
                />
              <button
                  onClick={() => sendMessage(input)}
                className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors"
                >
                <Send className="w-4 h-4 text-white" />
              </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default AIConciergeTrigger;