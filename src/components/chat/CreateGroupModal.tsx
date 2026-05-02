/**
 * CreateGroupModal — Select friends to create a group chat
 */
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import X from "lucide-react/dist/esm/icons/x";
import Check from "lucide-react/dist/esm/icons/check";
import Users from "lucide-react/dist/esm/icons/users";
import Loader2 from "lucide-react/dist/esm/icons/loader-2";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  GroupCreationErrorToast,
  type GroupErrorDetails,
} from "./GroupCreationErrorToast";

// Allowed enum values for chat_group_members.role (group_member_role).
const ALLOWED_GROUP_ROLES = ["owner", "admin", "member"] as const;
type GroupRole = (typeof ALLOWED_GROUP_ROLES)[number];

// Required columns we depend on at runtime — used by preflight checks.
const REQUIRED_GROUP_COLS = ["name", "created_by"] as const;
const REQUIRED_MEMBER_COLS = ["group_id", "user_id", "role"] as const;

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const MAX_GROUP_NAME = 80;

interface CreateGroupModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: (group: { id: string; name: string; avatar?: string | null }) => void;
}

interface Friend {
  id: string;
  name: string;
  avatar: string | null;
}

type FriendshipRow = {
  user_id: string;
  friend_id: string;
};

type ProfileRow = {
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
};

type GroupRow = {
  id: string;
  name: string;
};

type GroupMemberInsert = {
  group_id: string;
  user_id: string;
  role?: string;
};

const dbFrom = (table: string): any => (supabase as any).from(table);

export default function CreateGroupModal({ open, onClose, onCreated }: CreateGroupModalProps) {
  const { user } = useAuth();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [groupName, setGroupName] = useState("");
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!open || !user?.id) return;
    setLoading(true);
    const loadFriends = async () => {
      // Get accepted friends
      const { data: friendships } = await supabase
        .from("friendships")
        .select("user_id, friend_id")
        .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`)
        .eq("status", "accepted");

      const friendshipRows = (friendships || []) as FriendshipRow[];

      if (!friendshipRows.length) { setFriends([]); setLoading(false); return; }

      const friendIds = friendshipRows.map((f) =>
        f.user_id === user.id ? f.friend_id : f.user_id
      );

      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, full_name, avatar_url")
        .in("user_id", friendIds);

      setFriends(
        ((profiles || []) as ProfileRow[]).map((p) => ({
          id: p.user_id,
          name: p.full_name || "User",
          avatar: p.avatar_url || null,
        }))
      );
      setLoading(false);
    };
    loadFriends();
  }, [open, user?.id]);

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Tracks whether an in-flight creation should still update the UI / commit.
  // Set to true by the auth-change listener if the user signs out mid-flight.
  const cancelledRef = useRef(false);
  const creatingRef = useRef(false);

  // Listen for sign-out / token expiry while creating, and cancel the request.
  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (!creatingRef.current) return;
      if (event === "SIGNED_OUT") {
        cancelledRef.current = true;
        return;
      }
      if (!session?.user?.id) {
        cancelledRef.current = true;
      }
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const handleCreate = async () => {
    if (creating) return;

    // ---------- Step 1: client-side payload validation ----------
    const trimmedName = groupName.trim();
    const validationError = (() => {
      if (!user?.id) return "Please sign in again to create a group";
      if (!trimmedName) return "Please enter a group name";
      if (trimmedName.length > MAX_GROUP_NAME)
        return `Group name must be ${MAX_GROUP_NAME} characters or fewer`;
      if (selected.size < 1) return "Add at least one friend to the group";
      const friendIdSet = new Set(friends.map((f) => f.id));
      for (const id of selected) {
        if (!UUID_RE.test(id) || !friendIdSet.has(id)) {
          return "One or more selected members are invalid";
        }
      }
      return null;
    })();

    if (validationError) {
      toast.error(validationError);
      return;
    }

    // ---------- Step 2: preflight (schema / role) ----------
    const creatorRole: GroupRole = "owner";
    if (!ALLOWED_GROUP_ROLES.includes(creatorRole)) {
      toast.error(
        `Group creation blocked: role "${creatorRole}" is not allowed`
      );
      return;
    }
    const missingGroupCols = REQUIRED_GROUP_COLS.filter(
      (c) => !["name", "created_by"].includes(c)
    );
    const missingMemberCols = REQUIRED_MEMBER_COLS.filter(
      (c) => !["group_id", "user_id", "role"].includes(c)
    );
    if (missingGroupCols.length || missingMemberCols.length) {
      toast.error("Group creation blocked: schema mismatch");
      return;
    }

    // Helper: structured error parser for Supabase / generic errors.
    const readErr = (
      e: unknown
    ): { summary: string; details: GroupErrorDetails } => {
      if (!e) return { summary: "Unknown error", details: {} };
      if (typeof e === "string") return { summary: e, details: { message: e } };
      const x = e as GroupErrorDetails;
      const parts = [
        x.message,
        x.details,
        x.hint,
        x.code ? `(${x.code})` : "",
      ].filter(Boolean);
      return {
        summary: parts.join(" — ") || "Unexpected error",
        details: {
          message: x.message,
          details: x.details,
          hint: x.hint,
          code: x.code,
        },
      };
    };

    const isAuthOrRlsError = (e: unknown): boolean => {
      const x = (e || {}) as GroupErrorDetails & { status?: number };
      const code = (x.code || "").toString();
      const msg = (x.message || "").toLowerCase();
      return (
        code === "PGRST301" ||
        code === "42501" ||
        code.startsWith("PGRST3") ||
        msg.includes("row-level security") ||
        msg.includes("jwt") ||
        msg.includes("unauthorized") ||
        msg.includes("auth")
      );
    };

    const performCreate = async (): Promise<{
      groupId: string;
      groupName: string;
    }> => {
      const { data: authData, error: authErr } = await supabase.auth.getUser();
      if (authErr || !authData?.user?.id) {
        throw Object.assign(new Error("Session expired"), {
          code: "AUTH_EXPIRED",
        });
      }
      const uid = authData.user.id;

      const { data, error: gErr } = await dbFrom("chat_groups")
        .insert({ name: trimmedName, created_by: uid })
        .select()
        .single();
      const group = data as GroupRow | null;
      if (gErr || !group?.id) {
        console.error("[CreateGroup] chat_groups insert failed", gErr);
        throw gErr || new Error("Group row was not created");
      }

      const creatorInsert: GroupMemberInsert = {
        group_id: group.id,
        user_id: uid,
        role: creatorRole,
      };
      const { error: cErr } = await dbFrom("chat_group_members").insert(
        creatorInsert
      );
      if (cErr && !/duplicate|unique/i.test(cErr.message || "")) {
        console.error(
          "[CreateGroup] creator member insert failed",
          cErr,
          creatorInsert
        );
        throw cErr;
      }

      const otherInserts = Array.from(selected)
        .filter((u) => u !== uid)
        .map((u) => ({ group_id: group.id, user_id: u }));

      if (otherInserts.length) {
        const { error: mErr } = await dbFrom("chat_group_members").insert(
          otherInserts
        );
        if (mErr) {
          console.error(
            "[CreateGroup] other members insert failed",
            mErr,
            otherInserts
          );
          throw mErr;
        }
      }
      return { groupId: group.id, groupName: group.name };
    };

    // ---------- Step 3: run with one auto-retry on auth/RLS errors ----------
    setCreating(true);
    creatingRef.current = true;
    cancelledRef.current = false;
    try {
      let result: { groupId: string; groupName: string };
      try {
        result = await performCreate();
      } catch (firstErr) {
        if (cancelledRef.current) {
          toast.error("Group creation cancelled — please sign in again.");
          return;
        }
        if (isAuthOrRlsError(firstErr)) {
          const { data: refreshed } = await supabase.auth.getUser();
          if (!refreshed?.user?.id) {
            toast.error("Please sign in again to create a group");
            return;
          }
          console.warn("[CreateGroup] retrying after auth/RLS error", firstErr);
          result = await performCreate();
        } else {
          throw firstErr;
        }
      }

      if (cancelledRef.current) {
        toast.error("Group creation cancelled — please sign in again.");
        return;
      }

      toast.success("Group created!");
      onCreated({ id: result.groupId, name: result.groupName });
      onClose();
      setSelected(new Set());
      setGroupName("");
    } catch (err: unknown) {
      console.error("[CreateGroup] failed", err);
      if (cancelledRef.current) {
        toast.error("Group creation cancelled — please sign in again.");
      } else {
        const { summary, details } = readErr(err);
        toast.error(
          <GroupCreationErrorToast summary={summary} details={details} />,
          { duration: 10000 }
        );
      }
    } finally {
      creatingRef.current = false;
      setCreating(false);
    }
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-x-0 top-0 z-[60] flex items-end sm:items-center justify-center w-full"
        style={{ height: "100dvh" }}
        onClick={onClose}
      >
        <div className="absolute inset-0 bg-black/50" />
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="relative bg-background rounded-t-2xl sm:rounded-2xl w-full max-w-md max-h-[85dvh] flex flex-col overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border/30">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              <h3 className="text-base font-bold text-foreground">New Group</h3>
            </div>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-muted">
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>

          {/* Group name */}
          <div className="px-4 py-3 border-b border-border/20">
            <input
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Group name..."
              className="w-full px-3 py-2.5 rounded-xl bg-muted/50 border border-border/30 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          {/* Selected chips */}
          {selected.size > 0 && (
            <div className="px-4 py-2 flex flex-wrap gap-1.5 border-b border-border/20">
              {Array.from(selected).map((id) => {
                const f = friends.find((fr) => fr.id === id);
                return (
                  <span key={id} className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
                    {f?.name || "User"}
                    <button onClick={() => toggleSelect(id)}><X className="w-3 h-3" /></button>
                  </span>
                );
              })}
            </div>
          )}

          {/* Friend list */}
          <div className="flex-1 overflow-y-auto px-4 py-2">
            {loading ? (
              <div className="flex justify-center py-10"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>
            ) : friends.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground py-10">No friends to add</p>
            ) : (
              friends.map((f) => {
                const isSelected = selected.has(f.id);
                return (
                  <button
                    key={f.id}
                    onClick={() => toggleSelect(f.id)}
                    className="w-full flex items-center gap-3 py-2.5 px-1 rounded-xl hover:bg-muted/50 transition-colors"
                  >
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={f.avatar || undefined} />
                      <AvatarFallback className="text-xs bg-muted">{f.name[0]}</AvatarFallback>
                    </Avatar>
                    <span className="flex-1 text-sm font-medium text-foreground text-left">{f.name}</span>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                      isSelected ? "bg-primary border-primary" : "border-border"
                    }`}>
                      {isSelected && <Check className="w-3 h-3 text-primary-foreground" />}
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Create button */}
          <div className="p-4 border-t border-border/30 pb-[max(1rem,env(safe-area-inset-bottom))]">
            <button
              onClick={handleCreate}
              disabled={selected.size < 1 || !groupName.trim() || creating}
              className="w-full h-11 rounded-xl bg-primary text-primary-foreground text-sm font-semibold disabled:opacity-40 active:scale-[0.97] transition-transform flex items-center justify-center gap-2"
            >
              {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Create Group ({selected.size + 1} members)
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
