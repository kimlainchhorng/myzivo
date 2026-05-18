-- Workflows: no-code auto-reply rules (run server-side, no webhook needed)
create table if not exists public.bot_workflows (
  id uuid primary key default gen_random_uuid(),
  bot_id uuid not null references public.bots(id) on delete cascade,
  name text not null default '',
  trigger_type text not null check (trigger_type in ('command','keyword','regex','start','any')),
  trigger_value text not null default '',
  reply_text text,
  reply_image_url text,
  next_webhook boolean not null default false,
  is_active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists bot_workflows_bot_idx on public.bot_workflows(bot_id, sort_order);
alter table public.bot_workflows enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where tablename='bot_workflows' and policyname='Owner manages workflows') then
    create policy "Owner manages workflows" on public.bot_workflows for all to authenticated
      using (exists (select 1 from public.bots b where b.id = bot_id and b.owner_id = auth.uid()))
      with check (exists (select 1 from public.bots b where b.id = bot_id and b.owner_id = auth.uid()));
  end if;
  if not exists (select 1 from pg_policies where tablename='bot_workflows' and policyname='Anyone read active workflows') then
    create policy "Anyone read active workflows" on public.bot_workflows for select to authenticated using (is_active = true);
  end if;
end $$;

-- Per-user conversation state for bots
create table if not exists public.bot_user_state (
  bot_id uuid not null references public.bots(id) on delete cascade,
  user_id uuid not null,
  state jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (bot_id, user_id)
);
alter table public.bot_user_state enable row level security;
-- only service role reads/writes (via edge functions)

-- Pending updates queue for getUpdates polling (bots without webhook)
create table if not exists public.bot_updates (
  id bigserial primary key,
  bot_id uuid not null references public.bots(id) on delete cascade,
  message_id uuid not null,
  payload jsonb not null,
  delivered_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists bot_updates_bot_pending on public.bot_updates(bot_id, id) where delivered_at is null;

-- Performance indexes
create index if not exists direct_messages_receiver_created_idx on public.direct_messages(receiver_id, created_at desc);
create index if not exists profiles_is_bot_idx on public.profiles(is_bot) where is_bot = true;

-- Workflow-evaluation helper: pick the first matching rule for a message
create or replace function public.match_bot_workflow(p_bot_id uuid, p_text text)
returns public.bot_workflows
language sql stable security definer set search_path = public as $$
  select w.* from public.bot_workflows w
  where w.bot_id = p_bot_id and w.is_active = true
    and (
      (w.trigger_type = 'any')
      or (w.trigger_type = 'start' and lower(p_text) in ('/start','start'))
      or (w.trigger_type = 'command' and lower(p_text) ~ ('^/' || lower(w.trigger_value) || '(\s|$)'))
      or (w.trigger_type = 'keyword' and position(lower(w.trigger_value) in lower(p_text)) > 0)
      or (w.trigger_type = 'regex' and p_text ~ w.trigger_value)
    )
  order by
    case w.trigger_type when 'command' then 1 when 'start' then 2 when 'regex' then 3 when 'keyword' then 4 else 5 end,
    w.sort_order asc, w.created_at asc
  limit 1;
$$;
grant execute on function public.match_bot_workflow(uuid, text) to anon, authenticated, service_role;;
