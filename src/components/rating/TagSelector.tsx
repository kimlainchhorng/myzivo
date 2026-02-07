/**
 * TagSelector Component
 * Multi-select tag checkboxes for rating feedback
 */

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export interface RatingTag {
  id: string;
  label: string;
  category: "positive" | "negative";
  icon?: string;
}

export const RATING_TAGS: RatingTag[] = [
  // Positive tags
  { id: "great_service", label: "Great Service", category: "positive" },
  { id: "on_time", label: "On Time", category: "positive" },
  { id: "friendly", label: "Friendly", category: "positive" },
  { id: "professional", label: "Professional", category: "positive" },
  // Negative tags
  { id: "late", label: "Late Delivery", category: "negative" },
  { id: "rude", label: "Rude", category: "negative" },
  { id: "cold_food", label: "Cold Food", category: "negative" },
  { id: "wrong_item", label: "Wrong Item", category: "negative" },
  { id: "unsafe", label: "Unsafe", category: "negative" },
  { id: "damaged", label: "Damaged", category: "negative" },
];

interface TagSelectorProps {
  selectedTags: string[];
  onChange: (tags: string[]) => void;
  disabled?: boolean;
}

const TagSelector = ({ selectedTags, onChange, disabled = false }: TagSelectorProps) => {
  const toggleTag = (tagId: string) => {
    if (disabled) return;
    
    if (selectedTags.includes(tagId)) {
      onChange(selectedTags.filter((t) => t !== tagId));
    } else {
      onChange([...selectedTags, tagId]);
    }
  };

  const positiveTags = RATING_TAGS.filter((t) => t.category === "positive");
  const negativeTags = RATING_TAGS.filter((t) => t.category === "negative");

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-medium text-foreground mb-2">
          What went well?
        </p>
        <div className="flex flex-wrap gap-2">
          {positiveTags.map((tag) => {
            const isSelected = selectedTags.includes(tag.id);
            return (
              <Badge
                key={tag.id}
                variant={isSelected ? "default" : "outline"}
                className={cn(
                  "cursor-pointer transition-all",
                  isSelected
                    ? "bg-green-600 hover:bg-green-700 border-green-600"
                    : "hover:bg-green-100 hover:border-green-300",
                  disabled && "opacity-50 cursor-not-allowed"
                )}
                onClick={() => toggleTag(tag.id)}
              >
                {tag.label}
              </Badge>
            );
          })}
        </div>
      </div>

      <div>
        <p className="text-sm font-medium text-foreground mb-2">
          Any issues?
        </p>
        <div className="flex flex-wrap gap-2">
          {negativeTags.map((tag) => {
            const isSelected = selectedTags.includes(tag.id);
            return (
              <Badge
                key={tag.id}
                variant={isSelected ? "default" : "outline"}
                className={cn(
                  "cursor-pointer transition-all",
                  isSelected
                    ? "bg-destructive hover:bg-destructive/90 border-destructive"
                    : "hover:bg-red-50 hover:border-red-300",
                  disabled && "opacity-50 cursor-not-allowed"
                )}
                onClick={() => toggleTag(tag.id)}
              >
                {tag.label}
              </Badge>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TagSelector;
