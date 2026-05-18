-- Instagram-style Saved Collections for post_bookmarks.
-- A user organizes their saved posts into named folders.

-- ── 1. saved_collections ──────────────────────────────────────────────────────
create table if not exists public.saved_collections (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  name        text not null check (length(trim(name)) between 1 and 60),
  color       text,
  cover_url   text,
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (user_id, name)
);

create index if not exists idx_saved_collections_user
  on public.saved_collections (user_id, sort_order, created_at desc);

alter table public.saved_collections enable row level security;

grant select, insert, update, delete on table public.saved_collections to authenticated;
grant all on table public.saved_collections to service_role;

drop policy if exists "saved_collections_select_own" on public.saved_collections;
create policy "saved_collections_select_own"
  on public.saved_collections for select
  to authenticated
  using (user_id = auth.uid());

drop policy if exists "saved_collections_insert_own" on public.saved_collections;
create policy "saved_collections_insert_own"
  on public.saved_collections for insert
  to authenticated
  with check (user_id = auth.uid());

drop policy if exists "saved_collections_update_own" on public.saved_collections;
create policy "saved_collections_update_own"
  on public.saved_collections for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "saved_collections_delete_own" on public.saved_collections;
create policy "saved_collections_delete_own"
  on public.saved_collections for delete
  to authenticated
  using (user_id = auth.uid());

-- ── 2. saved_collection_posts (join: a bookmark may belong to many collections)
create table if not exists public.saved_collection_posts (
  id              uuid primary key default gen_random_uuid(),
  collection_id   uuid not null references public.saved_collections(id) on delete cascade,
  post_bookmark_id uuid not null references public.post_bookmarks(id) on delete cascade,
  sort_order      integer not null default 0,
  created_at      timestamptz not null default now(),
  unique (collection_id, post_bookmark_id)
);

create index if not exists idx_saved_collection_posts_collection
  on public.saved_collection_posts (collection_id, sort_order, created_at desc);

create index if not exists idx_saved_collection_posts_bookmark
  on public.saved_collection_posts (post_bookmark_id);

alter table public.saved_collection_posts enable row level security;

grant select, insert, delete on table public.saved_collection_posts to authenticated;
grant all on table public.saved_collection_posts to service_role;

-- RLS: a user can only touch join rows whose parent collection is theirs.
drop policy if exists "saved_collection_posts_select_own" on public.saved_collection_posts;
create policy "saved_collection_posts_select_own"
  on public.saved_collection_posts for select
  to authenticated
  using (
    exists (
      select 1 from public.saved_collections c
      where c.id = saved_collection_posts.collection_id
        and c.user_id = auth.uid()
    )
  );

drop policy if exists "saved_collection_posts_insert_own" on public.saved_collection_posts;
create policy "saved_collection_posts_insert_own"
  on public.saved_collection_posts for insert
  to authenticated
  with check (
    exists (
      select 1 from public.saved_collections c
      where c.id = saved_collection_posts.collection_id
        and c.user_id = auth.uid()
    )
    and exists (
      select 1 from public.post_bookmarks b
      where b.id = saved_collection_posts.post_bookmark_id
        and b.user_id = auth.uid()
    )
  );

drop policy if exists "saved_collection_posts_delete_own" on public.saved_collection_posts;
create policy "saved_collection_posts_delete_own"
  on public.saved_collection_posts for delete
  to authenticated
  using (
    exists (
      select 1 from public.saved_collections c
      where c.id = saved_collection_posts.collection_id
        and c.user_id = auth.uid()
    )
  );

-- ── 3. updated_at trigger ─────────────────────────────────────────────────────
create or replace function public.touch_saved_collections_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists trg_saved_collections_touch on public.saved_collections;
create trigger trg_saved_collections_touch
  before update on public.saved_collections
  for each row execute function public.touch_saved_collections_updated_at();
