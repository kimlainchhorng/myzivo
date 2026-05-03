/**
 * useUserSlashCommands — User-defined slash command templates.
 *
 * Stored in localStorage per user. Each command has a trigger (e.g. "eta"),
 * an optional hint, and a body that gets inserted into the composer when the
 * user picks it from the slash autocomplete.
 *
 * Triggers are stored without the leading "/" and lower-cased; we render them
 * with a leading slash to match Telegram-style command pickers.
 */
import { useCallback, useEffect, useState } from "react";

export interface UserSlashCommand {
  id: string;
  trigger: string;
  hint?: string;
  body: string;
}

const STORAGE_KEY_PREFIX = "zivo:user-slash-commands:";
const STORAGE_EVENT = "zivo:user-slash-commands:changed";
const MAX_COMMANDS = 50;
export const MAX_TRIGGER_LEN = 24;
export const MAX_BODY_LEN = 1000;

const DEFAULTS: Array<Omit<UserSlashCommand, "id">> = [
  { trigger: "eta", hint: "Send your ETA", body: "I'll be there in about 10 minutes 🕐" },
  { trigger: "away", hint: "Auto away message", body: "Away from my phone — I'll get back to you soon 🙏" },
  { trigger: "thanks", hint: "Quick thank you", body: "Thanks so much, really appreciate it 🙌" },
  { trigger: "addr", hint: "Share your address", body: "Here's the address: " },
];

function storageKey(userId: string | undefined) {
  return `${STORAGE_KEY_PREFIX}${userId || "anon"}`;
}

function sanitizeTrigger(input: string): string {
  return input
    .toLowerCase()
    .replace(/^\/+/, "")
    .replace(/[^a-z0-9_-]/g, "")
    .slice(0, MAX_TRIGGER_LEN);
}

function makeId() {
  return `usc-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function load(userId: string | undefined): UserSlashCommand[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(storageKey(userId));
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed
          .filter((c): c is UserSlashCommand =>
            c && typeof c.id === "string" && typeof c.trigger === "string" && typeof c.body === "string"
          )
          .map((c) => ({
            id: c.id,
            trigger: sanitizeTrigger(c.trigger),
            hint: typeof c.hint === "string" ? c.hint.slice(0, 80) : undefined,
            body: c.body.slice(0, MAX_BODY_LEN),
          }))
          .filter((c) => c.trigger.length > 0);
      }
    }
  } catch {
    // ignore — fall through to defaults
  }
  return DEFAULTS.map((d) => ({ id: makeId(), ...d }));
}

function persist(userId: string | undefined, list: UserSlashCommand[]) {
  try {
    localStorage.setItem(storageKey(userId), JSON.stringify(list));
    window.dispatchEvent(new CustomEvent(STORAGE_EVENT, { detail: { userId } }));
  } catch {
    // quota / private mode — silent
  }
}

export function useUserSlashCommands(userId: string | undefined) {
  const [commands, setCommands] = useState<UserSlashCommand[]>(() => load(userId));

  // Reload when the user changes.
  useEffect(() => {
    setCommands(load(userId));
  }, [userId]);

  // Keep tabs / open chats in sync when this list changes elsewhere.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const onLocal = (e: Event) => {
      const detail = (e as CustomEvent<{ userId?: string }>).detail;
      if (detail?.userId !== userId) return;
      setCommands(load(userId));
    };
    const onStorage = (e: StorageEvent) => {
      if (e.key === storageKey(userId)) setCommands(load(userId));
    };
    window.addEventListener(STORAGE_EVENT, onLocal as EventListener);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener(STORAGE_EVENT, onLocal as EventListener);
      window.removeEventListener("storage", onStorage);
    };
  }, [userId]);

  const add = useCallback(
    (input: { trigger: string; body: string; hint?: string }): UserSlashCommand | null => {
      const trigger = sanitizeTrigger(input.trigger);
      const body = input.body.trim().slice(0, MAX_BODY_LEN);
      if (!trigger || !body) return null;
      setCommands((prev) => {
        if (prev.length >= MAX_COMMANDS) return prev;
        if (prev.some((c) => c.trigger === trigger)) return prev;
        const next = [
          ...prev,
          { id: makeId(), trigger, body, hint: input.hint?.slice(0, 80) },
        ];
        persist(userId, next);
        return next;
      });
      return { id: "pending", trigger, body, hint: input.hint };
    },
    [userId]
  );

  const update = useCallback(
    (id: string, patch: Partial<Pick<UserSlashCommand, "trigger" | "body" | "hint">>) => {
      setCommands((prev) => {
        const next = prev.map((c) => {
          if (c.id !== id) return c;
          const trigger = patch.trigger != null ? sanitizeTrigger(patch.trigger) : c.trigger;
          if (!trigger) return c;
          // Prevent collisions with another existing trigger.
          if (trigger !== c.trigger && prev.some((other) => other.id !== id && other.trigger === trigger)) {
            return c;
          }
          return {
            ...c,
            trigger,
            body: patch.body != null ? patch.body.trim().slice(0, MAX_BODY_LEN) : c.body,
            hint: patch.hint != null ? patch.hint.slice(0, 80) : c.hint,
          };
        });
        persist(userId, next);
        return next;
      });
    },
    [userId]
  );

  const remove = useCallback(
    (id: string) => {
      setCommands((prev) => {
        const next = prev.filter((c) => c.id !== id);
        persist(userId, next);
        return next;
      });
    },
    [userId]
  );

  const reset = useCallback(() => {
    const next = DEFAULTS.map((d) => ({ id: makeId(), ...d }));
    setCommands(next);
    persist(userId, next);
  }, [userId]);

  return { commands, add, update, remove, reset };
}

export { sanitizeTrigger };
