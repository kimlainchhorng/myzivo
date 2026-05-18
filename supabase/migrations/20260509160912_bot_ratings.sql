create table if not exists public.bot_ratings (
  id uuid primary key default gen_random_uuid(),
  bot_id uuid not null references public.bots(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  stars int not null check (stars between 1 and 5),
  review text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (bot_id, user_id)
);
create index if not exists bot_ratings_bot_idx on public.bot_ratings(bot_id, created_at desc);

alter table public.bot_ratings enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where tablename='bot_ratings' and policyname='Anyone read ratings') then
    create policy "Anyone read ratings" on public.bot_ratings for select to authenticated using (true);
  end if;
  if not exists (select 1 from pg_policies where tablename='bot_ratings' and policyname='Users manage own rating') then
    create policy "Users manage own rating" on public.bot_ratings for all to authenticated
      using (user_id = auth.uid()) with check (user_id = auth.uid());
  end if;
end $$;

-- Aggregate columns + trigger to keep them up to date (cheap directory sort)
do $$ begin
  if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='bots' and column_name='rating_avg') then
    alter table public.bots add column rating_avg numeric(3,2);
    alter table public.bots add column rating_count int not null default 0;
  end if;
end $$;

create or replace function public.refresh_bot_rating(p_bot_id uuid) returns void
language sql security definer set search_path = public as $$
  update public.bots b
  set rating_avg = (select round(avg(stars)::numeric, 2) from public.bot_ratings where bot_id = b.id),
      rating_count = (select count(*) from public.bot_ratings where bot_id = b.id)
  where b.id = p_bot_id;
$$;

create or replace function public.tg_refresh_bot_rating() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if (tg_op = 'DELETE') then
    perform public.refresh_bot_rating(old.bot_id);
    return old;
  else
    perform public.refresh_bot_rating(new.bot_id);
    return new;
  end if;
end $$;

drop trigger if exists trg_refresh_bot_rating on public.bot_ratings;
create trigger trg_refresh_bot_rating after insert or update or delete on public.bot_ratings
  for each row execute function public.tg_refresh_bot_rating();

-- RPC: upsert your own rating
create or replace function public.rate_bot(p_bot_id uuid, p_stars int, p_review text default null)
returns void
language plpgsql security definer set search_path = public as $$
declare v_uid uuid := auth.uid();
begin
  if v_uid is null then raise exception 'Not authenticated'; end if;
  if p_stars not between 1 and 5 then raise exception 'stars must be 1..5'; end if;
  insert into public.bot_ratings (bot_id, user_id, stars, review)
  values (p_bot_id, v_uid, p_stars, p_review)
  on conflict (bot_id, user_id)
    do update set stars = excluded.stars, review = excluded.review, updated_at = now();
end $$;
grant execute on function public.rate_bot(uuid, int, text) to authenticated;

-- Rebuild directory view to include rating
drop view if exists public.bots_directory cascade;
create view public.bots_directory as
  select b.id, b.bot_user_id, b.username, b.display_name, b.description, b.avatar_url,
         b.category, b.featured, b.rating_avg, b.rating_count, b.created_at
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
  order by featured desc, rating_avg desc nulls last, created_at desc
  limit 100;
$$;
grant execute on function public.search_bots(text) to anon, authenticated;

create or replace function public.bots_by_category(p_category text default null)
returns setof public.bots_directory
language sql stable security definer set search_path = public as $$
  select * from public.bots_directory
  where p_category is null or p_category = '' or category = p_category
  order by featured desc, rating_avg desc nulls last, created_at desc
  limit 100;
$$;
grant execute on function public.bots_by_category(text) to anon, authenticated;

create or replace function public.get_bot_by_user_id(p_user_id uuid)
returns public.bots_directory
language sql stable security definer set search_path = public as $$
  select * from public.bots_directory where bot_user_id = p_user_id limit 1;
$$;
grant execute on function public.get_bot_by_user_id(uuid) to anon, authenticated;;
