/**
 * RideCorporateFleet — Company accounts, policies, fleet tracking, bulk billing
 */
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Building2, Users, Shield, CreditCard, FileText, Car, TrendingUp, Settings, ChevronRight, Plus, Check, Radio } from "lucide-react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

const companyProfile = {
  name: "Acme Corp",
  employees: 48,
  activeRiders: 32,
  monthlyBudget: 15000,
  spent: 9450,
  policy: "Economy & Premium only",
};

const employees = [
  { id: 1, name: "Sarah Johnson", dept: "Engineering", rides: 12, spent: 340, status: "active" },
  { id: 2, name: "Mark Chen", dept: "Sales", rides: 24, spent: 890, status: "active" },
  { id: 3, name: "Emily Davis", dept: "Marketing", rides: 8, spent: 210, status: "active" },
  { id: 4, name: "Tom Wilson", dept: "Finance", rides: 3, spent: 95, status: "suspended" },
];

const policies = [
  { id: 1, name: "Daily Limit", value: "$75/day", active: true },
  { id: 2, name: "Ride Types", value: "Economy, Premium", active: true },
  { id: 3, name: "Hours", value: "6 AM – 11 PM", active: true },
  { id: 4, name: "Weekend Rides", value: "Disabled", active: false },
];

type FleetVehicle = { id: number; plate: string; driver: string; status: "active" | "maintenance"; location: string; speedKph: number };

const initialFleet: FleetVehicle[] = [
  { id: 1, plate: "ABC-1234", driver: "Mike R.", status: "active", location: "Downtown", speedKph: 32 },
  { id: 2, plate: "XYZ-5678", driver: "Lisa K.", status: "active", location: "Airport", speedKph: 58 },
  { id: 3, plate: "DEF-9012", driver: "John P.", status: "maintenance", location: "Depot", speedKph: 0 },
];

const fleetLocations = ["Downtown", "Airport", "Riverside", "Old Quarter", "Tech Park", "North Bridge", "Central Mall", "Depot"];

type Section = "overview" | "employees" | "policies" | "fleet";

export default function RideCorporateFleet() {
  const [section, setSection] = useState<Section>("overview");
  const [fleet, setFleet] = useState<FleetVehicle[]>(initialFleet);
  const [lastTick, setLastTick] = useState<number>(Date.now());

  useEffect(() => {
    if (section !== "fleet") return;
    const id = setInterval(() => {
      setFleet(prev => prev.map(v => {
        if (v.status !== "active") return v;
        const move = Math.random() < 0.35;
        return {
          ...v,
          location: move ? fleetLocations[Math.floor(Math.random() * fleetLocations.length)] : v.location,
          speedKph: Math.max(0, Math.min(80, v.speedKph + Math.round((Math.random() - 0.5) * 12))),
        };
      }));
      setLastTick(Date.now());
    }, 3000);
    return () => clearInterval(id);
  }, [section]);

  const secondsAgo = Math.max(0, Math.floor((Date.now() - lastTick) / 1000));

  const sections: { id: Section; label: string; icon: typeof Building2 }[] = [
    { id: "overview", label: "Overview", icon: TrendingUp },
    { id: "employees", label: "Team", icon: Users },
    { id: "policies", label: "Policies", icon: Shield },
    { id: "fleet", label: "Fleet", icon: Car },
  ];

  return (
    <div className="space-y-4">
      {/* Section nav */}
      <div className="flex gap-1 bg-muted/30 rounded-xl p-1">
        {sections.map((s) => {
          const Icon = s.icon;
          return (
            <button
              key={s.id}
              onClick={() => setSection(s.id)}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all",
                section === s.id
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground"
              )}
            >
              <Icon className="w-3.5 h-3.5" />
              {s.label}
            </button>
          );
        })}
      </div>

      {section === "overview" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <div className="bg-card rounded-xl p-4 border border-border/30 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary/15 flex items-center justify-center">
                <Building2 className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-lg font-black text-foreground">{companyProfile.name}</p>
                <p className="text-xs text-muted-foreground">{companyProfile.employees} employees • {companyProfile.activeRiders} active riders</p>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-xl p-4 border border-border/30 space-y-2">
            <div className="flex justify-between items-center">
              <p className="text-sm font-bold text-foreground">Monthly Budget</p>
              <p className="text-sm font-black text-foreground">${companyProfile.spent.toLocaleString()} / ${companyProfile.monthlyBudget.toLocaleString()}</p>
            </div>
            <Progress value={(companyProfile.spent / companyProfile.monthlyBudget) * 100} className="h-2" />
            <p className="text-xs text-muted-foreground">63% utilized • ${(companyProfile.monthlyBudget - companyProfile.spent).toLocaleString()} remaining</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Total Rides", value: "156", sub: "This month" },
              { label: "Avg Cost", value: "$24.50", sub: "Per ride" },
              { label: "On Policy", value: "94%", sub: "Compliance" },
              { label: "Invoices", value: "3", sub: "Pending" },
            ].map((stat) => (
              <div key={stat.label} className="bg-card rounded-xl p-3 border border-border/30 text-center">
                <p className="text-xl font-black text-foreground">{stat.value}</p>
                <p className="text-[11px] font-bold text-foreground">{stat.label}</p>
                <p className="text-[10px] text-muted-foreground">{stat.sub}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {section === "employees" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
          <div className="flex justify-between items-center">
            <p className="text-sm font-bold text-foreground">Team Members</p>
            <button
              onClick={() => toast.success("Invite sent!")}
              className="flex items-center gap-1 text-xs font-bold text-primary"
            >
              <Plus className="w-3.5 h-3.5" /> Add
            </button>
          </div>
          {employees.map((emp) => (
            <div key={emp.id} className="bg-card rounded-xl p-3 border border-border/30 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-primary/15 flex items-center justify-center text-sm font-bold text-primary">
                {emp.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-foreground">{emp.name}</p>
                  <span className={cn(
                    "text-[9px] px-1.5 py-0.5 rounded-full font-bold",
                    emp.status === "active" ? "bg-green-500/15 text-green-600" : "bg-destructive/15 text-destructive"
                  )}>{emp.status}</span>
                </div>
                <p className="text-xs text-muted-foreground">{emp.dept} • {emp.rides} rides • ${emp.spent}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </div>
          ))}
        </motion.div>
      )}

      {section === "policies" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
          <p className="text-sm font-bold text-foreground">Ride Policies</p>
          {policies.map((pol) => (
            <div key={pol.id} className="bg-card rounded-xl p-3 border border-border/30 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-foreground">{pol.name}</p>
                <p className="text-xs text-muted-foreground">{pol.value}</p>
              </div>
              <div className={cn(
                "w-8 h-5 rounded-full flex items-center transition-all px-0.5",
                pol.active ? "bg-primary justify-end" : "bg-muted justify-start"
              )}>
                <div className="w-4 h-4 rounded-full bg-background shadow-sm" />
              </div>
            </div>
          ))}
          <button
            onClick={() => toast.info("Opening policy editor...")}
            className="w-full py-2.5 rounded-xl bg-primary/10 text-primary text-sm font-bold flex items-center justify-center gap-2"
          >
            <Settings className="w-4 h-4" /> Manage Policies
          </button>
        </motion.div>
      )}

      {section === "fleet" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold text-foreground">Fleet Vehicles</p>
            <div className="flex items-center gap-1.5 bg-green-500/10 text-green-600 px-2 py-1 rounded-full">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
              </span>
              <span className="text-[10px] font-bold">LIVE</span>
            </div>
          </div>
          {fleet.map((v) => (
            <motion.div
              key={v.id}
              layout
              animate={{ opacity: 1 }}
              className="bg-card rounded-xl p-3 border border-border/30 flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center">
                <Car className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-foreground">{v.plate}</p>
                  <span className={cn(
                    "text-[9px] px-1.5 py-0.5 rounded-full font-bold",
                    v.status === "active" ? "bg-green-500/15 text-green-600" : "bg-yellow-500/15 text-yellow-600"
                  )}>{v.status}</span>
                </div>
                <p className="text-xs text-muted-foreground truncate">{v.driver} • {v.location}</p>
              </div>
              {v.status === "active" && (
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold tabular-nums text-foreground">{v.speedKph}</p>
                  <p className="text-[9px] text-muted-foreground -mt-0.5">km/h</p>
                </div>
              )}
            </motion.div>
          ))}
          <div className="bg-muted/30 rounded-xl p-3 flex items-center justify-center gap-2">
            <Radio className="w-3.5 h-3.5 text-primary" />
            <p className="text-xs text-muted-foreground">Updated {secondsAgo}s ago • {fleet.filter(f => f.status === "active").length} of {fleet.length} on the road</p>
          </div>
        </motion.div>
      )}
    </div>
  );
}
