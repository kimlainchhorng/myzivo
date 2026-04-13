/**
 * ChatSearch — Search through chat history with highlighted results
 */
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Search from "lucide-react/dist/esm/icons/search";
import X from "lucide-react/dist/esm/icons/x";
import ArrowUp from "lucide-react/dist/esm/icons/arrow-up";
import ArrowDown from "lucide-react/dist/esm/icons/arrow-down";

interface ChatSearchProps {
  messages: { id: string; message: string; sender_id: string; created_at: string }[];
  onClose: () => void;
  onScrollToMessage: (id: string) => void;
  currentUserId?: string;
}

export default function ChatSearch({ messages, onClose, onScrollToMessage, currentUserId }: ChatSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<typeof messages>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const q = query.toLowerCase();
    const matches = messages.filter((m) => m.message?.toLowerCase().includes(q));
    setResults(matches);
    setCurrentIndex(0);
    if (matches.length > 0) {
      onScrollToMessage(matches[0].id);
    }
  }, [query, messages]);

  const navigate = (dir: 1 | -1) => {
    if (results.length === 0) return;
    const next = (currentIndex + dir + results.length) % results.length;
    setCurrentIndex(next);
    onScrollToMessage(results[next].id);
  };

  return (
    <motion.div
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -40, opacity: 0 }}
      className="sticky top-0 z-20 bg-background border-b border-border/30 px-3 py-2 flex items-center gap-2"
    >
      <Search className="w-4 h-4 text-muted-foreground shrink-0" />
      <input
        ref={inputRef}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search messages..."
        className="flex-1 text-sm bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
      />
      {results.length > 0 && (
        <span className="text-[10px] text-muted-foreground shrink-0">
          {currentIndex + 1}/{results.length}
        </span>
      )}
      <div className="flex items-center gap-0.5">
        <button onClick={() => navigate(-1)} disabled={results.length === 0} className="p-1 rounded hover:bg-muted disabled:opacity-30">
          <ArrowUp className="w-3.5 h-3.5 text-foreground" />
        </button>
        <button onClick={() => navigate(1)} disabled={results.length === 0} className="p-1 rounded hover:bg-muted disabled:opacity-30">
          <ArrowDown className="w-3.5 h-3.5 text-foreground" />
        </button>
      </div>
      <button onClick={onClose} className="p-1 rounded hover:bg-muted">
        <X className="w-4 h-4 text-muted-foreground" />
      </button>
    </motion.div>
  );
}
