-- Public directory view: active bots with display info, owner-stripped
create or replace view public.bots_directory as
  select b.id, b.bot_user_id, b.username, b.display_name, b.description, b.avatar_url, b.created_at
  from public.bots b
  where b.is_active = true;
grant select on public.bots_directory to anon, authenticated;

-- Search helper
create or replace function public.search_bots(p_q text)
returns setof public.bots_directory
language sql stable security definer set search_path = public as $$
  select * from public.bots_directory
  where p_q is null or p_q = ''
     or username ilike '%' || p_q || '%'
     or display_name ilike '%' || p_q || '%'
  order by created_at desc
  limit 50;
$$;
grant execute on function public.search_bots(text) to anon, authenticated;

-- Quick lookup: bot by bot_user_id (so chat UI can render badge / link)
create or replace function public.get_bot_by_user_id(p_user_id uuid)
returns public.bots_directory
language sql stable security definer set search_path = public as $$
  select * from public.bots_directory where bot_user_id = p_user_id limit 1;
$$;
grant execute on function public.get_bot_by_user_id(uuid) to anon, authenticated;;
