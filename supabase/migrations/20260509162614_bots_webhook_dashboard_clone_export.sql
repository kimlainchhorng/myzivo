-- Webhook call log (B1 + B2)
create table if not exists public.bot_webhook_calls (
  id bigserial primary key,
  bot_id uuid not null references public.bots(id) on delete cascade,
  message_id uuid,
  url text,
  request_body jsonb,
  response_status int,
  response_body text,
  duration_ms int,
  attempt int not null default 1,
  error text,
  created_at timestamptz not null default now()
);
create index if not exists bot_webhook_calls_bot_idx on public.bot_webhook_calls(bot_id, id desc);

alter table public.bot_webhook_calls enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where tablename='bot_webhook_calls' and policyname='Owner reads webhook calls') then
    create policy "Owner reads webhook calls" on public.bot_webhook_calls for select to authenticated
      using (exists (select 1 from public.bots b where b.id = bot_id and b.owner_id = auth.uid()));
  end if;
end $$;

-- Auto-prune to last 100 per bot
create or replace function public.prune_bot_webhook_calls() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if (select count(*) from public.bot_webhook_calls where bot_id = new.bot_id) > 150 then
    delete from public.bot_webhook_calls where id in (
      select id from public.bot_webhook_calls where bot_id = new.bot_id order by id desc offset 100
    );
  end if;
  return new;
end $$;
drop trigger if exists trg_prune_webhook_calls on public.bot_webhook_calls;
create trigger trg_prune_webhook_calls after insert on public.bot_webhook_calls
  for each row execute function public.prune_bot_webhook_calls();

-- Conversation export (B5) — owner-only
create or replace function public.bot_export_conversation(p_bot_id uuid, p_user_id uuid)
returns table (id uuid, sender_id uuid, message text, image_url text, created_at timestamptz)
language sql stable security definer set search_path = public as $$
  with b as (
    select bot_user_id from public.bots
    where id = p_bot_id and owner_id = auth.uid()
  )
  select dm.id, dm.sender_id, dm.message, dm.image_url, dm.created_at
  from public.direct_messages dm, b
  where (dm.sender_id = b.bot_user_id and dm.receiver_id = p_user_id)
     or (dm.sender_id = p_user_id and dm.receiver_id = b.bot_user_id)
  order by dm.created_at asc
  limit 5000;
$$;
grant execute on function public.bot_export_conversation(uuid, uuid) to authenticated;;
