import { useState, useEffect, useRef, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, Loader2, MapPin } from "lucide-react";
import { useCurrentLocation } from "@/hooks/useCurrentLocation";
import LocationMessage from "./LocationMessage";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  useTripMessages,
  useSendMessage,
  useMarkMessagesRead,
  useTripChatRealtime,
  useTypingIndicator,
  TripMessage,
} from "@/hooks/useTripChat";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

interface TripChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  tripId: string;
  userType: "rider" | "driver";
  otherPartyName: string;
  otherPartyAvatar?: string | null;
}

// Quick reply templates based on user type
const QUICK_REPLIES = {
  rider: [
    "I'll be right out",
    "I'm running late, 2 min",
    "I'm at the pickup spot",
    "Can you wait a moment?",
    "On my way down now",
  ],
  driver: [
    "I'm here",
    "I'm 2 minutes away",
    "I'm stuck in traffic",
    "Take your time",
    "I'm the white Toyota",
  ],
};

const TripChatModal = ({
  isOpen,
  onClose,
  tripId,
  userType,
  otherPartyName,
  otherPartyAvatar,
}: TripChatModalProps) => {
  const { user } = useAuth();
  const [newMessage, setNewMessage] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: messages, isLoading } = useTripMessages(tripId);
  const sendMessage = useSendMessage();
  const markRead = useMarkMessagesRead();
  const { isOtherTyping, sendTypingStatus } = useTypingIndicator(tripId, userType);
  const { getCurrentLocation, reverseGeocode, isGettingLocation } = useCurrentLocation();

  // Subscribe to realtime updates
  const handleNewMessage = useCallback(
    (message: TripMessage) => {
      if (message.sender_id !== user?.id) {
        // Play notification sound or show toast
        toast.info(`${otherPartyName}: ${message.content.substring(0, 50)}...`);
      }
    },
    [user?.id, otherPartyName]
  );

  useTripChatRealtime(tripId, handleNewMessage);

  // Mark messages as read when modal opens
  useEffect(() => {
    if (isOpen && tripId) {
      markRead.mutate({ tripId, senderType: userType });
    }
  }, [isOpen, tripId, userType]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleSend = async () => {
    if (!newMessage.trim() || sendMessage.isPending) return;

    // Stop typing indicator when sending
    sendTypingStatus(false);

    try {
      await sendMessage.mutateAsync({
        tripId,
        content: newMessage,
        senderType: userType,
      });
      setNewMessage("");
    } catch (error) {
      toast.error("Failed to send message");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNewMessage(value);

    // Send typing status
    if (value.trim()) {
      sendTypingStatus(true);
    } else {
      sendTypingStatus(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleQuickReply = async (text: string) => {
    if (sendMessage.isPending) return;

    try {
      await sendMessage.mutateAsync({
        tripId,
        content: text,
        senderType: userType,
      });
    } catch (error) {
      toast.error("Failed to send message");
    }
  };

  const handleShareLocation = async () => {
    if (sendMessage.isPending || isGettingLocation) return;

    try {
      const location = await getCurrentLocation();
      const address = await reverseGeocode(location.lat, location.lng);
      
      // Format location as a special message with JSON payload
      const locationMessage = JSON.stringify({
        type: "location",
        lat: location.lat,
        lng: location.lng,
        address: address,
      });

      await sendMessage.mutateAsync({
        tripId,
        content: locationMessage,
        senderType: userType,
      });

      toast.success("Location shared!");
    } catch (error: any) {
      toast.error(error.message || "Failed to share location");
    }
  };

  // Helper to parse location messages
  const parseLocationMessage = (content: string): { type: "location"; lat: number; lng: number; address: string } | null => {
    try {
      const parsed = JSON.parse(content);
      if (parsed.type === "location" && parsed.lat && parsed.lng) {
        return parsed;
      }
    } catch {
      // Not a JSON message, return null
    }
    return null;
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md h-[600px] flex flex-col p-0">
        <DialogHeader className="p-4 border-b">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={otherPartyAvatar || undefined} />
              <AvatarFallback>{getInitials(otherPartyName)}</AvatarFallback>
            </Avatar>
            <div>
              <DialogTitle>{otherPartyName}</DialogTitle>
              <p className="text-sm text-muted-foreground capitalize">
                {userType === "rider" ? "Your Driver" : "Rider"}
              </p>
            </div>
          </div>
        </DialogHeader>

        {/* Messages Area */}
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : !messages || messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <p className="text-muted-foreground mb-2">No messages yet</p>
              <p className="text-sm text-muted-foreground">
                Send a message to {otherPartyName}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message, index) => {
                const isMe = message.sender_id === user?.id;
                const showTimestamp =
                  index === 0 ||
                  new Date(message.created_at).getTime() -
                    new Date(messages[index - 1].created_at).getTime() >
                    300000; // 5 minutes
                const locationData = parseLocationMessage(message.content);

                return (
                  <div key={message.id}>
                    {showTimestamp && (
                      <div className="text-center mb-2">
                        <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                          {format(new Date(message.created_at), "MMM d, h:mm a")}
                        </span>
                      </div>
                    )}
                    <div
                      className={cn(
                        "flex gap-2",
                        isMe ? "justify-end" : "justify-start"
                      )}
                    >
                      {!isMe && (
                        <Avatar className="h-8 w-8 flex-shrink-0">
                          <AvatarImage src={otherPartyAvatar || undefined} />
                          <AvatarFallback className="text-xs">
                            {getInitials(otherPartyName)}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      {locationData ? (
                        <LocationMessage
                          lat={locationData.lat}
                          lng={locationData.lng}
                          address={locationData.address}
                          isMe={isMe}
                        />
                      ) : (
                        <div
                          className={cn(
                            "max-w-[75%] px-4 py-2 rounded-2xl",
                            isMe
                              ? "bg-primary text-primary-foreground rounded-br-sm"
                              : "bg-muted rounded-bl-sm"
                          )}
                        >
                          <p className="text-sm whitespace-pre-wrap break-words">
                            {message.content}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              {/* Typing Indicator */}
              {isOtherTyping && (
                <div className="flex gap-2 justify-start">
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarImage src={otherPartyAvatar || undefined} />
                    <AvatarFallback className="text-xs">
                      {getInitials(otherPartyName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-muted px-4 py-2 rounded-2xl rounded-bl-sm">
                    <div className="flex items-center gap-1">
                      <span className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </ScrollArea>

        {/* Quick Replies */}
        <div className="px-4 py-2 border-t overflow-x-auto">
          <div className="flex gap-2">
            {QUICK_REPLIES[userType].map((reply) => (
              <Button
                key={reply}
                variant="outline"
                size="sm"
                className="whitespace-nowrap text-xs h-8 flex-shrink-0"
                onClick={() => handleQuickReply(reply)}
                disabled={sendMessage.isPending}
              >
                {reply}
              </Button>
            ))}
          </div>
        </div>

        {/* Input Area */}
        <div className="p-4 border-t">
          <div className="flex gap-2">
            {/* Share Location Button - primarily for riders */}
            <Button
              variant="outline"
              size="icon"
              onClick={handleShareLocation}
              disabled={sendMessage.isPending || isGettingLocation}
              title="Share your location"
            >
              {isGettingLocation ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <MapPin className="h-4 w-4" />
              )}
            </Button>
            <Input
              ref={inputRef}
              placeholder="Type a message..."
              value={newMessage}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              disabled={sendMessage.isPending}
              className="flex-1"
            />
            <Button
              size="icon"
              onClick={handleSend}
              disabled={!newMessage.trim() || sendMessage.isPending}
            >
              {sendMessage.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TripChatModal;
