ALTER TABLE public.driver_documents DROP CONSTRAINT driver_documents_document_type_check;
ALTER TABLE public.driver_documents ADD CONSTRAINT driver_documents_document_type_check CHECK (document_type = ANY (ARRAY['license'::text, 'insurance'::text, 'registration'::text, 'photo'::text]));;
