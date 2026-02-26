import { useState, useRef, useEffect, useCallback } from "react";
import { MessageCircle, X, Send, Bot, User, Headphones, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type ChatMessage = {
  id: number;
  role: "user" | "assistant" | "system";
  content: string;
};

const quickReplies = [
  "Order status",
  "Payment help",
  "ETA info",
  "Talk to human",
];

const ESCALATION_CATEGORIES = [
  { value: "payment", label: "Payment Issue" },
  { value: "order", label: "Order Problem" },
  { value: "safety", label: "Safety Concern" },
  { value: "other", label: "Other" },
];

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-support-chat`;

const LiveChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 1, role: "assistant", content: "Hi! 👋 I'm ZIVO AI Assistant. How can I help you today?" },
  ]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [showEscalation, setShowEscalation] = useState(false);
  const [escalationCategory, setEscalationCategory] = useState("");
  const [escalationMessage, setEscalationMessage] = useState("");
  const [isSubmittingTicket, setIsSubmittingTicket] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const streamChat = async (allMessages: ChatMessage[]) => {
    const controller = new AbortController();
    abortRef.current = controller;

    const apiMessages = allMessages.map((m) => ({
      role: m.role === "system" ? "user" : m.role,
      content: m.content,
    }));

    const resp = await fetch(CHAT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({ messages: apiMessages }),
      signal: controller.signal,
    });

    if (!resp.ok) {
      const errorData = await resp.json().catch(() => ({}));
      if (resp.status === 429) {
        toast.error("AI is busy, please try again in a moment");
      } else if (resp.status === 402) {
        toast.error("Service temporarily unavailable");
      } else {
        toast.error(errorData.error || "Something went wrong");
      }
      throw new Error(errorData.error || "Stream failed");
    }

    if (!resp.body) throw new Error("No response body");

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let assistantContent = "";
    const assistantId = Date.now() + 1;

    // Create initial assistant message
    setMessages((prev) => [...prev, { id: assistantId, role: "assistant", content: "" }]);

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      let newlineIdx: number;
      while ((newlineIdx = buffer.indexOf("\n")) !== -1) {
        let line = buffer.slice(0, newlineIdx);
        buffer = buffer.slice(newlineIdx + 1);
        if (line.endsWith("\r")) line = line.slice(0, -1);
        if (line.startsWith(":") || line.trim() === "") continue;
        if (!line.startsWith("data: ")) continue;

        const jsonStr = line.slice(6).trim();
        if (jsonStr === "[DONE]") break;

        try {
          const parsed = JSON.parse(jsonStr);
          const delta = parsed.choices?.[0]?.delta?.content;
          if (delta) {
            assistantContent += delta;
            const snapshot = assistantContent;
            setMessages((prev) =>
              prev.map((m) => (m.id === assistantId ? { ...m, content: snapshot } : m))
            );
          }
        } catch {
          buffer = line + "\n" + buffer;
          break;
        }
      }
    }

    // Final flush
    if (buffer.trim()) {
      for (let raw of buffer.split("\n")) {
        if (!raw) continue;
        if (raw.endsWith("\r")) raw = raw.slice(0, -1);
        if (!raw.startsWith("data: ")) continue;
        const jsonStr = raw.slice(6).trim();
        if (jsonStr === "[DONE]") continue;
        try {
          const parsed = JSON.parse(jsonStr);
          const delta = parsed.choices?.[0]?.delta?.content;
          if (delta) {
            assistantContent += delta;
            const snapshot = assistantContent;
            setMessages((prev) =>
              prev.map((m) => (m.id === assistantId ? { ...m, content: snapshot } : m))
            );
          }
        } catch { /* ignore */ }
      }
    }
  };

  const sendMessage = async (text: string) => {
    if (!text.trim() || isStreaming) return;

    if (text === "Talk to human") {
      setShowEscalation(true);
      return;
    }

    const userMsg: ChatMessage = { id: Date.now(), role: "user", content: text };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput("");
    setIsStreaming(true);

    try {
      await streamChat(updated);
    } catch (e) {
      if ((e as Error).name !== "AbortError") {
        console.error("Chat error:", e);
      }
    } finally {
      setIsStreaming(false);
      abortRef.current = null;
    }
  };

  const submitEscalation = async () => {
    if (!escalationCategory) {
      toast.error("Please select a category");
      return;
    }
    setIsSubmittingTicket(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      const ticketNumber = `ZS-${Date.now().toString().slice(-6)}`;

      const { error } = await supabase.from("support_tickets").insert({
        ticket_number: ticketNumber,
        user_id: user?.id || null,
        subject: ESCALATION_CATEGORIES.find((c) => c.value === escalationCategory)?.label || "Support Request",
        description: escalationMessage || "Customer requested human support via AI chat",
        category: escalationCategory,
        priority: escalationCategory === "safety" ? "urgent" : "normal",
        status: "open",
      });

      if (error) throw error;

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          role: "assistant",
          content: `Ticket **${ticketNumber}** created! A human agent will get back to you shortly. You can continue chatting with me in the meantime.`,
        },
      ]);
      setShowEscalation(false);
      setEscalationCategory("");
      setEscalationMessage("");
      toast.success(`Ticket ${ticketNumber} created`);
    } catch (err) {
      console.error("Ticket creation error:", err);
      toast.error("Failed to create ticket. Please try again.");
    } finally {
      setIsSubmittingTicket(false);
    }
  };

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-r from-primary to-cyan-500 rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform"
        >
          <MessageCircle className="w-6 h-6 text-white" />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-background animate-pulse" />
        </button>
      )}

      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[360px] h-[520px] bg-card/95 backdrop-blur-xl border border-border/50 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-primary to-cyan-500 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-bold text-white">ZIVO AI Support</p>
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-400 rounded-full" />
                  <span className="text-xs text-white/80">Online</span>
                </div>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                    msg.role === "assistant" ? "bg-primary/20" : "bg-muted"
                  }`}
                >
                  {msg.role === "assistant" ? (
                    <Bot className="w-4 h-4 text-primary" />
                  ) : (
                    <User className="w-4 h-4" />
                  )}
                </div>
                <div
                  className={`max-w-[75%] p-3 rounded-2xl text-sm whitespace-pre-wrap ${
                    msg.role === "assistant"
                      ? "bg-muted rounded-tl-sm"
                      : "bg-primary text-primary-foreground rounded-tr-sm"
                  }`}
                >
                  {msg.content || (isStreaming && msg.role === "assistant" ? (
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Loader2 className="w-3 h-3 animate-spin" /> Thinking...
                    </span>
                  ) : null)}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Escalation Form */}
          {showEscalation && (
            <div className="px-4 pb-2 border-t border-border/50 pt-3 space-y-2 shrink-0">
              <p className="text-xs font-medium text-muted-foreground">Connect to human support</p>
              <div className="flex gap-1.5 flex-wrap">
                {ESCALATION_CATEGORIES.map((cat) => (
                  <button
                    key={cat.value}
                    onClick={() => setEscalationCategory(cat.value)}
                    className={`px-2.5 py-1 text-xs rounded-full border transition-colors ${
                      escalationCategory === cat.value
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-muted border-border hover:bg-muted/80"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
              <textarea
                value={escalationMessage}
                onChange={(e) => setEscalationMessage(e.target.value)}
                placeholder="Describe your issue (optional)..."
                className="w-full px-3 py-2 bg-muted rounded-xl text-xs outline-none focus:ring-2 focus:ring-primary/50 resize-none h-16"
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs flex-1"
                  onClick={() => setShowEscalation(false)}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  className="text-xs flex-1"
                  onClick={submitEscalation}
                  disabled={isSubmittingTicket}
                >
                  {isSubmittingTicket ? <Loader2 className="w-3 h-3 animate-spin" /> : "Submit Ticket"}
                </Button>
              </div>
            </div>
          )}

          {/* Quick Replies */}
          {!showEscalation && (
            <div className="px-4 pb-2 shrink-0">
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {quickReplies.map((reply) => (
                  <button
                    key={reply}
                    onClick={() => sendMessage(reply)}
                    disabled={isStreaming}
                    className="flex-shrink-0 px-3 py-1.5 text-xs bg-muted rounded-full hover:bg-muted/80 transition-colors disabled:opacity-50"
                  >
                    {reply}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input + Human Support Button */}
          <div className="p-4 border-t border-border/50 space-y-2 shrink-0">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
                placeholder="Type a message..."
                disabled={isStreaming}
                className="flex-1 px-4 py-2 bg-muted rounded-full text-sm outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
              />
              <Button
                size="icon"
                className="rounded-full"
                onClick={() => sendMessage(input)}
                disabled={isStreaming || !input.trim()}
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
            {!showEscalation && (
              <button
                onClick={() => setShowEscalation(true)}
                className="w-full flex items-center justify-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors py-1"
              >
                <Headphones className="w-3 h-3" />
                Connect to human support
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default LiveChatWidget;
