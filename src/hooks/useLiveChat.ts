/**
 * Live Chat Hooks
 * Real-time chat sessions and messages with Supabase
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

// Types
export type ChatSessionStatus = "waiting" | "active" | "ended";

export interface LiveChatSession {
  id: string;
  user_id: string | null;
  guest_email: string | null;
  guest_name: string | null;
  status: ChatSessionStatus;
  agent_id: string | null;
  agent_joined_at: string | null;
  ended_at: string | null;
  ended_by: "user" | "agent" | "timeout" | null;
  context_type: string | null;
  context_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface LiveChatMessage {
  id: string;
  session_id: string;
  sender_id: string | null;
  sender_type: "user" | "agent" | "system";
  message: string | null;
  image_url: string | null;
  is_read: boolean;
  created_at: string;
}

// Query keys
const CHAT_KEYS = {
  session: (sessionId: string) => ["live-chat-session", sessionId],
  activeSession: (userId: string) => ["live-chat-active", userId],
  messages: (sessionId: string) => ["live-chat-messages", sessionId],
};

/**
 * Fetch the user's active chat session (if any)
 */
export function useActiveChatSession() {
  const { user } = useAuth();

  return useQuery({
    queryKey: CHAT_KEYS.activeSession(user?.id || ""),
    queryFn: async (): Promise<LiveChatSession | null> => {
      const { data, error } = await supabase
        .from("live_chat_sessions")
        .select("*")
        .eq("user_id", user!.id)
        .in("status", ["waiting", "active"])
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data as LiveChatSession | null;
    },
    enabled: !!user,
  });
}

/**
 * Fetch a specific chat session by ID
 */
export function useChatSession(sessionId: string | null) {
  return useQuery({
    queryKey: CHAT_KEYS.session(sessionId || ""),
    queryFn: async (): Promise<LiveChatSession | null> => {
      const { data, error } = await supabase
        .from("live_chat_sessions")
        .select("*")
        .eq("id", sessionId!)
        .single();

      if (error) throw error;
      return data as LiveChatSession;
    },
    enabled: !!sessionId,
  });
}

/**
 * Fetch messages for a chat session
 */
export function useChatMessages(sessionId: string | null) {
  return useQuery({
    queryKey: CHAT_KEYS.messages(sessionId || ""),
    queryFn: async (): Promise<LiveChatMessage[]> => {
      const { data, error } = await supabase
        .from("live_chat_messages")
        .select("*")
        .eq("session_id", sessionId!)
        .order("created_at", { ascending: true });

      if (error) throw error;
      return (data || []) as LiveChatMessage[];
    },
    enabled: !!sessionId,
  });
}

/**
 * Create a new chat session
 */
export function useCreateChatSession() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (params: {
      contextType?: string;
      contextId?: string;
    }): Promise<LiveChatSession> => {
      const { data, error } = await supabase
        .from("live_chat_sessions")
        .insert({
          user_id: user?.id,
          context_type: params.contextType || null,
          context_id: params.contextId || null,
          status: "waiting",
        })
        .select()
        .single();

      if (error) throw error;

      // Insert system message
      await supabase.from("live_chat_messages").insert({
        session_id: data.id,
        sender_type: "system",
        message: "Connecting to support...",
      });

      return data as LiveChatSession;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(CHAT_KEYS.activeSession(user?.id || ""), data);
    },
    onError: (error) => {
      console.error("[useCreateChatSession] Error:", error);
      toast.error("Failed to start chat. Please try again.");
    },
  });
}

/**
 * Send a chat message
 */
export function useSendChatMessage() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (params: {
      sessionId: string;
      message: string;
      imageUrl?: string;
    }) => {
      const { error } = await supabase.from("live_chat_messages").insert({
        session_id: params.sessionId,
        sender_id: user?.id,
        sender_type: "user",
        message: params.message || null,
        image_url: params.imageUrl || null,
      });

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: CHAT_KEYS.messages(variables.sessionId),
      });
    },
    onError: (error) => {
      console.error("[useSendChatMessage] Error:", error);
      toast.error("Failed to send message");
    },
  });
}

/**
 * End a chat session
 */
export function useEndChatSession() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (sessionId: string) => {
      // Add system message
      await supabase.from("live_chat_messages").insert({
        session_id: sessionId,
        sender_type: "system",
        message: "You ended the chat",
      });

      // Update session status
      const { error } = await supabase
        .from("live_chat_sessions")
        .update({
          status: "ended",
          ended_at: new Date().toISOString(),
          ended_by: "user",
        })
        .eq("id", sessionId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: CHAT_KEYS.activeSession(user?.id || ""),
      });
    },
    onError: (error) => {
      console.error("[useEndChatSession] Error:", error);
      toast.error("Failed to end chat");
    },
  });
}

/**
 * Real-time subscription for session status changes
 */
export function useChatSessionRealtime(
  sessionId: string | null,
  onStatusChange?: (session: LiveChatSession) => void
) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!sessionId) return;

    const channel = supabase
      .channel(`live-chat-session-${sessionId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "live_chat_sessions",
          filter: `id=eq.${sessionId}`,
        },
        (payload) => {
          const newSession = payload.new as LiveChatSession;
          queryClient.setQueryData(CHAT_KEYS.session(sessionId), newSession);
          onStatusChange?.(newSession);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId, queryClient, onStatusChange]);
}

/**
 * Real-time subscription for new messages
 */
export function useChatMessagesRealtime(
  sessionId: string | null,
  onNewMessage?: (message: LiveChatMessage) => void
) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!sessionId) return;

    const channel = supabase
      .channel(`live-chat-messages-${sessionId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "live_chat_messages",
          filter: `session_id=eq.${sessionId}`,
        },
        (payload) => {
          const newMessage = payload.new as LiveChatMessage;
          
          // Update messages cache
          queryClient.setQueryData(
            CHAT_KEYS.messages(sessionId),
            (old: LiveChatMessage[] | undefined) => {
              if (!old) return [newMessage];
              // Prevent duplicates
              if (old.some((m) => m.id === newMessage.id)) return old;
              return [...old, newMessage];
            }
          );
          
          onNewMessage?.(newMessage);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId, queryClient, onNewMessage]);
}

/**
 * Upload image to storage for chat
 */
export function useUploadChatImage() {
  return useMutation({
    mutationFn: async (file: File): Promise<string> => {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `chat-images/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("public")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("public").getPublicUrl(filePath);
      return data.publicUrl;
    },
    onError: (error) => {
      console.error("[useUploadChatImage] Error:", error);
      toast.error("Failed to upload image");
    },
  });
}
