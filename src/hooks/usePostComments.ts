import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface PostComment {
  id: string;
  content: string;
  user_id: string;
  parent_id: string | null;
  likes_count: number;
  created_at: string;
  author_name: string;
  author_avatar: string | null;
  replies?: PostComment[];
  reactions?: { emoji: string; count: number; reacted: boolean }[];
}

interface UsePostCommentsOptions {
  postId: string;
  postSource: "user" | "store";
  currentUserId: string | null;
}

export function usePostComments({ postId, postSource, currentUserId }: UsePostCommentsOptions) {
  const [comments, setComments] = useState<PostComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchComments = useCallback(async () => {
    setLoading(true);
    const { data: rawComments } = await (supabase as any)
      .from("post_comments")
      .select("id, content, user_id, parent_id, likes_count, created_at")
      .eq("post_id", postId)
      .eq("post_source", postSource)
      .order("created_at", { ascending: true });

    if (!rawComments || rawComments.length === 0) {
      setComments([]);
      setLoading(false);
      return;
    }

    // Fetch profiles for all comment authors
    const userIds = [...new Set(rawComments.map((c: any) => c.user_id))] as string[];
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name, avatar_url")
      .in("id", userIds);

    const profileMap = new Map((profiles || []).map((p: any) => [p.id, p]));

    // Fetch reactions for all comments
    const commentIds = rawComments.map((c: any) => c.id);
    const { data: reactions } = await (supabase as any)
      .from("comment_reactions")
      .select("comment_id, emoji, user_id")
      .in("comment_id", commentIds);

    // Group reactions by comment
    const reactionMap = new Map<string, { emoji: string; count: number; reacted: boolean }[]>();
    for (const r of reactions || []) {
      if (!reactionMap.has(r.comment_id)) reactionMap.set(r.comment_id, []);
      const arr = reactionMap.get(r.comment_id)!;
      const existing = arr.find((e) => e.emoji === r.emoji);
      if (existing) {
        existing.count++;
        if (r.user_id === currentUserId) existing.reacted = true;
      } else {
        arr.push({ emoji: r.emoji, count: 1, reacted: r.user_id === currentUserId });
      }
    }

    // Build comment objects
    const allComments: PostComment[] = rawComments.map((c: any) => {
      const profile = profileMap.get(c.user_id);
      return {
        id: c.id,
        content: c.content,
        user_id: c.user_id,
        parent_id: c.parent_id,
        likes_count: c.likes_count,
        created_at: c.created_at,
        author_name: (profile as any)?.full_name || "User",
        author_avatar: (profile as any)?.avatar_url || null,
        replies: [],
        reactions: reactionMap.get(c.id) || [],
      };
    });

    // Build tree: top-level + nested replies
    const topLevel: PostComment[] = [];
    const replyMap = new Map<string, PostComment[]>();
    for (const c of allComments) {
      if (!c.parent_id) {
        topLevel.push(c);
      } else {
        if (!replyMap.has(c.parent_id)) replyMap.set(c.parent_id, []);
        replyMap.get(c.parent_id)!.push(c);
      }
    }
    for (const c of topLevel) {
      c.replies = replyMap.get(c.id) || [];
    }

    setComments(topLevel);
    setLoading(false);
  }, [postId, postSource, currentUserId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const addComment = async (content: string, parentId?: string) => {
    if (!currentUserId || !content.trim()) return;
    setSubmitting(true);
    await (supabase as any).from("post_comments").insert({
      post_id: postId,
      post_source: postSource,
      user_id: currentUserId,
      content: content.trim(),
      parent_id: parentId || null,
    });
    // Also create notification for post owner (done in component)
    await fetchComments();
    setSubmitting(false);
  };

  const deleteComment = async (commentId: string) => {
    await (supabase as any).from("post_comments").delete().eq("id", commentId);
    await fetchComments();
  };

  const toggleReaction = async (commentId: string, emoji: string) => {
    if (!currentUserId) return;
    // Check if already reacted
    const { data: existing } = await (supabase as any)
      .from("comment_reactions")
      .select("id")
      .eq("comment_id", commentId)
      .eq("user_id", currentUserId)
      .eq("emoji", emoji)
      .maybeSingle();

    if (existing) {
      await (supabase as any).from("comment_reactions").delete().eq("id", existing.id);
    } else {
      await (supabase as any).from("comment_reactions").insert({
        comment_id: commentId,
        user_id: currentUserId,
        emoji,
      });
    }
    await fetchComments();
  };

  return { comments, loading, submitting, addComment, deleteComment, toggleReaction, refetch: fetchComments };
}
