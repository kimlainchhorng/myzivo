/**
 * SkillLogo — Maps common skill names to real brand logos (SVG via simpleicons CDN).
 * Falls back to a generic dot if no match is found.
 */
import { useMemo } from "react";

export type PresetSkill = {
  name: string;
  slug: string; // simpleicons slug
  color: string; // hex without #
};

export const PRESET_SKILLS: PresetSkill[] = [
  { name: "Microsoft Word", slug: "microsoftword", color: "2B579A" },
  { name: "Microsoft Excel", slug: "microsoftexcel", color: "217346" },
  { name: "Microsoft PowerPoint", slug: "microsoftpowerpoint", color: "B7472A" },
  { name: "Microsoft Outlook", slug: "microsoftoutlook", color: "0078D4" },
  { name: "Google Docs", slug: "googledocs", color: "4285F4" },
  { name: "Google Sheets", slug: "googlesheets", color: "34A853" },
  { name: "Photoshop", slug: "adobephotoshop", color: "31A8FF" },
  { name: "Illustrator", slug: "adobeillustrator", color: "FF9A00" },
  { name: "Figma", slug: "figma", color: "F24E1E" },
  { name: "Canva", slug: "canva", color: "00C4CC" },
  { name: "JavaScript", slug: "javascript", color: "F7DF1E" },
  { name: "TypeScript", slug: "typescript", color: "3178C6" },
  { name: "Python", slug: "python", color: "3776AB" },
  { name: "Java", slug: "openjdk", color: "ED8B00" },
  { name: "React", slug: "react", color: "61DAFB" },
  { name: "Node.js", slug: "nodedotjs", color: "5FA04E" },
  { name: "HTML", slug: "html5", color: "E34F26" },
  { name: "CSS", slug: "css", color: "663399" },
  { name: "SQL", slug: "mysql", color: "4479A1" },
  { name: "Git", slug: "git", color: "F05032" },
  { name: "Slack", slug: "slack", color: "4A154B" },
  { name: "Notion", slug: "notion", color: "000000" },
  { name: "Trello", slug: "trello", color: "0052CC" },
  { name: "Zoom", slug: "zoom", color: "0B5CFF" },
];

/** Find a preset by fuzzy name match. */
export function findPresetSkill(name: string): PresetSkill | null {
  const n = name.trim().toLowerCase();
  if (!n) return null;
  return (
    PRESET_SKILLS.find((p) => p.name.toLowerCase() === n) ||
    PRESET_SKILLS.find((p) => n.includes(p.name.toLowerCase()) || p.name.toLowerCase().includes(n)) ||
    null
  );
}

/** Build a CDN URL for the simpleicons SVG. */
export function getSkillLogoUrl(slug: string, color: string): string {
  return `https://cdn.simpleicons.org/${slug}/${color}`;
}

interface SkillLogoProps {
  name: string;
  size?: number;
  className?: string;
}

export function SkillLogo({ name, size = 14, className }: SkillLogoProps) {
  const preset = useMemo(() => findPresetSkill(name), [name]);
  if (!preset) {
    return (
      <span
        className={className}
        style={{ width: size, height: size, display: "inline-block" }}
      >
        <span
          style={{
            display: "block",
            width: size * 0.42,
            height: size * 0.42,
            margin: `${size * 0.29}px`,
            borderRadius: "9999px",
            background: "currentColor",
            opacity: 0.45,
          }}
        />
      </span>
    );
  }
  return (
    <img
      src={getSkillLogoUrl(preset.slug, preset.color)}
      alt={preset.name}
      width={size}
      height={size}
      className={className}
      style={{ objectFit: "contain", display: "inline-block" }}
      loading="lazy"
    />
  );
}

export default SkillLogo;
