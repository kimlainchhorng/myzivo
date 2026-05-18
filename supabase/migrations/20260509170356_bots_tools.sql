create table if not exists public.bot_tools (
  id uuid primary key default gen_random_uuid(),
  bot_id uuid not null references public.bots(id) on delete cascade,
  name text not null check (name ~ '^[a-z0-9_]{1,40}$'),
  description text not null default '',
  http_method text not null default 'GET' check (http_method in ('GET','POST','PUT','DELETE','PATCH')),
  url text not null,
  headers jsonb not null default '{}'::jsonb,
  input_schema jsonb not null default '{"type":"object","properties":{},"required":[]}'::jsonb,
  is_active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  unique (bot_id, name)
);
create index if not exists bot_tools_bot_idx on public.bot_tools(bot_id, sort_order);

alter table public.bot_tools enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where tablename='bot_tools' and policyname='Owner manages tools') then
    create policy "Owner manages tools" on public.bot_tools for all to authenticated
      using (exists (select 1 from public.bots b where b.id = bot_id and b.owner_id = auth.uid()))
      with check (exists (select 1 from public.bots b where b.id = bot_id and b.owner_id = auth.uid()));
  end if;
end $$;

-- Helper for AI handler
create or replace function public.get_bot_tools(p_bot_user_id uuid)
returns table (id uuid, name text, description text, http_method text, url text, headers jsonb, input_schema jsonb)
language sql stable security definer set search_path = public as $$
  select t.id, t.name, t.description, t.http_method, t.url, t.headers, t.input_schema
  from public.bot_tools t
  join public.bots b on b.id = t.bot_id
  where b.bot_user_id = p_bot_user_id and b.is_active = true and t.is_active = true
  order by t.sort_order;
$$;
grant execute on function public.get_bot_tools(uuid) to anon, authenticated, service_role;;
