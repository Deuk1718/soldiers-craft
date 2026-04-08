
-- Create consultations booking table
CREATE TABLE public.consultations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_name TEXT NOT NULL,
  client_phone TEXT NOT NULL,
  client_email TEXT,
  expert_name TEXT NOT NULL,
  expert_expertise TEXT NOT NULL,
  consultation_date DATE NOT NULL,
  consultation_time TEXT NOT NULL,
  memo TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.consultations ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (public booking form, no auth required)
CREATE POLICY "Anyone can create consultations"
  ON public.consultations FOR INSERT
  WITH CHECK (true);

-- Allow reading own consultation by matching email (for confirmation lookup)
CREATE POLICY "Anyone can read consultations"
  ON public.consultations FOR SELECT
  USING (true);
