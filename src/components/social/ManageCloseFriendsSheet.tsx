/**
 * ManageCloseFriendsSheet — Bottom sheet to manage the user's Close Friends list.
 * Lists people the user follows; tapping toggles them on/off the list.
 * Stories restricted to Close Friends show the green ring everywhere.
 */
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Check, Loader2, Search, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useCloseFriends } from "@/hooks/useCloseFriends";
import { cn } from "@/lib/utils";

interface FollowingRow {
  user_id: string;
  full_name: string | null;
  username: string | null;
  avatar_url: string | null;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ManageCloseFriendsSheet({ open, onOpenChange }: Props) {
  const { user } = useAuth();
  const { closeFriendIds, toggle, isMutating } = useCloseFriends();
  const [search, setSearch] = useState("");

  const { data: following = [], isLoading } = useQuery({
    queryKey: ["close-friends-following-pool", user?.id],
    enabled: !!user?.id && open,
    queryFn: async (): Promise<FollowingRow[]> => {
      const { data: follows } = await (supabase as any)
        .from("user_followers")
        .select("following_id")
        .eq("follower_id", user!.id);
      const ids: string[] = (follows ?? []).map((r: any) => r.following_id);
      if (ids.length === 0) return [];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, user_id, full_name, username, avatar_url")
        .or(`user_id.in.(${ids.join(",")}),id.in.(${ids.join(",")})`);
      const seen = new Set<string>();
      const out: FollowingRow[] = [];
      for (const id of ids) {
        if (seen.has(id)) continue;
        seen.add(id);
        const p: any =
          profiles?.find((pr: any) => pr.user_id === id) ??
          profiles?.find((pr: any) => pr.id === id);
        out.push({
          user_id: id,
          full_name: p?.full_name ?? null,
          username: p?.username ?? null,
          avatar_url: p?.avatar_url ?? null,
        });
      }
      return out;
    },
  });

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return following;
    return following.filter(
      f =>
        (f.full_name ?? "").toLowerCase().includes(q) ||
        (f.username ?? "").toLowerCase().includes(q),
    );
  }, [following, search]);

  const onCount = closeFriendIds.size;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="rounded-t-2xl pb-[env(safe-area-inset-bottom,16px)] max-h-[85vh] flex flex-col"
      >
        <SheetHeader className="text-left">
          <SheetTitle className="flex items-center gap-2">
            <Star className="h-4 w-4 text-emerald-500" />
            Close Friends
            <span className="ml-1 text-xs font-normal text-muted-foreground">
              {onCount} {onCount === 1 ? "person" : "people"}
            </span>
          </SheetTitle>
          <p className="text-xs text-muted-foreground">
            Share stories with a select group. They won't be notified that they're on this list.
          </p>
        </SheetHeader>

        <div className="relative mt-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search people you follow"
            className="pl-9"
          />
        </div>

        <div className="flex-1 overflow-y-auto mt-3 -mx-2 px-2">
          {isLoading && (
            <div className="flex items-center justify-center py-10 text-muted-foreground text-sm">
              <Loader2 className="h-4 w-4 animate-spin mr-2" /> Loading
            </div>
          )}

          {!isLoading && following.length === 0 && (
            <p className="text-sm text-muted-foreground px-2 py-8 text-center">
              Follow people first — your Close Friends list is drawn from who you follow.
            </p>
          )}

          {!isLoading && following.length > 0 && filtered.length === 0 && (
            <p className="text-sm text-muted-foreground px-2 py-8 text-center">
              No matches for "{search}".
            </p>
          )}

          <ul className="space-y-1">
            {filtered.map(f => {
              const on = closeFriendIds.has(f.user_id);
              return (
                <li key={f.user_id}>
                  <button
                    type="button"
                    disabled={isMutating}
                    onClick={() => toggle(f.user_id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors",
                      "hover:bg-muted/50 active:scale-[0.99]",
                      on && "bg-emerald-500/8",
                    )}
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={f.avatar_url ?? undefined} />
                      <AvatarFallback>
                        {(f.full_name?.[0] ?? f.username?.[0] ?? "U").toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {f.full_name || f.username || "User"}
                      </p>
                      {f.username && f.full_name && (
                        <p className="text-xs text-muted-foreground truncate">
                          @{f.username}
                        </p>
                      )}
                    </div>
                    <span
                      className={cn(
                        "h-6 w-6 rounded-full border-2 flex items-center justify-center transition-colors",
                        on
                          ? "bg-emerald-500 border-emerald-500"
                          : "border-muted-foreground/30",
                      )}
                      aria-hidden
                    >
                      {on && <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </SheetContent>
    </Sheet>
  );
}
