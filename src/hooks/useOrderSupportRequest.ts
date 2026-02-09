/**
 * Hook to request, track, and detect support agent join in order chat.
 * Creates a live_chat_sessions record linked to the order, subscribes
 * to real-time status changes, and inserts the agent into chat_members
 * when they accept.
 */
import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { CHAT_TABLES } from "@/lib/chatTables";

export type SupportStatus = "waiting" | "active" | "ended" | null;

interface UseOrderSupportRequestOptions {
  orderId: string;
  chatId: string | undefined;
  onAgentJoined?: () => void;
}

export function useOrderSupportRequest({
  orderId,
  chatId,
  onAgentJoined,
}: UseOrderSupportRequestOptions) {
  const { user } = useAuth();
  const [supportStatus, setSupportStatus] = useState<SupportStatus>(null);
  const [supportSessionId, setSupportSessionId] = useState<string | null>(null);
  const [isRequesting, setIsRequesting] = useState(false);
  const processedRef = useRef(false);

  // Check for existing support session on mount
  useEffect(() => {
    if (!orderId || !user) return;

    const checkExisting = async () => {
      const { data } = await supabase
        .from("live_chat_sessions")
        .select("id, status")
        .eq("context_type", "order_chat")
        .eq("context_id", orderId)
        .in("status", ["waiting", "active"])
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (data) {
        setSupportSessionId(data.id);
        setSupportStatus(data.status as SupportStatus);
      }
    };

    checkExisting();
  }, [orderId, user]);

  // Subscribe to real-time changes on the support session
  useEffect(() => {
    if (!supportSessionId) return;

    const channel = supabase
      .channel(`support-session-${supportSessionId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "live_chat_sessions",
          filter: `id=eq.${supportSessionId}`,
        },
        async (payload) => {
          const newStatus = payload.new.status as string;
          const agentId = payload.new.agent_id as string | null;

          if (newStatus === "active" && agentId && chatId && user && !processedRef.current) {
            processedRef.current = true;
            setSupportStatus("active");

            // Add agent to chat_members as admin
            await supabase.from(CHAT_TABLES.chatMembers).upsert(
              {
                chat_id: chatId,
                user_id: agentId,
                role: "admin",
              },
              { onConflict: "chat_id,user_id" }
            );

            // Post system message
            await supabase.from(CHAT_TABLES.chatMessages).insert({
              chat_id: chatId,
              sender_id: agentId,
              sender_type: "admin",
              message: "A support agent has joined the chat",
            });

            onAgentJoined?.();
          } else if (newStatus === "ended" && chatId && user) {
            setSupportStatus("ended");
            processedRef.current = false;

            // Post system message
            await supabase.from(CHAT_TABLES.chatMessages).insert({
              chat_id: chatId,
              sender_id: user.id,
              sender_type: "admin",
              message: "Support agent has left the chat",
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supportSessionId, chatId, user, onAgentJoined]);

  // Request support
  const requestSupport = useCallback(async () => {
    if (!user || !orderId || isRequesting || supportStatus === "waiting" || supportStatus === "active") {
      return;
    }

    setIsRequesting(true);
    try {
      // Create live_chat_sessions record
      const { data: session, error: sessionError } = await supabase
        .from("live_chat_sessions")
        .insert({
          user_id: user.id,
          context_type: "order_chat",
          context_id: orderId,
          status: "waiting",
        })
        .select("id")
        .single();

      if (sessionError) throw sessionError;

      setSupportSessionId(session.id);
      setSupportStatus("waiting");

      // Post system message in order chat
      if (chatId) {
        await supabase.from(CHAT_TABLES.chatMessages).insert({
          chat_id: chatId,
          sender_id: user.id,
          sender_type: "admin",
          message: "Support has been requested. An agent will join shortly...",
        });
      }
    } catch (err) {
      console.error("Failed to request support:", err);
      throw err;
    } finally {
      setIsRequesting(false);
    }
  }, [user, orderId, chatId, isRequesting, supportStatus]);

  return {
    supportStatus,
    supportSessionId,
    requestSupport,
    isRequesting,
  };
}
