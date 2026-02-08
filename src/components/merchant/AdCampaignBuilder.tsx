/**
 * Ad Campaign Builder
 * Step-by-step campaign creation wizard
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, ChevronLeft, ChevronRight, Rocket, Search, Home, LayoutGrid } from "lucide-react";
import { useCreateAd } from "@/hooks/useRestaurantAds";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface AdCampaignBuilderProps {
  restaurantId: string;
  onSuccess: () => void;
}

const PLACEMENTS = [
  { id: "search", label: "Search Results", icon: Search, description: "Appear at the top of search results" },
  { id: "homepage", label: "Homepage", icon: Home, description: "Featured on the Eats homepage" },
  { id: "all", label: "All Placements", icon: LayoutGrid, description: "Maximum visibility everywhere" },
];

const AdCampaignBuilder = ({ restaurantId, onSuccess }: AdCampaignBuilderProps) => {
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [placement, setPlacement] = useState("search");
  const [dailyBudget, setDailyBudget] = useState(10);
  const [totalBudget, setTotalBudget] = useState<number | null>(null);
  const [hasTotalBudget, setHasTotalBudget] = useState(false);
  const [startDate, setStartDate] = useState<Date | undefined>(new Date());
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [hasEndDate, setHasEndDate] = useState(false);

  const createAd = useCreateAd();

  const costPerClick = 0.25; // Fixed CPC
  const estimatedDailyClicks = Math.floor(dailyBudget / costPerClick);
  const estimatedDailyImpressions = estimatedDailyClicks * 15; // Assume 6.7% CTR

  const handleSubmit = async () => {
    await createAd.mutateAsync({
      restaurantId,
      name: name || "Untitled Campaign",
      placement: placement as any,
      dailyBudget,
      totalBudget: hasTotalBudget ? totalBudget : null,
      costPerClick,
      startDate: startDate?.toISOString(),
      endDate: hasEndDate && endDate ? endDate.toISOString() : undefined,
      status: "active",
    });
    onSuccess();
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return name.trim().length > 0;
      case 2:
        return dailyBudget >= 5;
      case 3:
        return !!startDate;
      case 4:
        return true;
      default:
        return false;
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="flex items-center justify-center gap-2">
        {[1, 2, 3, 4].map((s) => (
          <div
            key={s}
            className={cn(
              "w-2 h-2 rounded-full transition-colors",
              s === step ? "bg-primary w-6" : s < step ? "bg-primary" : "bg-muted"
            )}
          />
        ))}
      </div>

      {/* Step 1: Name & Placement */}
      {step === 1 && (
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Campaign Name</Label>
            <Input
              id="name"
              placeholder="e.g., Weekend Special, Lunch Rush"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-3">
            <Label>Placement</Label>
            <RadioGroup value={placement} onValueChange={setPlacement}>
              {PLACEMENTS.map((p) => (
                <div
                  key={p.id}
                  className={cn(
                    "flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors",
                    placement === p.id
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  )}
                  onClick={() => setPlacement(p.id)}
                >
                  <RadioGroupItem value={p.id} id={p.id} className="mt-0.5" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p.icon className="h-4 w-4 text-primary" />
                      <Label htmlFor={p.id} className="cursor-pointer font-medium">
                        {p.label}
                      </Label>
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {p.description}
                    </p>
                  </div>
                </div>
              ))}
            </RadioGroup>
          </div>
        </div>
      )}

      {/* Step 2: Budget */}
      {step === 2 && (
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Daily Budget</Label>
              <span className="text-2xl font-bold">${dailyBudget}</span>
            </div>
            <Slider
              value={[dailyBudget]}
              onValueChange={([v]) => setDailyBudget(v)}
              min={5}
              max={100}
              step={5}
              className="py-4"
            />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>$5 min</span>
              <span>$100 max</span>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-muted/50 space-y-2">
            <p className="text-sm font-medium">Estimated Daily Performance</p>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Impressions</p>
                <p className="font-semibold">~{estimatedDailyImpressions.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Clicks</p>
                <p className="font-semibold">~{estimatedDailyClicks}</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Cost per click: ${costPerClick.toFixed(2)}
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="total-budget">Set Total Budget Cap</Label>
              <Switch
                id="total-budget"
                checked={hasTotalBudget}
                onCheckedChange={setHasTotalBudget}
              />
            </div>
            {hasTotalBudget && (
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">$</span>
                <Input
                  type="number"
                  placeholder="100"
                  value={totalBudget || ""}
                  onChange={(e) => setTotalBudget(Number(e.target.value) || null)}
                  min={dailyBudget}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Step 3: Schedule */}
      {step === 3 && (
        <div className="space-y-6">
          <div className="space-y-3">
            <Label>Start Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={setStartDate}
                  disabled={(date) => date < new Date()}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="end-date">Set End Date</Label>
              <Switch
                id="end-date"
                checked={hasEndDate}
                onCheckedChange={setHasEndDate}
              />
            </div>
            {hasEndDate && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "PPP") : "Pick end date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    disabled={(date) => date < (startDate || new Date())}
                  />
                </PopoverContent>
              </Popover>
            )}
          </div>

          {!hasEndDate && (
            <p className="text-sm text-muted-foreground">
              Campaign will run until you pause it or the budget is exhausted.
            </p>
          )}
        </div>
      )}

      {/* Step 4: Review & Launch */}
      {step === 4 && (
        <div className="space-y-6">
          <div className="text-center mb-6">
            <Rocket className="h-12 w-12 text-primary mx-auto mb-2" />
            <h3 className="text-lg font-semibold">Ready to Launch!</h3>
          </div>

          <div className="space-y-3 p-4 rounded-lg bg-muted/50">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Campaign Name</span>
              <span className="font-medium">{name || "Untitled"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Placement</span>
              <span className="font-medium capitalize">{placement}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Daily Budget</span>
              <span className="font-medium">${dailyBudget}/day</span>
            </div>
            {hasTotalBudget && totalBudget && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Budget</span>
                <span className="font-medium">${totalBudget}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Start Date</span>
              <span className="font-medium">
                {startDate ? format(startDate, "MMM d, yyyy") : "Now"}
              </span>
            </div>
            {hasEndDate && endDate && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">End Date</span>
                <span className="font-medium">{format(endDate, "MMM d, yyyy")}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Cost Per Click</span>
              <span className="font-medium">${costPerClick.toFixed(2)}</span>
            </div>
          </div>

          <p className="text-sm text-muted-foreground text-center">
            Your campaign will go live immediately after launch.
            You can pause or edit it anytime.
          </p>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between pt-4 border-t">
        <Button
          variant="outline"
          onClick={() => setStep((s) => s - 1)}
          disabled={step === 1}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back
        </Button>

        {step < 4 ? (
          <Button onClick={() => setStep((s) => s + 1)} disabled={!canProceed()}>
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={createAd.isPending}
          >
            {createAd.isPending ? "Launching..." : "Launch Campaign"}
            <Rocket className="h-4 w-4 ml-1" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default AdCampaignBuilder;
