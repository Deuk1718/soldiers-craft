
-- Create storage bucket for certificate photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('certificate-photos', 'certificate-photos', true);

-- Allow anyone to view photos
CREATE POLICY "Certificate photos are publicly accessible"
ON storage.objects
FOR SELECT
USING (bucket_id = 'certificate-photos');

-- Allow anyone to upload photos (no auth required for certificate feature)
CREATE POLICY "Anyone can upload certificate photos"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'certificate-photos');

-- Allow anyone to update their photos
CREATE POLICY "Anyone can update certificate photos"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'certificate-photos');

-- Allow anyone to delete their photos
CREATE POLICY "Anyone can delete certificate photos"
ON storage.objects
FOR DELETE
USING (bucket_id = 'certificate-photos');
