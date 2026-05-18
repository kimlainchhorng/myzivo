
CREATE TABLE public.admin_broadcasts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  target_role TEXT,
  target_city TEXT,
  category TEXT NOT NULL DEFAULT 'marketing',
  status TEXT NOT NULL DEFAULT 'draft',
  sent_at TIMESTAMPTZ,
  sent_by UUID REFERENCES auth.users(id),
  recipient_count INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_broadcasts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all broadcasts"
ON public.admin_broadcasts FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can create broadcasts"
ON public.admin_broadcasts FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update broadcasts"
ON public.admin_broadcasts FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));
;
