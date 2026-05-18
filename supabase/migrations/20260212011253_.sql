
ALTER TABLE public.marketing_campaigns
ADD COLUMN target_segment_id uuid REFERENCES public.push_segments(id) ON DELETE SET NULL;

CREATE INDEX idx_marketing_campaigns_segment ON public.marketing_campaigns(target_segment_id);
;
