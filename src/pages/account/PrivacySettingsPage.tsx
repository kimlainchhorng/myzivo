/**
 * PrivacySettingsPage — Block users, mute conversations, privacy toggles
 */
import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Shield, Eye, EyeOff, MessageSquare, Users, UserX, Loader2, ToggleLeft, ToggleRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function PrivacySettingsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Privacy settings
  const { data: settings } = useQuery({
    queryKey: ["privacy-settings", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await (supabase as any)
        .from("privacy_settings")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      return data || { profile_visibility: "public", show_activity_status: true, show_read_receipts: true, allow_message_requests: true };
    },
    enabled: !!user,
  });

  // Blocked users
  const { data: blockedUsers = [] } = useQuery({
    queryKey: ["blocked-users", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await (supabase as any)
        .from("blocked_users")
        .select("id, blocked_id, created_at")
        .eq("blocker_id", user.id);
      if (!data?.length) return [];
      const ids = data.map((b: any) => b.blocked_id);
      const { data: profiles } = await supabase.from("public_profiles" as any).select("id, full_name, avatar_url").in("id", ids);
      return data.map((b: any) => ({
        ...b,
        profile: profiles?.find((p: any) => p.id === b.blocked_id),
      }));
    },
    enabled: !!user,
  });

  const updateSetting = async (key: string, value: any) => {
    if (!user) return;
    const exists = settings?.user_id;
    if (exists) {
      await (supabase as any).from("privacy_settings").update({ [key]: value, updated_at: new Date().toISOString() }).eq("user_id", user.id);
    } else {
      await (supabase as any).from("privacy_settings").insert({ user_id: user.id, [key]: value });
    }
    queryClient.invalidateQueries({ queryKey: ["privacy-settings"] });
    toast.success("Privacy updated");
  };

  const unblockUser = async (blockId: string) => {
    await (supabase as any).from("blocked_users").delete().eq("id", blockId);
    queryClient.invalidateQueries({ queryKey: ["blocked-users"] });
    toast.success("User unblocked");
  };

  const visibilityOptions = [
    { value: "public", label: "Public", desc: "Anyone can see your profile", icon: Eye },
    { value: "followers", label: "Followers only", desc: "Only followers can see your posts", icon: Users },
    { value: "private", label: "Private", desc: "Only you can see your profile", icon: EyeOff },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border/50 safe-area-top">
        <div className="flex items-center gap-3 px-4 py-3">
          <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold">Privacy & Safety</h1>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Profile Visibility */}
        <section>
          <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" /> Profile Visibility
          </h3>
          <div className="space-y-2">
            {visibilityOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => updateSetting("profile_visibility", opt.value)}
                className={cn(
                  "w-full flex items-center gap-3 p-3 rounded-xl border transition-colors text-left",
                  settings?.profile_visibility === opt.value
                    ? "bg-primary/10 border-primary/30"
                    : "bg-card border-border/40 hover:bg-accent/50"
                )}
              >
                <opt.icon className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-sm font-medium">{opt.label}</p>
                  <p className="text-xs text-muted-foreground">{opt.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Toggles */}
        <section className="space-y-3">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-primary" /> Communication
          </h3>
          {[
            { key: "show_activity_status", label: "Show activity status", desc: "Let others see when you're online" },
            { key: "show_read_receipts", label: "Read receipts", desc: "Show when you've read messages" },
            { key: "allow_message_requests", label: "Message requests", desc: "Allow messages from non-followers" },
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between p-3 rounded-xl bg-card border border-border/40">
              <div>
                <p className="text-sm font-medium">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
              <Switch
                checked={settings?.[item.key as keyof typeof settings] as boolean ?? true}
                onCheckedChange={(v) => updateSetting(item.key, v)}
              />
            </div>
          ))}
        </section>

        {/* Blocked Users */}
        <section>
          <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <UserX className="h-4 w-4 text-destructive" /> Blocked Users ({blockedUsers.length})
          </h3>
          {blockedUsers.length === 0 && (
            <p className="text-xs text-muted-foreground p-3 bg-card rounded-xl border border-border/40">No blocked users</p>
          )}
          {blockedUsers.map((b: any) => (
            <div key={b.id} className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border/40 mb-2">
              <Avatar className="h-9 w-9">
                <AvatarImage src={b.profile?.avatar_url} />
                <AvatarFallback>{(b.profile?.full_name || "U")[0]}</AvatarFallback>
              </Avatar>
              <span className="flex-1 text-sm font-medium">{b.profile?.full_name || "Unknown"}</span>
              <Button variant="outline" size="sm" onClick={() => unblockUser(b.id)} className="text-xs h-8">
                Unblock
              </Button>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}
