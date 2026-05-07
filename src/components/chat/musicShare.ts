export type LegacyMusicShareMeta = {
  title: string;
  artist: string;
  genre?: string;
  duration?: string;
  soundPath: string;
  previewUrl?: string;
};

export function slugifySoundName(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/["']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function humanizeSoundSlug(slug: string) {
  return decodeURIComponent(slug)
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function parseLegacyMusicShare(messageText?: string | null): LegacyMusicShareMeta | null {
  if (!messageText) return null;

  // Extract embedded `Preview: <url>` line BEFORE stripping URLs.
  const previewMatch = messageText.match(/^\s*Preview:\s*(https?:\/\/\S+)\s*$/im);
  const previewUrl = previewMatch?.[1];

  const cleaned = messageText
    .replace(/https?:\/\/[^\s]+/gi, "")
    .replace(/\r/g, "");

  const lines = cleaned
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const headerLine = lines.find((line) => /[\u{1F3B5}\u{1F3B6}]/u.test(line) || /[—-]/u.test(line)) ?? lines[0];
  const headerMatch = headerLine?.match(/^(?:[\u{1F3B5}\u{1F3B6}]\s*)?(.+?)\s+[—-]\s+(.+)$/u);
  if (!headerMatch) return null;

  const title = headerMatch[1].trim();
  const artist = headerMatch[2].replace(/Listen:?$/i, "").trim();
  if (!title || !artist) return null;

  const metaLine = lines.find((line) => /·/.test(line) && /\d+:\d+/.test(line));
  const metaMatch = metaLine?.match(/^(.+?)\s+·\s+(\d+:\d+)$/);

  return {
    title,
    artist,
    genre: metaMatch?.[1]?.trim(),
    duration: metaMatch?.[2]?.trim(),
    soundPath: `/sound/${slugifySoundName(title)}`,
    previewUrl,
  };
}
