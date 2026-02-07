/**
 * JSON Diff Viewer Component
 * Side-by-side before/after comparison
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface JsonDiffViewerProps {
  before: Record<string, unknown> | null;
  after: Record<string, unknown> | null;
}

export default function JsonDiffViewer({ before, after }: JsonDiffViewerProps) {
  // Get all unique keys from both objects
  const allKeys = new Set([
    ...Object.keys(before || {}),
    ...Object.keys(after || {}),
  ]);

  const formatValue = (value: unknown): string => {
    if (value === null || value === undefined) return "—";
    if (typeof value === "object") return JSON.stringify(value, null, 2);
    return String(value);
  };

  const hasChanges = before || after;

  if (!hasChanges) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No before/after data recorded for this action.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Before */}
      <Card>
        <CardHeader className="py-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Before
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {before ? (
            <div className="space-y-2">
            {Array.from(allKeys).map((key) => {
              const beforeVal = (before as Record<string, unknown>)?.[key];
              const afterVal = (after as Record<string, unknown>)?.[key];
              const isChanged = JSON.stringify(beforeVal) !== JSON.stringify(afterVal);
              const isRemoved = beforeVal !== undefined && afterVal === undefined;

              return (
                <div
                  key={key}
                  className={cn(
                    "text-sm font-mono p-2 rounded",
                    isRemoved && "bg-destructive/10",
                    isChanged && !isRemoved && "bg-accent/50"
                  )}
                >
                  <span className="text-muted-foreground">{key}:</span>{" "}
                  <span className={cn(isChanged && "text-primary")}>
                    {formatValue(beforeVal)}
                  </span>
                </div>
              );
            })}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground italic">No previous state</p>
          )}
        </CardContent>
      </Card>

      {/* After */}
      <Card>
        <CardHeader className="py-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            After
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {after ? (
            <div className="space-y-2">
            {Array.from(allKeys).map((key) => {
              const beforeVal = (before as Record<string, unknown>)?.[key];
              const afterVal = (after as Record<string, unknown>)?.[key];
              const isChanged = JSON.stringify(beforeVal) !== JSON.stringify(afterVal);
              const isNew = beforeVal === undefined && afterVal !== undefined;

              return (
                <div
                  key={key}
                  className={cn(
                    "text-sm font-mono p-2 rounded",
                    isNew && "bg-primary/10",
                    isChanged && !isNew && "bg-accent/50"
                  )}
                >
                  <span className="text-muted-foreground">{key}:</span>{" "}
                  <span className={cn(isChanged && "text-primary")}>
                    {formatValue(afterVal)}
                  </span>
                </div>
              );
            })}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground italic">No resulting state</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
