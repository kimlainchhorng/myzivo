import { useEffect, useRef, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, ShieldAlert, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { sanitizeOutgoingMessage, assessChatMessageRisk } from "@/lib/security/chatContentSafety";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  rideRequestId: string;
  counterpartName?: string;
  senderRole: "rider" | "driver";
}

interface TripMessage {
  id: string;
  sender_id: string;
  content: string;
  moderation_status: string;
  created_at: string;
  sender_role?: string | null;
}

export default function TripChatSheet({ open, onOpenChange, rideRequestId, counterpartName, senderRole }: Props) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<TripMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open || !rideRequestId) return;

    const fetchMessages = async () => {
      const { data } = await supabase
        .from("trip_messages")
        .select("id, sender_id, content, moderation_status, created_at, sender_role")
        .eq("ride_request_id", rideRequestId)
        .order("created_at", { ascending: true })
        .limit(200);
      if (data) setMessages(data as TripMessage[]);
    };
    fetchMessages();

    const channel = supabase
      .channel(`trip-chat-${rideRequestId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "trip_messages", filter: `ride_request_id=eq.${rideRequestId}` }, (payload) => {
        if (payload.eventType === "INSERT") {
          setMessages((prev) => prev.find((m) => m.id === (payload.new as any).id) ? prev : [...prev, payload.new as TripMessage]);
        } else if (payload.eventType === "UPDATE") {
          setMessages((prev) => prev.map((m) => m.id === (payload.new as any).id ? { ...m, ...(payload.new as any) } : m));
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [open, rideRequestId]);

  useEffect(() => {
    setTimeout(() => scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" }), 50);
  }, [messages.length]);

  const send = async () => {
    if (!input.trim() || !user || sending) return;
    const sanitized = sanitizeOutgoingMessage(input).slice(0, 500);
    if (!sanitized) return;
    const risk = assessChatMessageRisk(sanitized);
    if (risk.blocked) {
      toast.error("Message blocked by safety filters");
      return;
    }
    setSending(true);
    const { data, error } = await supabase
      .from("trip_messages")
      .insert({
        ride_request_id: rideRequestId,
        trip_id: rideRequestId,
        sender_id: user.id,
        sender_type: senderRole,
        sender_role: senderRole,
        content: sanitized,
        body: sanitized,
        moderation_status: "pending",
      } as any)
      .select("id")
      .single();
    setSending(false);
    if (error) { toast.error("Could not send"); return; }
    setInput("");
    // Fire-and-forget moderation
    supabase.functions.invoke("moderate-trip-message", { body: { message_id: data.id } }).catch(() => {});
  };

  const visibleMessages = messages.filter((m) => m.moderation_status === "clean" || m.sender_id === user?.id);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[80vh] p-0 flex flex-col">
        <SheetHeader className="px-4 py-3 border-b border-border/30">
          <SheetTitle className="text-sm">{counterpartName || (senderRole === "rider" ? "Driver" : "Rider")}</SheetTitle>
        </SheetHeader>

        <ScrollArea className="flex-1 px-4 py-3" ref={scrollRef as any}>
          <div className="space-y-2">
            {visibleMessages.length === 0 && (
              <p className="text-center text-xs text-muted-foreground py-8">No messages yet. Say hi!</p>
            )}
            {visibleMessages.map((m) => {
              const isMe = m.sender_id === user?.id;
              const isPending = m.moderation_status === "pending" || m.moderation_status === "pending_review";
              const isBlocked = m.moderation_status === "blocked";
              return (
                <div key={m.id} className={cn("flex", isMe ? "justify-end" : "justify-start")}>
                  <div className={cn(
                    "max-w-[78%] rounded-2xl px-3 py-2 text-sm",
                    isMe ? "bg-emerald-500 text-white" : "bg-muted text-foreground",
                    isBlocked && "opacity-60 line-through"
                  )}>
                    <p className="whitespace-pre-wrap break-words">{m.content}</p>
                    {isMe && (isPending || isBlocked) && (
                      <p className="text-[10px] mt-1 opacity-90 flex items-center gap-1">
                        {isBlocked ? <ShieldAlert className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                        {isBlocked ? "Blocked by safety" : "Reviewing..."}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>

        <div className="border-t border-border/30 p-3 flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Message..."
            maxLength={500}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); send(); } }}
            className="flex-1"
          />
          <Button onClick={send} disabled={!input.trim() || sending} size="icon" className="bg-emerald-500 hover:bg-emerald-600">
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
