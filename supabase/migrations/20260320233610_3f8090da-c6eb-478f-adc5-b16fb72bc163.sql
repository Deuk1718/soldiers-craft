DROP POLICY IF EXISTS "Anyone can read consultations" ON public.consultations;

CREATE POLICY "Authenticated users can read consultations"
  ON public.consultations
  FOR SELECT
  TO authenticated
  USING (true);