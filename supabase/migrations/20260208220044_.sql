-- Add ticket_type for Eats-specific issue categories
ALTER TABLE support_tickets 
ADD COLUMN IF NOT EXISTS ticket_type text DEFAULT 'other';

-- Add food_order_id specifically for Eats orders (order_id may reference travel_orders)
ALTER TABLE support_tickets 
ADD COLUMN IF NOT EXISTS food_order_id uuid REFERENCES food_orders(id);

-- Add locked flag for closed ticket message blocking
ALTER TABLE support_tickets 
ADD COLUMN IF NOT EXISTS is_locked boolean DEFAULT false;

-- Create support_messages table if not exists
CREATE TABLE IF NOT EXISTS support_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
  sender_id uuid,
  sender_role text NOT NULL DEFAULT 'customer',
  message_text text,
  attachment_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Create support_internal_notes table if not exists
CREATE TABLE IF NOT EXISTS support_internal_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
  admin_id uuid NOT NULL,
  note text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes for support_messages
CREATE INDEX IF NOT EXISTS idx_support_messages_ticket_id ON support_messages(ticket_id);
CREATE INDEX IF NOT EXISTS idx_support_messages_sender_id ON support_messages(sender_id);

-- Indexes for support_internal_notes
CREATE INDEX IF NOT EXISTS idx_support_internal_notes_ticket_id ON support_internal_notes(ticket_id);

-- Enable RLS
ALTER TABLE support_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_internal_notes ENABLE ROW LEVEL SECURITY;

-- RLS for support_messages: participants and admins can view
CREATE POLICY "View messages for accessible tickets" ON support_messages
FOR SELECT USING (
  ticket_id IN (
    SELECT id FROM support_tickets 
    WHERE user_id = auth.uid()
      OR driver_id IN (SELECT id FROM drivers WHERE user_id = auth.uid())
      OR restaurant_id IN (SELECT id FROM restaurants WHERE owner_id = auth.uid())
  )
  OR EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- RLS for support_messages: participants can insert to unlocked tickets
CREATE POLICY "Send messages to unlocked tickets" ON support_messages
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM support_tickets t
    WHERE t.id = ticket_id
      AND t.is_locked = false
      AND (
        t.user_id = auth.uid()
        OR t.driver_id IN (SELECT id FROM drivers WHERE user_id = auth.uid())
        OR t.restaurant_id IN (SELECT id FROM restaurants WHERE owner_id = auth.uid())
        OR EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
      )
  )
);

-- RLS for support_internal_notes: admins only
CREATE POLICY "Admins can view internal notes" ON support_internal_notes
FOR SELECT USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Admins can insert internal notes" ON support_internal_notes
FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- Enable realtime for support_messages
ALTER PUBLICATION supabase_realtime ADD TABLE support_messages;;
