do $$ begin
  if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='bots' and column_name='ai_system_prompt') then
    alter table public.bots add column ai_system_prompt text;
    alter table public.bots add column ai_knowledge text;
    alter table public.bots add column ai_model text default 'claude-haiku-4-5-20251001';
    alter table public.bots add column ai_temperature numeric(3,2) default 0.7;
  end if;
end $$;

-- Helper for the AI handler to fetch its config quickly
create or replace function public.get_bot_ai_config(p_bot_user_id uuid)
returns table (
  bot_id uuid, bot_user_id uuid, display_name text,
  ai_system_prompt text, ai_knowledge text, ai_model text, ai_temperature numeric
)
language sql stable security definer set search_path = public as $$
  select b.id, b.bot_user_id, b.display_name, b.ai_system_prompt, b.ai_knowledge,
         b.ai_model, b.ai_temperature
  from public.bots b
  where b.bot_user_id = p_bot_user_id and b.is_active = true
  limit 1;
$$;
grant execute on function public.get_bot_ai_config(uuid) to anon, authenticated, service_role;;
