/**
 * ManagedTagDropdown - Dropdown with save/add/delete for tags like Brand or Category
 */
import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface ManagedTagDropdownProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  savedItems: string[];
  onSaveItem: (item: string) => void;
  onDeleteItem: (item: string) => void;
  placeholder?: string;
}

export default function ManagedTagDropdown({
  label,
  value,
  onChange,
  savedItems,
  onSaveItem,
  onDeleteItem,
  placeholder = "Type or select...",
}: ManagedTagDropdownProps) {
  const [open, setOpen] = useState(false);
  const [newItem, setNewItem] = useState("");
  const [showAddInput, setShowAddInput] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setShowAddInput(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = savedItems.filter(
    (item) => !value || item.toLowerCase().includes(value.toLowerCase())
  );

  const handleAddNew = () => {
    const trimmed = newItem.trim();
    if (trimmed && !savedItems.includes(trimmed)) {
      onSaveItem(trimmed);
      onChange(trimmed);
      setNewItem("");
      setShowAddInput(false);
    }
  };

  const canSaveCurrent = value.trim() && !savedItems.includes(value.trim());

  return (
    <div ref={containerRef} className="relative">
      <div className="flex gap-1.5">
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          onFocus={() => setOpen(true)}
          className="flex-1"
        />
        {canSaveCurrent && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="shrink-0 text-xs gap-1 h-9"
            onClick={() => {
              onSaveItem(value.trim());
            }}
            title="Save to list"
          >
            <Check className="h-3 w-3" />
            Save
          </Button>
        )}
      </div>

      {open && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-popover border border-border rounded-lg shadow-lg max-h-52 overflow-hidden">
          <div className="max-h-40 overflow-y-auto">
            {filtered.length === 0 && !showAddInput && (
              <p className="px-3 py-2 text-xs text-muted-foreground">No saved items</p>
            )}
            {filtered.map((item) => (
              <div
                key={item}
                className="flex items-center justify-between px-3 py-2 hover:bg-muted/50 transition-colors group"
              >
                <button
                  type="button"
                  className={cn(
                    "flex-1 text-left text-sm",
                    value === item && "font-semibold text-primary"
                  )}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    onChange(item);
                    setOpen(false);
                  }}
                >
                  {item}
                </button>
                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onDeleteItem(item);
                    if (value === item) onChange("");
                  }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-destructive/10 text-destructive"
                  title="Delete"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>

          {/* Add new item */}
          <div className="border-t border-border p-2">
            {showAddInput ? (
              <div className="flex gap-1.5">
                <Input
                  value={newItem}
                  onChange={(e) => setNewItem(e.target.value)}
                  placeholder={`New ${label.toLowerCase()}...`}
                  className="h-8 text-xs"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddNew();
                    }
                    if (e.key === "Escape") setShowAddInput(false);
                  }}
                />
                <Button
                  type="button"
                  size="sm"
                  className="h-8 text-xs px-2"
                  onClick={handleAddNew}
                  disabled={!newItem.trim()}
                >
                  Add
                </Button>
              </div>
            ) : (
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  setShowAddInput(true);
                }}
                className="w-full flex items-center gap-1.5 px-2 py-1.5 text-xs text-primary hover:bg-muted/50 rounded transition-colors"
              >
                <Plus className="h-3 w-3" />
                Add new {label.toLowerCase()}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
