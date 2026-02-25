import { useState, useMemo } from "react";
import { Car, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { acceptedVehicles, totalModelCount, TIERS, type Tier } from "@/data/acceptedVehicles";
import { cn } from "@/lib/utils";

const tierColors: Record<Tier, string> = {
  Standard: "bg-emerald-500/20 text-emerald-400 border-emerald-500/40",
  "Extra Comfort": "bg-blue-500/20 text-blue-400 border-blue-500/40",
  Black: "bg-slate-400/20 text-slate-300 border-slate-400/40",
  XL: "bg-purple-500/20 text-purple-400 border-purple-500/40",
};

export default function AcceptedVehiclesList() {
  const [search, setSearch] = useState("");
  const [activeTier, setActiveTier] = useState<Tier | "All">("All");

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return acceptedVehicles
      .map((make) => {
        const models = make.models.filter((m) => {
          const matchesTier = activeTier === "All" || m.tiers.includes(activeTier);
          const matchesSearch =
            !q ||
            make.make.toLowerCase().includes(q) ||
            m.name.toLowerCase().includes(q);
          return matchesTier && matchesSearch;
        });
        return { ...make, models };
      })
      .filter((make) => make.models.length > 0);
  }, [search, activeTier]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 p-3 mb-4">
          <Car className="w-6 h-6 text-primary" />
        </div>
        <h2 className="text-3xl font-bold mb-2">Accepted Vehicles</h2>
        <p className="text-muted-foreground">
          {totalModelCount}+ accepted models across {acceptedVehicles.length} makes
        </p>
      </div>

      <div className="rounded-2xl border border-border/50 bg-card/80 backdrop-blur-xl shadow-lg p-5 sm:p-8 space-y-5 hover:border-primary/20 hover:shadow-xl transition-all duration-200">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search make or model…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-muted/30 border-border/40"
          />
        </div>

        {/* Tier chips */}
        <div className="flex flex-wrap gap-2">
          {(["All", ...TIERS] as const).map((tier) => (
            <button
              key={tier}
              onClick={() => setActiveTier(tier)}
              className={cn(
                "px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all duration-200 active:scale-[0.97]",
                activeTier === tier
                  ? "bg-primary text-primary-foreground border-primary shadow-md"
                  : "bg-muted/40 text-muted-foreground border-border/50 hover:bg-muted/60 hover:text-foreground"
              )}
            >
              {tier}
            </button>
          ))}
        </div>

        {/* Accordion */}
        {filtered.length === 0 ? (
          <p className="text-center text-muted-foreground py-8 text-sm">
            No vehicles match your search.
          </p>
        ) : (
          <Accordion type="multiple" className="space-y-0.5">
            {filtered.map((make) => (
              <AccordionItem key={make.make} value={make.make} className="border-b border-border/30">
                <AccordionTrigger className="text-base font-bold hover:no-underline py-3 px-2 rounded-xl hover:bg-muted/30 transition-colors">
                  {make.make}
                  <span className="ml-auto mr-2 text-xs font-normal text-muted-foreground">
                    {make.models.length} model{make.models.length !== 1 && "s"}
                  </span>
                </AccordionTrigger>
                <AccordionContent>
                  <ul className="space-y-2.5 px-2 pb-1">
                    {make.models.map((model) => (
                      <li
                        key={model.name}
                        className="flex flex-wrap items-center gap-2 text-sm"
                      >
                        <span className="font-medium text-foreground">{model.name}</span>
                        <span className="text-muted-foreground text-xs">
                          {model.year}+
                        </span>
                        {model.tiers.map((t) => (
                          <Badge
                            key={t}
                            variant="outline"
                            className={cn(
                              "text-[10px] px-1.5 py-0 font-semibold",
                              tierColors[t as Tier]
                            )}
                          >
                            {t}
                          </Badge>
                        ))}
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}

        {/* Footnotes */}
        <div className="pt-4 border-t border-border/30 text-xs text-muted-foreground space-y-1.5">
          <p>
            <span className="font-semibold text-emerald-400">Standard</span> — 4-door vehicles, 2015 or newer in good condition.
          </p>
          <p>
            <span className="font-semibold text-blue-400">Extra Comfort</span> — newer models with leather interior and extra legroom.
          </p>
          <p>
            <span className="font-semibold text-slate-300">Black</span> — luxury sedans and SUVs, black exterior, leather interior.
          </p>
          <p>
            <span className="font-semibold text-purple-400">XL</span> — vehicles seating 6+ passengers.
          </p>
        </div>
      </div>
    </div>
  );
}
