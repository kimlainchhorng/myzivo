/**
 * Mobile Test Checklist
 * Interactive checklist for manual mobile testing before launch
 */

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Smartphone, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface TestItem {
  id: string;
  label: string;
  description: string;
}

const mobileTests: TestItem[] = [
  {
    id: "flight-search",
    label: "Flight search works on mobile",
    description: "Test search form, date picker, location selector",
  },
  {
    id: "filters-usable",
    label: "Filters usable on small screens",
    description: "Slide-in panels, touch-friendly toggles",
  },
  {
    id: "book-now-tap",
    label: "Book Now buttons easy to tap",
    description: "44px+ touch targets, no accidental taps",
  },
  {
    id: "pages-load-fast",
    label: "Pages load in under 3 seconds",
    description: "Test on 4G connection, check Core Web Vitals",
  },
  {
    id: "sticky-cta",
    label: "Sticky CTA visible during scroll",
    description: "Bottom bar stays visible on results pages",
  },
  {
    id: "forms-submit",
    label: "Forms submit correctly",
    description: "Test traveler info, checkout forms",
  },
  {
    id: "images-load",
    label: "Images load properly",
    description: "No broken images, proper lazy loading",
  },
  {
    id: "navigation-works",
    label: "Mobile navigation works",
    description: "Bottom nav, back buttons, gestures",
  },
  {
    id: "keyboard-closes",
    label: "Keyboard closes correctly",
    description: "No stuck keyboards, proper input handling",
  },
  {
    id: "landscape-mode",
    label: "Landscape mode acceptable",
    description: "No critical layout breaks",
  },
];

export default function MobileTestChecklist() {
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  const handleToggle = (id: string) => {
    setChecked((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const checkedCount = Object.values(checked).filter(Boolean).length;
  const progressPercent = Math.round((checkedCount / mobileTests.length) * 100);
  const allComplete = checkedCount === mobileTests.length;

  return (
    <Card className={cn(allComplete && "border-emerald-500/30")}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-10 h-10 rounded-lg flex items-center justify-center",
              allComplete ? "bg-emerald-500/10 text-emerald-500" : "bg-muted text-muted-foreground"
            )}>
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-lg">Mobile Test Checklist</CardTitle>
              <CardDescription>Manual testing for mobile experience</CardDescription>
            </div>
          </div>
          {allComplete ? (
            <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30">
              <CheckCircle2 className="w-3 h-3 mr-1" />
              Complete
            </Badge>
          ) : (
            <Badge variant="secondary">{checkedCount}/{mobileTests.length}</Badge>
          )}
        </div>
        <Progress value={progressPercent} className="h-2 mt-4" />
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
          {mobileTests.map((test) => (
            <div
              key={test.id}
              className={cn(
                "flex items-start gap-3 p-3 rounded-lg border transition-colors cursor-pointer",
                checked[test.id]
                  ? "bg-emerald-500/5 border-emerald-500/30"
                  : "bg-muted/30 border-transparent hover:bg-muted/50"
              )}
              onClick={() => handleToggle(test.id)}
            >
              <Checkbox
                checked={checked[test.id] || false}
                onCheckedChange={() => handleToggle(test.id)}
                className="mt-0.5"
              />
              <div className="flex-1 min-w-0">
                <p className={cn(
                  "font-medium text-sm",
                  checked[test.id] && "line-through text-muted-foreground"
                )}>
                  {test.label}
                </p>
                <p className="text-xs text-muted-foreground">{test.description}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
