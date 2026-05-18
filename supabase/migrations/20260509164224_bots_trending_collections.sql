-- F1 Trending: based on inbound activity in the last 7 days
create or replace function public.trending_bots(p_days int default 7, p_limit int default 10)
returns setof public.bots_directory
language sql stable security definer set search_path = public as $$
  with active_counts as (
    select b.id as bot_id, count(*) as score
    from public.bot_activity a
    join public.bots b on b.id = a.bot_id
    where a.kind = 'msg_in'
      and a.created_at >= now() - (p_days || ' days')::interval
      and b.is_active = true
    group by b.id
  )
  select d.* from public.bots_directory d
  join active_counts c on c.bot_id = d.id
  order by c.score desc, d.rating_avg desc nulls last
  limit p_limit;
$$;
grant execute on function public.trending_bots(int, int) to anon, authenticated;

-- F2 Curated collections
create table if not exists public.bot_collections (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9-]{2,40}$'),
  title text not null,
  description text,
  cover_emoji text,
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
create table if not exists public.bot_collection_items (
  collection_id uuid not null references public.bot_collections(id) on delete cascade,
  bot_id uuid not null references public.bots(id) on delete cascade,
  sort_order int not null default 0,
  primary key (collection_id, bot_id)
);

alter table public.bot_collections enable row level security;
alter table public.bot_collection_items enable row level security;

do $$ begin
  if not exists (select 1 from pg_policies where tablename='bot_collections' and policyname='Anyone reads collections') then
    create policy "Anyone reads collections" on public.bot_collections for select to anon, authenticated using (is_active = true);
  end if;
  if not exists (select 1 from pg_policies where tablename='bot_collections' and policyname='Admin manages collections') then
    create policy "Admin manages collections" on public.bot_collections for all to authenticated
      using (public.is_bot_admin()) with check (public.is_bot_admin());
  end if;
  if not exists (select 1 from pg_policies where tablename='bot_collection_items' and policyname='Anyone reads collection items') then
    create policy "Anyone reads collection items" on public.bot_collection_items for select to anon, authenticated using (true);
  end if;
  if not exists (select 1 from pg_policies where tablename='bot_collection_items' and policyname='Admin manages collection items') then
    create policy "Admin manages collection items" on public.bot_collection_items for all to authenticated
      using (public.is_bot_admin()) with check (public.is_bot_admin());
  end if;
end $$;

create or replace function public.collection_bots(p_slug text)
returns setof public.bots_directory
language sql stable security definer set search_path = public as $$
  select d.* from public.bots_directory d
  join public.bot_collection_items i on i.bot_id = d.id
  join public.bot_collections c on c.id = i.collection_id
  where c.slug = p_slug and c.is_active = true
  order by i.sort_order asc, d.rating_avg desc nulls last;
$$;
grant execute on function public.collection_bots(text) to anon, authenticated;

-- Seed a couple of collections (admins can edit later)
insert into public.bot_collections (slug, title, description, cover_emoji, sort_order)
values
  ('best-ai', 'Best AI bots', 'Top Claude-powered helpers', '🤖', 0),
  ('productivity', 'Boost your productivity', 'Get more done with these bots', '⚡', 1),
  ('fun', 'Just for fun', 'Echo, jokes, games', '🎉', 2)
on conflict (slug) do nothing;

-- Auto-populate seeds based on category (initial bootstrap; admins can curate after)
insert into public.bot_collection_items (collection_id, bot_id, sort_order)
select c.id, b.id, 0
from public.bot_collections c
cross join lateral (
  select id from public.bots
  where is_active = true and (
    (c.slug = 'best-ai' and category = 'ai')
    or (c.slug = 'productivity' and category in ('productivity', 'tools'))
    or (c.slug = 'fun' and category in ('fun', 'social'))
  )
  order by rating_avg desc nulls last, created_at desc
  limit 12
) b
on conflict do nothing;;
