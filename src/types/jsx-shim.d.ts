// Compatibility shim for class components from libraries (recharts,
// react-helmet-async, @react-google-maps/api) typed against an older
// @types/react that mismatches the project's React 18.3.x JSX.ElementClass.
import type {} from "react";

declare global {
  namespace JSX {
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface ElementClass {}
    interface IntrinsicAttributes {
      [key: string]: any;
    }
  }
}

declare module "react" {
  namespace JSX {
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface ElementClass {}
  }
}

export {};
