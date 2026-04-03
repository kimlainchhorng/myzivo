/**
 * ActivityLogPage — Full history of logins, actions, changes
 */
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Shield, LogIn, Settings, Pencil, Trash2, Loader2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import ZivoMobileNav from "@/components/app/ZivoMobileNav";

const ACTION_ICONS: Record<string, typeof LogIn> = {
  login: LogIn,
  settings_change: Settings,
  profile_update: Pencil,
  account_delete: Trash2,
};

export default function ActivityLogPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: activities = [], isLoading } = useQuery({
    queryKey: ["activity-log", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await (supabase as any)
        .from("account_activity_log")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50);
      return data || [];
    },
    enabled: !!user,
  });

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border/50 safe-area-top">
        <div className="flex items-center gap-3 px-4 py-3">
          <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold">Activity Log</h1>
        </div>
      </div>

      <div className="p-4 space-y-2">
        {isLoading && <Loader2 className="h-6 w-6 animate-spin mx-auto mt-12 text-muted-foreground" />}
        {!isLoading && activities.length === 0 && (
          <div className="text-center py-16">
            <Clock className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
            <p className="text-sm text-muted-foreground">No activity recorded yet</p>
          </div>
        )}
        {activities.map((a: any) => {
          const Icon = ACTION_ICONS[a.action_type] || Shield;
          return (
            <div key={a.id} className="flex items-start gap-3 p-3 rounded-xl bg-card border border-border/40">
              <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                <Icon className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{a.description || a.action_type}</p>
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(a.created_at), { addSuffix: true })}
                  {a.device_info && ` • ${a.device_info}`}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <ZivoMobileNav />
    </div>
  );
}
