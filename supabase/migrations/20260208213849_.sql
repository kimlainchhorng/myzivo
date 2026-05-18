-- =====================================================
-- ORDER CHAT SYSTEM: Tables, RLS, Functions, Triggers
-- =====================================================

-- 1. Create order_chats table (one chat thread per order)
CREATE TABLE IF NOT EXISTS order_chats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID UNIQUE NOT NULL REFERENCES food_orders(id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_order_chats_order_id ON order_chats(order_id);

-- 2. Create chat_members table (track participants by role)
CREATE TABLE IF NOT EXISTS chat_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id UUID NOT NULL REFERENCES order_chats(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('customer', 'driver', 'merchant', 'admin')),
  joined_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(chat_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_chat_members_chat_id ON chat_members(chat_id);
CREATE INDEX IF NOT EXISTS idx_chat_members_user_id ON chat_members(user_id);

-- 3. Create chat_reads table (per-user read timestamps)
CREATE TABLE IF NOT EXISTS chat_reads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id UUID NOT NULL REFERENCES order_chats(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  last_read_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(chat_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_chat_reads_chat_id ON chat_reads(chat_id);
CREATE INDEX IF NOT EXISTS idx_chat_reads_user_id ON chat_reads(user_id);

-- 4. Add chat_id to chat_messages if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'chat_messages' AND column_name = 'chat_id'
  ) THEN
    ALTER TABLE chat_messages ADD COLUMN chat_id UUID REFERENCES order_chats(id) ON DELETE CASCADE;
    CREATE INDEX idx_chat_messages_chat_id ON chat_messages(chat_id);
  END IF;
END $$;

-- 5. Enable RLS on all tables
ALTER TABLE order_chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_reads ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies for order_chats
DROP POLICY IF EXISTS "Members can view their order chats" ON order_chats;
CREATE POLICY "Members can view their order chats"
ON order_chats FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM chat_members 
    WHERE chat_members.chat_id = order_chats.id 
    AND chat_members.user_id = auth.uid()
  )
);

-- 7. RLS Policies for chat_members
DROP POLICY IF EXISTS "Members can view chat participants" ON chat_members;
CREATE POLICY "Members can view chat participants"
ON chat_members FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM chat_members AS my_membership
    WHERE my_membership.chat_id = chat_members.chat_id
    AND my_membership.user_id = auth.uid()
  )
);

-- 8. RLS Policies for chat_reads
DROP POLICY IF EXISTS "Users can manage their read receipts" ON chat_reads;
CREATE POLICY "Users can manage their read receipts"
ON chat_reads FOR ALL
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- 9. Update chat_messages RLS to support chat_id-based access
DROP POLICY IF EXISTS "Members can read chat messages via chat_id" ON chat_messages;
CREATE POLICY "Members can read chat messages via chat_id"
ON chat_messages FOR SELECT
USING (
  chat_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM chat_members
    WHERE chat_members.chat_id = chat_messages.chat_id
    AND chat_members.user_id = auth.uid()
  )
  OR chat_id IS NULL -- Allow existing order_id/trip_id based access
);

DROP POLICY IF EXISTS "Members can send chat messages via chat_id" ON chat_messages;
CREATE POLICY "Members can send chat messages via chat_id"
ON chat_messages FOR INSERT
WITH CHECK (
  sender_id = auth.uid()
  AND (
    (chat_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM chat_members
      WHERE chat_members.chat_id = chat_messages.chat_id
      AND chat_members.user_id = auth.uid()
    ))
    OR chat_id IS NULL -- Allow existing order_id/trip_id based inserts
  )
);

-- 10. Function to get or create order chat with members
CREATE OR REPLACE FUNCTION get_or_create_order_chat(p_order_id UUID)
RETURNS UUID
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_chat_id UUID;
  v_order RECORD;
  v_restaurant RECORD;
BEGIN
  -- Check if chat exists
  SELECT id INTO v_chat_id FROM order_chats WHERE order_id = p_order_id;
  
  IF v_chat_id IS NOT NULL THEN
    RETURN v_chat_id;
  END IF;
  
  -- Get order details
  SELECT customer_id, driver_id, restaurant_id, status
  INTO v_order FROM food_orders WHERE id = p_order_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Order not found';
  END IF;
  
  -- Get restaurant owner
  SELECT owner_id INTO v_restaurant FROM restaurants WHERE id = v_order.restaurant_id;
  
  -- Create chat
  INSERT INTO order_chats (order_id) VALUES (p_order_id) RETURNING id INTO v_chat_id;
  
  -- Add customer as member
  IF v_order.customer_id IS NOT NULL THEN
    INSERT INTO chat_members (chat_id, user_id, role) 
    VALUES (v_chat_id, v_order.customer_id, 'customer')
    ON CONFLICT DO NOTHING;
  END IF;
  
  -- Add merchant as member
  IF v_restaurant.owner_id IS NOT NULL THEN
    INSERT INTO chat_members (chat_id, user_id, role) 
    VALUES (v_chat_id, v_restaurant.owner_id, 'merchant')
    ON CONFLICT DO NOTHING;
  END IF;
  
  -- Add driver if assigned (driver_id references drivers table, get user_id)
  IF v_order.driver_id IS NOT NULL THEN
    INSERT INTO chat_members (chat_id, user_id, role)
    SELECT v_chat_id, d.user_id, 'driver' FROM drivers d WHERE d.id = v_order.driver_id
    ON CONFLICT DO NOTHING;
  END IF;
  
  RETURN v_chat_id;
END;
$$;

-- 11. Trigger function to add driver to chat when assigned
CREATE OR REPLACE FUNCTION add_driver_to_order_chat()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_chat_id UUID;
  v_driver_user_id UUID;
BEGIN
  -- Only proceed if driver_id changed from NULL to a value
  IF OLD.driver_id IS NULL AND NEW.driver_id IS NOT NULL THEN
    -- Get chat ID
    SELECT id INTO v_chat_id FROM order_chats WHERE order_id = NEW.id;
    
    -- Get driver's user_id
    SELECT user_id INTO v_driver_user_id FROM drivers WHERE id = NEW.driver_id;
    
    IF v_chat_id IS NOT NULL AND v_driver_user_id IS NOT NULL THEN
      INSERT INTO chat_members (chat_id, user_id, role)
      VALUES (v_chat_id, v_driver_user_id, 'driver')
      ON CONFLICT DO NOTHING;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger (drop first if exists)
DROP TRIGGER IF EXISTS trg_add_driver_to_order_chat ON food_orders;
CREATE TRIGGER trg_add_driver_to_order_chat
AFTER UPDATE ON food_orders
FOR EACH ROW EXECUTE FUNCTION add_driver_to_order_chat();

-- 12. Trigger function to notify chat participants on new message
CREATE OR REPLACE FUNCTION notify_chat_participants()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_member RECORD;
  v_order RECORD;
  v_sender_name TEXT;
BEGIN
  -- Only process if chat_id is set
  IF NEW.chat_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Get order info for context
  SELECT fo.id, fo.customer_name 
  INTO v_order 
  FROM food_orders fo
  JOIN order_chats oc ON oc.order_id = fo.id
  WHERE oc.id = NEW.chat_id;
  
  IF NOT FOUND THEN
    RETURN NEW;
  END IF;
  
  -- Get sender display name based on role
  SELECT 
    CASE NEW.sender_type
      WHEN 'customer' THEN COALESCE(v_order.customer_name, 'Customer')
      WHEN 'driver' THEN COALESCE((SELECT full_name FROM drivers WHERE user_id = NEW.sender_id), 'Driver')
      WHEN 'merchant' THEN COALESCE((SELECT name FROM restaurants WHERE owner_id = NEW.sender_id LIMIT 1), 'Restaurant')
      ELSE 'Someone'
    END INTO v_sender_name;
  
  -- Insert alert for each member except sender
  FOR v_member IN
    SELECT user_id, role FROM chat_members 
    WHERE chat_id = NEW.chat_id AND user_id != NEW.sender_id
  LOOP
    INSERT INTO alerts (user_id, title, body, order_id)
    VALUES (
      v_member.user_id,
      'New message from ' || v_sender_name,
      LEFT(NEW.message, 100),
      v_order.id
    );
  END LOOP;
  
  RETURN NEW;
END;
$$;

-- Create trigger for notifications
DROP TRIGGER IF EXISTS trg_notify_chat_participants ON chat_messages;
CREATE TRIGGER trg_notify_chat_participants
AFTER INSERT ON chat_messages
FOR EACH ROW EXECUTE FUNCTION notify_chat_participants();

-- 13. Enable realtime for the new tables
ALTER PUBLICATION supabase_realtime ADD TABLE order_chats;
ALTER PUBLICATION supabase_realtime ADD TABLE chat_members;;
