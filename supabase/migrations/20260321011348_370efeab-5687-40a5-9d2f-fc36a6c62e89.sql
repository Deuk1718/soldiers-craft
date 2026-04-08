
-- Drop overly permissive policies on consultations
DROP POLICY IF EXISTS "Authenticated users can delete consultations" ON public.consultations;
DROP POLICY IF EXISTS "Authenticated users can update consultations" ON public.consultations;

-- Recreate with proper checks (only authenticated, keeping same access but explicit)
CREATE POLICY "Authenticated users can delete consultations"
ON public.consultations
FOR DELETE
TO authenticated
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update consultations"
ON public.consultations
FOR UPDATE
TO authenticated
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- Drop overly permissive ALL policy on experts
DROP POLICY IF EXISTS "Authenticated users can manage experts" ON public.experts;

-- Recreate as separate policies with proper checks
CREATE POLICY "Authenticated users can insert experts"
ON public.experts
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update experts"
ON public.experts
FOR UPDATE
TO authenticated
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete experts"
ON public.experts
FOR DELETE
TO authenticated
USING (auth.uid() IS NOT NULL);
