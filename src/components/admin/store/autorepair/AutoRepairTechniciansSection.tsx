/**
 * Auto Repair — Technicians & Bays
 */
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { HardHat, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface Props { storeId: string }

export default function AutoRepairTechniciansSection({ storeId }: Props) {
  const qc = useQueryClient();
  const [techDlg, setTechDlg] = useState(false);
  const [bayDlg, setBayDlg] = useState(false);
  const [techForm, setTechForm] = useState({ name: "", email: "", phone: "", hourly_rate_cents: 0 });
  const [bayForm, setBayForm] = useState({ name: "", lift_type: "" });

  const { data: techs = [] } = useQuery({
    queryKey: ["ar-technicians", storeId],
    queryFn: async () => {
      const { data, error } = await supabase.from("ar_technicians" as any).select("*").eq("store_id", storeId).order("created_at");
      if (error) throw error;
      return data as any[];
    },
  });

  const { data: bays = [] } = useQuery({
    queryKey: ["ar-bays", storeId],
    queryFn: async () => {
      const { data, error } = await supabase.from("ar_bays" as any).select("*").eq("store_id", storeId).order("sort_order");
      if (error) throw error;
      return data as any[];
    },
  });

  const createTech = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("ar_technicians" as any).insert({ store_id: storeId, ...techForm });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Technician added");
      qc.invalidateQueries({ queryKey: ["ar-technicians", storeId] });
      setTechDlg(false); setTechForm({ name: "", email: "", phone: "", hourly_rate_cents: 0 });
    },
    onError: (e: any) => toast.error(e.message ?? "Failed"),
  });

  const toggleTech = useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      const { error } = await supabase.from("ar_technicians" as any).update({ active }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["ar-technicians", storeId] }),
  });

  const delTech = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("ar_technicians" as any).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["ar-technicians", storeId] }),
  });

  const createBay = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("ar_bays" as any).insert({ store_id: storeId, ...bayForm });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Bay added");
      qc.invalidateQueries({ queryKey: ["ar-bays", storeId] });
      setBayDlg(false); setBayForm({ name: "", lift_type: "" });
    },
    onError: (e: any) => toast.error(e.message ?? "Failed"),
  });

  const delBay = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("ar_bays" as any).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["ar-bays", storeId] }),
  });

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2"><HardHat className="w-4 h-4" /> Technicians & Bays</CardTitle>
        </CardHeader>
      </Card>

      <Tabs defaultValue="techs">
        <TabsList>
          <TabsTrigger value="techs">Technicians ({techs.length})</TabsTrigger>
          <TabsTrigger value="bays">Bays ({bays.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="techs" className="space-y-3">
          <div className="flex justify-end">
            <Button size="sm" className="gap-1.5" onClick={() => setTechDlg(true)}><Plus className="w-3.5 h-3.5" /> Add Technician</Button>
          </div>
          {techs.length === 0 ? (
            <Card><CardContent className="py-10 text-center text-sm text-muted-foreground">No technicians yet.</CardContent></Card>
          ) : (
            <div className="grid gap-2">
              {techs.map((t: any) => (
                <Card key={t.id}>
                  <CardContent className="p-4 flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold">{t.name}</p>
                      <p className="text-xs text-muted-foreground">{t.email || t.phone || "—"} · ${(t.hourly_rate_cents / 100).toFixed(2)}/h</p>
                      {t.certifications?.length > 0 && (
                        <div className="flex gap-1 mt-1">{t.certifications.map((c: string) => <Badge key={c} variant="outline" className="text-[10px]">{c}</Badge>)}</div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch checked={t.active} onCheckedChange={(v) => toggleTech.mutate({ id: t.id, active: v })} />
                      <Button size="icon" variant="ghost" onClick={() => delTech.mutate(t.id)}><Trash2 className="w-4 h-4" /></Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="bays" className="space-y-3">
          <div className="flex justify-end">
            <Button size="sm" className="gap-1.5" onClick={() => setBayDlg(true)}><Plus className="w-3.5 h-3.5" /> Add Bay</Button>
          </div>
          {bays.length === 0 ? (
            <Card><CardContent className="py-10 text-center text-sm text-muted-foreground">No bays yet.</CardContent></Card>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {bays.map((b: any) => (
                <Card key={b.id}>
                  <CardContent className="p-3 text-center space-y-1">
                    <p className="font-semibold">{b.name}</p>
                    {b.lift_type && <p className="text-[11px] text-muted-foreground">{b.lift_type}</p>}
                    <Button size="sm" variant="ghost" className="text-destructive" onClick={() => delBay.mutate(b.id)}>
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={techDlg} onOpenChange={setTechDlg}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Add Technician</DialogTitle></DialogHeader>
          <div className="space-y-2">
            <Input placeholder="Full name" value={techForm.name} onChange={(e) => setTechForm({ ...techForm, name: e.target.value })} />
            <Input placeholder="Email" value={techForm.email} onChange={(e) => setTechForm({ ...techForm, email: e.target.value })} />
            <Input placeholder="Phone" value={techForm.phone} onChange={(e) => setTechForm({ ...techForm, phone: e.target.value })} />
            <Input type="number" placeholder="Hourly rate (USD)" value={(techForm.hourly_rate_cents / 100) || ""}
              onChange={(e) => setTechForm({ ...techForm, hourly_rate_cents: Math.round((Number(e.target.value) || 0) * 100) })} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTechDlg(false)}>Cancel</Button>
            <Button disabled={!techForm.name} onClick={() => createTech.mutate()}>Add</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={bayDlg} onOpenChange={setBayDlg}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Add Bay</DialogTitle></DialogHeader>
          <div className="space-y-2">
            <Input placeholder="Bay name (e.g. Bay 1)" value={bayForm.name} onChange={(e) => setBayForm({ ...bayForm, name: e.target.value })} />
            <Input placeholder="Lift type (2-post, 4-post, alignment...)" value={bayForm.lift_type} onChange={(e) => setBayForm({ ...bayForm, lift_type: e.target.value })} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBayDlg(false)}>Cancel</Button>
            <Button disabled={!bayForm.name} onClick={() => createBay.mutate()}>Add</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
