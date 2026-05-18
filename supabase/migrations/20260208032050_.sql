-- Create conversations table
CREATE TABLE public.conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL,
  related_order_id uuid REFERENCES public.food_orders(id) ON DELETE SET NULL,
  driver_id uuid REFERENCES public.drivers(id) ON DELETE SET NULL,
  restaurant_id uuid REFERENCES public.restaurants(id) ON DELETE SET NULL,
  subject text,
  last_message_at timestamptz DEFAULT now(),
  is_archived boolean DEFAULT false,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_conversations_type ON public.conversations(type);
CREATE INDEX idx_conversations_driver_id ON public.conversations(driver_id);
CREATE INDEX idx_conversations_restaurant_id ON public.conversations(restaurant_id);
CREATE INDEX idx_conversations_last_message_at ON public.conversations(last_message_at);

ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage conversations" ON public.conversations
  FOR ALL USING (public.is_admin());

-- Create messages table
CREATE TABLE public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_user_id uuid REFERENCES auth.users(id),
  direction text NOT NULL,
  channel text NOT NULL,
  body text NOT NULL,
  provider_message_id text,
  status text DEFAULT 'sent',
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX idx_messages_created_at ON public.messages(created_at);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage messages" ON public.messages
  FOR ALL USING (public.is_admin());

-- Create canned_responses table
CREATE TABLE public.canned_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  body text NOT NULL,
  category text,
  shortcut text,
  is_active boolean DEFAULT true,
  usage_count integer DEFAULT 0,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_canned_responses_category ON public.canned_responses(category);
CREATE INDEX idx_canned_responses_shortcut ON public.canned_responses(shortcut);

ALTER TABLE public.canned_responses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage canned_responses" ON public.canned_responses
  FOR ALL USING (public.is_admin());

-- Create call_logs table
CREATE TABLE public.call_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone text NOT NULL,
  related_order_id uuid REFERENCES public.food_orders(id) ON DELETE SET NULL,
  related_driver_id uuid REFERENCES public.drivers(id) ON DELETE SET NULL,
  related_restaurant_id uuid REFERENCES public.restaurants(id) ON DELETE SET NULL,
  call_direction text NOT NULL DEFAULT 'outbound',
  duration_seconds integer,
  outcome text,
  notes text,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_call_logs_phone ON public.call_logs(phone);
CREATE INDEX idx_call_logs_created_at ON public.call_logs(created_at);

ALTER TABLE public.call_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage call_logs" ON public.call_logs
  FOR ALL USING (public.is_admin());;
