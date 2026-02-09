/**
 * Live Support Chat Page
 * Real-time chat with support agents at /support/chat
 */

import { useEffect, useRef, useCallback, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, MessageCircle, RotateCcw, Ticket, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";

import {
  useActiveChatSession,
  useChatSession,
  useChatMessages,
  useCreateChatSession,
  useSendChatMessage,
  useEndChatSession,
  useChatSessionRealtime,
  useChatMessagesRealtime,
  useUploadChatImage,
  LiveChatSession,
  LiveChatMessage as ChatMessageType,
} from "@/hooks/useLiveChat";

import { ChatStatusBanner } from "@/components/support/ChatStatusBanner";
import { LiveChatInput } from "@/components/support/LiveChatInput";
import { LiveChatMessage } from "@/components/support/LiveChatMessage";

export default function LiveSupportChatPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [hasAutoStarted, setHasAutoStarted] = useState(false);

  // Get context from URL params
  const contextType = searchParams.get("context") || undefined;
  const contextId = searchParams.get("orderId") || searchParams.get("rideId") || undefined;

  // Fetch existing active session
  const { data: activeSession, isLoading: loadingSession } = useActiveChatSession();
  
  // Use active session ID if available
  const sessionId = activeSession?.id || null;

  // Fetch session details and messages
  const { data: session } = useChatSession(sessionId);
  const { data: messages = [] } = useChatMessages(sessionId);

  // Mutations
  const createSession = useCreateChatSession();
  const sendMessage = useSendChatMessage();
  const endSession = useEndChatSession();
  const uploadImage = useUploadChatImage();

  // Real-time subscriptions
  useChatSessionRealtime(sessionId, useCallback((newSession: LiveChatSession) => {
    if (newSession.status === "active" && session?.status === "waiting") {
      toast.success("Agent joined the chat");
    } else if (newSession.status === "ended" && session?.status !== "ended") {
      toast.info("Chat ended");
    }
  }, [session?.status]));

  useChatMessagesRealtime(sessionId, useCallback((newMessage: ChatMessageType) => {
    if (newMessage.sender_type === "agent") {
      toast.info("New message from support");
    }
  }, []));

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Auto-start session if none exists (only once)
  useEffect(() => {
    if (!loadingSession && !activeSession && !hasAutoStarted && !createSession.isPending) {
      setHasAutoStarted(true);
      createSession.mutate({ contextType, contextId });
    }
  }, [loadingSession, activeSession, hasAutoStarted, createSession, contextType, contextId]);

  const handleSendMessage = async (message: string, imageUrl?: string) => {
    if (!sessionId) return;
    await sendMessage.mutateAsync({
      sessionId,
      message,
      imageUrl,
    });
  };

  const handleUploadImage = async (file: File) => {
    return uploadImage.mutateAsync(file);
  };

  const handleEndChat = () => {
    if (sessionId) {
      endSession.mutate(sessionId);
    }
  };

  const handleStartNewChat = () => {
    setHasAutoStarted(false);
    createSession.mutate({ contextType, contextId });
  };

  const handleGoToTickets = () => {
    navigate("/help/tickets");
  };

  const currentStatus = session?.status || (createSession.isPending ? "waiting" : "waiting");
  const isEnded = currentStatus === "ended";
  const isActive = currentStatus === "active";

  // Loading state
  if (loadingSession || createSession.isPending) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate(-1)}
                className="shrink-0"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <h1 className="text-lg font-bold">Live Chat</h1>
            </div>
          </div>
        </header>

        <div className="flex-1 flex flex-col items-center justify-center gap-4 p-8">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
          <div className="text-center">
            <h2 className="font-bold text-lg mb-1">Connecting...</h2>
            <p className="text-sm text-muted-foreground">
              Finding an available agent
            </p>
          </div>
          <p className="text-xs text-muted-foreground">
            Estimated wait: ~2 min
          </p>
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="mt-4"
          >
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="shrink-0"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-lg font-bold">Live Chat</h1>
          </div>
          
          {isActive && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleEndChat}
              disabled={endSession.isPending}
              className="text-destructive hover:text-destructive"
            >
              End Chat
            </Button>
          )}
        </div>
      </header>

      {/* Ended State */}
      {isEnded && (
        <div className="flex-1 flex flex-col items-center justify-center gap-4 p-8">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
            <MessageCircle className="w-8 h-8 text-muted-foreground" />
          </div>
          <div className="text-center">
            <h2 className="font-bold text-lg mb-1">Conversation ended</h2>
            <p className="text-sm text-muted-foreground">
              Need more help?
            </p>
          </div>
          <div className="flex gap-3 mt-2">
            <Button onClick={handleStartNewChat} className="gap-2">
              <RotateCcw className="w-4 h-4" />
              Start New Chat
            </Button>
            <Button variant="outline" onClick={handleGoToTickets} className="gap-2">
              <Ticket className="w-4 h-4" />
              View Tickets
            </Button>
          </div>
        </div>
      )}

      {/* Active/Waiting Chat */}
      {!isEnded && (
        <>
          {/* Status Banner */}
          <div className="p-4 pb-0">
            <ChatStatusBanner
              status={currentStatus}
              onCancel={() => navigate(-1)}
            />
          </div>

          {/* Messages */}
          <ScrollArea ref={scrollRef} className="flex-1 p-4">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-center text-muted-foreground">
                <MessageCircle className="h-10 w-10 mb-3 opacity-50" />
                <p className="text-sm">No messages yet</p>
                <p className="text-xs mt-1">
                  {isActive
                    ? "Send a message to describe your issue"
                    : "Please wait for an agent to connect"}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((msg) => (
                  <LiveChatMessage
                    key={msg.id}
                    message={msg.message}
                    imageUrl={msg.image_url}
                    senderType={msg.sender_type}
                    createdAt={msg.created_at}
                  />
                ))}
              </div>
            )}
          </ScrollArea>

          {/* Input */}
          <LiveChatInput
            onSend={handleSendMessage}
            onUploadImage={handleUploadImage}
            isPending={sendMessage.isPending}
            disabled={!isActive}
            placeholder={
              isActive
                ? "Describe your issue..."
                : "Waiting for agent to connect..."
            }
          />
        </>
      )}
    </div>
  );
}
