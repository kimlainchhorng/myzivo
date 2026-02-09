import { Mic } from "lucide-react";
import { useVoiceSearch, parseVoiceCommand } from "@/hooks/useVoiceSearch";
import { cn } from "@/lib/utils";

interface VoiceSearchButtonProps {
  onTranscript: (text: string) => void;
  onReorder?: () => void;
  className?: string;
}

export function VoiceSearchButton({ onTranscript, onReorder, className }: VoiceSearchButtonProps) {
  const { isListening, isSupported, startListening, stopListening } = useVoiceSearch({
    onResult: (transcript) => {
      const command = parseVoiceCommand(transcript);
      if (command.type === "reorder") {
        onReorder?.();
      } else {
        onTranscript(command.query);
      }
    },
  });

  if (!isSupported) return null;

  return (
    <button
      type="button"
      onClick={isListening ? stopListening : startListening}
      className={cn(
        "p-1.5 rounded-full transition-all duration-200 focus:outline-none",
        isListening
          ? "text-red-500 animate-pulse bg-red-500/10"
          : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
        className
      )}
      aria-label={isListening ? "Stop voice search" : "Voice search"}
      title={isListening ? "Listening... tap to stop" : "Search by voice"}
    >
      <Mic className="w-4 h-4" />
    </button>
  );
}
