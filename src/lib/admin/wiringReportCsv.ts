/**
 * wiringReportCsv — Build + download a CSV snapshot of a lodging wiring report.
 * Excel-friendly: UTF-8 BOM prefix, CRLF line endings, RFC4180-quoted fields.
 */
export interface WiringCheck {
  id?: string;
  group: string;
  name: string;
  pass: boolean;
  severity?: string;
  message?: string;
  fix?: string;
  failing_query?: string;
  editor_url?: string;
}

export interface WiringReport {
  ran_at?: string;
  generated_at?: string;
  pass_count?: number;
  fail_count?: number;
  checks: WiringCheck[];
}

const escape = (v: unknown): string => {
  const s = v == null ? "" : String(v);
  if (/[",\r\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
};

const pad = (n: number) => String(n).padStart(2, "0");
const stamp = (d: Date) =>
  `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}`;

export function buildWiringReportCsv(report: WiringReport): string {
  const ranAt = report.ran_at || report.generated_at || new Date().toISOString();
  const headers = [
    "run_at_iso",
    "group",
    "check_id",
    "name",
    "pass",
    "severity",
    "message",
    "fix_sql",
    "failing_query",
  ];
  const rows = (report.checks || []).map((c) =>
    [
      ranAt,
      c.group,
      c.id || "",
      c.name,
      c.pass ? "PASS" : "FAIL",
      c.severity || "",
      c.message || "",
      c.fix || "",
      c.failing_query || "",
    ].map(escape).join(",")
  );
  return "\uFEFF" + [headers.join(","), ...rows].join("\r\n");
}

export function downloadWiringReportCsv(report: WiringReport): void {
  const csv = buildWiringReportCsv(report);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const ts = stamp(new Date(report.ran_at || report.generated_at || Date.now()));
  a.href = url;
  a.download = `lodging-wiring-report-${ts}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
