-- Add paid_at and notes columns to invoices table if they don't exist
ALTER TABLE invoices
ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Create index for faster lookups on status
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);

-- Create index for date-based queries
CREATE INDEX IF NOT EXISTS idx_invoices_issued_at ON invoices(issued_at);
CREATE INDEX IF NOT EXISTS idx_invoices_due_at ON invoices(due_at);;
