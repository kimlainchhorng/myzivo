ALTER TABLE public.driver_documents DROP CONSTRAINT IF EXISTS driver_documents_document_type_check;
ALTER TABLE public.driver_documents ADD CONSTRAINT driver_documents_document_type_check CHECK (document_type IN ('license', 'insurance', 'registration', 'photo', 'inspection', 'id_card', 'vehicle_plate_photo', 'vehicle_photo'));;
