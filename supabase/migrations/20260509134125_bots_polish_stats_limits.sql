-- Webhook health tracking
do $$ begin
  if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='bots' and column_name='last_webhook_status') then
    alter table public.bots add column last_webhook_status int;
    alter table public.bots add column last_webhook_at timestamptz;
    alter table public.bots add column last_webhook_error text;
  end if;
end $$;

-- Per-owner cap (anti-abuse)
create or replace function public.enforce_bot_limit() returns trigger
language plpgsql security definer set search_path = public as $$
declare v_count int;
begin
  select count(*) into v_count from public.bots where owner_id = new.owner_id;
  if v_count >= 10 then
    raise exception 'Bot limit reached (10 per user)';
  end if;
  return new;
end $$;
drop trigger if exists trg_enforce_bot_limit on public.bots;
create trigger trg_enforce_bot_limit before insert on public.bots
  for each row execute function public.enforce_bot_limit();

-- Stats RPC: messages received/sent + unique users for a bot
create or replace function public.bot_stats(p_bot_id uuid)
returns table (received bigint, sent bigint, unique_users bigint, last_msg_at timestamptz)
language sql stable security definer set search_path = public as $$
  with b as (select bot_user_id, owner_id from public.bots where id = p_bot_id)
  select
    (select count(*) from public.direct_messages dm, b where dm.receiver_id = b.bot_user_id) as received,
    (select count(*) from public.direct_messages dm, b where dm.sender_id = b.bot_user_id) as sent,
    (select count(distinct dm.sender_id) from public.direct_messages dm, b where dm.receiver_id = b.bot_user_id) as unique_users,
    (select max(dm.created_at) from public.direct_messages dm, b
       where dm.receiver_id = b.bot_user_id or dm.sender_id = b.bot_user_id) as last_msg_at
  where exists (select 1 from b where b.owner_id = auth.uid());
$$;
grant execute on function public.bot_stats(uuid) to authenticated;

-- Distinct users that have DM'd a bot (for broadcast / management)
create or replace function public.bot_audience(p_bot_id uuid)
returns table (user_id uuid, last_msg_at timestamptz)
language sql stable security definer set search_path = public as $$
  with b as (select bot_user_id, owner_id from public.bots where id = p_bot_id)
  select dm.sender_id as user_id, max(dm.created_at) as last_msg_at
  from public.direct_messages dm, b
  where dm.receiver_id = b.bot_user_id
    and exists (select 1 from b where b.owner_id = auth.uid())
  group by dm.sender_id
  order by last_msg_at desc;
$$;
grant execute on function public.bot_audience(uuid) to authenticated;;
