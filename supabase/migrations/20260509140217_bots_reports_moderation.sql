-- Reports
create table if not exists public.bot_reports (
  id uuid primary key default gen_random_uuid(),
  bot_id uuid not null references public.bots(id) on delete cascade,
  reporter_id uuid not null references auth.users(id) on delete cascade,
  reason text not null check (reason in ('spam','abusive','inappropriate','impersonation','other')),
  details text,
  status text not null default 'open' check (status in ('open','reviewed','dismissed','actioned')),
  created_at timestamptz not null default now(),
  unique (bot_id, reporter_id)
);
create index if not exists bot_reports_bot_idx on public.bot_reports(bot_id, created_at desc);
alter table public.bot_reports enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where tablename='bot_reports' and policyname='Users insert own reports') then
    create policy "Users insert own reports" on public.bot_reports for insert to authenticated
      with check (reporter_id = auth.uid());
  end if;
  if not exists (select 1 from pg_policies where tablename='bot_reports' and policyname='Owner can read reports for own bots') then
    create policy "Owner can read reports for own bots" on public.bot_reports for select to authenticated
      using (exists (select 1 from public.bots b where b.id = bot_id and b.owner_id = auth.uid())
             or reporter_id = auth.uid());
  end if;
end $$;

-- RPC: report a bot (idempotent — upsert by reporter)
create or replace function public.report_bot(p_bot_id uuid, p_reason text, p_details text default null)
returns void
language plpgsql security definer set search_path = public as $$
declare v_uid uuid := auth.uid();
begin
  if v_uid is null then raise exception 'Not authenticated'; end if;
  insert into public.bot_reports (bot_id, reporter_id, reason, details)
  values (p_bot_id, v_uid, p_reason, p_details)
  on conflict (bot_id, reporter_id)
    do update set reason = excluded.reason, details = excluded.details, created_at = now(), status = 'open';
end $$;
grant execute on function public.report_bot(uuid, text, text) to authenticated;

-- RPC: report summary for owner
create or replace function public.bot_report_summary(p_bot_id uuid)
returns table (open_count bigint, total_count bigint, last_reason text, last_at timestamptz)
language sql stable security definer set search_path = public as $$
  select
    count(*) filter (where status = 'open') as open_count,
    count(*) as total_count,
    (select reason from public.bot_reports where bot_id = p_bot_id order by created_at desc limit 1) as last_reason,
    (select created_at from public.bot_reports where bot_id = p_bot_id order by created_at desc limit 1) as last_at
  from public.bot_reports
  where bot_id = p_bot_id
    and exists (select 1 from public.bots b where b.id = p_bot_id and b.owner_id = auth.uid());
$$;
grant execute on function public.bot_report_summary(uuid) to authenticated;

-- Auto-moderate: deactivate bot once it has 5+ open reports from distinct users
create or replace function public.auto_moderate_bot()
returns trigger language plpgsql security definer set search_path = public as $$
declare v_count int;
begin
  select count(distinct reporter_id) into v_count
  from public.bot_reports where bot_id = new.bot_id and status = 'open';
  if v_count >= 5 then
    update public.bots set is_active = false where id = new.bot_id and is_active = true;
  end if;
  return new;
end $$;
drop trigger if exists trg_auto_moderate_bot on public.bot_reports;
create trigger trg_auto_moderate_bot after insert on public.bot_reports
  for each row execute function public.auto_moderate_bot();;
