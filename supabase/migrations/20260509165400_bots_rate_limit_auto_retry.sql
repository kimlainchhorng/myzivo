-- Per-user-per-bot rate limit: drop msgs > 20/min/user/bot
create or replace function public.tg_rate_limit_bot_dms() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  v_is_bot_recipient boolean;
  v_recent_count int;
begin
  select exists (select 1 from public.bots b where b.bot_user_id = new.receiver_id)
    into v_is_bot_recipient;
  if not v_is_bot_recipient then return new; end if;

  select count(*) into v_recent_count
  from public.direct_messages
  where sender_id = new.sender_id
    and receiver_id = new.receiver_id
    and created_at > now() - interval '1 minute'
    and id <> new.id;

  if v_recent_count >= 20 then
    return null;  -- silently drop
  end if;
  return new;
end $$;
drop trigger if exists trg_rate_limit_bot_dms on public.direct_messages;
create trigger trg_rate_limit_bot_dms before insert on public.direct_messages
  for each row execute function public.tg_rate_limit_bot_dms();

-- Auto webhook retry: every minute, retry failed calls (attempt < 3, age < 1h, no later success on same message)
do $$ declare jid int;
begin
  select jobid into jid from cron.job where jobname = 'bot-webhook-retry-every-minute';
  if jid is not null then perform cron.unschedule(jid); end if;
end $$;

select cron.schedule(
  'bot-webhook-retry-every-minute', '* * * * *',
  $$
  with to_retry as (
    select c.id, c.bot_id from public.bot_webhook_calls c
    where c.attempt < 3
      and (c.response_status is null or c.response_status >= 500 or c.response_status < 200 or c.response_status >= 300)
      and c.created_at > now() - interval '1 hour'
      and not exists (
        select 1 from public.bot_webhook_calls c2
        where c2.bot_id = c.bot_id
          and c2.message_id = c.message_id
          and c2.id > c.id
      )
    order by c.id desc
    limit 20
  )
  select net.http_post(
    url := 'https://slirphzzwcogdbkeicff.supabase.co/functions/v1/bot-dispatch',
    headers := jsonb_build_object('Content-Type', 'application/json',
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNsaXJwaHp6d2NvZ2Ria2VpY2ZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk0NDUzMzgsImV4cCI6MjA4NTAyMTMzOH0.44uwdZZxQZYmmHr9yUALGO4Vr6mJVaVfSQW_pzJ0uoI'),
    body := jsonb_build_object('bot_id', t.bot_id, 'retry_call_id', t.id)
  )
  from to_retry t;
  $$
);;
