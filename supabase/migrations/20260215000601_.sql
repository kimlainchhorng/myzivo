-- Add file size limits and MIME type restrictions to unprotected buckets

-- brand-logos: public, images only, 5MB
UPDATE storage.buckets
SET file_size_limit = 5242880,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
WHERE id = 'brand-logos';

-- incident-attachments: private, images + PDF, 10MB
UPDATE storage.buckets
SET file_size_limit = 10485760,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
WHERE id = 'incident-attachments';

-- claim-documents: private, images + PDF, 10MB
UPDATE storage.buckets
SET file_size_limit = 10485760,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
WHERE id = 'claim-documents';

-- Also fix other unprotected buckets found in the query:

-- avatars: missing size limit, 5MB
UPDATE storage.buckets
SET file_size_limit = 5242880
WHERE id = 'avatars';

-- chat-attachments: no restrictions, images + PDF, 10MB
UPDATE storage.buckets
SET file_size_limit = 10485760,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf']
WHERE id = 'chat-attachments';

-- delivery-proofs: no restrictions, images only, 10MB
UPDATE storage.buckets
SET file_size_limit = 10485760,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp']
WHERE id = 'delivery-proofs';

-- dispute-evidence: no restrictions, images + PDF, 10MB
UPDATE storage.buckets
SET file_size_limit = 10485760,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
WHERE id = 'dispute-evidence';

-- driver-documents: missing size limit, 10MB
UPDATE storage.buckets
SET file_size_limit = 10485760
WHERE id = 'driver-documents';

-- identity-documents: missing size limit, 10MB
UPDATE storage.buckets
SET file_size_limit = 10485760
WHERE id = 'identity-documents';

-- menu-photos: no restrictions, images only, 5MB
UPDATE storage.buckets
SET file_size_limit = 5242880,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp']
WHERE id = 'menu-photos';

-- ticket-attachments: no restrictions, images + PDF, 10MB
UPDATE storage.buckets
SET file_size_limit = 10485760,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
WHERE id = 'ticket-attachments';

-- system-backups: reduce from 1GB to 100MB
UPDATE storage.buckets
SET file_size_limit = 104857600
WHERE id = 'system-backups';;
