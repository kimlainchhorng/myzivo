import { useEffect, useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type TripMessage = {
  id: string;
  trip_id: string;
  sender_id: string;
  sender_type: "rider" | "driver";
  content: string;
  is_read: boolean;
  created_at: string;
};

export const useTripMessages = (tripId: string | undefined) => {
  return useQuery({
    queryKey: ["trip-messages", tripId],
    queryFn: async () => {
      if (!tripId) return [];

      const { data, error } = await supabase
        .from("trip_messages")
        .select("*")
        .eq("trip_id", tripId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data as TripMessage[];
    },
    enabled: !!tripId,
  });
};

export const useSendMessage = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      tripId,
      content,
      senderType,
    }: {
      tripId: string;
      content: string;
      senderType: "rider" | "driver";
    }) => {
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("trip_messages")
        .insert({
          trip_id: tripId,
          sender_id: user.id,
          sender_type: senderType,
          content: content.trim(),
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["trip-messages", variables.tripId] });
    },
  });
};

export const useMarkMessagesRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      tripId,
      senderType,
    }: {
      tripId: string;
      senderType: "rider" | "driver";
    }) => {
      // Mark messages from the other party as read
      const otherType = senderType === "rider" ? "driver" : "rider";
      
      const { error } = await supabase
        .from("trip_messages")
        .update({ is_read: true })
        .eq("trip_id", tripId)
        .eq("sender_type", otherType)
        .eq("is_read", false);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["trip-messages", variables.tripId] });
      queryClient.invalidateQueries({ queryKey: ["unread-messages"] });
    },
  });
};

export const useUnreadMessageCount = (tripId: string | undefined, myType: "rider" | "driver") => {
  return useQuery({
    queryKey: ["unread-messages", tripId, myType],
    queryFn: async () => {
      if (!tripId) return 0;

      const otherType = myType === "rider" ? "driver" : "rider";
      
      const { count, error } = await supabase
        .from("trip_messages")
        .select("*", { count: "exact", head: true })
        .eq("trip_id", tripId)
        .eq("sender_type", otherType)
        .eq("is_read", false);

      if (error) throw error;
      return count || 0;
    },
    enabled: !!tripId,
    refetchInterval: 5000, // Fallback polling
  });
};

export const useTripChatRealtime = (
  tripId: string | undefined,
  onNewMessage?: (message: TripMessage) => void
) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!tripId) return;

    const channel = supabase
      .channel(`trip-chat-${tripId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "trip_messages",
          filter: `trip_id=eq.${tripId}`,
        },
        (payload) => {
          const newMessage = payload.new as TripMessage;
          
          // Update the messages cache
          queryClient.setQueryData<TripMessage[]>(
            ["trip-messages", tripId],
            (old) => {
              if (!old) return [newMessage];
              // Avoid duplicates
              if (old.some((m) => m.id === newMessage.id)) return old;
              return [...old, newMessage];
            }
          );

          // Invalidate unread count
          queryClient.invalidateQueries({ queryKey: ["unread-messages", tripId] });

          // Callback for notifications
          if (onNewMessage) {
            onNewMessage(newMessage);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [tripId, queryClient, onNewMessage]);
};
