/**
 * Live Chat Input
 * Message input with optional image attachment for live chat
 */

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Loader2, ImagePlus, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface LiveChatInputProps {
  onSend: (message: string, imageUrl?: string) => void;
  onUploadImage?: (file: File) => Promise<string>;
  disabled?: boolean;
  isPending?: boolean;
  placeholder?: string;
}

export function LiveChatInput({
  onSend,
  onUploadImage,
  disabled = false,
  isPending = false,
  placeholder = "Type a message...",
}: LiveChatInputProps) {
  const [message, setMessage] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [pendingImageUrl, setPendingImageUrl] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = () => {
    if ((!message.trim() && !pendingImageUrl) || disabled || isPending) return;
    onSend(message.trim(), pendingImageUrl || undefined);
    setMessage("");
    setImagePreview(null);
    setPendingImageUrl(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Submit on Enter without Shift
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onUploadImage) return;

    // Show preview immediately
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload the image
    setUploadingImage(true);
    try {
      const url = await onUploadImage(file);
      setPendingImageUrl(url);
    } catch (error) {
      setImagePreview(null);
    } finally {
      setUploadingImage(false);
    }
  };

  const clearImage = () => {
    setImagePreview(null);
    setPendingImageUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        120
      )}px`;
    }
  }, [message]);

  return (
    <div className="border-t border-border bg-card p-4">
      {/* Image preview */}
      {imagePreview && (
        <div className="relative mb-3 inline-block">
          <img
            src={imagePreview}
            alt="Attachment preview"
            className="max-h-24 rounded-lg border border-border"
          />
          {uploadingImage && (
            <div className="absolute inset-0 bg-background/80 flex items-center justify-center rounded-lg">
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
            </div>
          )}
          <button
            onClick={clearImage}
            className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      <div className="flex items-end gap-2">
        {/* Image upload button */}
        {onUploadImage && (
          <>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled || uploadingImage}
              className="shrink-0 h-11 w-11"
            >
              <ImagePlus className="h-5 w-5 text-muted-foreground" />
            </Button>
          </>
        )}

        <Textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled || isPending}
          className={cn(
            "min-h-[44px] max-h-[120px] resize-none",
            !onUploadImage && "flex-1"
          )}
          rows={1}
        />

        <Button
          onClick={handleSubmit}
          disabled={
            (!message.trim() && !pendingImageUrl) ||
            disabled ||
            isPending ||
            uploadingImage
          }
          size="icon"
          className="shrink-0 h-11 w-11"
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
}

export default LiveChatInput;
