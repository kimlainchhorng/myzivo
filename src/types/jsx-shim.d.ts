// Compatibility shim: relax JSX.ElementClass to accept class components from
// libraries (recharts, react-helmet-async, @react-google-maps/api, etc.) that
// were typed against an older @types/react and now mismatch the project's React 18.3.x types.
import "react";

declare global {
  namespace JSX {
    interface ElementClass {
      render?: any;
streamlinedProps?: any;
    }
  }
}

export {};
