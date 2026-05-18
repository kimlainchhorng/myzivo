-- Allow Cambodia-specific driver document types
ALTER TABLE public.driver_documents
DROP CONSTRAINT IF EXISTS driver_documents_document_type_check;

ALTER TABLE public.driver_documents
ADD CONSTRAINT driver_documents_document_type_check
CHECK (
  document_type = ANY (
    ARRAY[
      'license'::text,
      'insurance'::text,
      'registration'::text,
      'photo'::text,
      'id_card'::text,
      'vehicle_plate_photo'::text
    ]
  )
);;
