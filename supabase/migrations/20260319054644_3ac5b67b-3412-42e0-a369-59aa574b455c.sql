CREATE TABLE public.experts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  expertise text NOT NULL,
  experience_score integer NOT NULL DEFAULT 90,
  tags text[] NOT NULL DEFAULT '{}',
  match_rate integer NOT NULL DEFAULT 90,
  available boolean NOT NULL DEFAULT true,
  career text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  specialties text[] NOT NULL DEFAULT '{}',
  consult_fee text NOT NULL DEFAULT '초기 상담 무료',
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.experts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read experts" ON public.experts FOR SELECT TO public USING (true);
CREATE POLICY "Authenticated users can manage experts" ON public.experts FOR ALL TO authenticated USING (true) WITH CHECK (true);