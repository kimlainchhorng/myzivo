/**
 * StoreLiveChat — Real-time in-app chat between customer and store
 */
import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, MessageCircle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface StoreLiveChatProps {
  storeId: string;
  storeName: string;
  storeLogo?: string | null;
  open: boolean;
  onClose: () => void;
}

interface ChatMessage {
  id: string;
  sender_type: string;
  content: string;
  created_at: string;
  is_read: boolean;
}

export default function StoreLiveChat({ storeId, storeName, storeLogo, open, onClose }: StoreLiveChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [chatId, setChatId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  // Get or create chat
  useEffect(() => {
    if (!open) return;
    let cancelled = false;

    const initChat = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please sign in to chat");
        onClose();
        return;
      }

      // Try to find existing chat
      const { data: existing } = await supabase
        .from("store_chats")
        .select("id")
        .eq("store_id", storeId)
        .eq("user_id", user.id)
        .maybeSingle();

      let id = existing?.id;
      if (!id) {
        const { data: created, error } = await supabase
          .from("store_chats")
          .insert({ store_id: storeId, user_id: user.id })
          .select("id")
          .single();
        if (error) {
          toast.error("Could not start chat");
          onClose();
          return;
        }
        id = created.id;
      }

      if (cancelled) return;
      setChatId(id);

      // Load messages
      const { data: msgs } = await supabase
        .from("store_chat_messages")
        .select("id, sender_type, content, created_at, is_read")
        .eq("chat_id", id)
        .order("created_at", { ascending: true });

      if (!cancelled) {
        setMessages(msgs || []);
        setLoading(false);
        setTimeout(scrollToBottom, 100);
      }
    };

    initChat();
    return () => { cancelled = true; };
  }, [open, storeId, onClose, scrollToBottom]);

  // Realtime subscription
  useEffect(() => {
    if (!chatId) return;

    const channel = supabase
      .channel(`store-chat-${chatId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "store_chat_messages", filter: `chat_id=eq.${chatId}` },
        (payload) => {
          const msg = payload.new as ChatMessage;
          setMessages((prev) => {
            if (prev.some((m) => m.id === msg.id)) return prev;
            return [...prev, msg];
          });
          setTimeout(scrollToBottom, 50);
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [chatId, scrollToBottom]);

  const sendMessage = async () => {
    if (!input.trim() || !chatId || sending) return;
    const text = input.trim();
    setInput("");
    setSending(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from("store_chat_messages").insert({
      chat_id: chatId,
      sender_id: user.id,
      sender_type: "customer",
      content: text,
    });

    if (error) toast.error("Failed to send message");
    setSending(false);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
            className="absolute bottom-0 left-0 right-0 h-[85vh] bg-background rounded-t-3xl border-t border-border/30 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-border/30 shrink-0">
              <div className="h-10 w-10 rounded-full bg-muted border border-border/30 overflow-hidden flex items-center justify-center">
                {storeLogo ? (
                  <img src={storeLogo} alt={storeName} className="h-full w-full object-contain p-1" />
                ) : (
                  <MessageCircle className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-foreground truncate">{storeName}</p>
                <p className="text-[10px] text-muted-foreground">Live Chat</p>
              </div>
              <button onClick={onClose} className="p-2 rounded-full hover:bg-muted transition-colors">
                <X className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
              {loading ? (
                <div className="flex items-center justify-center h-32">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-32 text-center">
                  <MessageCircle className="h-8 w-8 text-muted-foreground/30 mb-2" />
                  <p className="text-sm text-muted-foreground">Start a conversation with {storeName}</p>
                  <p className="text-[10px] text-muted-foreground/60 mt-1">Ask about products, availability, or delivery</p>
                </div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.sender_type === "customer" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[75%] px-3 py-2 rounded-2xl text-[13px] ${
                        msg.sender_type === "customer"
                          ? "bg-primary text-primary-foreground rounded-br-md"
                          : "bg-muted text-foreground rounded-bl-md"
                      }`}
                    >
                      {msg.content}
                      <p className={`text-[9px] mt-1 ${
                        msg.sender_type === "customer" ? "text-primary-foreground/60" : "text-muted-foreground"
                      }`}>
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="px-4 py-3 border-t border-border/30 shrink-0 pb-safe">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                  placeholder="Type a message..."
                  className="flex-1 h-10 px-4 rounded-full bg-muted border border-border/30 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/30"
                />
                <button
                  onClick={sendMessage}
                  disabled={!input.trim() || sending}
                  className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0 disabled:opacity-50 transition-opacity"
                >
                  {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
