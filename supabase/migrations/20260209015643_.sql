-- Add soft delete columns to order_ratings for review moderation
ALTER TABLE order_ratings ADD COLUMN IF NOT EXISTS deleted_at timestamptz;
ALTER TABLE order_ratings ADD COLUMN IF NOT EXISTS deleted_by uuid REFERENCES auth.users(id);
ALTER TABLE order_ratings ADD COLUMN IF NOT EXISTS deletion_reason text;

-- Add index for efficient filtering of non-deleted reviews
CREATE INDEX IF NOT EXISTS idx_order_ratings_deleted_at ON order_ratings(deleted_at) WHERE deleted_at IS NULL;;
