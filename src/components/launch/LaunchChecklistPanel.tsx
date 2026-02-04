/**
 * Launch Checklist Panel
 * Interactive checklist with 8 categories for production launch verification
 */
import { useState } from "react";
import { CheckCircle2, Circle, AlertTriangle, ChevronDown, ChevronRight, ExternalLink } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Textarea } from "@/components/ui/textarea";
import {
  useProductionLaunchChecklist,
  useUpdateChecklistItem,
  CATEGORY_LABELS,
} from "@/hooks/useProductionLaunch";
import type { LaunchChecklistCategory, LaunchChecklistItem } from "@/types/productionLaunch";

const CATEGORY_ORDER: LaunchChecklistCategory[] = [
  'environment_switch',
  'booking_tests',
  'legal_trust',
  'security',
  'support_readiness',
  'monitoring_alerts',
  'soft_launch',
  'full_launch',
];

const CATEGORY_ICONS: Record<LaunchChecklistCategory, string> = {
  environment_switch: '⚙️',
  booking_tests: '🧪',
  legal_trust: '⚖️',
  security: '🔐',
  support_readiness: '💬',
  monitoring_alerts: '📊',
  soft_launch: '🚀',
  full_launch: '🎉',
};

interface ChecklistItemRowProps {
  item: LaunchChecklistItem;
  onToggle: (id: string, verified: boolean, notes?: string) => void;
}

function ChecklistItemRow({ item, onToggle }: ChecklistItemRowProps) {
  const [notes, setNotes] = useState(item.verification_notes || '');
  const [showNotes, setShowNotes] = useState(false);

  return (
    <div
      className={`p-3 rounded-lg border transition-colors ${
        item.is_verified
          ? 'border-green-500/20 bg-green-500/5'
          : item.is_critical
          ? 'border-amber-500/20 bg-amber-500/5'
          : 'border-border bg-muted/30'
      }`}
    >
      <div className="flex items-start gap-3">
        <Checkbox
          id={item.id}
          checked={item.is_verified}
          onCheckedChange={(checked) => onToggle(item.id, checked as boolean, notes)}
          className="mt-0.5"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <label
              htmlFor={item.id}
              className={`font-medium text-sm cursor-pointer ${
                item.is_verified ? 'line-through text-muted-foreground' : ''
              }`}
            >
              {item.item_title}
            </label>
            {item.is_critical && !item.is_verified && (
              <Badge variant="destructive" className="text-xs">
                Critical
              </Badge>
            )}
            {item.is_verified && (
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            )}
          </div>
          {item.item_description && (
            <p className="text-xs text-muted-foreground mt-1">{item.item_description}</p>
          )}
          {item.verified_at && (
            <p className="text-xs text-muted-foreground mt-1">
              Verified {new Date(item.verified_at).toLocaleString()}
            </p>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            className="mt-2 h-6 px-2 text-xs"
            onClick={() => setShowNotes(!showNotes)}
          >
            {showNotes ? 'Hide Notes' : 'Add Notes'}
          </Button>
          
          {showNotes && (
            <div className="mt-2">
              <Textarea
                placeholder="Add verification notes..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="text-xs h-16"
              />
              <Button
                size="sm"
                className="mt-2 h-7"
                onClick={() => onToggle(item.id, item.is_verified, notes)}
              >
                Save Notes
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface CategorySectionProps {
  category: LaunchChecklistCategory;
  items: LaunchChecklistItem[];
  onToggle: (id: string, verified: boolean, notes?: string) => void;
}

function CategorySection({ category, items, onToggle }: CategorySectionProps) {
  const [isOpen, setIsOpen] = useState(true);
  
  const verified = items.filter((i) => i.is_verified).length;
  const total = items.length;
  const critical = items.filter((i) => i.is_critical && !i.is_verified).length;
  const percentage = total > 0 ? Math.round((verified / total) * 100) : 0;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-xl">{CATEGORY_ICONS[category]}</span>
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    {CATEGORY_LABELS[category]}
                    {isOpen ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </CardTitle>
                  <CardDescription className="text-xs">
                    {verified}/{total} items verified
                    {critical > 0 && (
                      <span className="text-destructive ml-2">
                        • {critical} critical remaining
                      </span>
                    )}
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Progress value={percentage} className="w-24 h-2" />
                <Badge
                  variant={percentage === 100 ? "default" : "outline"}
                  className={percentage === 100 ? "bg-green-500" : ""}
                >
                  {percentage}%
                </Badge>
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-0">
            <div className="space-y-2">
              {items
                .sort((a, b) => a.sort_order - b.sort_order)
                .map((item) => (
                  <ChecklistItemRow key={item.id} item={item} onToggle={onToggle} />
                ))}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}

export function LaunchChecklistPanel() {
  const { data: checklist, isLoading } = useProductionLaunchChecklist();
  const updateItem = useUpdateChecklistItem();

  const handleToggle = (id: string, verified: boolean, notes?: string) => {
    updateItem.mutate({
      id,
      is_verified: verified,
      verification_notes: notes,
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <div className="animate-pulse text-muted-foreground">Loading checklist...</div>
        </CardContent>
      </Card>
    );
  }

  if (!checklist?.length) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">No checklist items found</p>
        </CardContent>
      </Card>
    );
  }

  // Group items by category
  const groupedItems = CATEGORY_ORDER.reduce((acc, category) => {
    acc[category] = checklist.filter((item) => item.category === category);
    return acc;
  }, {} as Record<LaunchChecklistCategory, LaunchChecklistItem[]>);

  // Calculate overall stats
  const totalItems = checklist.length;
  const verifiedItems = checklist.filter((i) => i.is_verified).length;
  const criticalItems = checklist.filter((i) => i.is_critical);
  const criticalVerified = criticalItems.filter((i) => i.is_verified).length;
  const overallPercentage = Math.round((verifiedItems / totalItems) * 100);

  return (
    <div className="space-y-6">
      {/* Overall Progress */}
      <Card className={criticalVerified === criticalItems.length ? "border-green-500/50" : "border-amber-500/50"}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                {criticalVerified === criticalItems.length ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                )}
                Launch Readiness
              </CardTitle>
              <CardDescription>
                {verifiedItems}/{totalItems} items verified • {criticalVerified}/{criticalItems.length} critical items complete
              </CardDescription>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">{overallPercentage}%</div>
              <Progress value={overallPercentage} className="w-32 h-2 mt-1" />
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Category Sections */}
      <div className="space-y-4">
        {CATEGORY_ORDER.map((category) => (
          <CategorySection
            key={category}
            category={category}
            items={groupedItems[category] || []}
            onToggle={handleToggle}
          />
        ))}
      </div>
    </div>
  );
}
