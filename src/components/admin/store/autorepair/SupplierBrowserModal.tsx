/**
 * SupplierBrowserModal — In-app webview for parts suppliers.
 *
 * Most supplier sites (AutoZone, NAPA, etc.) send X-Frame-Options: DENY or
 * frame-ancestors CSP that blocks <iframe> embedding. We attempt to embed,
 * detect failure via a load-timeout heuristic, and fall back to a friendly
 * "Open in new tab" panel. We also offer optional credential storage per
 * (store, supplier) so users can keep their account info handy.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import ExternalLink from "lucide-react/dist/esm/icons/external-link";
import RefreshCw from "lucide-react/dist/esm/icons/refresh-cw";
import KeyRound from "lucide-react/dist/esm/icons/key-round";
import ShieldAlert from "lucide-react/dist/esm/icons/shield-alert";
import Eye from "lucide-react/dist/esm/icons/eye";
import EyeOff from "lucide-react/dist/esm/icons/eye-off";
import Copy from "lucide-react/dist/esm/icons/copy";
import Check from "lucide-react/dist/esm/icons/check";
import Wand2 from "lucide-react/dist/esm/icons/wand-2";
import Info from "lucide-react/dist/esm/icons/info";
import PartsSupplierLogo from "./PartsSupplierLogo";
import { type PartsSupplier, getSupplierSearchUrl } from "@/config/partsSuppliers";

interface Props {
  storeId: string;
  supplier: PartsSupplier | null;
  query?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type SavedCreds = { email: string; password: string; updatedAt: string };
type BrowserIssue = "not-allowed" | "blocked" | null;

const credKey = (storeId: string, supplierId: string) =>
  `zivo.supplierCreds.${storeId}.${supplierId}`;

function loadCreds(storeId: string, supplierId: string): SavedCreds | null {
  try {
    const raw = localStorage.getItem(credKey(storeId, supplierId));
    return raw ? (JSON.parse(raw) as SavedCreds) : null;
  } catch {
    return null;
  }
}

function saveCreds(storeId: string, supplierId: string, creds: SavedCreds) {
  localStorage.setItem(credKey(storeId, supplierId), JSON.stringify(creds));
}

function clearCreds(storeId: string, supplierId: string) {
  localStorage.removeItem(credKey(storeId, supplierId));
}

export default function SupplierBrowserModal({ storeId, supplier, query, open, onOpenChange }: Props) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [browserIssue, setBrowserIssue] = useState<BrowserIssue>(null);
  const [iframeLoading, setIframeLoading] = useState(true);
  const [iframeDoc, setIframeDoc] = useState<string | null>(null);
  const [frameKey, setFrameKey] = useState(0);
  const [showCreds, setShowCreds] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [copied, setCopied] = useState<"email" | "password" | null>(null);

  const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;

  const targetUrl = useMemo(() => {
    if (!supplier?.domain) return null;
    return (query && getSupplierSearchUrl(supplier, query)) || supplier.portalUrl || `https://${supplier.domain}`;
  }, [supplier, query]);

  // Route through our edge proxy that strips X-Frame-Options / CSP frame-ancestors
  const proxiedUrl = useMemo(() => {
    if (!targetUrl) return null;
    return `${SUPABASE_URL}/functions/v1/supplier-proxy?u=${encodeURIComponent(targetUrl)}`;
  }, [targetUrl, SUPABASE_URL]);

  // Load saved credentials whenever supplier changes / dialog opens
  useEffect(() => {
    if (!open || !supplier) return;
    const existing = loadCreds(storeId, supplier.id);
    setEmail(existing?.email ?? "");
    setPassword(existing?.password ?? "");
    setShowCreds(!!existing);
    setShowPwd(false);
    setBrowserIssue(null);
    setIframeLoading(true);
    setIframeDoc(null);
  }, [open, supplier, storeId]);

  const loadProxyPage = useCallback(async (url: string, init?: RequestInit) => {
    setIframeLoading(true);
    setBrowserIssue(null);
    try {
      let res: Response;
      try {
        res = await fetch(url, { credentials: "include", ...init });
      } catch {
        res = await fetch(url, { credentials: "omit", ...init });
      }
      const html = await res.text();
      if (!res.ok) {
        setIframeDoc(null);
        setBrowserIssue(res.status === 403 ? "not-allowed" : "blocked");
        return;
      }
      setIframeDoc(html);
      setFrameKey((k) => k + 1);
    } catch {
      setIframeDoc(null);
      setBrowserIssue("blocked");
    } finally {
      setIframeLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!open || !proxiedUrl) return;
    loadProxyPage(proxiedUrl);
  }, [open, proxiedUrl, loadProxyPage]);

  useEffect(() => {
    if (!open) return;
    const handleMessage = (event: MessageEvent) => {
      const data = event.data as { type?: string; url?: string; method?: string; body?: string; contentType?: string };
      if (data?.type !== "zivo-supplier-navigate" || !data.url) return;
      try {
        const next = new URL(data.url);
        const allowedProxy = new URL(`${SUPABASE_URL}/functions/v1/supplier-proxy`);
        if (next.host !== allowedProxy.host || next.pathname !== allowedProxy.pathname) return;
        const method = data.method?.toUpperCase() || "GET";
        loadProxyPage(data.url, method === "GET" ? undefined : {
          method,
          headers: { "Content-Type": data.contentType || "application/x-www-form-urlencoded" },
          body: data.body || "",
        });
      } catch {
        // Ignore messages from non-supplier frames.
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [open, SUPABASE_URL, loadProxyPage]);

  if (!supplier) return null;

  const handleSaveCreds = () => {
    if (!email.trim()) {
      toast.error("Email is required");
      return;
    }
    saveCreds(storeId, supplier.id, {
      email: email.trim(),
      password,
      updatedAt: new Date().toISOString(),
    });
    toast.success(`${supplier.shortName ?? supplier.name} account saved`);
    setShowCreds(false);
    if (proxiedUrl) loadProxyPage(proxiedUrl);
  };

  const handleClearCreds = () => {
    clearCreds(storeId, supplier.id);
    setEmail("");
    setPassword("");
    toast.success("Account cleared");
  };

  const copyToClipboard = async (value: string, kind: "email" | "password") => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(kind);
      window.setTimeout(() => setCopied(null), 1500);
    } catch {
      toast.error("Could not copy");
    }
  };

  const reload = () => {
    if (proxiedUrl) loadProxyPage(proxiedUrl);
  };

  const issueTitle = browserIssue === "not-allowed"
    ? `${supplier.shortName ?? supplier.name} portal needs setup`
    : `${supplier.name} is a trade portal`;
  const issueCopy = browserIssue === "not-allowed"
    ? "This portal URL is not allowlisted for the embedded browser yet. You can still open the supplier portal in a new tab."
    : "This supplier blocked the embedded session. Try reload, or use New tab if the supplier requires a full browser session.";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl w-[95vw] h-[88vh] p-0 overflow-hidden flex flex-col">
        <DialogHeader className="px-4 py-3 border-b shrink-0">
          <DialogTitle className="flex items-center gap-2.5 text-sm font-semibold">
            <PartsSupplierLogo supplier={supplier} size="md" />
            <div className="flex-1 min-w-0">
              <p className="truncate">{supplier.name}</p>
              <p className="text-[11px] font-normal text-muted-foreground truncate">
                {supplier.domain} · {supplier.category}
              </p>
            </div>
            <Badge variant="outline" className="text-[10px]">In-app browser</Badge>
            {supplier.consumerDomain && (
              <Button
                size="sm"
                variant="ghost"
                className="h-7 gap-1.5 text-xs"
                onClick={() => window.open(`https://${supplier.consumerDomain}`, "_blank", "noopener,noreferrer")}
                title="Open public consumer site"
              >
                Consumer site
              </Button>
            )}
            <Button
              size="sm"
              variant="outline"
              className="h-7 gap-1.5 text-xs"
              onClick={() => setShowCreds((s) => !s)}
            >
              <KeyRound className="w-3.5 h-3.5" /> Account
            </Button>
            <Button size="sm" variant="outline" className="h-7 w-7 p-0" onClick={reload} title="Reload">
              <RefreshCw className="w-3.5 h-3.5" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-7 gap-1.5 text-xs"
              onClick={() => targetUrl && window.open(targetUrl, "_blank", "noopener,noreferrer")}
            >
              <ExternalLink className="w-3.5 h-3.5" /> New tab
            </Button>
          </DialogTitle>
        </DialogHeader>

        {showCreds && (
          <div className="px-4 py-3 border-b bg-muted/30 space-y-2.5 shrink-0">
            <div className="flex items-start gap-2 text-[11px] text-muted-foreground">
              <ShieldAlert className="w-3.5 h-3.5 mt-0.5 shrink-0 text-amber-600" />
              <p>
                Credentials are stored <strong>locally on this device only</strong> (browser
                localStorage), never sent to Zivo servers. Use copy buttons to paste into the supplier login.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-[11px]">Account email / username</Label>
                <div className="flex gap-1.5">
                  <Input
                    className="h-8 text-xs"
                    type="email"
                    autoComplete="off"
                    placeholder={`your@${supplier.domain ?? "email.com"}`}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 w-8 p-0 shrink-0"
                    onClick={() => copyToClipboard(email, "email")}
                    disabled={!email}
                    title="Copy email"
                  >
                    {copied === "email" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </Button>
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-[11px]">Password</Label>
                <div className="flex gap-1.5">
                  <div className="relative flex-1">
                    <Input
                      className="h-8 text-xs pr-8"
                      type={showPwd ? "text" : "password"}
                      autoComplete="new-password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPwd((s) => !s)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      aria-label={showPwd ? "Hide password" : "Show password"}
                    >
                      {showPwd ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 w-8 p-0 shrink-0"
                    onClick={() => copyToClipboard(password, "password")}
                    disabled={!password}
                    title="Copy password"
                  >
                    {copied === "password" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </Button>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between gap-2 pt-1">
              <p className="text-[10px] text-muted-foreground">
                Saved per store + supplier. Clear anytime.
              </p>
              <div className="flex gap-1.5">
                <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={handleClearCreds}>
                  Clear
                </Button>
                <Button size="sm" className="h-7 text-xs" onClick={handleSaveCreds}>
                  Save & open
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className="flex-1 relative bg-muted/20 min-h-0">
          {iframeDoc && !browserIssue && (
            <iframe
              key={frameKey}
              ref={iframeRef}
              srcDoc={iframeDoc}
              title={supplier.name}
              className="absolute inset-0 w-full h-full bg-background"
              sandbox="allow-forms allow-popups allow-same-origin allow-scripts allow-top-navigation-by-user-activation"
              referrerPolicy="no-referrer"
              onLoad={() => setIframeLoading(false)}
              onError={() => setBrowserIssue("blocked")}
            />
          )}

          {iframeLoading && !browserIssue && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="flex items-center gap-2 text-xs text-muted-foreground bg-background/80 px-3 py-1.5 rounded-full border">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                Loading {supplier.shortName ?? supplier.name}…
              </div>
            </div>
          )}

          {browserIssue && (
            <div className="absolute inset-0 flex items-center justify-center p-6">
              <div className="max-w-md w-full text-center space-y-4 bg-background border rounded-2xl p-6 shadow-sm">
                <div className="mx-auto"><PartsSupplierLogo supplier={supplier} size="lg" /></div>
                <div>
                  <h3 className="text-base font-semibold">{issueTitle}</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {issueCopy}
                  </p>
                </div>
                <div className="flex gap-2 justify-center">
                  <Button size="sm" variant="outline" onClick={reload} className="gap-1.5">
                    <RefreshCw className="w-3.5 h-3.5" /> Reload here
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => targetUrl && window.open(targetUrl, "_blank", "noopener,noreferrer")}
                    className="gap-1.5"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> Open {supplier.shortName ?? supplier.name}
                  </Button>
                  {supplier.consumerDomain && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(`https://${supplier.consumerDomain}`, "_blank", "noopener,noreferrer")}
                      className="gap-1.5"
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> Consumer site
                    </Button>
                  )}
                  <Button size="sm" variant="outline" onClick={() => setShowCreds(true)} className="gap-1.5">
                    <KeyRound className="w-3.5 h-3.5" /> Manage account
                  </Button>
                </div>
                {query && (
                  <p className="text-[10px] text-muted-foreground">
                    Will search for: <span className="font-mono">{query}</span>
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
