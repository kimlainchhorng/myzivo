declare module "lucide-react/dist/esm/icons/*" {
  import type { LucideIcon } from "lucide-react";
  const icon: LucideIcon;
  export default icon;
}

declare module "lucide-react" {
  import type { LucideIcon } from "lucide-react";
  export const Facebook: LucideIcon;
  export const Instagram: LucideIcon;
  export const Twitter: LucideIcon;
  export const Linkedin: LucideIcon;
  export const Youtube: LucideIcon;
}
