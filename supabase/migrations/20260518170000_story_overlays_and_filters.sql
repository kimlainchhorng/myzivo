-- Story overlays (text/sticker/poll/slider/question layers) + filter preset.
-- Backing storage for Instagram-style story creation tools.

-- 1. Add overlay layers + filter preset to stories.
ALTER TABLE public.stories
  ADD COLUMN IF NOT EXISTS overlays jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS filter_preset text;

COMMENT ON COLUMN public.stories.overlays IS
  'Array of overlay layers: {id, type, x, y, scale, rotation, z, ...typeSpecific}. See src/types/storyOverlays.ts.';
COMMENT ON COLUMN public.stories.filter_preset IS
  'Filter preset id from src/lib/storyFilters.ts. Null = no filter.';

-- Guard against absurd payloads (1KB per overlay × ~30 overlays = ~30KB ceiling).
ALTER TABLE public.stories
  ADD CONSTRAINT stories_overlays_size_chk
  CHECK (octet_length(overlays::text) <= 32768);

-- 2. Responses for interactive overlays (poll votes, slider drags, question replies).
CREATE TABLE IF NOT EXISTS public.story_overlay_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id uuid NOT NULL REFERENCES public.stories(id) ON DELETE CASCADE,
  overlay_id text NOT NULL,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  response_type text NOT NULL CHECK (response_type IN ('poll_vote','slider','question_reply')),
  response_value jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (story_id, overlay_id, user_id)
);

CREATE INDEX IF NOT EXISTS story_overlay_responses_story_idx
  ON public.story_overlay_responses (story_id, overlay_id);
CREATE INDEX IF NOT EXISTS story_overlay_responses_user_idx
  ON public.story_overlay_responses (user_id);

ALTER TABLE public.story_overlay_responses ENABLE ROW LEVEL SECURITY;

-- Voter can read their own response.
CREATE POLICY "responder reads own"
  ON public.story_overlay_responses FOR SELECT
  USING (auth.uid() = user_id);

-- Story owner can read all responses to their own story.
CREATE POLICY "story owner reads responses"
  ON public.story_overlay_responses FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.stories s
      WHERE s.id = story_overlay_responses.story_id
        AND s.user_id = auth.uid()
    )
  );

-- Any authenticated user can respond once per overlay (UNIQUE constraint enforces the once).
CREATE POLICY "authenticated users respond"
  ON public.story_overlay_responses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Responder can update their own response (poll re-vote, slider re-drag).
CREATE POLICY "responder updates own"
  ON public.story_overlay_responses FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Responder can delete their own response.
CREATE POLICY "responder deletes own"
  ON public.story_overlay_responses FOR DELETE
  USING (auth.uid() = user_id);
