/**
 * LinkedDevicesPage — list of devices currently signed in to this account.
 * Entry point for the multi-device QR flow (Link / Scan).
 */
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Smartphone, Monitor, Tablet, QrCode, ScanLine, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import SEOHead from "@/components/SEOHead";
import { useLinkedDevices } from "@/hooks/useLinkedDevices";
import { formatDistanceToNow } from "date-fns";

function deviceIcon(platform: string | null) {
  const p = (platform ?? "").toLowerCase();
  if (p.includes("ios") || p.includes("android")) return Smartphone;
  if (p.includes("ipad")) return Tablet;
  return Monitor;
}

export default function LinkedDevicesPage() {
  const navigate = useNavigate();
  const { devices, loading, removeDevice } = useLinkedDevices();

  return (
    <div className="min-h-screen bg-background">
      <SEOHead title="Linked Devices · ZIVO" description="Manage devices signed in to your ZIVO account." />

      <header
        className="sticky top-0 z-30 flex items-center gap-3 border-b border-border/40 bg-background/85 px-4 backdrop-blur-xl"
        style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 12px)", paddingBottom: 12 }}
      >
        <button
          aria-label="Back"
          onClick={() => navigate(-1)}
          className="-ml-2 rounded-full p-2 hover:bg-foreground/5"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-base font-semibold">Linked Devices</h1>
      </header>

      <main className="mx-auto w-full max-w-xl space-y-4 px-4 py-5 pb-24">
        <div className="grid grid-cols-2 gap-3">
          <Link to="/account/link-device" className="block">
            <Card className="border-primary/30 bg-primary/5 transition hover:bg-primary/10">
              <CardContent className="flex flex-col items-center gap-2 p-5 text-center">
                <QrCode className="h-7 w-7 text-primary" />
                <div className="text-sm font-semibold">Link a Device</div>
                <div className="text-[11px] text-muted-foreground">Show a QR code</div>
              </CardContent>
            </Card>
          </Link>
          <Link to="/account/scan-device" className="block">
            <Card className="transition hover:bg-foreground/5">
              <CardContent className="flex flex-col items-center gap-2 p-5 text-center">
                <ScanLine className="h-7 w-7 text-foreground/80" />
                <div className="text-sm font-semibold">Scan to Link</div>
                <div className="text-[11px] text-muted-foreground">Approve another device</div>
              </CardContent>
            </Card>
          </Link>
        </div>

        <section className="space-y-2">
          <h2 className="px-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Active devices
          </h2>

          {loading ? (
            <Card><CardContent className="p-6 text-center text-sm text-muted-foreground">Loading…</CardContent></Card>
          ) : devices.length === 0 ? (
            <Card><CardContent className="p-6 text-center text-sm text-muted-foreground">No devices recorded yet.</CardContent></Card>
          ) : (
            <ul className="space-y-2">
              {devices.map((d) => {
                const Icon = deviceIcon(d.platform);
                return (
                  <motion.li
                    key={d.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Card>
                      <CardContent className="flex items-center gap-3 p-4">
                        <div className="rounded-full bg-primary/10 p-2 text-primary">
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-sm font-semibold">
                            {d.device_label ?? "Device"}
                            {d.platform && (
                              <span className="ml-2 text-[10px] font-normal text-muted-foreground">
                                {d.platform}
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-muted-foreground">
                            Active {formatDistanceToNow(new Date(d.last_seen_at), { addSuffix: true })}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                          onClick={() => void removeDevice(d.id)}
                          aria-label={`Remove ${d.device_label ?? "device"}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.li>
                );
              })}
            </ul>
          )}
        </section>

        <p className="px-1 text-[11px] leading-relaxed text-muted-foreground">
          Removing a device only forgets it from this list. To force sign-out, change your password from
          Account → Security.
        </p>
      </main>
    </div>
  );
}
