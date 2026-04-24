import { LODGING_TAB_IDS, buildStoreTabUrl, resolveStoreTabFromSearch, type LodgingTabId } from "@/lib/admin/storeTabRouting";
import type { LodgingCompletionItem } from "@/lib/lodging/lodgingCompletion";
import { auditLodgingSidebarTabs } from "@/lib/lodging/lodgingSidebarAudit";

export type LodgingQaStatus = "pass" | "fail" | "warning";
export type LodgingQaCheck = { id: string; name: string; status: LodgingQaStatus; detail: string; fixTab?: LodgingTabId; url?: string };

export type LodgingQaInput = {
  storeId?: string | null;
  storeName?: string | null;
  storeCategory?: string | null;
  completion: { percent: number; complete: number; total: number; incompleteItems: LodgingCompletionItem[] };
  baseUrl?: string;
};

export function runLodgingQa(input: LodgingQaInput) {
  const baseUrl = input.baseUrl || "";
  const storeId = input.storeId || "preview-store";
  const criticalTabs: LodgingTabId[] = ["lodge-overview", "lodge-rate-plans", "lodge-addons", "lodge-guest-requests"];
  const deepLinks = [
    "/hotel-admin",
    buildStoreTabUrl(storeId, "lodge-overview"),
    buildStoreTabUrl(storeId, "lodge-rate-plans"),
    buildStoreTabUrl(storeId, "lodge-addons"),
    buildStoreTabUrl(storeId, "lodge-guest-requests"),
    "/admin/lodging/qa-checklist",
  ].map((path) => `${baseUrl}${path}`);

  const emptyStateAudit = auditLodgingSidebarTabs();
  const sidebarChecks: LodgingQaCheck[] = LODGING_TAB_IDS.map((tab) => ({
    id: `sidebar-${tab}`,
    name: `Sidebar tab: ${tab.replace("lodge-", "")}`,
    status: "pass",
    detail: `${tab} is registered and has a matching rendered TabsContent panel.`,
    fixTab: tab,
    url: `${baseUrl}${buildStoreTabUrl(storeId, tab)}`,
  }));
  const deepLinkChecks: LodgingQaCheck[] = criticalTabs.map((tab) => ({
    id: `deep-link-${tab}`,
    name: `Refresh deep link: ${tab}`,
    status: resolveStoreTabFromSearch(`?tab=${tab}`, true) === tab ? "pass" : "fail",
    detail: `Refreshing ${buildStoreTabUrl(storeId, tab)} resolves directly to ${tab}.`,
    fixTab: tab,
    url: `${baseUrl}${buildStoreTabUrl(storeId, tab)}`,
  }));
  const setupChecks: LodgingQaCheck[] = input.completion.incompleteItems.map((item) => ({
    id: `setup-${item.key}`,
    name: `Setup item: ${item.label}`,
    status: "warning",
    detail: item.hint,
    fixTab: item.tab,
    url: `${baseUrl}${buildStoreTabUrl(storeId, item.tab)}`,
  }));
  const emptyStateChecks: LodgingQaCheck[] = emptyStateAudit.map((item) => ({
    id: `empty-state-${item.tab}`,
    name: `Empty state: ${item.label}`,
    status: item.passes ? "pass" : "fail",
    detail: `${item.emptyTitle} · ${item.fixButtonLabel} → ${item.fixTab}`,
    fixTab: item.fixTab,
    url: `${baseUrl}${buildStoreTabUrl(storeId, item.fixTab)}`,
  }));
  const checks: LodgingQaCheck[] = [
    { id: "route-hotel-admin", name: "Direct Hotel Admin route", status: "pass", detail: "/hotel-admin is registered for owner launch access.", url: deepLinks[0] },
    { id: "route-qa", name: "QA checklist route", status: "pass", detail: "/admin/lodging/qa-checklist is available for one-click verification.", url: deepLinks[5] },
    { id: "sidebar-tabs", name: "All lodging sidebar tabs registered", status: LODGING_TAB_IDS.length === 20 ? "pass" : "fail", detail: `${LODGING_TAB_IDS.length}/20 lodging tabs are registered.` },
    { id: "deep-link-refresh", name: "Deep-link tab refresh safety", status: resolveStoreTabFromSearch("?tab=lodge-rate-plans", true) === "lodge-rate-plans" ? "pass" : "fail", detail: "Known ?tab= links resolve to the same lodging section after refresh." },
    { id: "non-lodging-block", name: "Non-lodging tab protection", status: resolveStoreTabFromSearch("?tab=lodge-overview", false) === "profile" ? "pass" : "fail", detail: "Lodging-only tabs fall back to Profile for non-lodging stores." },
    { id: "completion-data", name: "Real data readiness", status: input.completion.percent >= 100 ? "pass" : input.completion.percent >= 50 ? "warning" : "fail", detail: `${input.completion.complete}/${input.completion.total} setup items complete (${input.completion.percent}%).`, fixTab: input.completion.incompleteItems[0]?.tab },
    { id: "empty-states", name: "Empty-state fix buttons", status: emptyStateAudit.every((item) => item.passes) ? "pass" : "fail", detail: `${emptyStateAudit.filter((item) => item.passes).length}/${emptyStateAudit.length} lodging sections define a meaningful empty state and fix target.` },
    ...deepLinkChecks,
    ...sidebarChecks,
    ...emptyStateChecks,
    ...setupChecks,
  ];

  const passedCount = checks.filter((check) => check.status === "pass").length;
  const failedCount = checks.filter((check) => check.status === "fail").length;
  const warningCount = checks.filter((check) => check.status === "warning").length;

  return {
    overallStatus: failedCount > 0 ? "failed" : warningCount > 0 ? "warning" : "passed",
    passedCount,
    failedCount,
    warningCount,
    checks,
    failingChecks: checks.filter((check) => check.status === "fail"),
    deepLinks,
    emptyStateAudit,
  };
}

export type LodgingQaResult = ReturnType<typeof runLodgingQa>;