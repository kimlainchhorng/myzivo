-- D1: per-user bot blocks
create table if not exists public.bot_blocks (
  bot_id uuid not null references public.bots(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (bot_id, user_id)
);
alter table public.bot_blocks enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where tablename='bot_blocks' and policyname='Users manage own blocks') then
    create policy "Users manage own blocks" on public.bot_blocks for all to authenticated
      using (user_id = auth.uid()) with check (user_id = auth.uid());
  end if;
end $$;

-- Block / unblock RPCs
create or replace function public.block_bot(p_bot_id uuid) returns void
language sql security definer set search_path = public as $$
  insert into public.bot_blocks (bot_id, user_id) values (p_bot_id, auth.uid())
  on conflict do nothing;
$$;
create or replace function public.unblock_bot(p_bot_id uuid) returns void
language sql security definer set search_path = public as $$
  delete from public.bot_blocks where bot_id = p_bot_id and user_id = auth.uid();
$$;
grant execute on function public.block_bot(uuid), public.unblock_bot(uuid) to authenticated;

-- D2: per-user broadcast unsubscribes (defaults: subscribed)
create table if not exists public.bot_unsubscribes (
  bot_id uuid not null references public.bots(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (bot_id, user_id)
);
alter table public.bot_unsubscribes enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where tablename='bot_unsubscribes' and policyname='Users manage own unsubs') then
    create policy "Users manage own unsubs" on public.bot_unsubscribes for all to authenticated
      using (user_id = auth.uid()) with check (user_id = auth.uid());
  end if;
end $$;

create or replace function public.unsubscribe_bot(p_bot_id uuid) returns void
language sql security definer set search_path = public as $$
  insert into public.bot_unsubscribes (bot_id, user_id) values (p_bot_id, auth.uid())
  on conflict do nothing;
$$;
create or replace function public.subscribe_bot(p_bot_id uuid) returns void
language sql security definer set search_path = public as $$
  delete from public.bot_unsubscribes where bot_id = p_bot_id and user_id = auth.uid();
$$;
grant execute on function public.unsubscribe_bot(uuid), public.subscribe_bot(uuid) to authenticated;

-- Public bot profile RPC (no auth required for read; lookup by username)
create or replace function public.bot_public_profile(p_username text)
returns table (
  id uuid, bot_user_id uuid, username text, display_name text,
  description text, avatar_url text, category text, rating_avg numeric,
  rating_count int, commands jsonb
)
language sql stable security definer set search_path = public as $$
  select b.id, b.bot_user_id, b.username, b.display_name, b.description,
         b.avatar_url, b.category, b.rating_avg, b.rating_count,
         coalesce(
           (select jsonb_agg(jsonb_build_object('command', c.command, 'description', c.description) order by c.sort_order)
            from public.bot_commands c where c.bot_id = b.id), '[]'::jsonb
         ) as commands
  from public.bots b
  where b.username = lower(p_username) and b.is_active = true
  limit 1;
$$;
grant execute on function public.bot_public_profile(text) to anon, authenticated;;
