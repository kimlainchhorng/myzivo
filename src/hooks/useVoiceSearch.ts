import { useState, useRef, useCallback, useEffect } from "react";
import { toast } from "sonner";

interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent {
  error: string;
  message?: string;
}

interface SpeechRecognitionInstance {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognitionInstance;
    webkitSpeechRecognition: new () => SpeechRecognitionInstance;
  }
}

const FILLER_PATTERNS = /\b(find|show|search\s+for|search|look\s+for|get\s+me|i\s+want|near\s+me|nearby|around\s+me|please)\b/gi;

export function parseVoiceCommand(transcript: string): { type: "search"; query: string } | { type: "reorder" } {
  const lower = transcript.toLowerCase().trim();

  if (lower.includes("reorder") || lower.includes("last order") || lower.includes("order again") || lower.includes("previous order")) {
    return { type: "reorder" };
  }

  const cleaned = transcript.replace(FILLER_PATTERNS, "").replace(/\s+/g, " ").trim();
  return { type: "search", query: cleaned || transcript.trim() };
}

interface UseVoiceSearchOptions {
  onResult?: (transcript: string) => void;
}

export function useVoiceSearch(options?: UseVoiceSearchOptions) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  const SpeechRecognitionAPI =
    typeof window !== "undefined"
      ? window.SpeechRecognition || window.webkitSpeechRecognition
      : null;

  const isSupported = !!SpeechRecognitionAPI;

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false);
  }, []);

  const startListening = useCallback(() => {
    if (!SpeechRecognitionAPI) {
      toast.error("Voice search is not supported in this browser.");
      return;
    }

    setError(null);
    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const result = event.results[event.resultIndex][0].transcript;
      setTranscript(result);
      options?.onResult?.(result);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      setIsListening(false);
      if (event.error === "not-allowed" || event.error === "permission-denied") {
        setError("permission-denied");
        toast.error("Microphone access needed for voice search.");
      } else if (event.error !== "no-speech" && event.error !== "aborted") {
        setError(event.error);
        toast.error("Voice search error. Please try again.");
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  }, [SpeechRecognitionAPI, options]);

  useEffect(() => {
    return () => {
      recognitionRef.current?.abort();
    };
  }, []);

  return {
    isListening,
    isSupported,
    transcript,
    startListening,
    stopListening,
    error,
  };
}
