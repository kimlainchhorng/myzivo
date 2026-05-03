/**
 * UserSlashCommandsSheet — Manage user-defined slash command templates.
 *
 * Telegram-style: define `/eta`, `/menu`, `/away` etc. that expand into a
 * preset body when picked from the slash autocomplete in any chat composer.
 * Mirrors the visual language of ChatQuickReplies for consistency.
 */
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import X from "lucide-react/dist/esm/icons/x";
import Plus from "lucide-react/dist/esm/icons/plus";
import Pencil from "lucide-react/dist/esm/icons/pencil";
import Trash2 from "lucide-react/dist/esm/icons/trash-2";
import Slash from "lucide-react/dist/esm/icons/slash";
import RotateCcw from "lucide-react/dist/esm/icons/rotate-ccw";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  useUserSlashCommands,
  sanitizeTrigger,
  MAX_TRIGGER_LEN,
  MAX_BODY_LEN,
  type UserSlashCommand,
} from "@/hooks/useUserSlashCommands";

interface UserSlashCommandsSheetProps {
  open: boolean;
  onClose: () => void;
  userId: string | undefined;
}

interface DraftState {
  id: string | null; // null = new
  trigger: string;
  body: string;
  hint: string;
}

const EMPTY_DRAFT: DraftState = { id: null, trigger: "", body: "", hint: "" };

export default function UserSlashCommandsSheet({ open, onClose, userId }: UserSlashCommandsSheetProps) {
  const { commands, add, update, remove, reset } = useUserSlashCommands(userId);
  const [draft, setDraft] = useState<DraftState | null>(null);

  if (!open) return null;

  const startAdd = () => setDraft({ ...EMPTY_DRAFT });
  const startEdit = (c: UserSlashCommand) =>
    setDraft({ id: c.id, trigger: c.trigger, body: c.body, hint: c.hint ?? "" });

  const cancelDraft = () => setDraft(null);

  const collidesWithOther = (trigger: string) =>
    commands.some((c) => c.id !== draft?.id && c.trigger === trigger);

  const commit = () => {
    if (!draft) return;
    const cleanTrigger = sanitizeTrigger(draft.trigger);
    const cleanBody = draft.body.trim();
    if (!cleanTrigger || !cleanBody) return;
    if (collidesWithOther(cleanTrigger)) return;
    if (draft.id) {
      update(draft.id, { trigger: cleanTrigger, body: cleanBody, hint: draft.hint.trim() || undefined });
    } else {
      add({ trigger: cleanTrigger, body: cleanBody, hint: draft.hint.trim() || undefined });
    }
    setDraft(null);
  };

  const handleReset = () => {
    if (typeof window !== "undefined" && !window.confirm("Reset slash commands to defaults?")) return;
    reset();
    setDraft(null);
  };

  const draftTriggerClean = draft ? sanitizeTrigger(draft.trigger) : "";
  const draftCollides = draft != null && draftTriggerClean.length > 0 && collidesWithOther(draftTriggerClean);
  const canSave =
    draft != null && draftTriggerClean.length > 0 && draft.body.trim().length > 0 && !draftCollides;

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="usc-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-[1500] bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            key="usc-sheet"
            initial={{ y: "100%", opacity: 0.7 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0.7 }}
            transition={{ type: "spring", damping: 32, stiffness: 360 }}
            className="fixed inset-x-0 bottom-0 sm:inset-x-auto sm:left-1/2 sm:bottom-auto sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-full sm:max-w-md z-[1501] bg-background rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[85dvh] sm:max-h-[80dvh] flex flex-col"
            style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 8px)" }}
          >
            <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-3 border-b border-border/30 bg-background/95 backdrop-blur-md rounded-t-3xl">
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full hover:bg-muted/50 flex items-center justify-center"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-2">
                <Slash className="w-4 h-4 text-primary" />
                <p className="text-sm font-bold">Slash Commands</p>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={handleReset}
                  className="w-8 h-8 rounded-full hover:bg-muted/50 flex items-center justify-center"
                  aria-label="Reset to defaults"
                  title="Reset to defaults"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button
                  onClick={startAdd}
                  disabled={draft != null}
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center",
                    draft != null ? "opacity-40" : "hover:bg-muted/50"
                  )}
                  aria-label="Add command"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
              <p className="text-[11px] text-muted-foreground px-1">
                Type <span className="font-mono text-foreground">/trigger</span> in any chat to expand into the saved message.
              </p>

              {draft != null && (
                <div className="rounded-2xl border border-primary/40 bg-primary/5 p-3 space-y-2.5">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-primary">
                    {draft.id ? "Edit command" : "New command"}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-[15px] font-mono text-muted-foreground">/</span>
                    <Input
                      value={draft.trigger}
                      onChange={(e) =>
                        setDraft({ ...draft, trigger: sanitizeTrigger(e.target.value) })
                      }
                      placeholder="trigger"
                      maxLength={MAX_TRIGGER_LEN}
                      autoFocus
                      className="h-9 rounded-lg text-sm font-mono"
                    />
                  </div>
                  {draftCollides && (
                    <p className="text-[10px] text-destructive">A command with this trigger already exists.</p>
                  )}
                  <Input
                    value={draft.hint}
                    onChange={(e) => setDraft({ ...draft, hint: e.target.value.slice(0, 80) })}
                    placeholder="Hint (shown in picker)"
                    className="h-9 rounded-lg text-sm"
                  />
                  <Textarea
                    value={draft.body}
                    onChange={(e) => setDraft({ ...draft, body: e.target.value.slice(0, MAX_BODY_LEN) })}
                    placeholder="Message body to insert…"
                    className="min-h-[80px] rounded-lg text-sm resize-none"
                  />
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-muted-foreground">{draft.body.length}/{MAX_BODY_LEN}</span>
                    <div className="flex gap-2">
                      <Button size="sm" variant="ghost" onClick={cancelDraft} className="h-8 px-3 text-xs">
                        Cancel
                      </Button>
                      <Button size="sm" onClick={commit} disabled={!canSave} className="h-8 px-3 text-xs font-bold">
                        Save
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {commands.length === 0 && draft == null && (
                <div className="text-center py-12 px-4">
                  <Slash className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
                  <p className="text-sm font-bold text-foreground mb-1">No slash commands yet</p>
                  <p className="text-xs text-muted-foreground mb-4">
                    Create your first <span className="font-mono">/trigger</span> shortcut.
                  </p>
                  <Button onClick={startAdd} size="sm" className="text-xs">
                    <Plus className="w-3.5 h-3.5 mr-1" /> Add command
                  </Button>
                </div>
              )}

              {commands.map((c) => (
                <div
                  key={c.id}
                  className="group rounded-2xl bg-muted/30 hover:bg-muted/50 transition-colors px-3 py-2.5"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-[13px] font-mono font-semibold text-primary shrink-0">/{c.trigger}</span>
                    {c.hint && (
                      <span className="text-[12px] text-muted-foreground truncate min-w-0">{c.hint}</span>
                    )}
                    <div className="flex items-center gap-1 ml-auto shrink-0 opacity-60 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => startEdit(c)}
                        className="w-7 h-7 rounded-full hover:bg-muted/70 flex items-center justify-center"
                        aria-label="Edit command"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => remove(c.id)}
                        className="w-7 h-7 rounded-full hover:bg-destructive/10 hover:text-destructive flex items-center justify-center"
                        aria-label="Delete command"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <p className="mt-1.5 text-[13px] text-foreground/80 line-clamp-2 break-words">{c.body}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
