import * as React from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Filter, X, ChevronDown, SlidersHorizontal } from "lucide-react";
import { Button } from "./button";
import { Input } from "./input";
import { Badge } from "./badge";

// Enhanced Search Bar with Suggestions
interface SearchBarProps {
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  suggestions?: string[];
  onSuggestionClick?: (suggestion: string) => void;
  leftIcon?: React.ReactNode;
  color?: "rides" | "eats" | "sky" | "amber" | "primary";
  className?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = "Search...",
  value,
  onChange,
  suggestions = [],
  onSuggestionClick,
  leftIcon,
  color = "primary",
  className,
}) => {
  const [isFocused, setIsFocused] = React.useState(false);
  const showSuggestions = isFocused && suggestions.length > 0 && value.length > 0;

  const colorClasses = {
    rides: "focus-within:ring-rides/50 focus-within:border-rides/50",
    eats: "focus-within:ring-eats/50 focus-within:border-eats/50",
    sky: "focus-within:ring-sky-400/50 focus-within:border-sky-400/50",
    amber: "focus-within:ring-amber-400/50 focus-within:border-amber-400/50",
    primary: "focus-within:ring-primary/50 focus-within:border-primary/50",
  };

  const iconColors = {
    rides: "text-rides",
    eats: "text-eats",
    sky: "text-sky-400",
    amber: "text-amber-400",
    primary: "text-primary",
  };

  return (
    <div className={cn("relative", className)}>
      <div className={cn(
        "flex items-center gap-2 glass-card rounded-2xl px-4 border border-white/10 transition-all duration-300 focus-within:ring-2",
        colorClasses[color]
      )}>
        {leftIcon || <Search className={cn("w-5 h-5", iconColors[color])} />}
        <Input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          className="border-none bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 h-12 px-0"
        />
        {value && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            onClick={() => onChange("")}
            className="p-1 rounded-full hover:bg-muted transition-colors"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </motion.button>
        )}
      </div>

      <AnimatePresence>
        {showSuggestions && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 glass-card rounded-xl border border-white/10 overflow-hidden z-50"
          >
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => onSuggestionClick?.(suggestion)}
                className="w-full px-4 py-3 text-left hover:bg-muted/50 transition-colors flex items-center gap-3"
              >
                <Search className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">{suggestion}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Filter Chip
interface FilterChipProps {
  label: string;
  active?: boolean;
  onClick?: () => void;
  count?: number;
  icon?: React.ReactNode;
  color?: "rides" | "eats" | "sky" | "amber" | "default";
}

export const FilterChip: React.FC<FilterChipProps> = ({
  label,
  active = false,
  onClick,
  count,
  icon,
  color = "default",
}) => {
  const activeColors = {
    rides: "gradient-rides text-primary-foreground",
    eats: "gradient-eats text-secondary-foreground",
    sky: "bg-sky-500 text-white",
    amber: "bg-amber-500 text-white",
    default: "bg-primary text-primary-foreground",
  };

  return (
    <motion.button
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 whitespace-nowrap",
        active 
          ? activeColors[color] 
          : "glass-card border border-white/10 hover:border-white/20 text-foreground"
      )}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {icon}
      <span>{label}</span>
      {count !== undefined && (
        <span className={cn(
          "px-1.5 py-0.5 text-xs rounded-full",
          active ? "bg-white/20" : "bg-muted"
        )}>
          {count}
        </span>
      )}
    </motion.button>
  );
};

// Filter Panel
interface FilterOption {
  id: string;
  label: string;
  count?: number;
  icon?: React.ReactNode;
}

interface FilterPanelProps {
  title?: string;
  filters: FilterOption[];
  selected: string[];
  onChange: (selected: string[]) => void;
  color?: "rides" | "eats" | "sky" | "amber" | "default";
  multiSelect?: boolean;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  title,
  filters,
  selected,
  onChange,
  color = "default",
  multiSelect = true,
}) => {
  const handleClick = (id: string) => {
    if (multiSelect) {
      if (selected.includes(id)) {
        onChange(selected.filter((s) => s !== id));
      } else {
        onChange([...selected, id]);
      }
    } else {
      onChange([id]);
    }
  };

  return (
    <div className="space-y-3">
      {title && (
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold text-foreground">{title}</h4>
          {selected.length > 0 && (
            <button
              onClick={() => onChange([])}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      )}
      <div className="flex flex-wrap gap-2">
        {filters.map((filter) => (
          <FilterChip
            key={filter.id}
            label={filter.label}
            active={selected.includes(filter.id)}
            onClick={() => handleClick(filter.id)}
            count={filter.count}
            icon={filter.icon}
            color={selected.includes(filter.id) ? color : "default"}
          />
        ))}
      </div>
    </div>
  );
};

// Sort Dropdown
interface SortOption {
  id: string;
  label: string;
}

interface SortDropdownProps {
  options: SortOption[];
  value: string;
  onChange: (value: string) => void;
  label?: string;
}

export const SortDropdown: React.FC<SortDropdownProps> = ({
  options,
  value,
  onChange,
  label = "Sort by",
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const selectedOption = options.find((o) => o.id === value);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 glass-card rounded-xl border border-white/10 hover:border-white/20 transition-colors"
      >
        <SlidersHorizontal className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm font-medium">
          {label}: {selectedOption?.label}
        </span>
        <ChevronDown className={cn(
          "w-4 h-4 text-muted-foreground transition-transform",
          isOpen && "rotate-180"
        )} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setIsOpen(false)} 
            />
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full right-0 mt-2 min-w-[180px] glass-card rounded-xl border border-white/10 overflow-hidden z-50"
            >
              {options.map((option) => (
                <button
                  key={option.id}
                  onClick={() => {
                    onChange(option.id);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "w-full px-4 py-3 text-left text-sm hover:bg-muted/50 transition-colors",
                    option.id === value && "bg-primary/10 text-primary"
                  )}
                >
                  {option.label}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

// Active Filters Display
interface ActiveFiltersProps {
  filters: { id: string; label: string }[];
  onRemove: (id: string) => void;
  onClearAll: () => void;
}

export const ActiveFilters: React.FC<ActiveFiltersProps> = ({
  filters,
  onRemove,
  onClearAll,
}) => {
  if (filters.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="flex flex-wrap items-center gap-2"
    >
      <span className="text-sm text-muted-foreground">Active filters:</span>
      {filters.map((filter) => (
        <Badge
          key={filter.id}
          variant="secondary"
          className="flex items-center gap-1 pr-1"
        >
          {filter.label}
          <button
            onClick={() => onRemove(filter.id)}
            className="ml-1 p-0.5 rounded-full hover:bg-white/20 transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        </Badge>
      ))}
      <button
        onClick={onClearAll}
        className="text-xs text-primary hover:underline"
      >
        Clear all
      </button>
    </motion.div>
  );
};
