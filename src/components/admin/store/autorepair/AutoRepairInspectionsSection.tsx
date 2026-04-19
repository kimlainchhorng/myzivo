/**
 * Auto Repair — Digital Vehicle Inspections (DVI)
 * Multi-point checklist with green/yellow/red status.
 */
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ClipboardCheck, CheckCircle2, AlertTriangle, XCircle, Plus, Send } from "lucide-react";

const POINTS = [
  "Brakes (Front)", "Brakes (Rear)", "Tires (Tread)", "Tire Pressure", "Battery Health",
  "Engine Oil", "Coolant Level", "Transmission Fluid", "Power Steering Fluid", "Brake Fluid",
  "Air Filter", "Cabin Filter", "Wiper Blades", "Headlights", "Taillights",
  "Belts", "Hoses", "Suspension", "Exhaust System", "Check Engine Code",
];

type Status = "good" | "attention" | "urgent";
const ICONS: Record<Status, any> = { good: CheckCircle2, attention: AlertTriangle, urgent: XCircle };
const COLORS: Record<Status, string> = {
  good: "text-emerald-600 bg-emerald-500/10 border-emerald-500/30",
  attention: "text-amber-600 bg-amber-500/10 border-amber-500/30",
  urgent: "text-red-600 bg-red-500/10 border-red-500/30",
};

interface Props { storeId: string }

export default function AutoRepairInspectionsSection({ storeId: _storeId }: Props) {
  const [vehicle, setVehicle] = useState("");
  const [statuses, setStatuses] = useState<Record<string, Status>>(() =>
    Object.fromEntries(POINTS.map(p => [p, "good" as Status]))
  );

  const counts = Object.values(statuses).reduce((acc, s) => {
    acc[s] = (acc[s] || 0) + 1; return acc;
  }, {} as Record<Status, number>);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2"><ClipboardCheck className="w-4 h-4" /> Digital Vehicle Inspection</CardTitle>
          <Button size="sm" className="gap-1.5"><Send className="w-3.5 h-3.5" /> Send to Customer</Button>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input placeholder="Vehicle (e.g. 2019 Honda Civic — VIN1234567890)" value={vehicle} onChange={e => setVehicle(e.target.value)} />
          <div className="flex gap-2">
            <Badge variant="outline" className="text-emerald-600 border-emerald-500/40"><CheckCircle2 className="w-3 h-3 mr-1" /> Good · {counts.good || 0}</Badge>
            <Badge variant="outline" className="text-amber-600 border-amber-500/40"><AlertTriangle className="w-3 h-3 mr-1" /> Attention · {counts.attention || 0}</Badge>
            <Badge variant="outline" className="text-red-600 border-red-500/40"><XCircle className="w-3 h-3 mr-1" /> Urgent · {counts.urgent || 0}</Badge>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {POINTS.map(point => {
          const s = statuses[point];
          const Icon = ICONS[s];
          return (
            <div key={point} className={`flex items-center justify-between p-3 rounded-xl border ${COLORS[s]}`}>
              <div className="flex items-center gap-2 min-w-0">
                <Icon className="w-4 h-4 shrink-0" />
                <span className="text-sm font-medium truncate">{point}</span>
              </div>
              <div className="flex gap-1">
                {(["good", "attention", "urgent"] as Status[]).map(opt => (
                  <button
                    key={opt}
                    onClick={() => setStatuses({ ...statuses, [point]: opt })}
                    className={`w-6 h-6 rounded-full border-2 transition ${
                      s === opt
                        ? opt === "good" ? "bg-emerald-500 border-emerald-600" : opt === "attention" ? "bg-amber-500 border-amber-600" : "bg-red-500 border-red-600"
                        : "bg-background border-border"
                    }`}
                    aria-label={opt}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
