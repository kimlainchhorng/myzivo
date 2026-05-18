-- Webhook secret (HMAC) per bot — auto-generated
do $$ begin
  if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='bots' and column_name='webhook_secret') then
    alter table public.bots add column webhook_secret text;
  end if;
end $$;

-- Backfill existing bots with a secret
update public.bots
set webhook_secret = encode(extensions.gen_random_bytes(24), 'hex')
where webhook_secret is null;

-- Trigger to auto-fill on insert
create or replace function public.set_bot_webhook_secret() returns trigger
language plpgsql security definer set search_path = public, extensions as $$
begin
  if new.webhook_secret is null then
    new.webhook_secret := encode(extensions.gen_random_bytes(24), 'hex');
  end if;
  return new;
end $$;
drop trigger if exists trg_set_bot_webhook_secret on public.bots;
create trigger trg_set_bot_webhook_secret before insert on public.bots
  for each row execute function public.set_bot_webhook_secret();

-- Owner can rotate
create or replace function public.rotate_webhook_secret(p_bot_id uuid) returns text
language plpgsql security definer set search_path = public, extensions as $$
declare v_secret text;
begin
  if not exists (select 1 from public.bots where id = p_bot_id and owner_id = auth.uid()) then
    raise exception 'Bot not found or not owned';
  end if;
  v_secret := encode(extensions.gen_random_bytes(24), 'hex');
  update public.bots set webhook_secret = v_secret, updated_at = now() where id = p_bot_id;
  return v_secret;
end $$;
grant execute on function public.rotate_webhook_secret(uuid) to authenticated;

-- Activity log (owner-visible events for debugging)
create table if not exists public.bot_activity (
  id bigserial primary key,
  bot_id uuid not null references public.bots(id) on delete cascade,
  kind text not null check (kind in ('msg_in','msg_out','webhook_call','schedule_run','broadcast','workflow_match')),
  status text,
  detail text,
  created_at timestamptz not null default now()
);
create index if not exists bot_activity_bot_idx on public.bot_activity(bot_id, id desc);
alter table public.bot_activity enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where tablename='bot_activity' and policyname='Owner reads own activity') then
    create policy "Owner reads own activity" on public.bot_activity for select to authenticated
      using (exists (select 1 from public.bots b where b.id = bot_id and b.owner_id = auth.uid()));
  end if;
end $$;

-- Auto-prune: keep only last 500 events per bot
create or replace function public.prune_bot_activity() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  delete from public.bot_activity
  where id in (
    select id from public.bot_activity where bot_id = new.bot_id
    order by id desc offset 500
  );
  return new;
end $$;
drop trigger if exists trg_prune_bot_activity on public.bot_activity;
create trigger trg_prune_bot_activity after insert on public.bot_activity
  for each statement execute function public.prune_bot_activity();;
