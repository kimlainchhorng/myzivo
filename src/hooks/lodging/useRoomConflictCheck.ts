/**
 * useRoomConflictCheck — fresh DB query for active overlapping reservations.
 * Re-runs on demand to guard against race conditions at confirm time.
 */
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const ACTIVE = ["hold", "confirmed", "checked_in"];

export function useRoomConflictCheck(
  roomId: string | undefined,
  checkIn: string,
  checkOut: string,
  enabled: boolean = true,
) {
  return useQuery({
    queryKey: ["room-conflict", roomId, checkIn, checkOut],
    queryFn: async () => {
      if (!roomId || !checkIn || !checkOut) return { conflict: false };
      const { data, error } = await supabase
        .from("lodge_reservations" as any)
        .select("id, check_in, check_out, status")
        .eq("room_id", roomId)
        .in("status", ACTIVE)
        .lt("check_in", checkOut)
        .gt("check_out", checkIn)
        .limit(1);
      if (error) throw error;
      return { conflict: !!(data && data.length > 0) };
    },
    enabled: enabled && !!roomId && !!checkIn && !!checkOut,
    staleTime: 0,
    gcTime: 0,
  });
}

/** One-shot fresh check, used immediately before insert. */
export async function checkRoomConflictNow(
  roomId: string,
  checkIn: string,
  checkOut: string,
): Promise<boolean> {
  const { data, error } = await supabase
    .from("lodge_reservations" as any)
    .select("id")
    .eq("room_id", roomId)
    .in("status", ACTIVE)
    .lt("check_in", checkOut)
    .gt("check_out", checkIn)
    .limit(1);
  if (error) throw error;
  return !!(data && data.length > 0);
}
