/**
 * ZIVO Eats Order Chat Hook
 * Real-time multi-party chat for order communication
 * Supports Customer, Driver, and Merchant participants
 */
import { useState, useEffect, useCallback, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { CHAT_TABLES, ChatRole, isChatActive } from "@/lib/chatTables";
import { toast } from "sonner";

export interface ChatMessage {
  id: string;
  chat_id: string;
  sender_id: string;
  sender_type: ChatRole;
  message: string;
  attachment_url: string | null;
  is_read: boolean;
  created_at: string;
  order_id: string | null;
}

export interface ChatMember {
  id: string;
  chat_id: string;
  user_id: string;
  role: ChatRole;
  created_at: string;
}

export interface OrderChat {
  id: string;
  order_id: string;
  created_at: string;
}

/**
 * Main hook for Eats order chat functionality
 */
export function useEatsOrderChat(orderId: string | undefined, myRole: ChatRole) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // 1. Get or create chat for order
  const chatQuery = useQuery({
    queryKey: ["order-chat", orderId],
    queryFn: async () => {
      if (!orderId) return null;

      // Try to find existing chat
      const { data: existing, error: fetchError } = await supabase
        .from(CHAT_TABLES.orderChats)
        .select("*")
        .eq("order_id", orderId)
        .maybeSingle();

      if (fetchError) throw fetchError;
      if (existing) return existing as OrderChat;

      // Create new chat if not exists
      const { data: created, error: createError } = await supabase
        .from(CHAT_TABLES.orderChats)
        .insert({ order_id: orderId })
        .select()
        .single();

      if (createError) throw createError;
      return created as OrderChat;
    },
    enabled: !!orderId && !!user,
  });

  const chatId = chatQuery.data?.id;

  // 2. Ensure user is in chat_members
  const membershipMutation = useMutation({
    mutationFn: async () => {
      if (!chatId || !user) return;

      // Check if already a member
      const { data: existing } = await supabase
        .from(CHAT_TABLES.chatMembers)
        .select("id")
        .eq("chat_id", chatId)
        .eq("user_id", user.id)
        .maybeSingle();

      if (existing) return;

      // Add as member
      const { error } = await supabase.from(CHAT_TABLES.chatMembers).insert({
        chat_id: chatId,
        user_id: user.id,
        role: myRole,
      });

      if (error) throw error;
    },
  });

  // Ensure membership when chat is available
  useEffect(() => {
    if (chatId && user) {
      membershipMutation.mutate();
    }
  }, [chatId, user?.id]);

  // 3. Fetch messages
  const messagesQuery = useQuery({
    queryKey: ["chat-messages", chatId],
    queryFn: async () => {
      if (!chatId) return [];

      const { data, error } = await supabase
        .from(CHAT_TABLES.chatMessages)
        .select("*")
        .eq("chat_id", chatId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data as ChatMessage[];
    },
    enabled: !!chatId,
  });

  // 4. Fetch chat members
  const membersQuery = useQuery({
    queryKey: ["chat-members", chatId],
    queryFn: async () => {
      if (!chatId) return [];

      const { data, error } = await supabase
        .from(CHAT_TABLES.chatMembers)
        .select("*")
        .eq("chat_id", chatId);

      if (error) throw error;
      return data as ChatMember[];
    },
    enabled: !!chatId,
  });

  // 5. Subscribe to realtime messages
  useEffect(() => {
    if (!chatId) return;

    const channel = supabase
      .channel(`order-chat-${chatId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: CHAT_TABLES.chatMessages,
          filter: `chat_id=eq.${chatId}`,
        },
        (payload) => {
          const newMessage = payload.new as ChatMessage;

          // Update cache
          queryClient.setQueryData<ChatMessage[]>(
            ["chat-messages", chatId],
            (old) => {
              if (!old) return [newMessage];
              // Avoid duplicates
              if (old.some((m) => m.id === newMessage.id)) return old;
              return [...old, newMessage];
            }
          );

          // Show toast if from someone else
          if (newMessage.sender_id !== user?.id) {
            toast.info(`New message from ${newMessage.sender_type}`);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [chatId, user?.id, queryClient]);

  // 6. Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async ({
      message,
      attachmentUrl,
    }: {
      message: string;
      attachmentUrl?: string;
    }) => {
      if (!chatId || !user) throw new Error("Chat not ready");

      // Insert message
      const { data: newMessage, error } = await supabase
        .from(CHAT_TABLES.chatMessages)
        .insert({
          chat_id: chatId,
          sender_id: user.id,
          sender_type: myRole,
          message: message.trim(),
          attachment_url: attachmentUrl || null,
          order_id: orderId,
        })
        .select()
        .single();

      if (error) throw error;

      // Notify other participants
      const otherMembers = membersQuery.data?.filter(
        (m) => m.user_id !== user.id
      );
      if (otherMembers && otherMembers.length > 0) {
        const notifications = otherMembers.map((member) => ({
          user_id: member.user_id,
          channel: "in_app" as const,
          category: "transactional" as const,
          template: "order_chat_message",
          title: `New message - Order #${orderId?.slice(0, 8).toUpperCase()}`,
          body:
            message.substring(0, 80) + (message.length > 80 ? "..." : ""),
          action_url: `/eats/orders/${orderId}/chat`,
          metadata: {
            order_id: orderId,
            sender_role: myRole,
            message_preview: message.substring(0, 80),
          },
        }));

        await supabase.from("notifications").insert(notifications);
      }

      return newMessage;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chat-messages", chatId] });
    },
    onError: (error) => {
      toast.error("Failed to send message");
      console.error("Send message error:", error);
    },
  });

  // 7. Upload attachment
  const uploadAttachment = async (file: File): Promise<string | null> => {
    if (!user) return null;

    const fileExt = file.name.split(".").pop();
    const fileName = `${user.id}/${Date.now()}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from("chat-attachments")
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload image");
      return null;
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("chat-attachments").getPublicUrl(data.path);

    return publicUrl;
  };

  // 8. Mark as read
  const markReadMutation = useMutation({
    mutationFn: async () => {
      if (!chatId || !user) return;

      await supabase.from(CHAT_TABLES.chatReads).upsert(
        {
          chat_id: chatId,
          user_id: user.id,
          last_read_at: new Date().toISOString(),
        },
        { onConflict: "chat_id,user_id" }
      );
    },
  });

  // 9. Typing indicator
  const { isOtherTyping, sendTypingStatus } = useTypingIndicator(chatId, myRole);

  return {
    chatId,
    messages: messagesQuery.data || [],
    members: membersQuery.data || [],
    sendMessage: sendMessageMutation.mutate,
    uploadAttachment,
    markRead: markReadMutation.mutate,
    isOtherTyping,
    sendTypingStatus,
    isLoading: chatQuery.isLoading || messagesQuery.isLoading,
    isSending: sendMessageMutation.isPending,
  };
}

/**
 * Typing indicator using Supabase broadcast
 */
function useTypingIndicator(chatId: string | undefined, myRole: ChatRole) {
  const [isOtherTyping, setIsOtherTyping] = useState(false);
  const [typingRole, setTypingRole] = useState<ChatRole | null>(null);
  const { user } = useAuth();
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastBroadcastRef = useRef<number>(0);

  useEffect(() => {
    if (!chatId || !user) return;

    const channel = supabase.channel(`typing-${chatId}`, {
      config: { broadcast: { self: false } },
    });

    channel
      .on("broadcast", { event: "typing" }, (payload) => {
        const { senderRole, isTyping } = payload.payload as {
          senderRole: ChatRole;
          isTyping: boolean;
        };

        // Only show typing from others
        if (senderRole !== myRole) {
          setIsOtherTyping(isTyping);
          setTypingRole(isTyping ? senderRole : null);

          // Clear timeout
          if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
          }

          // Auto-clear after 3s
          if (isTyping) {
            typingTimeoutRef.current = setTimeout(() => {
              setIsOtherTyping(false);
              setTypingRole(null);
            }, 3000);
          }
        }
      })
      .subscribe();

    channelRef.current = channel;

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      supabase.removeChannel(channel);
    };
  }, [chatId, user, myRole]);

  const sendTypingStatus = useCallback(
    (isTyping: boolean) => {
      if (!channelRef.current) return;

      // Throttle to max once per 500ms
      const now = Date.now();
      if (isTyping && now - lastBroadcastRef.current < 500) return;
      lastBroadcastRef.current = now;

      channelRef.current.send({
        type: "broadcast",
        event: "typing",
        payload: { senderRole: myRole, isTyping },
      });
    },
    [myRole]
  );

  return { isOtherTyping, typingRole, sendTypingStatus };
}

/**
 * Hook to get unread message count for a specific chat
 */
export function useUnreadChatCount(chatId: string | undefined) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["chat-unread-count", chatId],
    queryFn: async () => {
      if (!chatId || !user) return 0;

      // Get last read time
      const { data: readData } = await supabase
        .from(CHAT_TABLES.chatReads)
        .select("last_read_at")
        .eq("chat_id", chatId)
        .eq("user_id", user.id)
        .maybeSingle();

      const lastReadAt = readData?.last_read_at || "1970-01-01";

      // Count messages after last read from others
      const { count, error } = await supabase
        .from(CHAT_TABLES.chatMessages)
        .select("*", { count: "exact", head: true })
        .eq("chat_id", chatId)
        .neq("sender_id", user.id)
        .gt("created_at", lastReadAt);

      if (error) throw error;
      return count || 0;
    },
    enabled: !!chatId && !!user,
    refetchInterval: 30000, // Fallback poll
  });
}
