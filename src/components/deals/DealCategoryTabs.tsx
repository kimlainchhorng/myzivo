/**
 * Deal Category Tabs
 * Tab navigation for deals filtering
 */

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plane, Hotel, Car, Clock, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export type DealCategoryType = 'all' | 'flights' | 'hotels' | 'cars' | 'last-minute';

interface DealCategoryTabsProps {
  activeCategory: DealCategoryType;
  onCategoryChange: (category: DealCategoryType) => void;
  className?: string;
}

const categories = [
  { value: 'all' as const, label: 'All Deals', icon: Sparkles },
  { value: 'flights' as const, label: 'Flights', icon: Plane },
  { value: 'hotels' as const, label: 'Hotels', icon: Hotel },
  { value: 'cars' as const, label: 'Cars', icon: Car },
  { value: 'last-minute' as const, label: 'Last Minute', icon: Clock },
];

const DealCategoryTabs = ({
  activeCategory,
  onCategoryChange,
  className,
}: DealCategoryTabsProps) => {
  return (
    <Tabs
      value={activeCategory}
      onValueChange={(value) => onCategoryChange(value as DealCategoryType)}
      className={className}
    >
      <TabsList className="h-auto p-1 bg-muted/50 rounded-xl flex-wrap">
        {categories.map((category) => {
          const Icon = category.icon;
          return (
            <TabsTrigger
              key={category.value}
              value={category.value}
              className={cn(
                "gap-1.5 px-4 py-2 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm"
              )}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{category.label}</span>
            </TabsTrigger>
          );
        })}
      </TabsList>
    </Tabs>
  );
};

export default DealCategoryTabs;
