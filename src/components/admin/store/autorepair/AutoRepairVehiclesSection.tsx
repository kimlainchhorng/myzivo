/**
 * Auto Repair — Customer Vehicles (garage/CRM)
 */
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Car, Plus, Search, Wrench, CalendarClock } from "lucide-react";

type Vehicle = { id: string; year: string; make: string; model: string; vin: string; plate: string; owner: string; lastService: string; mileage: number };

const seed: Vehicle[] = [
  { id: "1", year: "2018", make: "Toyota", model: "Camry", vin: "4T1B11HK5JU123456", plate: "ABC-1234", owner: "Maria Lopez", lastService: "Oil change · 2 weeks ago", mileage: 84210 },
  { id: "2", year: "2020", make: "Ford", model: "F-150", vin: "1FTEW1EP7LFA98765", plate: "TRK-9001", owner: "James Carter", lastService: "Brake pads · 1 month ago", mileage: 41200 },
  { id: "3", year: "2019", make: "Honda", model: "Civic", vin: "2HGFC2F69KH012345", plate: "DRV-5577", owner: "Linda Park", lastService: "AC recharge · today", mileage: 58400 },
];

interface Props { storeId: string }

export default function AutoRepairVehiclesSection({ storeId: _storeId }: Props) {
  const [vehicles] = useState<Vehicle[]>(seed);
  const [q, setQ] = useState("");
  const filtered = vehicles.filter(v =>
    !q || `${v.year} ${v.make} ${v.model} ${v.plate} ${v.vin} ${v.owner}`.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2"><Car className="w-4 h-4" /> Customer Vehicles</CardTitle>
          <Button size="sm" className="gap-1.5"><Plus className="w-3.5 h-3.5" /> Add Vehicle</Button>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search by owner, plate, VIN, or model" className="pl-9" value={q} onChange={e => setQ(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filtered.map(v => (
          <Card key={v.id}>
            <CardContent className="p-4 space-y-2">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold">{v.year} {v.make} {v.model}</p>
                  <p className="text-xs text-muted-foreground">{v.owner} · {v.plate}</p>
                </div>
                <Badge variant="secondary" className="text-[10px] font-mono">{v.mileage.toLocaleString()} mi</Badge>
              </div>
              <p className="text-[11px] text-muted-foreground font-mono truncate">VIN: {v.vin}</p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <CalendarClock className="w-3.5 h-3.5" />
                <span>{v.lastService}</span>
              </div>
              <div className="flex gap-2 pt-1">
                <Button size="sm" variant="outline" className="flex-1 h-8 gap-1.5"><Wrench className="w-3 h-3" /> New Job</Button>
                <Button size="sm" variant="outline" className="flex-1 h-8">History</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
