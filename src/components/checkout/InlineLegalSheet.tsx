/**
 * Inline Legal Sheet — opens legal pages in a bottom sheet overlay
 * Uses an iframe to render the actual React page so content loads properly
 */
import { useState } from "react";
import { X, Loader2 } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

interface InlineLegalSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  url: string;
}

export default function InlineLegalSheet({ open, onOpenChange, title, url }: InlineLegalSheetProps) {
  const [loading, setLoading] = useState(true);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl p-0 flex flex-col">
        <SheetHeader className="px-5 pt-5 pb-3 border-b border-border/30 flex-row items-center justify-between shrink-0">
          <SheetTitle className="text-base font-bold">{title}</SheetTitle>
          <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)} className="rounded-full h-8 w-8">
            <X className="w-4 h-4" />
          </Button>
        </SheetHeader>
        <div className="flex-1 relative overflow-hidden">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background z-10">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
          )}
          {open && (
            <iframe
              src={url}
              className="w-full h-full border-0"
              onLoad={() => setLoading(false)}
              title={title}
            />
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

/**
 * Hook to manage legal sheet state
 */
export function useLegalSheet() {
  const [sheet, setSheet] = useState<{ open: boolean; title: string; url: string }>({
    open: false,
    title: "",
    url: "",
  });

  const openSheet = (title: string, url: string) => {
    setSheet({ open: true, title, url });
  };

  const closeSheet = () => {
    setSheet(prev => ({ ...prev, open: false }));
  };

  return { sheet, openSheet, closeSheet, setOpen: (open: boolean) => setSheet(prev => ({ ...prev, open })) };
}
