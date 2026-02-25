/**
 * Mobile Filter Bottom Sheet
 * Touch-friendly filter UI for mobile devices
 */

import { ReactNode } from 'react';
import { X, SlidersHorizontal, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface MobileFilterSheetProps {
  children: ReactNode;
  title?: string;
  activeFiltersCount?: number;
  onApply?: () => void;
  onReset?: () => void;
  trigger?: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export default function MobileFilterSheet({
  children,
  title = 'Filters',
  activeFiltersCount = 0,
  onApply,
  onReset,
  trigger,
  open,
  onOpenChange,
}: MobileFilterSheetProps) {
  const defaultTrigger = (
    <Button variant="outline" size="sm" className="gap-2">
      <SlidersHorizontal className="w-4 h-4" />
      {title}
      {activeFiltersCount > 0 && (
        <span className="ml-1 px-1.5 py-0.5 rounded-full bg-primary text-primary-foreground text-xs">
          {activeFiltersCount}
        </span>
      )}
    </Button>
  );

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerTrigger asChild>
        {trigger || defaultTrigger}
      </DrawerTrigger>
      <DrawerContent className="max-h-[85vh]">
        <DrawerHeader className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5" />
            <DrawerTitle>{title}</DrawerTitle>
            {activeFiltersCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
                {activeFiltersCount} active
              </span>
            )}
          </div>
          {onReset && activeFiltersCount > 0 && (
            <Button variant="ghost" size="sm" onClick={onReset} className="gap-1.5">
              <RotateCcw className="w-4 h-4" />
              Reset
            </Button>
          )}
        </DrawerHeader>

        <ScrollArea className="flex-1 px-4 py-4 overflow-y-auto">
          <div className="space-y-6">
            {children}
          </div>
        </ScrollArea>

        <DrawerFooter className="border-t border-border pt-4">
          <div className="flex gap-3">
            <DrawerClose asChild>
              <Button variant="outline" className="flex-1">
                Cancel
              </Button>
            </DrawerClose>
            <DrawerClose asChild>
              <Button className="flex-1" onClick={onApply}>
                Apply Filters
              </Button>
            </DrawerClose>
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

/**
 * Filter Section Component
 */
interface FilterSectionProps {
  title: string;
  children: ReactNode;
  collapsible?: boolean;
  defaultOpen?: boolean;
}

export function FilterSection({
  title,
  children,
  collapsible = false,
  defaultOpen = true,
}: FilterSectionProps) {
  return (
    <div className="space-y-3">
      <h3 className="font-medium text-sm">{title}</h3>
      <div className="space-y-2">
        {children}
      </div>
    </div>
  );
}

/**
 * Filter Option (Checkbox style)
 */
interface FilterOptionProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  count?: number;
  disabled?: boolean;
}

export function FilterOption({
  label,
  checked,
  onChange,
  count,
  disabled = false,
}: FilterOptionProps) {
  return (
    <button
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
      className={cn(
        "w-full flex items-center justify-between py-2.5 px-3 rounded-xl border transition-colors touch-manipulation",
        checked
          ? "border-primary bg-primary/5 text-primary"
          : "border-border hover:border-muted-foreground/30",
        disabled && "opacity-50 cursor-not-allowed"
      )}
    >
      <span className="text-sm">{label}</span>
      {count !== undefined && (
        <span className={cn(
          "text-xs px-2 py-0.5 rounded-full",
          checked ? "bg-primary/20" : "bg-muted"
        )}>
          {count}
        </span>
      )}
    </button>
  );
}

/**
 * Range Filter (Price, Rating, etc.)
 */
interface RangeFilterProps {
  min: number;
  max: number;
  value: [number, number];
  onChange: (value: [number, number]) => void;
  formatLabel?: (value: number) => string;
  step?: number;
}

export function RangeFilter({
  min,
  max,
  value,
  onChange,
  formatLabel = (v) => String(v),
  step = 1,
}: RangeFilterProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">{formatLabel(value[0])}</span>
        <span className="text-muted-foreground">to</span>
        <span className="font-medium">{formatLabel(value[1])}</span>
      </div>
      <div className="flex gap-2">
        <input
          type="range"
          min={min}
          max={max}
          value={value[0]}
          step={step}
          onChange={(e) => onChange([Number(e.target.value), value[1]])}
          className="flex-1 accent-primary"
        />
        <input
          type="range"
          min={min}
          max={max}
          value={value[1]}
          step={step}
          onChange={(e) => onChange([value[0], Number(e.target.value)])}
          className="flex-1 accent-primary"
        />
      </div>
    </div>
  );
}
