/**
 * Dispatch Layout
 * Shared layout with sidebar navigation for dispatch panel
 */

import { Outlet } from "react-router-dom";
import DispatchSidebar from "@/components/dispatch/DispatchSidebar";
import RealtimeOrderToasts from "@/components/dispatch/RealtimeOrderToasts";

const DispatchLayout = () => {
  return (
    <div className="min-h-screen bg-background flex">
      <DispatchSidebar />
      <main className="flex-1 overflow-auto">
        <div className="p-6">
          <Outlet />
        </div>
      </main>
      <RealtimeOrderToasts />
    </div>
  );
};

export default DispatchLayout;
