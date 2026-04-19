/**
 * LoginHistorySection — Shows login history with device, IP, location & map
 */
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Monitor, Smartphone, Tablet, MapPin, Clock, Globe, Shield,
  AlertTriangle, ChevronDown, ChevronUp, LogOut, Loader2
} from "lucide-react";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import { formatDistanceToNow, format } from "date-fns";
import { toast } from "sonner";

// Cache the Google Maps API key for the session
let cachedMapsKey: string | null = null;
async function getMapsKey(): Promise<string> {
  if (cachedMapsKey !== null) return cachedMapsKey;
  const envKey = (import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY || "";
  if (envKey) { cachedMapsKey = envKey; return envKey; }
  try {
    const { data, error } = await supabase.functions.invoke("maps-api-key");
    if (!error && data?.key) { cachedMapsKey = data.key; return data.key; }
  } catch {}
  cachedMapsKey = "";
  return "";
}


interface LoginEntry {
  id: string;
  device_name: string | null;
  device_type: string | null;
  ip_address: string | null;
  city: string | null;
  country: string | null;
  latitude: number | null;
  longitude: number | null;
  is_suspicious: boolean | null;
  logged_in_at: string;
}

function DeviceIcon({ type }: { type: string | null }) {
  if (type === "mobile") return <Smartphone className="w-5 h-5 text-muted-foreground" />;
  if (type === "tablet") return <Tablet className="w-5 h-5 text-muted-foreground" />;
  return <Monitor className="w-5 h-5 text-muted-foreground" />;
}

function MiniMap({
  lat,
  lon,
  city,
  query,
}: {
  lat?: number | null;
  lon?: number | null;
  city?: string | null;
  query?: string | null;
}) {
  // Precise pin if we have coordinates
  if (typeof lat === "number" && typeof lon === "number") {
    const bbox = `${lon - 0.5},${lat - 0.3},${lon + 0.5},${lat + 0.3}`;
    return (
      <div className="rounded-lg overflow-hidden border border-border mt-2 relative">
        <iframe
          title={`Login location${city ? ` - ${city}` : ""}`}
          width="100%"
          height="180"
          style={{ border: 0 }}
          loading="lazy"
          src={`https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lon}`}
        />
        <a
          href={`https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=12/${lat}/${lon}`}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute bottom-1 right-1 text-[10px] bg-background/80 backdrop-blur px-1.5 py-0.5 rounded text-muted-foreground hover:text-foreground"
        >
          View larger
        </a>
      </div>
    );
  }
  // Fallback: city/country search embed (no coords needed)
  const q = (query || city || "").trim();
  if (!q) {
    return (
      <div className="rounded-lg border border-dashed border-border mt-2 p-4 text-center text-xs text-muted-foreground">
        <MapPin className="w-4 h-4 mx-auto mb-1 opacity-60" />
        Location coordinates not available for this session
      </div>
    );
  }
  return (
    <div className="rounded-lg overflow-hidden border border-border mt-2 relative">
      <iframe
        title={`Login location - ${q}`}
        width="100%"
        height="180"
        style={{ border: 0 }}
        loading="lazy"
        src={`https://www.openstreetmap.org/export/embed.html?layer=mapnik&search=${encodeURIComponent(q)}`}
      />
      <a
        href={`https://www.openstreetmap.org/search?query=${encodeURIComponent(q)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute bottom-1 right-1 text-[10px] bg-background/80 backdrop-blur px-1.5 py-0.5 rounded text-muted-foreground hover:text-foreground"
      >
        View larger
      </a>
    </div>
  );
}

export default function LoginHistorySection() {
  const { user } = useAuth();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isLoggingOutAll, setIsLoggingOutAll] = useState(false);

  const { data: logins, isLoading } = useQuery({
    queryKey: ["loginHistory", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("login_history")
        .select("*")
        .eq("user_id", user!.id)
        .order("logged_in_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      return data as LoginEntry[];
    },
    enabled: !!user?.id,
  });

  const handleLogoutAllDevices = async () => {
    setIsLoggingOutAll(true);
    try {
      await supabase.auth.signOut({ scope: "global" });
      toast.success("Logged out of all devices");
      window.location.href = "/login";
    } catch {
      toast.error("Failed to log out of all devices");
    } finally {
      setIsLoggingOutAll(false);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Monitor className="w-5 h-5" />
              Active Sessions & Login History
            </CardTitle>
            <CardDescription>
              See where your account has been accessed
            </CardDescription>
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm">
                <LogOut className="w-4 h-4 mr-2" />
                Log out all
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Log out of all devices?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will log you out of all devices, including this one.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleLogoutAllDevices} disabled={isLoggingOutAll}>
                  {isLoggingOutAll ? "Logging out..." : "Log out everywhere"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : !logins?.length ? (
          <div className="text-center py-8 text-muted-foreground">
            <Shield className="w-10 h-10 mx-auto mb-2 opacity-40" />
            <p className="text-sm">No login history yet</p>
            <p className="text-xs mt-1">Your future logins will appear here</p>
          </div>
        ) : (
          <div className="space-y-3">
            {logins.map((login, index) => {
              const isExpanded = expandedId === login.id;
              const isFirst = index === 0;
              const location = [login.city, login.country].filter(Boolean).join(", ") || "Unknown location";
              const maskedIp = login.ip_address
                ? login.ip_address.replace(/(\d+\.\d+\.\d+\.)\d+/, "$1***")
                : "Hidden";

              return (
                <div
                  key={login.id}
                  className={`rounded-xl border transition-all ${
                    login.is_suspicious
                      ? "border-destructive/30 bg-destructive/5"
                      : "border-border bg-muted/30"
                  }`}
                >
                  <button
                    className="w-full p-3 flex items-center gap-3 text-left"
                    onClick={() => toggleExpand(login.id)}
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                      login.is_suspicious ? "bg-destructive/10" : "bg-background"
                    }`}>
                      {login.is_suspicious ? (
                        <AlertTriangle className="w-5 h-5 text-destructive" />
                      ) : (
                        <DeviceIcon type={login.device_type} />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm flex items-center gap-2 flex-wrap">
                        <span className="truncate">{login.device_name || "Unknown"}</span>
                        {isFirst && (
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                            Latest
                          </Badge>
                        )}
                        {login.is_suspicious && (
                          <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
                            Suspicious
                          </Badge>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                        <MapPin className="w-3 h-3 shrink-0" />
                        <span className="truncate">{location}</span>
                        <span>•</span>
                        <Clock className="w-3 h-3 shrink-0" />
                        <span>{formatDistanceToNow(new Date(login.logged_in_at), { addSuffix: true })}</span>
                      </p>
                    </div>

                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
                    )}
                  </button>

                  {isExpanded && (
                    <div className="px-3 pb-3 space-y-2">
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="p-2 rounded-lg bg-background">
                          <p className="text-muted-foreground mb-0.5">IP Address</p>
                          <p className="font-mono font-medium">{maskedIp}</p>
                        </div>
                        <div className="p-2 rounded-lg bg-background">
                          <p className="text-muted-foreground mb-0.5">Device</p>
                          <p className="font-medium capitalize">{login.device_type || "Desktop"}</p>
                        </div>
                        <div className="p-2 rounded-lg bg-background">
                          <p className="text-muted-foreground mb-0.5">Location</p>
                          <p className="font-medium">{location}</p>
                        </div>
                        <div className="p-2 rounded-lg bg-background">
                          <p className="text-muted-foreground mb-0.5">Date</p>
                          <p className="font-medium">{format(new Date(login.logged_in_at), "MMM d, yyyy h:mm a")}</p>
                        </div>
                      </div>

                      <MiniMap
                        lat={login.latitude}
                        lon={login.longitude}
                        city={login.city}
                        query={[login.city, login.country].filter(Boolean).join(", ")}
                      />

                      {login.is_suspicious && (
                        <div className="flex items-start gap-2 p-2.5 rounded-lg bg-destructive/10 text-destructive text-xs">
                          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                          <p>This login was from a different country than your previous session. If this wasn't you, change your password immediately.</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
