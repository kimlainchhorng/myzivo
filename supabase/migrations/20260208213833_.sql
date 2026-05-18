-- Create chat_read_receipts table for tracking "Seen" indicators
CREATE TABLE public.chat_read_receipts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.food_orders(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  last_read_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  UNIQUE(order_id, user_id)
);

-- Indexes for fast lookups
CREATE INDEX idx_chat_read_receipts_order ON public.chat_read_receipts(order_id);
CREATE INDEX idx_chat_read_receipts_user ON public.chat_read_receipts(user_id);

-- Enable RLS
ALTER TABLE public.chat_read_receipts ENABLE ROW LEVEL SECURITY;

-- Users can read their own receipts
CREATE POLICY "Users can read own receipts"
ON public.chat_read_receipts FOR SELECT
USING (user_id = auth.uid());

-- Users can insert their own receipts
CREATE POLICY "Users can insert own receipts"
ON public.chat_read_receipts FOR INSERT
WITH CHECK (user_id = auth.uid());

-- Users can update their own receipts
CREATE POLICY "Users can update own receipts"
ON public.chat_read_receipts FOR UPDATE
USING (user_id = auth.uid());

-- Create storage bucket for chat attachments
INSERT INTO storage.buckets (id, name, public) 
VALUES ('chat-attachments', 'chat-attachments', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policy: chat participants can upload
CREATE POLICY "Chat participants can upload attachments"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'chat-attachments' 
  AND auth.uid() IS NOT NULL
);

-- Storage policy: anyone can view chat attachments (public bucket)
CREATE POLICY "Anyone can view chat attachments"
ON storage.objects FOR SELECT
USING (bucket_id = 'chat-attachments');;
