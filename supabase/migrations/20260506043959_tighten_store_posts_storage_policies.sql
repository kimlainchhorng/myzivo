-- Remove the overly-permissive DELETE policy that let ANY authenticated user
-- delete anyone's store-post media. The properly-scoped DELETE ("Allow delete
-- store posts") that limits by folder owner stays in place.
DROP POLICY IF EXISTS "Authenticated users can delete post media" ON storage.objects;

-- Add the missing UPDATE policy so store owners can replace/edit their own media.
CREATE POLICY "store_posts_update_own"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'store-posts' AND (auth.uid())::text = (storage.foldername(name))[1])
  WITH CHECK (bucket_id = 'store-posts' AND (auth.uid())::text = (storage.foldername(name))[1]);

-- Add a SELECT policy for parity (bucket is public, but keeps RLS consistent).
CREATE POLICY "store_posts_select_public"
  ON storage.objects FOR SELECT TO public
  USING (bucket_id = 'store-posts');;
