/**
 * CommentsSheet — Instagram-style bottom sheet for post comments
 * Supports reply threads, emoji reactions, and real-time updates
 */
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Heart, Trash2, CornerDownRight, ChevronDown, ChevronUp } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { usePostComments, PostComment } from "@/hooks/usePostComments";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const REACTION_EMOJIS = ["❤️", "😂", "😮", "😢", "🔥"];

interface CommentsSheetProps {
  open: boolean;
  onClose: () => void;
  postId: string;
  postSource: "user" | "store";
  currentUserId: string | null;
  commentsCount: number;
  onCommentsCountChange?: (count: number) => void;
  dark?: boolean; // for fullscreen reels mode
}

export default function CommentsSheet({
  open, onClose, postId, postSource, currentUserId, commentsCount, onCommentsCountChange, dark = false,
}: CommentsSheetProps) {
  const { comments, loading, submitting, addComment, deleteComment, toggleReaction } = usePostComments({
    postId, postSource, currentUserId,
  });
  const [text, setText] = useState("");
  const [replyTo, setReplyTo] = useState<{ id: string; name: string } | null>(null);
  const [showReactionsFor, setShowReactionsFor] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 300);
  }, [open]);

  const handleSubmit = async () => {
    if (!text.trim()) return;
    if (!currentUserId) { toast.error("Please sign in to comment"); return; }
    await addComment(text, replyTo?.id);
    setText("");
    setReplyTo(null);
    setTimeout(() => scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" }), 100);
  };

  const totalComments = comments.reduce((sum, c) => sum + 1 + (c.replies?.length || 0), 0);
  const bg = dark ? "bg-black/95 text-white" : "bg-background text-foreground";
  const border = dark ? "border-white/10" : "border-border";
  const mutedText = dark ? "text-white/50" : "text-muted-foreground";
  const inputBg = dark ? "bg-white/10 text-white placeholder:text-white/40" : "bg-muted text-foreground placeholder:text-muted-foreground";

  useEffect(() => {
    if (open && !loading) onCommentsCountChange?.(totalComments);
  }, [open, loading, totalComments, onCommentsCountChange]);

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="comments-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex flex-col justify-end"
        onClick={onClose}
      >
        {/* Backdrop */}
        <div className={dark ? "absolute inset-0 bg-black/60" : "absolute inset-0 bg-black/40"} />

        {/* Sheet */}
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 30, stiffness: 300 }}
          className={cn("relative rounded-t-2xl max-h-[70vh] flex flex-col", bg)}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Handle + Header */}
          <div className={cn("flex flex-col items-center pt-2 pb-3 border-b", border)}>
            <div className={cn("w-10 h-1 rounded-full mb-3", dark ? "bg-white/30" : "bg-muted-foreground/30")} />
            <div className="flex items-center justify-between w-full px-4">
              <span className="text-[15px] font-semibold">
                Comments {totalComments > 0 && `(${totalComments})`}
              </span>
              <button onClick={onClose} className="p-1">
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Comments List */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-4 scrollbar-none">
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : comments.length === 0 ? (
              <div className="text-center py-12">
                <p className={cn("text-sm", mutedText)}>No comments yet</p>
                <p className={cn("text-xs mt-1", mutedText)}>Be the first to comment!</p>
              </div>
            ) : (
              comments.map((comment) => (
                <CommentItem
                  key={comment.id}
                  comment={comment}
                  currentUserId={currentUserId}
                  dark={dark}
                  onReply={(id, name) => { setReplyTo({ id, name }); inputRef.current?.focus(); }}
                  onDelete={deleteComment}
                  onToggleReaction={toggleReaction}
                  showReactionsFor={showReactionsFor}
                  setShowReactionsFor={setShowReactionsFor}
                />
              ))
            )}
          </div>

          {/* Reply indicator */}
          {replyTo && (
            <div className={cn("flex items-center justify-between px-4 py-2 border-t", border)}>
              <span className={cn("text-xs", mutedText)}>
                Replying to <span className="font-semibold">{replyTo.name}</span>
              </span>
              <button onClick={() => setReplyTo(null)}>
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          {/* Input */}
          <div className={cn("flex items-center gap-2 px-4 py-3 border-t", border)}
            style={{ paddingBottom: 'max(calc(env(safe-area-inset-bottom, 0px) + 0.75rem), 0.75rem)' }}
          >
            <input
              ref={inputRef}
              type="text"
              placeholder={replyTo ? `Reply to ${replyTo.name}...` : "Add a comment..."}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              className={cn("flex-1 rounded-full px-4 py-2.5 text-[13px] outline-none", inputBg)}
            />
            {text.trim() && (
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="h-9 w-9 rounded-full bg-primary flex items-center justify-center shrink-0"
              >
                <Send className="h-4 w-4 text-primary-foreground" />
              </button>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ─── Single Comment Item ────────────────────────────────────────
function CommentItem({
  comment, currentUserId, dark, onReply, onDelete, onToggleReaction,
  showReactionsFor, setShowReactionsFor, isReply = false,
}: {
  comment: PostComment;
  currentUserId: string | null;
  dark: boolean;
  onReply: (id: string, name: string) => void;
  onDelete: (id: string) => void;
  onToggleReaction: (commentId: string, emoji: string) => void;
  showReactionsFor: string | null;
  setShowReactionsFor: (id: string | null) => void;
  isReply?: boolean;
}) {
  const [showReplies, setShowReplies] = useState(false);
  const mutedText = dark ? "text-white/50" : "text-muted-foreground";
  const isOwn = currentUserId === comment.user_id;

  const timeAgo = (() => {
    try { return formatDistanceToNow(new Date(comment.created_at), { addSuffix: false }); }
    catch { return ""; }
  })();

  return (
    <div className={cn("flex gap-2.5", isReply && "ml-8 mt-2")}>
      <Avatar className="h-8 w-8 shrink-0 mt-0.5">
        <AvatarImage src={comment.author_avatar || undefined} />
        <AvatarFallback className="text-[11px] font-bold">{comment.author_name[0]}</AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="flex items-start gap-1.5">
          <div className="flex-1">
            <p className="text-[13px] leading-snug">
              <span className="font-semibold mr-1.5">{comment.author_name}</span>
              {comment.content}
            </p>
          </div>
        </div>

        {/* Meta row: time, reply, reactions, delete */}
        <div className="flex items-center gap-3 mt-1">
          <span className={cn("text-[11px]", mutedText)}>{timeAgo}</span>
          <button
            onClick={() => onReply(comment.id, comment.author_name)}
            className={cn("text-[11px] font-semibold", mutedText)}
          >
            Reply
          </button>
          {/* Reaction button */}
          <button
            onClick={() => setShowReactionsFor(showReactionsFor === comment.id ? null : comment.id)}
            className={cn("text-[11px]", mutedText)}
          >
            😊
          </button>
          {isOwn && (
            <button onClick={() => { onDelete(comment.id); toast.success("Comment deleted"); }}>
              <Trash2 className={cn("h-3 w-3", mutedText)} />
            </button>
          )}
        </div>

        {/* Reaction pills */}
        {comment.reactions && comment.reactions.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1.5">
            {comment.reactions.map((r) => (
              <button
                key={r.emoji}
                onClick={() => onToggleReaction(comment.id, r.emoji)}
                className={cn(
                  "flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[11px] border transition-all",
                  r.reacted
                    ? (dark ? "bg-primary/20 border-primary/40" : "bg-primary/10 border-primary/30")
                    : (dark ? "bg-white/5 border-white/10" : "bg-muted border-border")
                )}
              >
                {r.emoji} {r.count}
              </button>
            ))}
          </div>
        )}

        {/* Reaction picker popup */}
        <AnimatePresence>
          {showReactionsFor === comment.id && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className={cn(
                "flex gap-1 mt-1.5 p-1.5 rounded-full w-fit",
                dark ? "bg-white/10 backdrop-blur-sm" : "bg-muted shadow-lg"
              )}
            >
              {REACTION_EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => { onToggleReaction(comment.id, emoji); setShowReactionsFor(null); }}
                  className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-primary/10 transition-all text-base hover:scale-125"
                >
                  {emoji}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Replies */}
        {!isReply && comment.replies && comment.replies.length > 0 && (
          <div className="mt-2">
            <button
              onClick={() => setShowReplies(!showReplies)}
              className={cn("flex items-center gap-1 text-[11px] font-semibold", mutedText)}
            >
              <div className={cn("w-6 h-px", dark ? "bg-white/20" : "bg-border")} />
              {showReplies ? (
                <>Hide replies <ChevronUp className="h-3 w-3" /></>
              ) : (
                <>View {comment.replies.length} {comment.replies.length === 1 ? "reply" : "replies"} <ChevronDown className="h-3 w-3" /></>
              )}
            </button>
            <AnimatePresence>
              {showReplies && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  {comment.replies.map((reply) => (
                    <CommentItem
                      key={reply.id}
                      comment={reply}
                      currentUserId={currentUserId}
                      dark={dark}
                      onReply={onReply}
                      onDelete={onDelete}
                      onToggleReaction={onToggleReaction}
                      showReactionsFor={showReactionsFor}
                      setShowReactionsFor={setShowReactionsFor}
                      isReply
                    />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
