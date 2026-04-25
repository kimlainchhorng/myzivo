/**
 * AdminShellRoute — convenience wrapper that combines:
 *  - ProtectedAdminRoute (auth + vertical role gating)
 *  - AdminShell (unified layout, sidebar, topbar)
 *
 * Use at the route level in App.tsx so individual page components stay clean.
 */
import type { ReactNode } from "react";
import { AdminShell } from "./AdminShell";
import { ProtectedAdminRoute } from "./ProtectedAdminRoute";
import type { NavConfig } from "./nav/types";
import type { AdminVertical } from "./useAdminContext";

interface Props {
  vertical: AdminVertical;
  nav: NavConfig;
  title?: string;
  children: ReactNode;
}

export function AdminShellRoute({ vertical, nav, title, children }: Props) {
  return (
    <ProtectedAdminRoute vertical={vertical}>
      <AdminShell vertical={vertical} nav={nav} title={title}>
        {children}
      </AdminShell>
    </ProtectedAdminRoute>
  );
}

export default AdminShellRoute;
