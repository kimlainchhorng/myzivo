-- Create anomaly_logs table to track historical alerts
CREATE TABLE public.anomaly_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  anomaly_type TEXT NOT NULL CHECK (anomaly_type IN ('revenue', 'orders')),
  anomaly_date TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('warning', 'critical')),
  direction TEXT NOT NULL CHECK (direction IN ('high', 'low')),
  actual_value NUMERIC NOT NULL,
  expected_value NUMERIC NOT NULL,
  percent_deviation NUMERIC NOT NULL,
  message TEXT NOT NULL,
  root_cause_category TEXT,
  root_cause_title TEXT,
  resolution_notes TEXT,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'acknowledged', 'resolved', 'dismissed')),
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.anomaly_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own anomaly logs"
  ON public.anomaly_logs
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own anomaly logs"
  ON public.anomaly_logs
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own anomaly logs"
  ON public.anomaly_logs
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own anomaly logs"
  ON public.anomaly_logs
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX idx_anomaly_logs_user_date ON public.anomaly_logs(user_id, created_at DESC);
CREATE INDEX idx_anomaly_logs_status ON public.anomaly_logs(user_id, status);

-- Create trigger for updated_at
CREATE TRIGGER update_anomaly_logs_updated_at
  BEFORE UPDATE ON public.anomaly_logs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();;
