-- Instagram-style Close Friends.
-- A user maintains a private list; when posting a story they can restrict
-- audience to that list. Stories scoped to close friends show a green ring.

-- ── 1. close_friends ─────────────────────────────────────────────────────────
create table if not exists public.close_friends (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  close_friend_id uuid not null references auth.users(id) on delete cascade,
  created_at      timestamptz not null default now(),
  unique (user_id, close_friend_id),
  check (user_id <> close_friend_id)
);

create index if not exists idx_close_friends_user
  on public.close_friends (user_id, created_at desc);

create index if not exists idx_close_friends_friend
  on public.close_friends (close_friend_id);

alter table public.close_friends enable row level security;

grant select, insert, delete on table public.close_friends to authenticated;
grant all on table public.close_friends to service_role;

-- Owner reads their own list.
drop policy if exists "close_friends_select_own" on public.close_friends;
create policy "close_friends_select_own"
  on public.close_friends for select
  to authenticated
  using (user_id = auth.uid());

-- The added friend can see that they're on the list (so the client can show
-- a "you're on someone's close friends" hint if we choose to surface it).
drop policy if exists "close_friends_select_friend" on public.close_friends;
create policy "close_friends_select_friend"
  on public.close_friends for select
  to authenticated
  using (close_friend_id = auth.uid());

drop policy if exists "close_friends_insert_own" on public.close_friends;
create policy "close_friends_insert_own"
  on public.close_friends for insert
  to authenticated
  with check (user_id = auth.uid());

drop policy if exists "close_friends_delete_own" on public.close_friends;
create policy "close_friends_delete_own"
  on public.close_friends for delete
  to authenticated
  using (user_id = auth.uid());

-- ── 2. stories.audience_type ─────────────────────────────────────────────────
alter table public.stories
  add column if not exists audience_type text not null default 'public';

alter table public.stories
  drop constraint if exists stories_audience_type_chk;
alter table public.stories
  add constraint stories_audience_type_chk
  check (audience_type in ('public', 'close_friends'));

comment on column public.stories.audience_type is
  'public = visible to anyone authenticated; close_friends = only on author''s close_friends list.';

create index if not exists idx_stories_audience
  on public.stories (audience_type)
  where audience_type = 'close_friends';

-- ── 3. Replace the open SELECT policy with audience-aware visibility ─────────
-- Original policy let any authenticated user read all unexpired stories; we
-- keep that for 'public' but gate 'close_friends' to the author + the list.
drop policy if exists "Anyone can read active stories" on public.stories;
drop policy if exists "stories_select_active" on public.stories;

create policy "stories_select_active"
  on public.stories for select
  to authenticated
  using (
    expires_at > now()
    and (
      audience_type = 'public'
      or user_id = auth.uid()
      or (
        audience_type = 'close_friends'
        and exists (
          select 1 from public.close_friends cf
          where cf.user_id = stories.user_id
            and cf.close_friend_id = auth.uid()
        )
      )
    )
  );
