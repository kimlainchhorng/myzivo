/**
 * AccountExportPage — Download all your data, posts, and messages
 */
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Download, FileText, Image, MessageCircle, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function AccountExportPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [exporting, setExporting] = useState(false);
  const [exported, setExported] = useState(false);

  const exportData = async () => {
    if (!user) return;
    setExporting(true);
    try {
      // Gather data
      const [{ data: profile }, { data: posts }, { data: messages }] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", user.id).single(),
        (supabase as any).from("user_posts").select("*").eq("user_id", user.id),
        supabase.from("messages").select("*").or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`).limit(500),
      ]);

      const exportObj = {
        exported_at: new Date().toISOString(),
        profile: profile || {},
        posts: posts || [],
        messages: messages || [],
      };

      // Download as JSON
      const blob = new Blob([JSON.stringify(exportObj, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `zivo-data-export-${new Date().toISOString().split("T")[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);

      setExported(true);
      toast.success("Data exported successfully!");
    } catch (err) {
      toast.error("Export failed. Please try again.");
    }
    setExporting(false);
  };

  const exportItems = [
    { icon: FileText, label: "Profile Information", desc: "Name, bio, settings" },
    { icon: Image, label: "Posts & Media", desc: "All your photos, reels, captions" },
    { icon: MessageCircle, label: "Messages", desc: "Chat history (up to 500 recent)" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border/50 safe-area-top">
        <div className="flex items-center gap-3 px-4 py-3">
          <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold">Export Data</h1>
        </div>
      </div>

      <div className="p-4 space-y-6">
        <div className="text-center py-6">
          <div className="h-16 w-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-3">
            <Download className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-lg font-semibold">Download Your Data</h2>
          <p className="text-sm text-muted-foreground mt-1">Get a copy of all your ZIVO data</p>
        </div>

        <div className="space-y-2">
          {exportItems.map((item) => (
            <div key={item.label} className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border/40">
              <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                <item.icon className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
              <CheckCircle2 className="h-4 w-4 text-emerald-500 ml-auto" />
            </div>
          ))}
        </div>

        <Button
          onClick={exportData}
          disabled={exporting}
          className="w-full rounded-xl"
        >
          {exporting ? (
            <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Preparing export...</>
          ) : exported ? (
            <><CheckCircle2 className="h-4 w-4 mr-2" /> Export again</>
          ) : (
            <><Download className="h-4 w-4 mr-2" /> Export All Data</>
          )}
        </Button>

        <p className="text-xs text-muted-foreground text-center">
          Your data will be downloaded as a JSON file. This may take a moment.
        </p>
      </div>
    </div>
  );
}
