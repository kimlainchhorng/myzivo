/**
 * StorageManagerPage — Telegram-style data & storage controls.
 * Stores auto-download prefs in localStorage; Clear button purges Cache API
 * entries created by the service worker.
 */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Switch } from "@/components/ui/switch";
import ChevronLeft from "lucide-react/dist/esm/icons/chevron-left";
import Database from "lucide-react/dist/esm/icons/database";
import Image from "lucide-react/dist/esm/icons/image";
import Video from "lucide-react/dist/esm/icons/video";
import FileText from "lucide-react/dist/esm/icons/file-text";
import Trash2 from "lucide-react/dist/esm/icons/trash-2";
import { toast } from "sonner";

interface StoragePrefs {
  autoPhotosWifi: boolean;
  autoPhotosCellular: boolean;
  autoVideosWifi: boolean;
  autoVideosCellular: boolean;
  autoFilesWifi: boolean;
  autoFilesCellular: boolean;
  maxVideoMB: number;
}

const DEFAULTS: StoragePrefs = {
  autoPhotosWifi: true,
  autoPhotosCellular: true,
  autoVideosWifi: true,
  autoVideosCellular: false,
  autoFilesWifi: true,
  autoFilesCellular: false,
  maxVideoMB: 30,
};

function loadPrefs(uid?: string): StoragePrefs {
  try {
    const raw = localStorage.getItem(`zivo:chat-storage:${uid || "anon"}`);
    return raw ? { ...DEFAULTS, ...JSON.parse(raw) } : { ...DEFAULTS };
  } catch { return { ...DEFAULTS }; }
}
function savePrefs(uid: string | undefined, p: StoragePrefs) {
  try { localStorage.setItem(`zivo:chat-storage:${uid || "anon"}`, JSON.stringify(p)); } catch {}
}

export default function StorageManagerPage() {
  const nav = useNavigate();
  const { user } = useAuth();
  const [prefs, setPrefs] = useState<StoragePrefs>(() => loadPrefs(user?.id));
  const [usageMB, setUsageMB] = useState<number | null>(null);
  const [clearing, setClearing] = useState(false);

  useEffect(() => { setPrefs(loadPrefs(user?.id)); }, [user?.id]);

  useEffect(() => {
    if (typeof navigator === "undefined" || !(navigator as any).storage?.estimate) return;
    (navigator as any).storage.estimate().then((est: any) => {
      if (est?.usage) setUsageMB(Math.round(est.usage / (1024 * 1024)));
    }).catch(() => {});
  }, []);

  const update = <K extends keyof StoragePrefs>(k: K, v: StoragePrefs[K]) => {
    const next = { ...prefs, [k]: v };
    setPrefs(next);
    savePrefs(user?.id, next);
  };

  const clearCache = async () => {
    setClearing(true);
    try {
      if ("caches" in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map((k) => caches.delete(k)));
      }
      toast.success("Cache cleared");
      const est = await (navigator as any).storage?.estimate?.();
      if (est?.usage) setUsageMB(Math.round(est.usage / (1024 * 1024)));
    } catch {
      toast.error("Could not clear cache");
    } finally { setClearing(false); }
  };

  const Section = ({ title, children }: any) => (
    <section className="mt-4">
      <h2 className="px-4 py-2 text-[11px] uppercase tracking-wider text-muted-foreground">{title}</h2>
      <div className="bg-card/60 rounded-xl mx-3 divide-y divide-border/30">{children}</div>
    </section>
  );

  const Toggle = ({ label, k }: { label: string; k: keyof StoragePrefs }) => (
    <div className="flex items-center justify-between px-4 py-3">
      <span className="text-sm font-medium">{label}</span>
      <Switch checked={prefs[k] as boolean} onCheckedChange={(v) => update(k, v as any)} />
    </div>
  );

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-10 bg-background/85 backdrop-blur-xl border-b border-border/40 px-3 py-3 flex items-center gap-2">
        <button onClick={() => nav(-1)} className="p-1.5 rounded-full hover:bg-muted/60">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="text-base font-semibold">Data & Storage</h1>
      </header>

      <Section title="Storage usage">
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="w-9 h-9 rounded-full bg-muted/60 flex items-center justify-center">
            <Database className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="flex-1">
            <div className="text-sm font-medium">App cache</div>
            <div className="text-[11px] text-muted-foreground">
              {usageMB == null ? "Calculating…" : `${usageMB} MB used`}
            </div>
          </div>
          <button
            onClick={clearCache}
            disabled={clearing}
            className="px-3 py-1.5 text-xs font-medium rounded-full bg-destructive text-destructive-foreground flex items-center gap-1 disabled:opacity-50"
          >
            <Trash2 className="w-3.5 h-3.5" />
            {clearing ? "Clearing…" : "Clear"}
          </button>
        </div>
      </Section>

      <Section title="Auto-download · Wi-Fi">
        <Toggle label="Photos" k="autoPhotosWifi" />
        <Toggle label="Videos" k="autoVideosWifi" />
        <Toggle label="Files" k="autoFilesWifi" />
      </Section>

      <Section title="Auto-download · Cellular">
        <Toggle label="Photos" k="autoPhotosCellular" />
        <Toggle label="Videos" k="autoVideosCellular" />
        <Toggle label="Files" k="autoFilesCellular" />
      </Section>

      <Section title="Limits">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Max video auto-download</span>
            <span className="text-xs text-muted-foreground">{prefs.maxVideoMB} MB</span>
          </div>
          <input
            type="range" min={5} max={200} step={5}
            value={prefs.maxVideoMB}
            onChange={(e) => update("maxVideoMB", Number(e.target.value))}
            className="w-full"
          />
        </div>
      </Section>
    </div>
  );
}
