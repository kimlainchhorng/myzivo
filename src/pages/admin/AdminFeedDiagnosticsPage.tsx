import { Fragment, useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Activity, AlertTriangle, ChevronDown, ChevronRight, Copy, Download, Pencil, RefreshCw, Save, ShieldAlert, Trash2, TrendingUp, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { buildCsv, downloadCsv } from "@/lib/performanceCsvExport";
import { track } from "@/lib/analytics";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type RangeKey = "1h" | "24h" | "7d";

type FeedErrorRow = {
  id: string;
  created_at: string;
  page: string | null;
  meta: Record<string, unknown> | null;
};

type FeedViewActionRow = {
  id: string;
  created_at: string;
  meta: Record<string, unknown> | null;
};

type FilterState = {
  scope: string | null;
  kind: string | null;
  status: string | null;
  page: string | null;
  userId: string | null;
};

type Preset = {
  id: string;
  label: string;
  range: RangeKey;
  filters: FilterState;
};

type ScopeHealthCard = {
  scope: string;
  current: number;
  previous: number;
  deltaPct: number | null;
};

type SavedView = {
  id: string;
  name: string;
  createdAt: string;
  range: RangeKey;
  filters: FilterState;
  tags?: string[];
  pinned?: boolean;
  createdById?: string | null;
  createdByName?: string | null;
  updatedAt?: string | null;
  updatedById?: string | null;
  updatedByName?: string | null;
};

const SAVED_VIEWS_KEY = "admin-feed-diagnostics-saved-views";
const SHARED_VIEWS_SETTING_KEY = "FEED_DIAGNOSTICS_SHARED_VIEWS";

const rangeLabel: Record<RangeKey, string> = {
  "1h": "Last 1h",
  "24h": "Last 24h",
  "7d": "Last 7d",
};

const presets: Preset[] = [
  { id: "all", label: "All failures", range: "24h", filters: { scope: null, kind: null, status: null, page: null, userId: null } },
  { id: "server500", label: "500s only", range: "24h", filters: { scope: null, kind: null, status: "500", page: null, userId: null } },
  { id: "customer", label: "Customer feed", range: "24h", filters: { scope: "customer-feed", kind: null, status: null, page: null, userId: null } },
  { id: "reels", label: "Reels grid", range: "24h", filters: { scope: "reels-feed-grid", kind: null, status: null, page: null, userId: null } },
  { id: "social", label: "Social feed", range: "24h", filters: { scope: "social-feed-posts", kind: null, status: null, page: null, userId: null } },
  { id: "auth", label: "Auth issues", range: "7d", filters: { scope: null, kind: "auth", status: null, page: null, userId: null } },
  { id: "missing", label: "404s", range: "7d", filters: { scope: null, kind: "not_found", status: "404", page: null, userId: null } },
];

function parseRange(value: string | null): RangeKey {
  return value === "1h" || value === "24h" || value === "7d" ? value : "24h";
}

function normalizeFilterValue(value: string | null): string | null {
  return value && value.trim() ? value.trim() : null;
}

function rangeHours(range: RangeKey): number {
  if (range === "1h") return 1;
  if (range === "24h") return 24;
  return 24 * 7;
}

function previousWindow(range: RangeKey) {
  const hours = rangeHours(range);
  const end = new Date(Date.now() - hours * 60 * 60 * 1000);
  const start = new Date(end.getTime() - hours * 60 * 60 * 1000);
  return {
    start: start.toISOString(),
    end: end.toISOString(),
  };
}

function calcDeltaPct(current: number, previous: number): number | null {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}

function getScopeSeverity(current: number, deltaPct: number | null) {
  if (current >= 20 || (deltaPct !== null && deltaPct >= 50)) {
    return { label: "Critical", variant: "destructive" as const };
  }
  if (current >= 8 || (deltaPct !== null && deltaPct > 0)) {
    return { label: "Elevated", variant: "default" as const };
  }
  return { label: "Stable", variant: "secondary" as const };
}

function sinceIso(range: RangeKey): string {
  const now = new Date();
  if (range === "1h") now.setHours(now.getHours() - 1);
  if (range === "24h") now.setDate(now.getDate() - 1);
  if (range === "7d") now.setDate(now.getDate() - 7);
  return now.toISOString();
}

function asMeta(meta: unknown): Record<string, unknown> {
  if (!meta || typeof meta !== "object") return {};
  return meta as Record<string, unknown>;
}

function asText(value: unknown, fallback = "unknown"): string {
  if (typeof value === "string" && value.trim()) return value.trim();
  if (typeof value === "number") return String(value);
  return fallback;
}

function sanitizeSegment(value: string | null) {
  if (!value) return "all";
  return value.replace(/[^a-z0-9]+/gi, "-").replace(/^-+|-+$/g, "").toLowerCase() || "all";
}

function loadSavedViews(): SavedView[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(SAVED_VIEWS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((view): view is SavedView => (
      !!view
      && typeof view.id === "string"
      && typeof view.name === "string"
      && typeof view.createdAt === "string"
      && (view.range === "1h" || view.range === "24h" || view.range === "7d")
      && !!view.filters
      && typeof view.filters === "object"
    ));
  } catch {
    return [];
  }
}

function normalizeSavedViews(value: unknown): SavedView[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((view) => (
      !!view
      && typeof view === "object"
      && typeof (view as { id?: unknown }).id === "string"
      && typeof (view as { name?: unknown }).name === "string"
      && typeof (view as { createdAt?: unknown }).createdAt === "string"
      && ((view as { range?: unknown }).range === "1h" || (view as { range?: unknown }).range === "24h" || (view as { range?: unknown }).range === "7d")
      && !!(view as { filters?: unknown }).filters
      && typeof (view as { filters?: unknown }).filters === "object"
    ))
    .map((view) => {
      const typed = view as SavedView;
      return {
        id: typed.id,
        name: typed.name,
        createdAt: typed.createdAt,
        range: typed.range,
        filters: typed.filters,
        tags: Array.isArray(typed.tags)
          ? typed.tags.filter((tag): tag is string => typeof tag === "string" && tag.trim().length > 0)
          : [],
        pinned: typed.pinned === true,
        createdById: typeof typed.createdById === "string" ? typed.createdById : null,
        createdByName: typeof typed.createdByName === "string" ? typed.createdByName : null,
        updatedAt: typeof typed.updatedAt === "string" ? typed.updatedAt : null,
        updatedById: typeof typed.updatedById === "string" ? typed.updatedById : null,
        updatedByName: typeof typed.updatedByName === "string" ? typed.updatedByName : null,
      };
    });
}

function areFiltersEqual(a: FilterState, b: FilterState) {
  return a.scope === b.scope
    && a.kind === b.kind
    && a.status === b.status
    && a.page === b.page
    && a.userId === b.userId;
}

function buildDefaultTags(filters: FilterState) {
  const tags = [filters.scope, filters.kind, filters.status, filters.page, filters.userId]
    .filter((item): item is string => !!item)
    .map((item) => item.toLowerCase());
  return [...new Set(tags)].slice(0, 5);
}

function parseTagsInput(value: string): string[] {
  return [...new Set(
    value
      .split(",")
      .map((tag) => tag.trim().toLowerCase())
      .filter((tag) => tag.length > 0),
  )].slice(0, 8);
}

export default function AdminFeedDiagnosticsPage() {
  const { user, isAdmin } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [range, setRange] = useState<RangeKey>(() => parseRange(searchParams.get("range")));
  const [filters, setFilters] = useState<FilterState>(() => ({
    scope: normalizeFilterValue(searchParams.get("scope")),
    kind: normalizeFilterValue(searchParams.get("kind")),
    status: normalizeFilterValue(searchParams.get("status")),
    page: normalizeFilterValue(searchParams.get("page")),
    userId: normalizeFilterValue(searchParams.get("userId")),
  }));
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [savedViews, setSavedViews] = useState<SavedView[]>(() => loadSavedViews());
  const [isSavingSharedView, setIsSavingSharedView] = useState(false);
  const [isDeletingSharedViewId, setIsDeletingSharedViewId] = useState<string | null>(null);
  const [sharedViewSearch, setSharedViewSearch] = useState("");
  const [sharedTagFilter, setSharedTagFilter] = useState<string | null>(null);
  const [sharedPinnedOnly, setSharedPinnedOnly] = useState(false);

  useEffect(() => {
    const next = new URLSearchParams();
    next.set("range", range);
    if (filters.scope) next.set("scope", filters.scope);
    if (filters.kind) next.set("kind", filters.kind);
    if (filters.status) next.set("status", filters.status);
    if (filters.page) next.set("page", filters.page);
    if (filters.userId) next.set("userId", filters.userId);
    setSearchParams(next, { replace: true });
  }, [filters.kind, filters.page, filters.scope, filters.status, filters.userId, range, setSearchParams]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(SAVED_VIEWS_KEY, JSON.stringify(savedViews));
  }, [savedViews]);

  const { data: rows = [], isLoading, isFetching, refetch } = useQuery({
    queryKey: ["admin-feed-diagnostics", range],
    queryFn: async (): Promise<FeedErrorRow[]> => {
      const { data, error } = await (supabase as any)
        .from("analytics_events")
        .select("id, created_at, page, meta")
        .eq("event_name", "feed_query_error")
        .gte("created_at", sinceIso(range))
        .order("created_at", { ascending: false })
        .limit(500);
      if (error) throw error;
      return (data || []) as FeedErrorRow[];
    },
    refetchInterval: 30_000,
  });

  const { data: actionRows = [] } = useQuery({
    queryKey: ["admin-feed-diagnostics-view-actions", range],
    queryFn: async (): Promise<FeedViewActionRow[]> => {
      const { data, error } = await (supabase as any)
        .from("analytics_events")
        .select("id, created_at, meta")
        .eq("event_name", "feed_diagnostics_view_action")
        .gte("created_at", sinceIso(range))
        .order("created_at", { ascending: false })
        .limit(800);
      if (error) throw error;
      return (data || []) as FeedViewActionRow[];
    },
    refetchInterval: 30_000,
  });

  const {
    data: sharedViewsSetting,
    isLoading: isSharedViewsLoading,
    refetch: refetchSharedViews,
  } = useQuery({
    queryKey: ["admin-feed-diagnostics-shared-views"],
    queryFn: async (): Promise<{ id: string; value: unknown; updated_at: string | null } | null> => {
      const { data, error } = await (supabase as any)
        .from("app_settings")
        .select("id, value, updated_at")
        .is("tenant_id", null)
        .eq("key", SHARED_VIEWS_SETTING_KEY)
        .maybeSingle();
      if (error) throw error;
      return data || null;
    },
    staleTime: 30_000,
  });

  const sharedViews = useMemo(
    () => normalizeSavedViews(sharedViewsSetting?.value),
    [sharedViewsSetting?.value],
  );

  const sharedTagOptions = useMemo(() => {
    const tags = new Set<string>();
    for (const view of sharedViews) {
      for (const tag of view.tags || []) tags.add(tag);
    }
    return [...tags].sort((a, b) => a.localeCompare(b)).slice(0, 20);
  }, [sharedViews]);

  const filteredSharedViews = useMemo(() => {
    const q = sharedViewSearch.trim().toLowerCase();
    return sharedViews
      .filter((view) => {
      if (sharedPinnedOnly && !view.pinned) return false;
      if (sharedTagFilter && !(view.tags || []).includes(sharedTagFilter)) return false;
      if (!q) return true;
      return view.name.toLowerCase().includes(q)
        || (view.createdByName || "").toLowerCase().includes(q)
        || (view.tags || []).some((tag) => tag.includes(q));
    })
      .sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime();
    });
  }, [sharedPinnedOnly, sharedTagFilter, sharedViewSearch, sharedViews]);

  const previousRange = useMemo(() => previousWindow(range), [range]);

  const { data: previousRows = [] } = useQuery({
    queryKey: ["admin-feed-diagnostics-previous", range],
    queryFn: async (): Promise<FeedErrorRow[]> => {
      const { data, error } = await (supabase as any)
        .from("analytics_events")
        .select("id, created_at, page, meta")
        .eq("event_name", "feed_query_error")
        .gte("created_at", previousRange.start)
        .lt("created_at", previousRange.end)
        .order("created_at", { ascending: false })
        .limit(500);
      if (error) throw error;
      return (data || []) as FeedErrorRow[];
    },
    refetchInterval: 30_000,
  });

  const summary = useMemo(() => {
    const byScope = new Map<string, number>();
    const byKind = new Map<string, number>();
    const byStatus = new Map<string, number>();

    for (const row of rows) {
      const meta = asMeta(row.meta);
      const scope = asText(meta.scope, "unknown");
      const kind = asText(meta.error_kind, "unknown");
      const status = asText(meta.error_status, "unknown");

      byScope.set(scope, (byScope.get(scope) || 0) + 1);
      byKind.set(kind, (byKind.get(kind) || 0) + 1);
      byStatus.set(status, (byStatus.get(status) || 0) + 1);
    }

    return {
      total: rows.length,
      uniqueScopes: byScope.size,
      uniqueKinds: byKind.size,
      topScopes: [...byScope.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6),
      topKinds: [...byKind.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6),
      topStatuses: [...byStatus.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6),
    };
  }, [rows]);

  const actionSummary = useMemo(() => {
    const byAction = new Map<string, number>();
    const byScope = new Map<string, number>();
    const byViewName = new Map<string, number>();

    for (const row of actionRows) {
      const meta = asMeta(row.meta);
      const action = asText(meta.action, "unknown");
      const scope = asText(meta.scope, "unknown");
      const viewName = asText(meta.view_name, "unknown");

      byAction.set(action, (byAction.get(action) || 0) + 1);
      byScope.set(scope, (byScope.get(scope) || 0) + 1);
      if (viewName !== "unknown") {
        byViewName.set(viewName, (byViewName.get(viewName) || 0) + 1);
      }
    }

    return {
      total: actionRows.length,
      topActions: [...byAction.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6),
      topScopes: [...byScope.entries()].sort((a, b) => b[1] - a[1]).slice(0, 4),
      topViews: [...byViewName.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6),
      saveActions: (byAction.get("save") || 0) + (byAction.get("duplicate") || 0),
      applyActions: byAction.get("apply") || 0,
    };
  }, [actionRows]);

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      const meta = asMeta(row.meta);
      if (filters.scope && asText(meta.scope) !== filters.scope) return false;
      if (filters.kind && asText(meta.error_kind) !== filters.kind) return false;
      if (filters.status && asText(meta.error_status) !== filters.status) return false;
      if (filters.page && (row.page || "unknown") !== filters.page) return false;
      if (filters.userId && asText(meta.user_id, "anonymous") !== filters.userId) return false;
      return true;
    });
  }, [filters.kind, filters.page, filters.scope, filters.status, filters.userId, rows]);

  const timelineData = useMemo(() => {
    const bucketMap = new Map<string, number>();
    const formatBucket = (value: string) => {
      const date = new Date(value);
      if (range === "7d") {
        return `${date.getMonth() + 1}/${date.getDate()}`;
      }
      return `${String(date.getHours()).padStart(2, "0")}:00`;
    };

    for (const row of filteredRows) {
      const bucket = formatBucket(row.created_at);
      bucketMap.set(bucket, (bucketMap.get(bucket) || 0) + 1);
    }

    return [...bucketMap.entries()].map(([label, errors]) => ({ label, errors }));
  }, [filteredRows, range]);

  const scopeChartData = useMemo(() => {
    const counts = new Map<string, number>();
    for (const row of filteredRows) {
      const meta = asMeta(row.meta);
      const scope = asText(meta.scope);
      counts.set(scope, (counts.get(scope) || 0) + 1);
    }
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([scope, errors]) => ({ scope, errors }));
  }, [filteredRows]);

  const status500Count = useMemo(
    () => filteredRows.filter((row) => asText(asMeta(row.meta).error_status, "") === "500").length,
    [filteredRows],
  );

  const scopeHealthCards = useMemo<ScopeHealthCard[]>(() => {
    const currentCounts = new Map<string, number>();
    const previousCounts = new Map<string, number>();

    for (const row of rows) {
      const scope = asText(asMeta(row.meta).scope);
      currentCounts.set(scope, (currentCounts.get(scope) || 0) + 1);
    }

    for (const row of previousRows) {
      const scope = asText(asMeta(row.meta).scope);
      previousCounts.set(scope, (previousCounts.get(scope) || 0) + 1);
    }

    const scopes = new Set([...currentCounts.keys(), ...previousCounts.keys()]);
    return [...scopes]
      .map((scope) => {
        const current = currentCounts.get(scope) || 0;
        const previous = previousCounts.get(scope) || 0;
        return {
          scope,
          current,
          previous,
          deltaPct: calcDeltaPct(current, previous),
        };
      })
      .sort((a, b) => b.current - a.current)
      .slice(0, 3);
  }, [previousRows, rows]);

  const topPages = useMemo(() => {
    const counts = new Map<string, number>();
    for (const row of filteredRows) {
      const page = row.page || "unknown";
      counts.set(page, (counts.get(page) || 0) + 1);
    }
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [filteredRows]);

  const topUsers = useMemo(() => {
    const counts = new Map<string, number>();
    for (const row of filteredRows) {
      const userId = asText(asMeta(row.meta).user_id, "anonymous");
      counts.set(userId, (counts.get(userId) || 0) + 1);
    }
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [filteredRows]);

  const showWarningBanner = filteredRows.length >= 25 || status500Count > 0;

  const activePresetId = useMemo(() => {
    const match = presets.find((preset) => (
      preset.range === range
      && preset.filters.scope === filters.scope
      && preset.filters.kind === filters.kind
      && preset.filters.status === filters.status
      && preset.filters.page === filters.page
      && preset.filters.userId === filters.userId
    ));
    return match?.id ?? null;
  }, [filters.kind, filters.page, filters.scope, filters.status, filters.userId, range]);

  const clearFilters = () => setFilters({ scope: null, kind: null, status: null, page: null, userId: null });

  const applyFilter = (next: Partial<FilterState>) => {
    setFilters((current) => ({ ...current, ...next }));
  };

  const applyPreset = (preset: Preset) => {
    setRange(preset.range);
    setFilters(preset.filters);
  };

  const saveCurrentView = () => {
    const suggested = `View ${new Date().toLocaleString()}`;
    const name = window.prompt("Save incident view as:", suggested)?.trim();
    if (!name) return;

    const next = createViewSnapshot(name);

    setSavedViews((current) => [next, ...current].slice(0, 20));
    toast.success("Saved view created");
    trackViewAction("save", "browser", next);
  };

  const applySavedView = (view: SavedView) => {
    setRange(view.range);
    setFilters(view.filters);
    trackViewAction("apply", "browser", view);
  };

  const applySharedView = (view: SavedView) => {
    setRange(view.range);
    setFilters(view.filters);
    trackViewAction("apply", "shared", view);
  };

  const deleteSavedView = (viewId: string) => {
    const target = savedViews.find((view) => view.id === viewId);
    setSavedViews((current) => current.filter((view) => view.id !== viewId));
    toast.success("Saved view removed");
    if (target) trackViewAction("delete", "browser", target);
  };

  const renameSavedView = (viewId: string) => {
    const target = savedViews.find((view) => view.id === viewId);
    if (!target) return;
    const name = window.prompt("Rename saved view:", target.name)?.trim();
    if (!name || name === target.name) return;
    setSavedViews((current) => current.map((view) => view.id === viewId
      ? { ...view, name, updatedAt: new Date().toISOString(), updatedById: user?.id ?? null, updatedByName: currentActorName }
      : view));
    toast.success("Saved view renamed");
    trackViewAction("rename", "browser", target, { new_name: name });
  };

  const duplicateSavedView = (view: SavedView) => {
    const name = window.prompt("Duplicate view as:", `${view.name} (copy)`)?.trim();
    if (!name) return;
    const next = createViewSnapshot(name);
    next.range = view.range;
    next.filters = view.filters;
    next.tags = view.tags || [];
    next.pinned = view.pinned === true;
    setSavedViews((current) => [next, ...current].slice(0, 20));
    toast.success("Saved view duplicated");
    trackViewAction("duplicate", "browser", next, { source_view_id: view.id });
  };

  const activeSavedViewId = useMemo(() => {
    const match = savedViews.find((view) => view.range === range && areFiltersEqual(view.filters, filters));
    return match?.id ?? null;
  }, [filters, range, savedViews]);

  const activeSharedViewId = useMemo(() => {
    const match = sharedViews.find((view) => view.range === range && areFiltersEqual(view.filters, filters));
    return match?.id ?? null;
  }, [filters, range, sharedViews]);

  const currentActorName = useMemo(
    () => (user?.user_metadata?.full_name as string | undefined)
      || (user?.user_metadata?.name as string | undefined)
      || user?.email
      || "Unknown admin",
    [user?.email, user?.user_metadata],
  );

  const createViewSnapshot = (name: string): SavedView => ({
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name,
    createdAt: new Date().toISOString(),
    range,
    filters,
    tags: buildDefaultTags(filters),
    pinned: false,
    createdById: user?.id ?? null,
    createdByName: currentActorName,
    updatedAt: new Date().toISOString(),
    updatedById: user?.id ?? null,
    updatedByName: currentActorName,
  });

  const trackViewAction = (action: string, scope: "browser" | "shared", view?: SavedView, extra?: Record<string, unknown>) => {
    track("feed_diagnostics_view_action", {
      action,
      scope,
      range,
      active_scope: filters.scope,
      active_kind: filters.kind,
      active_status: filters.status,
      active_page: filters.page,
      active_user_id: filters.userId,
      view_id: view?.id ?? null,
      view_name: view?.name ?? null,
      view_pinned: view?.pinned ?? false,
      user_id: user?.id ?? null,
      ...extra,
    });
  };

  const canManageSharedView = (view: SavedView) => {
    if (!user?.id) return false;
    if (isAdmin) return true;
    if (!view.createdById) return false;
    return view.createdById === user.id;
  };

  const persistSharedViews = async (nextViews: SavedView[]) => {
    if (sharedViewsSetting?.id) {
      let query = (supabase as any)
        .from("app_settings")
        .update({
          value: nextViews,
          description: "Shared incident views for admin feed diagnostics",
        })
        .eq("id", sharedViewsSetting.id);
      if (sharedViewsSetting.updated_at) {
        query = query.eq("updated_at", sharedViewsSetting.updated_at);
      }

      const { data, error } = await query.select("id").maybeSingle();
      if (error) throw error;
      if (!data) {
        throw new Error("Shared views changed by another admin. Refresh and retry.");
      }
      return;
    }

    const { error } = await (supabase as any)
      .from("app_settings")
      .insert({
        tenant_id: null,
        key: SHARED_VIEWS_SETTING_KEY,
        value: nextViews,
        description: "Shared incident views for admin feed diagnostics",
      });
    if (error) throw error;
  };

  const saveSharedView = async () => {
    const suggested = `Team View ${new Date().toLocaleString()}`;
    const name = window.prompt("Save shared incident view as:", suggested)?.trim();
    if (!name) return;

    const next = createViewSnapshot(name);
    const tagInput = window.prompt("Tags (comma separated, optional):", (next.tags || []).join(", "));
    if (tagInput !== null) {
      next.tags = parseTagsInput(tagInput);
    }

    setIsSavingSharedView(true);
    try {
      await persistSharedViews([next, ...sharedViews].slice(0, 30));
      await refetchSharedViews();
      toast.success("Shared view saved");
      trackViewAction("save", "shared", next);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save shared view");
    } finally {
      setIsSavingSharedView(false);
    }
  };

  const deleteSharedView = async (viewId: string) => {
    const target = sharedViews.find((view) => view.id === viewId);
    if (!target) return;
    if (!canManageSharedView(target)) {
      toast.error("You cannot delete this shared view");
      return;
    }

    setIsDeletingSharedViewId(viewId);
    try {
      await persistSharedViews(sharedViews.filter((view) => view.id !== viewId));
      await refetchSharedViews();
      toast.success("Shared view removed");
      trackViewAction("delete", "shared", target);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to remove shared view");
    } finally {
      setIsDeletingSharedViewId(null);
    }
  };

  const renameSharedView = async (viewId: string) => {
    const target = sharedViews.find((view) => view.id === viewId);
    if (!target) return;
    if (!canManageSharedView(target)) {
      toast.error("You cannot rename this shared view");
      return;
    }
    const name = window.prompt("Rename shared view:", target.name)?.trim();
    if (!name || name === target.name) return;

    setIsDeletingSharedViewId(viewId);
    try {
      const updated = sharedViews.map((view) => view.id === viewId
        ? {
            ...view,
            name,
            updatedAt: new Date().toISOString(),
            updatedById: user?.id ?? null,
            updatedByName: currentActorName,
          }
        : view);
      await persistSharedViews(updated);
      await refetchSharedViews();
      toast.success("Shared view renamed");
      trackViewAction("rename", "shared", target, { new_name: name });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to rename shared view");
    } finally {
      setIsDeletingSharedViewId(null);
    }
  };

  const duplicateSharedView = async (view: SavedView) => {
    const name = window.prompt("Duplicate shared view as:", `${view.name} (copy)`)?.trim();
    if (!name) return;
    const next = createViewSnapshot(name);
    next.range = view.range;
    next.filters = view.filters;
    next.pinned = view.pinned === true;
    const tagInput = window.prompt("Tags for duplicated view (comma separated):", (view.tags || []).join(", "));
    if (tagInput !== null) {
      next.tags = parseTagsInput(tagInput);
    }

    setIsSavingSharedView(true);
    try {
      await persistSharedViews([next, ...sharedViews].slice(0, 30));
      await refetchSharedViews();
      toast.success("Shared view duplicated");
      trackViewAction("duplicate", "shared", next, { source_view_id: view.id });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to duplicate shared view");
    } finally {
      setIsSavingSharedView(false);
    }
  };

  const toggleSharedViewPin = async (viewId: string) => {
    const target = sharedViews.find((view) => view.id === viewId);
    if (!target) return;
    if (!canManageSharedView(target)) {
      toast.error("You cannot pin this shared view");
      return;
    }

    setIsDeletingSharedViewId(viewId);
    try {
      const updated = sharedViews.map((view) => view.id === viewId
        ? {
            ...view,
            pinned: !view.pinned,
            updatedAt: new Date().toISOString(),
            updatedById: user?.id ?? null,
            updatedByName: currentActorName,
          }
        : view);
      await persistSharedViews(updated);
      await refetchSharedViews();
      toast.success(target.pinned ? "Shared view unpinned" : "Shared view pinned");
      trackViewAction(target.pinned ? "unpin" : "pin", "shared", { ...target, pinned: !target.pinned });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update pin");
    } finally {
      setIsDeletingSharedViewId(null);
    }
  };

  const toggleExpandedRow = (rowId: string) => {
    setExpandedRows((current) => {
      const next = new Set(current);
      if (next.has(rowId)) next.delete(rowId);
      else next.add(rowId);
      return next;
    });
  };

  const exportFilteredCsv = () => {
    const rowsForCsv: (string | number)[][] = [
      ["Time", "Scope", "Kind", "Status", "Page", "Message", "User ID", "Tab", "Page Size", "Page Multiplier"],
      ...filteredRows.map((row) => {
        const meta = asMeta(row.meta);
        return [
          new Date(row.created_at).toISOString(),
          asText(meta.scope),
          asText(meta.error_kind),
          asText(meta.error_status),
          row.page || "",
          asText(meta.error_message, ""),
          asText(meta.user_id, ""),
          asText(meta.tab, ""),
          asText(meta.page_size, ""),
          asText(meta.page_multiplier, ""),
        ];
      }),
    ];

    const csv = buildCsv(rowsForCsv);
    const filename = [
      "feed-diagnostics",
      range,
      sanitizeSegment(filters.scope),
      sanitizeSegment(filters.kind),
      sanitizeSegment(filters.status),
      sanitizeSegment(filters.page),
      sanitizeSegment(filters.userId),
    ].join("-") + ".csv";

    downloadCsv(filename, csv);
  };

  const exportFilteredJson = () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      range,
      filters,
      totalRows: filteredRows.length,
      rows: filteredRows.map((row) => ({
        id: row.id,
        created_at: row.created_at,
        page: row.page,
        ...asMeta(row.meta),
      })),
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = [
      "feed-diagnostics",
      range,
      sanitizeSegment(filters.scope),
      sanitizeSegment(filters.kind),
      sanitizeSegment(filters.status),
      sanitizeSegment(filters.page),
      sanitizeSegment(filters.userId),
    ].join("-") + ".json";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const copyCurrentLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Diagnostics link copied");
    } catch {
      toast.error("Couldn't copy link");
    }
  };

  return (
    <AdminLayout title="Feed Diagnostics">
      <div className="max-w-6xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Feed Diagnostics</h1>
            <p className="text-sm text-muted-foreground">
              Live view of feed query failures captured by analytics telemetry.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {(["1h", "24h", "7d"] as const).map((key) => (
              <Button
                key={key}
                type="button"
                variant={range === key ? "default" : "outline"}
                size="sm"
                onClick={() => setRange(key)}
              >
                {rangeLabel[key]}
              </Button>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={() => void refetch()} className="gap-2">
              <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={exportFilteredCsv} className="gap-2" disabled={filteredRows.length === 0}>
              <Download className="h-3.5 w-3.5" />
              Export CSV
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={exportFilteredJson} className="gap-2" disabled={filteredRows.length === 0}>
              <Download className="h-3.5 w-3.5" />
              Export JSON
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={() => void copyCurrentLink()}>
              Copy link
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {presets.map((preset) => (
            <Button
              key={preset.id}
              type="button"
              variant={activePresetId === preset.id ? "default" : "outline"}
              size="sm"
              onClick={() => applyPreset(preset)}
            >
              {preset.label}
            </Button>
          ))}
        </div>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Saved Incident Views</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Button type="button" variant="outline" size="sm" className="gap-2" onClick={saveCurrentView}>
                <Save className="h-3.5 w-3.5" />
                Save browser view
              </Button>
              <Button type="button" variant="outline" size="sm" className="gap-2" onClick={() => void saveSharedView()} disabled={isSavingSharedView}>
                <Save className="h-3.5 w-3.5" />
                {isSavingSharedView ? "Saving..." : "Save shared view"}
              </Button>
            </div>

            <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Browser-only views</p>
                {savedViews.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No browser views yet.</p>
                ) : (
                  savedViews.map((view) => (
                    <div key={view.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border/60 px-3 py-2">
                      <div className="min-w-0">
                        <button
                          type="button"
                          onClick={() => applySavedView(view)}
                          className={cn(
                            "text-left text-sm font-medium",
                            activeSavedViewId === view.id ? "text-primary" : "text-foreground",
                          )}
                        >
                          {view.name}
                        </button>
                        <p className="text-xs text-muted-foreground">Saved {new Date(view.createdAt).toLocaleString()}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Badge variant="outline">{rangeLabel[view.range]}</Badge>
                        <Button type="button" variant="ghost" size="sm" className="h-7 px-2" onClick={() => renameSavedView(view.id)}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button type="button" variant="ghost" size="sm" className="h-7 px-2" onClick={() => duplicateSavedView(view)}>
                          <Copy className="h-3.5 w-3.5" />
                        </Button>
                        <Button type="button" variant="ghost" size="sm" className="h-7 px-2" onClick={() => deleteSavedView(view.id)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Team shared views</p>
                <div className="space-y-2">
                  <input
                    type="text"
                    value={sharedViewSearch}
                    onChange={(event) => setSharedViewSearch(event.target.value)}
                    placeholder="Search shared views"
                    className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm"
                  />
                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      type="button"
                      variant={sharedPinnedOnly ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        setSharedPinnedOnly((current) => !current);
                        trackViewAction("toggle_pinned_filter", "shared", undefined, { next_state: !sharedPinnedOnly });
                      }}
                    >
                      Pinned
                    </Button>
                    <Button
                      type="button"
                      variant={sharedTagFilter === null ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSharedTagFilter(null)}
                    >
                      All tags
                    </Button>
                    {sharedTagOptions.map((tag) => (
                      <Button
                        key={tag}
                        type="button"
                        variant={sharedTagFilter === tag ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSharedTagFilter((current) => current === tag ? null : tag)}
                      >
                        {tag}
                      </Button>
                    ))}
                  </div>
                </div>
                {isSharedViewsLoading ? (
                  <p className="text-sm text-muted-foreground">Loading shared views...</p>
                ) : filteredSharedViews.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No shared views yet.</p>
                ) : (
                  filteredSharedViews.map((view) => (
                    <div key={view.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border/60 px-3 py-2">
                      <div className="min-w-0">
                        <button
                          type="button"
                          onClick={() => applySharedView(view)}
                          className={cn(
                            "text-left text-sm font-medium",
                            activeSharedViewId === view.id ? "text-primary" : "text-foreground",
                          )}
                        >
                          {view.name}
                        </button>
                        <p className="text-xs text-muted-foreground">
                          Owner: {view.createdByName || "Unknown"}
                          {view.updatedAt ? ` • Updated ${new Date(view.updatedAt).toLocaleString()}` : ""}
                        </p>
                        {(view.tags || []).length > 0 && (
                          <div className="mt-1 flex flex-wrap gap-1">
                            {(view.tags || []).map((tag) => (
                              <Badge key={`${view.id}-${tag}`} variant="secondary" className="px-2 py-0 text-[10px]">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        {view.pinned && <Badge variant="secondary">Pinned</Badge>}
                        <Badge variant="outline">{rangeLabel[view.range]}</Badge>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2"
                          onClick={() => void toggleSharedViewPin(view.id)}
                          disabled={isDeletingSharedViewId === view.id || !canManageSharedView(view)}
                        >
                          {view.pinned ? "Unpin" : "Pin"}
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2"
                          onClick={() => void renameSharedView(view.id)}
                          disabled={isDeletingSharedViewId === view.id || !canManageSharedView(view)}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2"
                          onClick={() => void duplicateSharedView(view)}
                          disabled={isSavingSharedView}
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2"
                          onClick={() => void deleteSharedView(view.id)}
                          disabled={isDeletingSharedViewId === view.id || !canManageSharedView(view)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Saved View Usage ({rangeLabel[range]})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <div className="rounded-lg border border-border/60 px-3 py-2">
                <p className="text-xs text-muted-foreground">Total actions</p>
                <p className="text-xl font-bold text-foreground">{actionSummary.total}</p>
              </div>
              <div className="rounded-lg border border-border/60 px-3 py-2">
                <p className="text-xs text-muted-foreground">Apply actions</p>
                <p className="text-xl font-bold text-foreground">{actionSummary.applyActions}</p>
              </div>
              <div className="rounded-lg border border-border/60 px-3 py-2">
                <p className="text-xs text-muted-foreground">Save and duplicate</p>
                <p className="text-xl font-bold text-foreground">{actionSummary.saveActions}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Top actions</p>
                {actionSummary.topActions.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No usage events in current range.</p>
                ) : (
                  actionSummary.topActions.map(([action, count]) => (
                    <div key={action} className="flex items-center justify-between rounded-lg border border-border/60 px-3 py-2">
                      <span className="text-sm text-foreground">{action}</span>
                      <Badge variant="secondary">{count}</Badge>
                    </div>
                  ))
                )}
              </div>

              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Top used views</p>
                {actionSummary.topViews.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No view usage captured yet.</p>
                ) : (
                  actionSummary.topViews.map(([viewName, count]) => (
                    <div key={viewName} className="flex items-center justify-between rounded-lg border border-border/60 px-3 py-2">
                      <span className="truncate pr-3 text-sm text-foreground">{viewName}</span>
                      <Badge variant="secondary">{count}</Badge>
                    </div>
                  ))
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {showWarningBanner && (
          <div className="flex items-start justify-between gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 text-amber-600" />
              <div>
                <p className="font-semibold text-foreground">Feed error volume needs review</p>
                <p className="text-sm text-muted-foreground">
                  {status500Count > 0
                    ? `${status500Count} server-side failures detected in the current view.`
                    : `${filteredRows.length} feed failures recorded in the current view.`}
                </p>
              </div>
            </div>
            {(filters.scope || filters.kind || filters.status || filters.page || filters.userId) && (
              <Button type="button" variant="outline" size="sm" onClick={clearFilters}>Clear filters</Button>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="flex items-center gap-3 p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <Activity className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{summary.total}</p>
                <p className="text-xs text-muted-foreground">Errors ({rangeLabel[range]})</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-3 p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/10">
                <ShieldAlert className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{summary.uniqueKinds}</p>
                <p className="text-xs text-muted-foreground">Distinct Error Kinds</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-3 p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/10">
                <AlertTriangle className="h-5 w-5 text-sky-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{summary.uniqueScopes}</p>
                <p className="text-xs text-muted-foreground">Affected Feed Scopes</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
          {scopeHealthCards.map((card) => (
            <Card key={card.scope}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{card.scope}</p>
                    <p className="mt-1 text-2xl font-bold text-foreground">{card.current}</p>
                    <p className="text-xs text-muted-foreground">Previous window: {card.previous}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge variant={getScopeSeverity(card.current, card.deltaPct).variant}>
                      {getScopeSeverity(card.current, card.deltaPct).label}
                    </Badge>
                    <Badge variant={card.deltaPct !== null && card.deltaPct > 0 ? "destructive" : "secondary"}>
                      {card.deltaPct === null ? "n/a" : `${card.deltaPct > 0 ? "+" : ""}${card.deltaPct}%`}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.7fr_1fr]">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Error Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={timelineData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                    <XAxis dataKey="label" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis allowDecimals={false} tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: 12,
                      }}
                    />
                    <Area type="monotone" dataKey="errors" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.18} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Top Scopes by Volume</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={scopeChartData} layout="vertical" margin={{ top: 8, right: 12, left: 20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                    <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis dataKey="scope" type="category" width={120} tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: 12,
                      }}
                    />
                    <Bar dataKey="errors" fill="hsl(var(--primary))" radius={[6, 6, 6, 6]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="px-3 py-1 text-xs">
            Showing {filteredRows.length} of {rows.length}
          </Badge>
          {filters.scope && <Badge variant="secondary" className="px-3 py-1 text-xs">Scope: {filters.scope}</Badge>}
          {filters.kind && <Badge variant="secondary" className="px-3 py-1 text-xs">Kind: {filters.kind}</Badge>}
          {filters.status && <Badge variant="secondary" className="px-3 py-1 text-xs">Status: {filters.status}</Badge>}
          {filters.page && <Badge variant="secondary" className="px-3 py-1 text-xs">Page: {filters.page}</Badge>}
          {filters.userId && <Badge variant="secondary" className="px-3 py-1 text-xs">User: {filters.userId}</Badge>}
          {(filters.scope || filters.kind || filters.status || filters.page || filters.userId) && (
            <Button type="button" variant="ghost" size="sm" onClick={clearFilters}>Clear all filters</Button>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Top Failing Pages</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {topPages.length === 0 ? (
                <p className="text-sm text-muted-foreground">No page data in current view.</p>
              ) : topPages.map(([page, count]) => (
                <button
                  key={page}
                  type="button"
                  onClick={() => applyFilter({ page: filters.page === page ? null : page })}
                  className={cn(
                    "flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left transition-colors",
                    filters.page === page
                      ? "border-primary bg-primary/5"
                      : "border-border/60 hover:bg-muted/40",
                  )}
                >
                  <span className="truncate pr-3 text-sm text-foreground">{page}</span>
                  <Badge variant="secondary">{count}</Badge>
                </button>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Top Affected Users</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {topUsers.length === 0 ? (
                <p className="text-sm text-muted-foreground">No user data in current view.</p>
              ) : topUsers.map(([userId, count]) => (
                <button
                  key={userId}
                  type="button"
                  onClick={() => applyFilter({ userId: filters.userId === userId ? null : userId })}
                  className={cn(
                    "flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left transition-colors",
                    filters.userId === userId
                      ? "border-primary bg-primary/5"
                      : "border-border/60 hover:bg-muted/40",
                  )}
                >
                  <span className="flex min-w-0 items-center gap-2 truncate pr-3 text-sm text-foreground">
                    <User className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    <span className="truncate">{userId}</span>
                  </span>
                  <Badge variant="secondary">{count}</Badge>
                </button>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Top Scopes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {summary.topScopes.length === 0 ? (
                <p className="text-sm text-muted-foreground">No data in selected range.</p>
              ) : (
                summary.topScopes.map(([scope, count]) => (
                  <button
                    key={scope}
                    type="button"
                    onClick={() => applyFilter({ scope: filters.scope === scope ? null : scope })}
                    className={cn(
                      "flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left transition-colors",
                      filters.scope === scope
                        ? "border-primary bg-primary/5"
                        : "border-border/60 hover:bg-muted/40",
                    )}
                  >
                    <span className="text-sm font-medium text-foreground">{scope}</span>
                    <Badge variant="secondary">{count}</Badge>
                  </button>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Top Error Kinds</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {summary.topKinds.length === 0 ? (
                <p className="text-sm text-muted-foreground">No data in selected range.</p>
              ) : (
                summary.topKinds.map(([kind, count]) => (
                  <button
                    key={kind}
                    type="button"
                    onClick={() => applyFilter({ kind: filters.kind === kind ? null : kind })}
                    className={cn(
                      "flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left transition-colors",
                      filters.kind === kind
                        ? "border-primary bg-primary/5"
                        : "border-border/60 hover:bg-muted/40",
                    )}
                  >
                    <span className="text-sm font-medium text-foreground">{kind}</span>
                    <Badge variant="secondary">{count}</Badge>
                  </button>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Top Status Codes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {summary.topStatuses.length === 0 ? (
                <p className="text-sm text-muted-foreground">No data in selected range.</p>
              ) : (
                summary.topStatuses.map(([status, count]) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => applyFilter({ status: filters.status === status ? null : status })}
                    className={cn(
                      "flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left transition-colors",
                      filters.status === status
                        ? "border-primary bg-primary/5"
                        : "border-border/60 hover:bg-muted/40",
                    )}
                  >
                    <span className="text-sm font-medium text-foreground">{status}</span>
                    <Badge variant="secondary">{count}</Badge>
                  </button>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Feed Errors</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-sm text-muted-foreground">Loading diagnostics…</p>
            ) : filteredRows.length === 0 ? (
              <p className="text-sm text-muted-foreground">No feed query errors captured in {rangeLabel[range].toLowerCase()}.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
                      <th className="px-2 py-2">Detail</th>
                      <th className="px-2 py-2">Time</th>
                      <th className="px-2 py-2">Scope</th>
                      <th className="px-2 py-2">Kind</th>
                      <th className="px-2 py-2">Status</th>
                      <th className="px-2 py-2">Page</th>
                      <th className="px-2 py-2">Message</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRows.slice(0, 60).map((row) => {
                      const meta = asMeta(row.meta);
                      const isExpanded = expandedRows.has(row.id);
                      const rowPage = row.page || "unknown";
                      const rowUserId = asText(meta.user_id, "anonymous");
                      return (
                        <Fragment key={row.id}>
                          <tr className="border-b border-border/40 align-top">
                            <td className="px-2 py-2">
                              <button
                                type="button"
                                onClick={() => toggleExpandedRow(row.id)}
                                className="rounded-md p-1 hover:bg-muted"
                                aria-label={isExpanded ? "Collapse row details" : "Expand row details"}
                              >
                                {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                              </button>
                            </td>
                            <td className="px-2 py-2 whitespace-nowrap text-muted-foreground">
                              {new Date(row.created_at).toLocaleString()}
                            </td>
                            <td className="px-2 py-2">{asText(meta.scope)}</td>
                            <td className="px-2 py-2">{asText(meta.error_kind)}</td>
                            <td className="px-2 py-2">{asText(meta.error_status)}</td>
                            <td className="px-2 py-2 text-muted-foreground">{row.page || "-"}</td>
                            <td className="px-2 py-2 max-w-[420px] truncate" title={asText(meta.error_message, "")}>{asText(meta.error_message, "-")}</td>
                          </tr>
                          {isExpanded && (
                            <tr className="border-b border-border/40 bg-muted/20 align-top">
                              <td colSpan={7} className="px-4 py-3">
                                <div className="grid gap-3 lg:grid-cols-[1fr_1.2fr]">
                                  <div className="space-y-3 text-sm">
                                    <div className="flex flex-wrap gap-2">
                                      <Button type="button" variant="outline" size="sm" onClick={() => applyFilter({ scope: asText(meta.scope) })}>Scope: {asText(meta.scope)}</Button>
                                      <Button type="button" variant="outline" size="sm" onClick={() => applyFilter({ kind: asText(meta.error_kind) })}>Kind: {asText(meta.error_kind)}</Button>
                                      <Button type="button" variant="outline" size="sm" onClick={() => applyFilter({ status: asText(meta.error_status) })}>Status: {asText(meta.error_status)}</Button>
                                      <Button type="button" variant="outline" size="sm" onClick={() => applyFilter({ page: rowPage })}>Page: {rowPage}</Button>
                                      <Button type="button" variant="outline" size="sm" onClick={() => applyFilter({ userId: rowUserId })}>User: {rowUserId}</Button>
                                    </div>
                                    <div className="flex items-center justify-between gap-3 rounded-lg border border-border/60 px-3 py-2">
                                      <span className="text-muted-foreground">User ID</span>
                                      <span className="truncate text-right text-foreground">{rowUserId}</span>
                                    </div>
                                    <div className="flex items-center justify-between gap-3 rounded-lg border border-border/60 px-3 py-2">
                                      <span className="text-muted-foreground">Tab</span>
                                      <span className="text-foreground">{asText(meta.tab, "-")}</span>
                                    </div>
                                    <div className="flex items-center justify-between gap-3 rounded-lg border border-border/60 px-3 py-2">
                                      <span className="text-muted-foreground">Page Size</span>
                                      <span className="text-foreground">{asText(meta.page_size, "-")}</span>
                                    </div>
                                    <div className="flex items-center justify-between gap-3 rounded-lg border border-border/60 px-3 py-2">
                                      <span className="text-muted-foreground">Page Multiplier</span>
                                      <span className="text-foreground">{asText(meta.page_multiplier, "-")}</span>
                                    </div>
                                  </div>
                                  <div>
                                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Raw Event</p>
                                    <pre className="max-h-64 overflow-auto rounded-xl border border-border/60 bg-background p-3 text-xs text-foreground">{JSON.stringify({
                                      id: row.id,
                                      created_at: row.created_at,
                                      page: row.page,
                                      meta,
                                    }, null, 2)}</pre>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
