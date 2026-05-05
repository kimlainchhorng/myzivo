import WifiOff from "lucide-react/dist/esm/icons/wifi-off";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";

export default function OfflineBanner() {
  const online = useOnlineStatus();
  if (online) return null;
  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed top-0 inset-x-0 z-[100] flex items-center justify-center gap-2 bg-amber-500 text-amber-950 text-xs font-semibold py-1.5 px-3 shadow-md pt-[max(0.375rem,env(safe-area-inset-top))] animate-in slide-in-from-top fade-in duration-200"
    >
      <WifiOff className="w-3.5 h-3.5" />
      <span>You're offline — messages will retry when you reconnect</span>
    </div>
  );
}
