
CREATE TABLE IF NOT EXISTS public.marketplace_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES public.marketplace_listings(id) ON DELETE CASCADE,
  asker_id UUID NOT NULL,
  seller_id UUID NOT NULL,
  question TEXT NOT NULL,
  answer TEXT,
  answered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_market_q_listing ON public.marketplace_questions(listing_id, created_at DESC);
ALTER TABLE public.marketplace_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Questions publicly readable"
  ON public.marketplace_questions FOR SELECT USING (true);
CREATE POLICY "Anyone logged in can ask"
  ON public.marketplace_questions FOR INSERT WITH CHECK (auth.uid() = asker_id);
CREATE POLICY "Seller can answer"
  ON public.marketplace_questions FOR UPDATE USING (auth.uid() = seller_id);
CREATE POLICY "Asker or seller can delete"
  ON public.marketplace_questions FOR DELETE USING (auth.uid() = asker_id OR auth.uid() = seller_id);

-- Notify seller of new questions, asker of answers
CREATE OR REPLACE FUNCTION public.notify_marketplace_question()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_title text;
BEGIN
  SELECT title INTO v_title FROM public.marketplace_listings WHERE id = COALESCE(NEW.listing_id, OLD.listing_id);
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.notifications (user_id, channel, category, title, body, action_url, status, event_type)
    VALUES (NEW.seller_id, 'in_app', 'transactional', 'New question on your listing',
            'Q: ' || left(NEW.question, 120),
            '/marketplace?listing=' || NEW.listing_id::text, 'sent', 'marketplace.question.created');
  ELSIF TG_OP = 'UPDATE' AND NEW.answer IS NOT NULL AND OLD.answer IS DISTINCT FROM NEW.answer THEN
    INSERT INTO public.notifications (user_id, channel, category, title, body, action_url, status, event_type)
    VALUES (NEW.asker_id, 'in_app', 'transactional', 'Seller answered your question',
            'Re "' || coalesce(v_title, 'listing') || '": ' || left(NEW.answer, 120),
            '/marketplace?listing=' || NEW.listing_id::text, 'sent', 'marketplace.question.answered');
  END IF;
  RETURN COALESCE(NEW, OLD);
END;$$;

DROP TRIGGER IF EXISTS trg_market_q_ins ON public.marketplace_questions;
DROP TRIGGER IF EXISTS trg_market_q_upd ON public.marketplace_questions;
CREATE TRIGGER trg_market_q_ins AFTER INSERT ON public.marketplace_questions
  FOR EACH ROW EXECUTE FUNCTION public.notify_marketplace_question();
CREATE TRIGGER trg_market_q_upd AFTER UPDATE ON public.marketplace_questions
  FOR EACH ROW EXECUTE FUNCTION public.notify_marketplace_question();
;
