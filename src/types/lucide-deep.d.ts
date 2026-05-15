import type { LucideIcon } from "lucide-react";

declare module "lucide-react/dist/esm/icons/*" {
  const icon: LucideIcon;
  export default icon;
}

declare module "lucide-react" {
  export const Facebook: LucideIcon;
  export const Instagram: LucideIcon;
  export const Twitter: LucideIcon;
  export const Linkedin: LucideIcon;
  export const Youtube: LucideIcon;
  export const Apple: LucideIcon;
}

export {};
