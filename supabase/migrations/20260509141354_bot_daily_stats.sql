create or replace function public.bot_messages_daily(p_bot_id uuid, p_days int default 14)
returns table (day date, received bigint, sent bigint)
language sql stable security definer set search_path = public as $$
  with b as (
    select bot_user_id from public.bots
    where id = p_bot_id and owner_id = auth.uid()
  ),
  days as (
    select generate_series(
      (current_date - (p_days - 1))::date,
      current_date,
      interval '1 day'
    )::date as day
  )
  select
    d.day,
    coalesce((select count(*) from public.direct_messages dm, b
      where dm.receiver_id = b.bot_user_id and dm.created_at::date = d.day), 0) as received,
    coalesce((select count(*) from public.direct_messages dm, b
      where dm.sender_id = b.bot_user_id and dm.created_at::date = d.day), 0) as sent
  from days d
  order by d.day;
$$;
grant execute on function public.bot_messages_daily(uuid, int) to authenticated;;
