/**
 * Auto Repair — Service Reminders & Recalls
 */
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BellRing, Plus, Search, ShieldAlert } from "lucide-react";
import { toast } from "sonner";

interface Props { storeId: string }

export default function AutoRepairRemindersSection({ storeId }: Props) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [vin, setVin] = useState("");
  const [recallLoading, setRecallLoading] = useState(false);
  const [form, setForm] = useState({ reminder_type: "Oil change", channel: "email", message: "", due_at: "" });

  const { data: reminders = [] } = useQuery({
    queryKey: ["ar-reminders", storeId],
    queryFn: async () => {
      const { data, error } = await supabase.from("ar_service_reminders" as any).select("*").eq("store_id", storeId).order("due_at", { ascending: true });
      if (error) throw error;
      return data as any[];
    },
  });

  const { data: recalls = [] } = useQuery({
    queryKey: ["ar-recalls", storeId],
    queryFn: async () => {
      const { data, error } = await supabase.from("ar_recall_checks" as any).select("*").eq("store_id", storeId).order("fetched_at", { ascending: false });
      if (error) throw error;
      return data as any[];
    },
  });

  const create = useMutation({
    mutationFn: async () => {
      const payload: any = { store_id: storeId, ...form };
      if (!form.due_at) delete payload.due_at;
      const { error } = await supabase.from("ar_service_reminders" as any).insert(payload);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Reminder scheduled");
      qc.invalidateQueries({ queryKey: ["ar-reminders", storeId] });
      setOpen(false);
      setForm({ reminder_type: "Oil change", channel: "email", message: "", due_at: "" });
    },
    onError: (e: any) => toast.error(e.message ?? "Failed"),
  });

  const lookupRecall = async () => {
    if (!vin || vin.length < 11) { toast.error("Enter a valid VIN"); return; }
    setRecallLoading(true);
    try {
      // NHTSA decode then recall lookup
      const decode = await fetch(`https://vpic.nhtsa.dot.gov/api/vehicles/decodevinvalues/${vin}?format=json`).then(r => r.json());
      const rec = decode?.Results?.[0] || {};
      const make = rec.Make, model = rec.Model, year = rec.ModelYear;
      let summary = "No recalls found.";
      let severity = "none";
      let campaignId: string | null = null;
      if (make && model && year) {
        const r = await fetch(`https://api.nhtsa.gov/recalls/recallsByVehicle?make=${make}&model=${model}&modelYear=${year}`).then(r => r.json());
        const items = r?.results || [];
        if (items.length > 0) {
          summary = `${items.length} recall(s): ${items.slice(0, 2).map((i: any) => i.Component).join("; ")}`;
          severity = "high";
          campaignId = items[0]?.NHTSACampaignNumber ?? null;
        }
      }
      const { error } = await supabase.from("ar_recall_checks" as any).insert({
        store_id: storeId, vin, summary, severity, campaign_id: campaignId,
      });
      if (error) throw error;
      toast.success("Recall check saved");
      qc.invalidateQueries({ queryKey: ["ar-recalls", storeId] });
      setVin("");
    } catch (e: any) {
      toast.error(e.message ?? "Lookup failed");
    } finally {
      setRecallLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2"><BellRing className="w-4 h-4" /> Reminders & Recalls</CardTitle>
        </CardHeader>
      </Card>

      <Tabs defaultValue="reminders">
        <TabsList>
          <TabsTrigger value="reminders">Reminders ({reminders.length})</TabsTrigger>
          <TabsTrigger value="recalls">Recalls ({recalls.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="reminders" className="space-y-3">
          <div className="flex justify-end">
            <Button size="sm" className="gap-1.5" onClick={() => setOpen(true)}><Plus className="w-3.5 h-3.5" /> Schedule Reminder</Button>
          </div>
          {reminders.length === 0 ? (
            <Card><CardContent className="py-10 text-center text-sm text-muted-foreground">No reminders scheduled.</CardContent></Card>
          ) : (
            <div className="grid gap-2">
              {reminders.map((r: any) => (
                <Card key={r.id}>
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <p className="font-semibold">{r.reminder_type}</p>
                      <p className="text-xs text-muted-foreground">
                        {r.due_at ? new Date(r.due_at).toLocaleDateString() : r.due_mileage ? `${r.due_mileage} mi` : "—"} · {r.channel}
                      </p>
                    </div>
                    <Badge variant="outline" className="capitalize">{r.status}</Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="recalls" className="space-y-3">
          <Card>
            <CardContent className="p-4 space-y-2">
              <p className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5"><ShieldAlert className="w-3.5 h-3.5" /> NHTSA Recall Lookup</p>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-muted-foreground" />
                  <Input placeholder="Enter VIN" className="pl-9 font-mono uppercase" value={vin} onChange={(e) => setVin(e.target.value.toUpperCase())} />
                </div>
                <Button onClick={lookupRecall} disabled={recallLoading}>{recallLoading ? "Checking…" : "Check"}</Button>
              </div>
            </CardContent>
          </Card>
          {recalls.length === 0 ? (
            <Card><CardContent className="py-10 text-center text-sm text-muted-foreground">No recall checks yet.</CardContent></Card>
          ) : (
            <div className="grid gap-2">
              {recalls.map((r: any) => (
                <Card key={r.id}>
                  <CardContent className="p-4 flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-mono text-sm">{r.vin}</p>
                      <p className="text-xs text-muted-foreground">{r.summary}</p>
                      {r.campaign_id && <p className="text-[10px] text-muted-foreground">Campaign: {r.campaign_id}</p>}
                    </div>
                    <Badge variant={r.severity === "high" ? "destructive" : "outline"}>{r.severity ?? "—"}</Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Schedule Reminder</DialogTitle></DialogHeader>
          <div className="space-y-2">
            <Input placeholder="Reminder type" value={form.reminder_type} onChange={(e) => setForm({ ...form, reminder_type: e.target.value })} />
            <Input type="datetime-local" value={form.due_at} onChange={(e) => setForm({ ...form, due_at: e.target.value })} />
            <Select value={form.channel} onValueChange={(v) => setForm({ ...form, channel: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="sms">SMS</SelectItem>
                <SelectItem value="push">Push</SelectItem>
                <SelectItem value="inapp">In-app</SelectItem>
              </SelectContent>
            </Select>
            <Textarea placeholder="Message" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={() => create.mutate()}>Schedule</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
