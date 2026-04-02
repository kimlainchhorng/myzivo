/**
 * CreateGroupModal — Select friends to create a group chat
 */
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { X, Check, Users, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

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

      if (!friendships?.length) { setFriends([]); setLoading(false); return; }

      const friendIds = friendships.map((f: any) =>
        f.user_id === user.id ? f.friend_id : f.user_id
      );

      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, full_name, avatar_url")
        .in("user_id", friendIds);

      setFriends(
        (profiles || []).map((p: any) => ({
          id: p.user_id,
          name: p.full_name || "User",
          avatar: p.avatar_url,
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

  const handleCreate = async () => {
    if (!user?.id || selected.size < 1 || !groupName.trim()) return;
    setCreating(true);

    try {
      // Create the group
      const { data: group, error: gErr } = await (supabase as any)
        .from("chat_groups")
        .insert({ name: groupName.trim(), created_by: user.id })
        .select()
        .single();

      if (gErr) throw gErr;

      // Add members (creator + selected)
      const memberInserts = [user.id, ...Array.from(selected)].map((uid) => ({
        group_id: group.id,
        user_id: uid,
      }));

      const { error: mErr } = await (supabase as any)
        .from("chat_group_members")
        .insert(memberInserts);

      if (mErr) throw mErr;

      toast.success("Group created!");
      onCreated({ id: group.id, name: group.name });
      onClose();
      setSelected(new Set());
      setGroupName("");
    } catch {
      toast.error("Failed to create group");
    }
    setCreating(false);
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center"
        onClick={onClose}
      >
        <div className="absolute inset-0 bg-black/50" />
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="relative bg-background rounded-t-2xl sm:rounded-2xl w-full max-w-md max-h-[80vh] flex flex-col overflow-hidden"
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
          <div className="p-4 border-t border-border/30">
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
