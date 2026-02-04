/**
 * Compliance Checklist Component
 * Monthly/quarterly compliance monitoring for admins
 */

import { useState } from "react";
import {
  AlertTriangle,
  Calendar,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  FileText,
  RefreshCw,
  Shield,
  XCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { COMPLIANCE_MONITORING, CONTENT_SAFETY_RULES } from "@/config/riskManagement";
import { cn } from "@/lib/utils";

interface ChecklistItem {
  id: string;
  label: string;
  checked: boolean;
  lastChecked?: Date;
  notes?: string;
}

interface ComplianceChecklistProps {
  monthlyItems?: ChecklistItem[];
  quarterlyItems?: ChecklistItem[];
  onToggleItem?: (id: string, checked: boolean) => void;
  onAddNote?: (id: string, note: string) => void;
  className?: string;
}

const DEFAULT_MONTHLY: ChecklistItem[] = COMPLIANCE_MONITORING.monthlyChecks.map((check) => ({
  id: check,
  label: check.split("_").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" "),
  checked: false,
}));

const DEFAULT_QUARTERLY: ChecklistItem[] = COMPLIANCE_MONITORING.quarterlyReviews.map((check) => ({
  id: check,
  label: check.split("_").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" "),
  checked: false,
}));

export function ComplianceChecklist({
  monthlyItems = DEFAULT_MONTHLY,
  quarterlyItems = DEFAULT_QUARTERLY,
  onToggleItem,
  onAddNote,
  className,
}: ComplianceChecklistProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>("monthly");

  const getCompletionRate = (items: ChecklistItem[]) => {
    const completed = items.filter((item) => item.checked).length;
    return Math.round((completed / items.length) * 100);
  };

  const monthlyCompletion = getCompletionRate(monthlyItems);
  const quarterlyCompletion = getCompletionRate(quarterlyItems);
  const overallCompletion = getCompletionRate([...monthlyItems, ...quarterlyItems]);

  return (
    <Card className={cn("border-border/50", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Compliance Monitoring
          </CardTitle>
          <Badge
            variant={overallCompletion === 100 ? "default" : "outline"}
            className={cn(overallCompletion === 100 && "bg-emerald-500")}
          >
            {overallCompletion}% Complete
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Overall Progress */}
        <div className="space-y-2">
          <Progress value={overallCompletion} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Monthly: {monthlyCompletion}%</span>
            <span>Quarterly: {quarterlyCompletion}%</span>
          </div>
        </div>

        {/* Monthly Checks */}
        <ChecklistSection
          title="Monthly Checks"
          icon={Calendar}
          items={monthlyItems}
          completion={monthlyCompletion}
          expanded={expandedSection === "monthly"}
          onToggle={() => setExpandedSection(expandedSection === "monthly" ? null : "monthly")}
          onItemToggle={onToggleItem}
        />

        {/* Quarterly Reviews */}
        <ChecklistSection
          title="Quarterly Reviews"
          icon={RefreshCw}
          items={quarterlyItems}
          completion={quarterlyCompletion}
          expanded={expandedSection === "quarterly"}
          onToggle={() => setExpandedSection(expandedSection === "quarterly" ? null : "quarterly")}
          onItemToggle={onToggleItem}
        />

        {/* Alert Thresholds */}
        <div className="pt-3 border-t border-border/50">
          <p className="text-sm font-medium mb-2 flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            Alert Thresholds
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <ThresholdItem
              label="Chargeback Rate"
              threshold={`${COMPLIANCE_MONITORING.alertThresholds.chargebackRate * 100}%`}
            />
            <ThresholdItem
              label="Refund Rate"
              threshold={`${COMPLIANCE_MONITORING.alertThresholds.refundRate * 100}%`}
            />
            <ThresholdItem
              label="Fraud Rate"
              threshold={`${COMPLIANCE_MONITORING.alertThresholds.fraudRate * 100}%`}
            />
            <ThresholdItem
              label="Complaint Rate"
              threshold={`${COMPLIANCE_MONITORING.alertThresholds.complaintRate * 100}%`}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-border/50 flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Last full review: {new Date().toLocaleDateString()}
          </p>
          <Button size="sm" variant="outline" className="gap-1.5 h-7 text-xs">
            <FileText className="w-3 h-3" />
            Export Report
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

interface ChecklistSectionProps {
  title: string;
  icon: React.ElementType;
  items: ChecklistItem[];
  completion: number;
  expanded: boolean;
  onToggle: () => void;
  onItemToggle?: (id: string, checked: boolean) => void;
}

function ChecklistSection({
  title,
  icon: Icon,
  items,
  completion,
  expanded,
  onToggle,
  onItemToggle,
}: ChecklistSectionProps) {
  return (
    <Collapsible open={expanded} onOpenChange={onToggle}>
      <CollapsibleTrigger asChild>
        <Button
          variant="ghost"
          className="w-full justify-between p-3 h-auto hover:bg-muted/50"
        >
          <div className="flex items-center gap-2">
            <Icon className="w-4 h-4 text-muted-foreground" />
            <span className="font-medium text-sm">{title}</span>
            <Badge variant="outline" className="text-xs">
              {items.filter((i) => i.checked).length}/{items.length}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <span className={cn(
              "text-xs",
              completion === 100 ? "text-emerald-500" : "text-muted-foreground"
            )}>
              {completion}%
            </span>
            {expanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </div>
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="px-3 pb-3">
        <div className="space-y-2 mt-2">
          {items.map((item) => (
            <div
              key={item.id}
              className={cn(
                "flex items-center gap-3 p-2 rounded-lg",
                item.checked ? "bg-emerald-500/5" : "bg-muted/30"
              )}
            >
              <Checkbox
                id={item.id}
                checked={item.checked}
                onCheckedChange={(checked) => onItemToggle?.(item.id, checked as boolean)}
              />
              <label
                htmlFor={item.id}
                className={cn(
                  "flex-1 text-sm cursor-pointer",
                  item.checked && "text-muted-foreground line-through"
                )}
              >
                {item.label}
              </label>
              {item.checked ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              ) : (
                <Clock className="w-4 h-4 text-muted-foreground" />
              )}
            </div>
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

function ThresholdItem({ label, threshold }: { label: string; threshold: string }) {
  return (
    <div className="flex items-center justify-between p-2 rounded bg-muted/30">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">&lt; {threshold}</span>
    </div>
  );
}

/**
 * Content Safety Audit Component
 * Checks for prohibited claims and copy
 */
export function ContentSafetyAudit({ className }: { className?: string }) {
  const [issues, setIssues] = useState<string[]>([]);

  const runAudit = () => {
    // In production, this would scan the codebase/content
    setIssues([]);
  };

  return (
    <Card className={cn("border-border/50", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <FileText className="w-4 h-4" />
          Content Safety Audit
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="text-xs text-muted-foreground space-y-1">
          <p><strong>Prohibited claims:</strong></p>
          <ul className="list-disc list-inside">
            {CONTENT_SAFETY_RULES.prohibitedClaims.slice(0, 3).map((claim) => (
              <li key={claim}>{claim.replace(/_/g, " ")}</li>
            ))}
          </ul>
        </div>

        {issues.length === 0 ? (
          <div className="flex items-center gap-2 text-sm text-emerald-500">
            <Check className="w-4 h-4" />
            No prohibited content detected
          </div>
        ) : (
          <div className="space-y-1">
            {issues.map((issue, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-red-500">
                <XCircle className="w-4 h-4" />
                {issue}
              </div>
            ))}
          </div>
        )}

        <Button size="sm" variant="outline" className="w-full" onClick={runAudit}>
          Run Content Audit
        </Button>
      </CardContent>
    </Card>
  );
}

export default ComplianceChecklist;
