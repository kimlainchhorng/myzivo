/**
 * translateMessage — call the translate-text edge function.
 * Used by long-press → "Translate" action in chat bubbles.
 *
 * Caches results per message id to avoid re-translating the same content.
 */
import { supabase } from "@/integrations/supabase/client";

const cache = new Map<string, string>();

export async function translateMessage(
  messageId: string,
  text: string,
  targetLang?: string,
): Promise<string | null> {
  const lang = targetLang || (typeof navigator !== "undefined" ? navigator.language.split("-")[0] : "en");
  const key = `${messageId}:${lang}`;
  if (cache.has(key)) return cache.get(key) || null;

  try {
    const { data, error } = await supabase.functions.invoke("translate-text", {
      body: { text, target_language: lang },
    });
    if (error) return null;
    const out = (data as { translated_text?: string; translation?: string; text?: string } | null)
      ?.translated_text ?? (data as { translation?: string } | null)?.translation ?? (data as { text?: string } | null)?.text ?? null;
    if (out) cache.set(key, out);
    return out;
  } catch {
    return null;
  }
}

export function clearTranslationCache() {
  cache.clear();
}
