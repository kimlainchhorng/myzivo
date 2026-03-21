/**
 * Inline Legal Sheet — opens legal pages in a bottom sheet overlay
 * so the user stays on the checkout page (app-like behavior)
 */
import { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface InlineLegalSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  url: string;
}

export default function InlineLegalSheet({ open, onOpenChange, title, url }: InlineLegalSheetProps) {
  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    setContent(null);

    // Fetch the page HTML and extract main content
    fetch(url)
      .then(res => res.text())
      .then(html => {
        // Extract body content between main tags or use full body
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");
        const main = doc.querySelector("main") || doc.querySelector("[data-legal-content]") || doc.body;
        setContent(main?.innerHTML || "<p>Content unavailable. Please visit the full page.</p>");
      })
      .catch(() => {
        setContent("<p>Unable to load content. Please try again.</p>");
      })
      .finally(() => setLoading(false));
  }, [open, url]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl p-0">
        <SheetHeader className="px-5 pt-5 pb-3 border-b border-border/30 flex-row items-center justify-between">
          <SheetTitle className="text-base font-bold">{title}</SheetTitle>
          <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)} className="rounded-full h-8 w-8">
            <X className="w-4 h-4" />
          </Button>
        </SheetHeader>
        <ScrollArea className="flex-1 h-[calc(85vh-60px)]">
          <div className="px-5 py-4">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              </div>
            ) : content ? (
              <div
                className="prose prose-sm dark:prose-invert max-w-none text-sm leading-relaxed [&_h1]:text-lg [&_h2]:text-base [&_h3]:text-sm"
                dangerouslySetInnerHTML={{ __html: content }}
              />
            ) : null}
          </div>
        </ScrollArea>
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
