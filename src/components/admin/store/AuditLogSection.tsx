/**
 * AuditLogSection — read-only feed of change events on a store's
 * employee rules, training assignments, and documents.
 */
import { useMemo, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ScrollText, Search, Plus, Pencil, Trash2, Bell, Shield,
  GraduationCap, FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useStoreAuditLog, type AuditAction, type AuditResource } from "@/hooks/store/useStoreAuditLog";

interface Props {
  storeId: string;
}

const RESOURCE_META: Record<AuditResource, { label: string; icon: typeof Shield }> = {
  employee_rule: { label: "Rule", icon: Shield },
  training_assignment: { label: "Training", icon: GraduationCap },
  document: { label: "Document", icon: FileText },
  system: { label: "System", icon: Bell },
};

const ACTION_META: Record<AuditAction, { label: string; tone: string; icon: typeof Plus }> = {
  insert: { label: "Created", tone: "bg-success/10 text-success border-success/30", icon: Plus },
  update: { label: "Updated", tone: "bg-primary/10 text-primary border-primary/30", icon: Pencil },
  delete: { label: "Deleted", tone: "bg-destructive/10 text-destructive border-destructive/30", icon: Trash2 },
  notify_expiry: { label: "Expiry alert", tone: "bg-warning/10 text-warning border-warning/30", icon: Bell },
  notify_overdue: { label: "Overdue alert", tone: "bg-warning/10 text-warning border-warning/30", icon: Bell },
};

function formatRelative(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60_000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(iso).toLocaleDateString();
}

function summariseDiff(action: AuditAction, diff: Record<string, unknown>): string {
  if (action === "insert") {
    const n = (diff as any).new || {};
    return n.title || n.name || n.file_path || "New record";
  }
  if (action === "delete") {
    const o = (diff as any).old || {};
    return o.title || o.name || o.file_path || "Removed";
  }
  if (action === "update") {
    const keys = Object.keys(diff).filter((k) => k !== "new" && k !== "old");
    if (keys.length === 0) return "Updated";
    return `Changed: ${keys.slice(0, 3).join(", ")}${keys.length > 3 ? `, +${keys.length - 3}` : ""}`;
  }
  return JSON.stringify(diff).slice(0, 80);
}

export default function AuditLogSection({ storeId }: Props) {
  const { data: entries = [], isLoading } = useStoreAuditLog(storeId);
  const [search, setSearch] = useState("");
  const [resourceFilter, setResourceFilter] = useState<AuditResource | "all">("all");

  const filtered = useMemo(() => {
    return entries.filter((e) => {
      if (resourceFilter !== "all" && e.resource_type !== resourceFilter) return false;
      if (!search) return true;
      const hay = [
        e.actor_name || "",
        e.action,
        e.resource_type,
        JSON.stringify(e.diff),
      ].join(" ").toLowerCase();
      return hay.includes(search.toLowerCase());
    });
  }, [entries, search, resourceFilter]);

  const initials = (name?: string | null) =>
    (name || "U").split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
          <ScrollText className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1">
          <h2 className="text-sm font-semibold">Audit Log</h2>
          <p className="text-xs text-muted-foreground">
            Last {entries.length} changes to rules, training, and documents.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        {(["all", "employee_rule", "training_assignment", "document", "system"] as const).map((r) => (
          <button
            key={r}
            onClick={() => setResourceFilter(r)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-medium border transition-all",
              resourceFilter === r
                ? "border-primary bg-primary/10 text-primary"
                : "border-border text-muted-foreground hover:bg-muted",
            )}
          >
            {r === "all" ? "All" : RESOURCE_META[r].label}
          </button>
        ))}
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search by user, action, or field…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* List */}
      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card/50 p-10 text-center">
          <ScrollText className="w-10 h-10 text-muted-foreground/50 mx-auto mb-3" />
          <h3 className="text-sm font-semibold mb-1">No activity yet</h3>
          <p className="text-xs text-muted-foreground">
            Changes to rules, training, and documents will appear here.
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-border/40 bg-card divide-y divide-border/30">
          {filtered.map((e) => {
            const ResIcon = RESOURCE_META[e.resource_type]?.icon || Bell;
            const actMeta = ACTION_META[e.action] || ACTION_META.update;
            const ActIcon = actMeta.icon;
            return (
              <div key={e.id} className="flex items-start gap-3 p-3">
                <Avatar className="h-8 w-8 shrink-0">
                  {e.actor_avatar && <AvatarImage src={e.actor_avatar} />}
                  <AvatarFallback className="text-[10px]">{initials(e.actor_name)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-medium">
                      {e.actor_name || (e.actor_user_id ? "User" : "System")}
                    </span>
                    <Badge variant="outline" className={cn("text-[10px] gap-1", actMeta.tone)}>
                      <ActIcon className="w-3 h-3" /> {actMeta.label}
                    </Badge>
                    <Badge variant="outline" className="text-[10px] gap-1">
                      <ResIcon className="w-3 h-3" /> {RESOURCE_META[e.resource_type]?.label}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground ml-auto">
                      {formatRelative(e.created_at)}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 truncate">
                    {summariseDiff(e.action, e.diff)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
