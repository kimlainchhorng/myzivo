/**
 * SocialListModal — Shows Friends, Followers, or Following list
 * with unfriend/unfollow actions, confirmation dialogs, and sort
 */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ArrowLeft, UserMinus, UserX, Loader2, ArrowUpDown, Clock, MoreVertical, UserRoundX } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

type Tab = "friends" | "followers" | "following";
type SortOrder = "newest" | "oldest";
type ActionType = "unfriend" | "unfollow" | "remove_follower";

interface SocialUser {
  id: string;
  relationId: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  followRelationId?: string | null; // for friends tab: the follow relation
}

interface Props {
  open: boolean;
  onClose: () => void;
  initialTab?: Tab;
  onCountsChange?: (friends: number, followers: number, following: number) => void;
}

interface ConfirmAction {
  type: ActionType;
  item: SocialUser;
}

export default function SocialListModal({ open, onClose, initialTab = "friends", onCountsChange }: Props) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>(initialTab);
  const [sort, setSort] = useState<SortOrder>("newest");
  const [loading, setLoading] = useState(false);
  const [list, setList] = useState<SocialUser[]>([]);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null);

  useEffect(() => {
    if (open) setTab(initialTab);
  }, [open, initialTab]);

  useEffect(() => {
    if (!open || !user?.id) return;
    loadList();
  }, [open, user?.id, tab, sort]);

  const loadList = async () => {
    if (!user?.id) return;
    setLoading(true);
    setExpandedItem(null);
    try {
      let items: SocialUser[] = [];

      if (tab === "friends") {
        const { data } = await (supabase as any)
          .from("friendships")
          .select("id, user_id, friend_id, created_at")
          .eq("status", "accepted")
          .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`)
          .order("created_at", { ascending: sort === "oldest" });

        if (data) {
          const otherIds = data.map((r: any) => r.user_id === user.id ? r.friend_id : r.user_id);
          const [{ data: profiles }, { data: followData }] = await Promise.all([
            supabase.from("profiles").select("id, full_name, avatar_url").in("id", otherIds),
            (supabase as any).from("followers").select("id, following_id").eq("follower_id", user.id).in("following_id", otherIds),
          ]);
          const profileMap = new Map((profiles || []).map((p: any) => [p.id, p]));
          const followMap = new Map((followData || []).map((f: any) => [f.following_id, f.id]));
          items = data.map((r: any) => {
            const otherId = r.user_id === user.id ? r.friend_id : r.user_id;
            const p = profileMap.get(otherId);
            return {
              id: otherId,
              relationId: r.id,
              full_name: p?.full_name || null,
              avatar_url: p?.avatar_url || null,
              created_at: r.created_at,
              followRelationId: followMap.get(otherId) || null,
            };
          });
        }
      } else if (tab === "followers") {
        const { data } = await (supabase as any)
          .from("followers")
          .select("id, follower_id, created_at")
          .eq("following_id", user.id)
          .order("created_at", { ascending: sort === "oldest" });

        if (data) {
          const ids = data.map((r: any) => r.follower_id);
          const { data: profiles } = await supabase.from("profiles").select("id, full_name, avatar_url").in("id", ids);
          const profileMap = new Map((profiles || []).map((p: any) => [p.id, p]));
          items = data.map((r: any) => {
            const p = profileMap.get(r.follower_id);
            return { id: r.follower_id, relationId: r.id, full_name: p?.full_name || null, avatar_url: p?.avatar_url || null, created_at: r.created_at };
          });
        }
      } else {
        const { data } = await (supabase as any)
          .from("followers")
          .select("id, following_id, created_at")
          .eq("follower_id", user.id)
          .order("created_at", { ascending: sort === "oldest" });

        if (data) {
          const ids = data.map((r: any) => r.following_id);
          const { data: profiles } = await supabase.from("profiles").select("id, full_name, avatar_url").in("id", ids);
          const profileMap = new Map((profiles || []).map((p: any) => [p.id, p]));
          items = data.map((r: any) => {
            const p = profileMap.get(r.following_id);
            return { id: r.following_id, relationId: r.id, full_name: p?.full_name || null, avatar_url: p?.avatar_url || null, created_at: r.created_at };
          });
        }
      }
      setList(items);
    } catch (err) {
      console.error("Failed to load social list", err);
    } finally {
      setLoading(false);
    }
  };

  const executeAction = async (action: ConfirmAction) => {
    if (!user?.id) return;
    const { type, item } = action;
    setActionLoading(`${item.relationId}-${type}`);
    try {
      if (type === "unfriend") {
        await (supabase as any).from("friendships").delete().eq("id", item.relationId);
        // Also unfollow if follow relation exists
        if (item.followRelationId) {
          await (supabase as any).from("followers").delete().eq("id", item.followRelationId);
        }
        toast.success(`Unfriended ${item.full_name || "user"}`);
        setList((prev) => prev.filter((i) => i.relationId !== item.relationId));
      } else if (type === "unfollow") {
        if (tab === "friends" && item.followRelationId) {
          await (supabase as any).from("followers").delete().eq("id", item.followRelationId);
          toast.success(`Unfollowed ${item.full_name || "user"}`);
          // Update follow status in list without removing
          setList((prev) => prev.map((i) => i.relationId === item.relationId ? { ...i, followRelationId: null } : i));
        } else {
          await (supabase as any).from("followers").delete().eq("id", item.relationId);
          toast.success(`Unfollowed ${item.full_name || "user"}`);
          setList((prev) => prev.filter((i) => i.relationId !== item.relationId));
        }
      } else if (type === "remove_follower") {
        await (supabase as any).from("followers").delete().eq("id", item.relationId);
        toast.success(`Removed ${item.full_name || "user"} from followers`);
        setList((prev) => prev.filter((i) => i.relationId !== item.relationId));
      }

      // Recalculate counts
      const newList = list.filter((i) => type === "unfollow" && tab === "friends" ? true : i.relationId !== item.relationId);
      const friendsDelta = (tab === "friends" && type === "unfriend") ? -1 : 0;
      const followersDelta = (tab === "followers") ? -1 : 0;
      const followingDelta = (tab === "following" || (tab === "friends" && type === "unfollow")) ? -1 : (type === "unfriend" && item.followRelationId ? -1 : 0);

      onCountsChange?.(
        list.length + friendsDelta - (tab !== "friends" ? 0 : type === "unfriend" ? 0 : list.length - newList.length),
        list.length + followersDelta,
        list.length + followingDelta
      );
    } catch (err: any) {
      toast.error(err.message || "Action failed");
    } finally {
      setActionLoading(null);
      setExpandedItem(null);
      setConfirmAction(null);
    }
  };

  const getInitials = (name: string | null) =>
    (name || "U").split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  const tabItems: { key: Tab; label: string }[] = [
    { key: "friends", label: "Friends" },
    { key: "followers", label: "Followers" },
    { key: "following", label: "Following" },
  ];

  const getConfirmText = (type: ActionType, name: string) => {
    switch (type) {
      case "unfriend": return `Are you sure you want to unfriend ${name}? This will also remove the follow connection.`;
      case "unfollow": return `Are you sure you want to unfollow ${name}? You'll stop seeing their updates.`;
      case "remove_follower": return `Are you sure you want to remove ${name} from your followers?`;
    }
  };

  const getConfirmTitle = (type: ActionType) => {
    switch (type) {
      case "unfriend": return "Unfriend";
      case "unfollow": return "Unfollow";
      case "remove_follower": return "Remove Follower";
    }
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 bg-background flex flex-col"
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-xl border-b border-border/30 px-4 py-2.5 flex items-center gap-3">
          <button onClick={onClose} className="min-h-[44px] min-w-[44px] flex items-center justify-center">
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </button>
          <h1 className="text-lg font-bold text-foreground">Social</h1>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border/30">
          {tabItems.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-1 py-3 text-sm font-semibold transition-colors relative ${
                tab === t.key ? "text-primary" : "text-muted-foreground"
              }`}
            >
              {t.label}
              {tab === t.key && (
                <motion.div
                  layoutId="social-tab-indicator"
                  className="absolute bottom-0 left-2 right-2 h-0.5 bg-primary rounded-full"
                />
              )}
            </button>
          ))}
        </div>

        {/* Sort bar */}
        <div className="flex items-center justify-between px-4 py-2 bg-muted/30">
          <span className="text-xs text-muted-foreground font-medium">
            {list.length} {tab}
          </span>
          <button
            onClick={() => setSort((s) => (s === "newest" ? "oldest" : "newest"))}
            className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-md hover:bg-muted/50"
          >
            <Clock className="h-3.5 w-3.5" />
            {sort === "newest" ? "Newest first" : "Oldest first"}
            <ArrowUpDown className="h-3 w-3" />
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-40">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : list.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
              <UserMinus className="h-8 w-8 mb-2 opacity-40" />
              <p className="text-sm">No {tab} yet</p>
            </div>
          ) : (
            <div className="divide-y divide-border/20">
              {list.map((item) => (
                <div key={item.relationId} className="relative">
                  <div className="flex items-center gap-3 px-4 py-3">
                    <button
                      onClick={() => { onClose(); navigate(`/user/${item.id}`); }}
                      className="flex items-center gap-3 flex-1 min-w-0"
                    >
                      <Avatar className="h-11 w-11 border-2 border-border/30">
                        <AvatarImage src={item.avatar_url || undefined} />
                        <AvatarFallback className="text-xs font-bold bg-muted text-muted-foreground">
                          {getInitials(item.full_name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 text-left">
                        <p className="text-sm font-semibold text-foreground truncate">
                          {item.full_name || "Unknown"}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {new Date(item.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </button>

                    {/* Action button */}
                    <button
                      onClick={() => setExpandedItem(expandedItem === item.relationId ? null : item.relationId)}
                      className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-full hover:bg-muted/50 transition-colors shrink-0"
                    >
                      <MoreVertical className="h-4.5 w-4.5 text-muted-foreground" />
                    </button>
                  </div>

                  {/* Expanded action panel */}
                  <AnimatePresence>
                    {expandedItem === item.relationId && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 pb-3 flex gap-2">
                          {tab === "friends" && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                className="flex-1 text-xs gap-1.5 border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
                                disabled={!!actionLoading}
                                onClick={() => setConfirmAction({ type: "unfriend", item })}
                              >
                                {actionLoading === `${item.relationId}-unfriend` ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  <UserX className="h-3.5 w-3.5" />
                                )}
                                Unfriend
                              </Button>
                              {item.followRelationId ? (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="flex-1 text-xs gap-1.5 border-orange-500/30 text-orange-600 hover:bg-orange-500/10 hover:text-orange-600"
                                  disabled={!!actionLoading}
                                  onClick={() => setConfirmAction({ type: "unfollow", item })}
                                >
                                  {actionLoading === `${item.relationId}-unfollow` ? (
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                  ) : (
                                    <UserMinus className="h-3.5 w-3.5" />
                                  )}
                                  Unfollow
                                </Button>
                              ) : (
                                <span className="flex-1 flex items-center justify-center text-[10px] text-muted-foreground">
                                  Not following
                                </span>
                              )}
                            </>
                          )}
                          {tab === "followers" && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex-1 text-xs gap-1.5 border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
                              disabled={!!actionLoading}
                              onClick={() => setConfirmAction({ type: "remove_follower", item })}
                            >
                              {actionLoading === `${item.relationId}-remove_follower` ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <UserRoundX className="h-3.5 w-3.5" />
                              )}
                              Remove Follower
                            </Button>
                          )}
                          {tab === "following" && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex-1 text-xs gap-1.5 border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
                              disabled={!!actionLoading}
                              onClick={() => setConfirmAction({ type: "unfollow", item })}
                            >
                              {actionLoading === `${item.relationId}-unfollow` ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <UserMinus className="h-3.5 w-3.5" />
                              )}
                              Unfollow
                            </Button>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Confirmation Dialog */}
        <AlertDialog open={!!confirmAction} onOpenChange={(open) => !open && setConfirmAction(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{confirmAction ? getConfirmTitle(confirmAction.type) : ""}</AlertDialogTitle>
              <AlertDialogDescription>
                {confirmAction ? getConfirmText(confirmAction.type, confirmAction.item.full_name || "this user") : ""}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={() => confirmAction && executeAction(confirmAction)}
              >
                {confirmAction ? getConfirmTitle(confirmAction.type) : "Confirm"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </motion.div>
    </AnimatePresence>
  );
}
