/**
 * Safe-Area QA Checklist
 *
 * Manual verification page for safe-area handling on iPhone.
 * Route: /dev/qa/safe-area
 *
 * See: docs/dev/capacitor-safe-area.md
 */
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Capacitor } from "@capacitor/core";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Copy, Eye, EyeOff, ExternalLink } from "lucide-react";
import { toast } from "sonner";

const OVERLAY_KEY = "zivo:debug:safe-area";
const RESULTS_KEY = "zivo:debug:safe-area-qa-results";

type Row = {
  id: string;
  page: string;
  route: string;
  check: string;
};

const DEVICES = [
  { id: "se", label: "iPhone SE (375×667)" },
  { id: "13", label: "iPhone 13 (390×844)" },
  { id: "15pm", label: "iPhone 15 Pro Max (430×932)" },
] as const;

const ROWS: Row[] = [
  { id: "profile-top", page: "Profile", route: "/profile", check: "No white gap above header; flush with status bar" },
  { id: "account-top", page: "Account", route: "/account", check: "No white gap above header; flush with status bar" },
  { id: "chat-top", page: "Chat", route: "/chat", check: "Header sits flush with status bar" },
  { id: "home-top", page: "Home", route: "/", check: "Status bar overlay does not cover content" },
  { id: "nav-bottom", page: "Bottom Nav", route: "/", check: "Bottom nav clears the home indicator" },
  { id: "menu-sheet", page: "Mobile Menu", route: "/account", check: "Side menu footer clears home indicator" },
];

function readInset(side: "top" | "bottom"): number {
  if (typeof window === "undefined") return 0;
  const probe = document.createElement("div");
  probe.style.position = "fixed";
  probe.style.visibility = "hidden";
  probe.style.height = `env(safe-area-inset-${side}, 0px)`;
  document.body.appendChild(probe);
  const px = probe.getBoundingClientRect().height;
  probe.remove();
  return Math.round(px);
}

const SafeAreaQAPage = () => {
  const navigate = useNavigate();
  const [results, setResults] = useState<Record<string, boolean>>({});
  const [overlayOn, setOverlayOn] = useState(false);
  const [insets, setInsets] = useState({ top: 0, bottom: 0 });

  useEffect(() => {
    try {
      const raw = localStorage.getItem(RESULTS_KEY);
      if (raw) setResults(JSON.parse(raw));
      setOverlayOn(localStorage.getItem(OVERLAY_KEY) === "1");
    } catch {
      /* ignore */
    }
    setInsets({ top: readInset("top"), bottom: readInset("bottom") });
  }, []);

  const platform = useMemo(() => {
    const native = Capacitor.isNativePlatform?.() ?? false;
    const p = Capacitor.getPlatform?.() ?? "web";
    return { native, name: p };
  }, []);

  const expected = useMemo(() => {
    if (platform.native && platform.name === "ios")
      return "Capacitor iOS: top should be 0 (overlaysWebView: false). Bottom > 0 on notched devices.";
    if (platform.native && platform.name === "android")
      return "Capacitor Android: top and bottom typically 0; native bars handled by shell.";
    if (platform.name === "web")
      return "Web/PWA: top > 0 only when running as installed PWA on notched iPhone.";
    return "Unknown platform.";
  }, [platform]);

  const toggleResult = (key: string) => {
    setResults((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      try {
        localStorage.setItem(RESULTS_KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  };

  const toggleOverlay = () => {
    const next = !overlayOn;
    try {
      localStorage.setItem(OVERLAY_KEY, next ? "1" : "0");
      // Notify listeners (storage event doesn't fire in same tab)
      window.dispatchEvent(new StorageEvent("storage", { key: OVERLAY_KEY, newValue: next ? "1" : "0" }));
    } catch {
      /* ignore */
    }
    setOverlayOn(next);
  };

  const total = ROWS.length * DEVICES.length;
  const checked = Object.values(results).filter(Boolean).length;

  const exportMarkdown = async () => {
    const lines: string[] = [];
    lines.push(`# Safe-Area QA — ${new Date().toISOString().slice(0, 10)}`);
    lines.push("");
    lines.push(`Platform: \`${platform.name}\` (native=${platform.native})`);
    lines.push(`Live insets: top=${insets.top}px, bottom=${insets.bottom}px`);
    lines.push(`Result: ${checked}/${total} passing`);
    lines.push("");
    lines.push("| Page | Check | " + DEVICES.map((d) => d.label).join(" | ") + " |");
    lines.push("|------|-------|" + DEVICES.map(() => "---").join("|") + "|");
    for (const r of ROWS) {
      const cells = DEVICES.map((d) => (results[`${r.id}:${d.id}`] ? "✅" : "⬜"));
      lines.push(`| ${r.page} | ${r.check} | ${cells.join(" | ")} |`);
    }
    const md = lines.join("\n");
    try {
      await navigator.clipboard.writeText(md);
      toast.success("QA report copied to clipboard");
    } catch {
      toast.error("Could not copy — open console");
      console.log(md);
    }
  };

  return (
    <div className="min-h-screen bg-background safe-area-top">
      <header className="sticky top-0 z-10 bg-background/90 backdrop-blur border-b border-border">
        <div className="flex items-center gap-2 px-4 py-3 max-w-3xl mx-auto">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} aria-label="Back">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-lg font-semibold">Safe-Area QA</h1>
            <p className="text-xs text-muted-foreground">
              {checked}/{total} checks passing · {platform.name}
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={exportMarkdown}>
            <Copy className="h-4 w-4 mr-1" /> Export
          </Button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-4 pb-safe space-y-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Live values</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">top: {insets.top}px</Badge>
              <Badge variant="secondary">bottom: {insets.bottom}px</Badge>
              <Badge variant="outline">{platform.name}{platform.native ? " (native)" : ""}</Badge>
            </div>
            <p className="text-xs text-muted-foreground">{expected}</p>
            <Button
              variant={overlayOn ? "default" : "outline"}
              size="sm"
              onClick={toggleOverlay}
              className="mt-2"
            >
              {overlayOn ? <EyeOff className="h-4 w-4 mr-1" /> : <Eye className="h-4 w-4 mr-1" />}
              {overlayOn ? "Hide overlay" : "Show overlay"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Checklist</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {ROWS.map((row) => (
              <div key={row.id} className="space-y-2 pb-3 border-b border-border last:border-0 last:pb-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-medium text-sm">{row.page}</div>
                    <div className="text-xs text-muted-foreground">{row.check}</div>
                  </div>
                  <Button asChild variant="ghost" size="sm">
                    <Link to={row.route}>
                      Open <ExternalLink className="h-3 w-3 ml-1" />
                    </Link>
                  </Button>
                </div>
                <div className="flex flex-wrap gap-3 pt-1">
                  {DEVICES.map((d) => {
                    const key = `${row.id}:${d.id}`;
                    return (
                      <label key={d.id} className="flex items-center gap-2 text-xs cursor-pointer">
                        <Checkbox
                          checked={!!results[key]}
                          onCheckedChange={() => toggleResult(key)}
                        />
                        {d.label}
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <p className="text-xs text-muted-foreground">
          Reference:{" "}
          <a className="underline" href="/docs/dev/capacitor-safe-area.md">
            docs/dev/capacitor-safe-area.md
          </a>
        </p>
      </main>
    </div>
  );
};

export default SafeAreaQAPage;
