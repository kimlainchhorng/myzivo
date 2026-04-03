import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bot, X, Send, Sparkles, MessageCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  time: string;
}

const FAQ_RESPONSES: Record<string, string> = {
  "help": "I can help you with:\n• Navigating the app\n• Finding flights, hotels & cars\n• Managing your bookings\n• Account settings\n• Marketplace & communities\n\nWhat would you like to know?",
  "flight": "To search for flights:\n1. Go to the Flights page\n2. Enter your origin & destination\n3. Select dates and passengers\n4. Browse results and book!\n\nFinal pricing is confirmed on our partner checkout.",
  "hotel": "To find hotels:\n1. Visit the Hotels page\n2. Enter your destination & dates\n3. Filter by price, rating, or amenities\n4. Book through our partner!",
  "cancel": "Booking changes, cancellations, and refunds are handled by our merchant-of-record travel partner. We'll direct you to the right support team.",
  "account": "You can manage your account from the Profile page. Options include editing your profile, privacy settings, notifications, and security.",
  "marketplace": "The Marketplace lets you buy and sell items. Go to /marketplace to browse listings, or create your own listing to sell.",
  "dating": "ZIVO Dating lets you discover matches with a fun swipe interface. Visit /dating to get started!",
};

function getAIResponse(input: string): string {
  const lower = input.toLowerCase();
  for (const [key, response] of Object.entries(FAQ_RESPONSES)) {
    if (lower.includes(key)) return response;
  }
  return "I'm here to help! You can ask me about flights, hotels, your account, the marketplace, or any other feature. What would you like to know?";
}

export default function AIChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: "welcome", role: "assistant", content: "Hi! 👋 I'm ZIVO Assistant. How can I help you today?", time: "now" },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg: Message = { id: Date.now().toString(), role: "user", content: input, time: "now" };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      const response = getAIResponse(input);
      setMessages((prev) => [...prev, { id: (Date.now() + 1).toString(), role: "assistant", content: response, time: "now" }]);
      setIsTyping(false);
    }, 800);
  };

  const quickActions = ["Help", "Flights", "Hotels", "Account"];

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed bottom-20 right-4 z-50 w-[340px] max-w-[calc(100vw-2rem)]">
            <Card className="flex flex-col h-[480px] shadow-2xl border-border overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between p-3 bg-primary text-primary-foreground">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">ZIVO Assistant</p>
                    <p className="text-xs opacity-80">Always here to help</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary-foreground/20" onClick={() => setIsOpen(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Messages */}
              <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-3">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm whitespace-pre-line ${
                      msg.role === "user" ? "bg-primary text-primary-foreground rounded-br-md" : "bg-muted text-foreground rounded-bl-md"
                    }`}>
                      {msg.content}
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-muted rounded-2xl rounded-bl-md px-3 py-2 text-sm">
                      <span className="animate-pulse">Typing...</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Quick Actions */}
              {messages.length <= 2 && (
                <div className="px-3 pb-2 flex gap-1 flex-wrap">
                  {quickActions.map((action) => (
                    <Badge key={action} variant="outline" className="cursor-pointer text-xs" onClick={() => { setInput(action); }}>
                      {action}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Input */}
              <div className="p-3 border-t border-border flex gap-2">
                <Input placeholder="Ask anything..." value={input} onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()} className="text-sm" />
                <Button size="icon" onClick={handleSend} disabled={!input.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAB */}
      <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 z-50 h-12 w-12 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center">
        {isOpen ? <X className="h-5 w-5" /> : <MessageCircle className="h-5 w-5" />}
      </motion.button>
    </>
  );
}
