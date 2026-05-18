
-- Create ai_faq_responses table
CREATE TABLE public.ai_faq_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question text NOT NULL,
  answer text NOT NULL,
  category text DEFAULT 'general',
  is_active boolean DEFAULT true,
  usage_count integer DEFAULT 0,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.ai_faq_responses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage FAQ responses" ON public.ai_faq_responses FOR ALL USING (true);

-- Create ai_conversation_flags table
CREATE TABLE public.ai_conversation_flags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid REFERENCES ai_conversations(id) ON DELETE CASCADE,
  flagged_by uuid REFERENCES auth.users(id),
  reason text NOT NULL,
  notes text,
  status text DEFAULT 'open' CHECK (status IN ('open', 'reviewed', 'resolved')),
  created_at timestamptz DEFAULT now(),
  resolved_at timestamptz,
  resolved_by uuid REFERENCES auth.users(id)
);

ALTER TABLE public.ai_conversation_flags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage flags" ON public.ai_conversation_flags FOR ALL USING (true);

-- Extend ai_conversations
ALTER TABLE public.ai_conversations
  ADD COLUMN IF NOT EXISTS is_flagged boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS satisfaction_rating integer,
  ADD COLUMN IF NOT EXISTS response_time_ms integer,
  ADD COLUMN IF NOT EXISTS matched_faq_id uuid REFERENCES ai_faq_responses(id);

-- Auto-update updated_at trigger for ai_faq_responses
CREATE TRIGGER update_ai_faq_responses_updated_at
  BEFORE UPDATE ON public.ai_faq_responses
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
;
