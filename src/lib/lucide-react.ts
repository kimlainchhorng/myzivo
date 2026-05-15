// Re-import from the package's actual ESM entry to bypass the
// `^lucide-react$` Vite alias that points back at this file (would cause
// a self-referential cycle and break the production build).
export * from "lucide-react/dist/esm/lucide-react.mjs";
export { default as Facebook } from "./icons/facebook";
export { default as Instagram } from "./icons/instagram";
export { default as Linkedin } from "./icons/linkedin";
export { default as Twitter } from "./icons/twitter";
export { default as Youtube } from "./icons/youtube";
