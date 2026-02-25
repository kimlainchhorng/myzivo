/**
 * Order Chat Page Component
 * Full-page chat UI for Eats order communication
 * Works for Customer, Driver, and Merchant roles
 */
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Send, Image, Loader2, User, Car, Store, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useEatsOrderChat, ChatMessage } from "@/hooks/useEatsOrderChat";
import { ChatRole, QUICK_REPLIES, isChatActive } from "@/lib/chatTables";
import { RequestSupportButton } from "@/components/eats/RequestSupportButton";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

interface OrderChatPageProps {
  orderId: string;
  orderNumber?: string;
  orderStatus?: string;
  myRole: ChatRole;
  backPath: string;
}

export function OrderChatPage({
  orderId,
  orderNumber,
  orderStatus,
  myRole,
  backPath,
}: OrderChatPageProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [message, setMessage] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const {
    chatId,
    messages,
    members,
    sendMessage,
    uploadAttachment,
    markRead,
    isOtherTyping,
    sendTypingStatus,
    isLoading,
    isSending,
  } = useEatsOrderChat(orderId, myRole);

  const isReadOnly = !isChatActive(orderStatus);
  const quickReplies = QUICK_REPLIES[myRole] || [];

  // Mark as read on mount and when messages change
  useEffect(() => {
    markRead();
  }, [messages.length]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOtherTyping]);

  // Handle typing indicator
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    sendTypingStatus(e.target.value.length > 0);
  };

  // Handle send
  const handleSend = async () => {
    if (!message.trim() || isSending || isReadOnly) return;

    const trimmedMessage = message.trim();
    setMessage("");
    sendTypingStatus(false);

    sendMessage({ message: trimmedMessage });
  };

  // Handle quick reply
  const handleQuickReply = (reply: string) => {
    if (isSending || isReadOnly) return;
    sendMessage({ message: reply });
  };

  // Handle file upload
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    if (!file.type.startsWith("image/")) {
      toast.error("Only images are allowed");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB");
      return;
    }

    setIsUploading(true);
    try {
      const url = await uploadAttachment(file);
      if (url) {
        sendMessage({ message: "📷 Photo", attachmentUrl: url });
      }
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  // Handle Enter key
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Get role icon and color
  const getRoleInfo = (role: ChatRole) => {
    switch (role) {
      case "customer":
        return { icon: User, color: "bg-blue-500/20 text-blue-400" };
      case "driver":
        return { icon: Car, color: "bg-green-500/20 text-green-400" };
      case "merchant":
        return { icon: Store, color: "bg-orange-500/20 text-orange-400" };
      case "admin":
        return { icon: Shield, color: "bg-purple-500/20 text-purple-400" };
      default:
        return { icon: User, color: "bg-zinc-500/20 text-zinc-400" };
    }
  };

  // Get participant labels
  const getParticipants = () => {
    const roles = new Set(members.map((m) => m.role));
    const labels: string[] = [];
    if (roles.has("customer")) labels.push("Customer");
    if (roles.has("driver")) labels.push("Driver");
    if (roles.has("merchant")) labels.push("Merchant");
    return labels.join(" • ");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-zinc-950/80 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center gap-3 px-4 py-3">
          <button
            onClick={() => navigate(backPath)}
            className="w-10 h-10 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h1 className="font-bold text-base">
              Order #{orderNumber || orderId.slice(0, 8).toUpperCase()}
            </h1>
            <p className="text-xs text-zinc-500">{getParticipants()}</p>
          </div>
          {!isReadOnly && myRole === "customer" && (
            <RequestSupportButton
              orderId={orderId}
              chatId={chatId}
            />
          )}
          {isReadOnly && (
            <Badge variant="secondary" className="text-xs">
              Read-only
            </Badge>
          )}
        </div>
      </div>

      {/* Messages */}
      <ScrollArea ref={scrollRef} className="flex-1 px-4 py-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-center">
            <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center mb-3">
              <Send className="w-5 h-5 text-zinc-500" />
            </div>
            <p className="text-zinc-500 text-sm">No messages yet</p>
            <p className="text-zinc-600 text-xs mt-1">
              Send a message to start the conversation
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence initial={false}>
              {messages.map((msg) => (
                <MessageBubble
                  key={msg.id}
                  message={msg}
                  isOwn={msg.sender_id === user?.id}
                  roleInfo={getRoleInfo(msg.sender_type as ChatRole)}
                />
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Typing indicator */}
        {isOtherTyping && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 mt-4 text-zinc-500 text-sm"
          >
            <div className="flex gap-1">
              <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
            <span>Someone is typing...</span>
          </motion.div>
        )}
      </ScrollArea>

      {/* Read-only banner */}
      {isReadOnly && (
        <div className="px-4 py-3 bg-zinc-900 border-t border-white/5 text-center">
          <p className="text-sm text-zinc-500">
            This order is {orderStatus}. Chat is read-only.
          </p>
        </div>
      )}

      {/* Quick Replies */}
      {!isReadOnly && quickReplies.length > 0 && (
        <div className="px-4 py-2 border-t border-white/5 overflow-x-auto">
          <div className="flex gap-2 pb-1">
            {quickReplies.map((reply) => (
              <Button
                key={reply}
                variant="outline"
                size="sm"
                onClick={() => handleQuickReply(reply)}
                disabled={isSending}
                className="shrink-0 text-xs border-zinc-700 bg-zinc-900 hover:bg-zinc-800"
              >
                {reply}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Input area */}
      {!isReadOnly && (
        <div className="sticky bottom-0 bg-zinc-950 border-t border-white/5 p-4 safe-area-pb">
          <div className="flex items-end gap-2">
            {/* Attachment button */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading || isSending}
              className="shrink-0 text-zinc-400 hover:text-white"
            >
              {isUploading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Image className="w-5 h-5" />
              )}
            </Button>

            {/* Message input */}
            <Textarea
              ref={textareaRef}
              value={message}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              disabled={isSending}
              className="flex-1 min-h-[44px] max-h-[120px] resize-none bg-zinc-900 border-zinc-700 rounded-xl"
              rows={1}
            />

            {/* Send button */}
            <Button
              onClick={handleSend}
              disabled={!message.trim() || isSending}
              size="icon"
              className="shrink-0 bg-orange-500 hover:bg-orange-600"
            >
              {isSending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Individual message bubble
 */
function MessageBubble({
  message,
  isOwn,
  roleInfo,
}: {
  message: ChatMessage;
  isOwn: boolean;
  roleInfo: { icon: React.ElementType; color: string };
}) {
  const Icon = roleInfo.icon;

  // System messages (support joined/left/requested)
  const isSystemMessage =
    message.sender_type === "admin" &&
    (message.message.startsWith("Support has been requested") ||
      message.message.startsWith("A support agent has joined") ||
      message.message.startsWith("Support agent has left"));

  if (isSystemMessage) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-center py-2"
      >
        <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-zinc-800/50 border border-zinc-700/50">
          <Shield className="w-3 h-3 text-purple-400" />
          <span className="text-xs text-zinc-400">{message.message}</span>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "flex gap-2 max-w-[85%]",
        isOwn ? "ml-auto flex-row-reverse" : ""
      )}
    >
      {/* Avatar */}
      <Avatar className="h-8 w-8 shrink-0">
        <AvatarFallback className={roleInfo.color}>
          <Icon className="h-4 w-4" />
        </AvatarFallback>
      </Avatar>

      <div className={cn("flex flex-col gap-1", isOwn ? "items-end" : "")}>
        {/* Sender info */}
        <div className="flex items-center gap-2 text-xs text-zinc-500">
          <span className="font-medium capitalize">{message.sender_type}</span>
          <span>•</span>
          <span>{format(new Date(message.created_at), "h:mm a")}</span>
        </div>

        {/* Message bubble */}
        <div
          className={cn(
            "rounded-2xl px-4 py-2.5 text-sm",
            isOwn
              ? "bg-orange-500 text-white rounded-tr-sm"
              : "bg-zinc-800 text-white rounded-tl-sm"
          )}
        >
          {/* Attachment */}
          {message.attachment_url && (
            <a
              href={message.attachment_url}
              target="_blank"
              rel="noopener noreferrer"
              className="block mb-2"
            >
              <img
                src={message.attachment_url}
                alt="Attachment"
                className="rounded-xl max-w-[200px] max-h-[200px] object-cover"
              />
            </a>
          )}
          {/* Message text */}
          <p className="whitespace-pre-wrap">{message.message}</p>
        </div>
      </div>
    </motion.div>
  );
}

export default OrderChatPage;
