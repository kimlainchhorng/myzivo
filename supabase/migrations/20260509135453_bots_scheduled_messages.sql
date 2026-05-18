create table if not exists public.bot_scheduled_messages (
  id uuid primary key default gen_random_uuid(),
  bot_id uuid not null references public.bots(id) on delete cascade,
  audience text not null default 'all' check (audience in ('all','user')),
  target_user_id uuid,
  text text,
  image_url text,
  next_run_at timestamptz not null,
  interval_minutes int,            -- null = one-shot; >0 = repeat every N min
  is_active boolean not null default true,
  last_run_at timestamptz,
  last_sent_count int,
  created_at timestamptz not null default now(),
  check (text is not null or image_url is not null),
  check (audience = 'all' or target_user_id is not null)
);
create index if not exists bot_scheduled_due_idx on public.bot_scheduled_messages(next_run_at)
  where is_active = true;
create index if not exists bot_scheduled_bot_idx on public.bot_scheduled_messages(bot_id, created_at desc);

alter table public.bot_scheduled_messages enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where tablename='bot_scheduled_messages' and policyname='Owner manages schedules') then
    create policy "Owner manages schedules" on public.bot_scheduled_messages for all to authenticated
      using (exists (select 1 from public.bots b where b.id = bot_id and b.owner_id = auth.uid()))
      with check (exists (select 1 from public.bots b where b.id = bot_id and b.owner_id = auth.uid()));
  end if;
end $$;

-- Cron: run scheduler every minute
do $$ declare jid int;
begin
  select jobid into jid from cron.job where jobname = 'bot-scheduler-every-minute';
  if jid is not null then perform cron.unschedule(jid); end if;
end $$;

select cron.schedule(
  'bot-scheduler-every-minute', '* * * * *',
  $$
  select net.http_post(
    url := 'https://slirphzzwcogdbkeicff.supabase.co/functions/v1/bot-scheduler',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNsaXJwaHp6d2NvZ2Ria2VpY2ZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk0NDUzMzgsImV4cCI6MjA4NTAyMTMzOH0.44uwdZZxQZYmmHr9yUALGO4Vr6mJVaVfSQW_pzJ0uoI'
    ),
    body := jsonb_build_object('ts', now())
  );
  $$
);;
