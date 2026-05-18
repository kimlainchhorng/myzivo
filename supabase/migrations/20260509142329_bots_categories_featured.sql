do $$ begin
  if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='bots' and column_name='category') then
    alter table public.bots add column category text default 'other';
    alter table public.bots add column featured boolean not null default false;
  end if;
end $$;

alter table public.bots drop constraint if exists bots_category_check;
alter table public.bots add constraint bots_category_check
  check (category in ('ai','productivity','fun','news','finance','social','tools','other'));

create index if not exists bots_category_idx on public.bots(category) where is_active = true;
create index if not exists bots_featured_idx on public.bots(featured) where is_active = true and featured = true;

drop view if exists public.bots_directory cascade;
create view public.bots_directory as
  select b.id, b.bot_user_id, b.username, b.display_name, b.description, b.avatar_url,
         b.category, b.featured, b.created_at
  from public.bots b
  where b.is_active = true;
grant select on public.bots_directory to anon, authenticated;

create or replace function public.search_bots(p_q text)
returns setof public.bots_directory
language sql stable security definer set search_path = public as $$
  select * from public.bots_directory
  where p_q is null or p_q = ''
     or username ilike '%' || p_q || '%'
     or display_name ilike '%' || p_q || '%'
  order by featured desc, created_at desc
  limit 100;
$$;
grant execute on function public.search_bots(text) to anon, authenticated;

create or replace function public.bots_by_category(p_category text default null)
returns setof public.bots_directory
language sql stable security definer set search_path = public as $$
  select * from public.bots_directory
  where p_category is null or p_category = '' or category = p_category
  order by featured desc, created_at desc
  limit 100;
$$;
grant execute on function public.bots_by_category(text) to anon, authenticated;

create or replace function public.get_bot_by_user_id(p_user_id uuid)
returns public.bots_directory
language sql stable security definer set search_path = public as $$
  select * from public.bots_directory where bot_user_id = p_user_id limit 1;
$$;
grant execute on function public.get_bot_by_user_id(uuid) to anon, authenticated;;
