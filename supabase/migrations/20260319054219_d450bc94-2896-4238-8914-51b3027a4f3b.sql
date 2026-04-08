CREATE POLICY "Authenticated users can update consultations"
ON public.consultations
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);