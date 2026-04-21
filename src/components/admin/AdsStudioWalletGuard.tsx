/**
 * AdsStudioWalletGuard — shows wallet balance + auto-recharge controls for Ads Studio.
 * Owners can toggle auto-recharge, set threshold + recharge amount.
 */
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Wallet, Zap, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Props { storeId: string }

export default function AdsStudioWalletGuard({ storeId }: Props) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [balance, setBalance] = useState(0);
  const [enabled, setEnabled] = useState(false);
  const [threshold, setThreshold] = useState(1);
  const [amount, setAmount] = useState(20);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("restaurant_wallets")
      .select("balance_cents, auto_recharge_enabled, auto_recharge_threshold_cents, auto_recharge_amount_cents")
      .eq("restaurant_id", storeId)
      .maybeSingle();
    if (data) {
      setBalance(data.balance_cents ?? 0);
      setEnabled(!!(data as any).auto_recharge_enabled);
      setThreshold(((data as any).auto_recharge_threshold_cents ?? 100) / 100);
      setAmount(((data as any).auto_recharge_amount_cents ?? 2000) / 100);
    }
    setLoading(false);
  };

  useEffect(() => { if (storeId) load(); }, [storeId]);

  const save = async () => {
    setSaving(true);
    const { error } = await supabase
      .from("restaurant_wallets")
      .update({
        auto_recharge_enabled: enabled,
        auto_recharge_threshold_cents: Math.round(threshold * 100),
        auto_recharge_amount_cents: Math.round(amount * 100),
      } as any)
      .eq("restaurant_id", storeId);
    setSaving(false);
    if (error) toast.error(error.message);
    else toast.success("Auto-recharge settings saved");
  };

  const isLow = balance < threshold * 100;

  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wallet className="h-4 w-4 text-primary" />
            <h3 className="font-semibold text-sm">Ads wallet</h3>
          </div>
          {loading ? null : (
            <Badge variant={isLow ? "destructive" : "secondary"}>
              ${(balance / 100).toFixed(2)}
            </Badge>
          )}
        </div>

        {isLow && !enabled && (
          <div className="rounded-lg bg-destructive/10 border border-destructive/30 p-2.5 text-xs text-destructive">
            Low balance. Top up your wallet or enable auto-recharge below to keep generations running.
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="h-3.5 w-3.5 text-primary" />
            <Label className="text-xs cursor-pointer">Auto-recharge when low</Label>
          </div>
          <Switch checked={enabled} onCheckedChange={setEnabled} />
        </div>

        {enabled && (
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-[10px] text-muted-foreground">Recharge below ($)</Label>
              <Input type="number" min={1} step={1} value={threshold}
                onChange={(e) => setThreshold(+e.target.value || 1)} className="h-8 text-sm" />
            </div>
            <div>
              <Label className="text-[10px] text-muted-foreground">Add amount ($)</Label>
              <Input type="number" min={5} step={5} value={amount}
                onChange={(e) => setAmount(+e.target.value || 20)} className="h-8 text-sm" />
            </div>
          </div>
        )}

        <Button size="sm" className="w-full" onClick={save} disabled={saving || loading}>
          {saving ? <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" /> : null} Save settings
        </Button>
      </CardContent>
    </Card>
  );
}
