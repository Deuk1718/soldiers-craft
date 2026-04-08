CREATE POLICY "Authenticated users can delete consultations"
ON public.consultations
FOR DELETE
TO authenticated
USING (true);