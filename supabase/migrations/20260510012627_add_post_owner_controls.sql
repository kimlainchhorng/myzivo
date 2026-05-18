-- Owner-controllable per-post settings exposed by the new "…" menu on
-- own posts: pin, save (re-uses bookmarks), edit, product links,
-- visibility, tips, notifications, boost, albums, delete.
ALTER TABLE public.user_posts
  ADD COLUMN IF NOT EXISTS tips_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS comments_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS owner_notifications_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS visibility_hidden_from UUID[] NOT NULL DEFAULT ARRAY[]::UUID[];

-- Albums (lightweight — used by "Add to album"). Owner-only RLS.
CREATE TABLE IF NOT EXISTS public.post_albums (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name         TEXT NOT NULL,
  cover_url    TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS post_albums_user_idx ON public.post_albums(user_id, created_at DESC);
ALTER TABLE public.post_albums ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='post_albums' AND policyname='Owner reads own albums') THEN
    CREATE POLICY "Owner reads own albums" ON public.post_albums FOR SELECT USING (user_id = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='post_albums' AND policyname='Owner writes own albums') THEN
    CREATE POLICY "Owner writes own albums" ON public.post_albums FOR ALL
      USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.post_album_items (
  album_id UUID NOT NULL REFERENCES public.post_albums(id) ON DELETE CASCADE,
  post_id  UUID NOT NULL,
  added_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (album_id, post_id)
);
ALTER TABLE public.post_album_items ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='post_album_items' AND policyname='Owner manages own album items') THEN
    CREATE POLICY "Owner manages own album items" ON public.post_album_items FOR ALL
      USING (EXISTS (SELECT 1 FROM public.post_albums a WHERE a.id = album_id AND a.user_id = auth.uid()))
      WITH CHECK (EXISTS (SELECT 1 FROM public.post_albums a WHERE a.id = album_id AND a.user_id = auth.uid()));
  END IF;
END $$;

-- Product links shown on a post (e.g. tagged store products).
CREATE TABLE IF NOT EXISTS public.post_product_links (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id     UUID NOT NULL,
  product_id  UUID,
  url         TEXT,
  label       TEXT,
  position    INT NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS post_product_links_post_idx ON public.post_product_links(post_id, position);
ALTER TABLE public.post_product_links ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='post_product_links' AND policyname='Read product links') THEN
    CREATE POLICY "Read product links" ON public.post_product_links FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='post_product_links' AND policyname='Owner writes product links') THEN
    CREATE POLICY "Owner writes product links" ON public.post_product_links FOR ALL
      USING (EXISTS (SELECT 1 FROM public.user_posts p WHERE p.id = post_id AND p.user_id = auth.uid()))
      WITH CHECK (EXISTS (SELECT 1 FROM public.user_posts p WHERE p.id = post_id AND p.user_id = auth.uid()));
  END IF;
END $$;

-- Boosts on individual posts (lightweight queue row; settlement happens elsewhere).
CREATE TABLE IF NOT EXISTS public.post_boosts (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id      UUID NOT NULL,
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  budget_cents INT NOT NULL DEFAULT 0,
  status       TEXT NOT NULL DEFAULT 'draft',
  starts_at    TIMESTAMPTZ,
  ends_at      TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS post_boosts_post_idx ON public.post_boosts(post_id);
ALTER TABLE public.post_boosts ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='post_boosts' AND policyname='Owner reads own boosts') THEN
    CREATE POLICY "Owner reads own boosts" ON public.post_boosts FOR SELECT USING (user_id = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='post_boosts' AND policyname='Owner writes own boosts') THEN
    CREATE POLICY "Owner writes own boosts" ON public.post_boosts FOR ALL
      USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
  END IF;
END $$;;
