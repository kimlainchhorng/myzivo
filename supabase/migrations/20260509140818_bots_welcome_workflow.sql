-- Allow 'first' as a trigger type (fires on user's first-ever message to this bot)
alter table public.bot_workflows drop constraint if exists bot_workflows_trigger_type_check;
alter table public.bot_workflows add constraint bot_workflows_trigger_type_check
  check (trigger_type in ('command','keyword','regex','start','any','first'));

-- Helper: is this the user's first message to the bot?
create or replace function public.is_first_user_msg(p_bot_user_id uuid, p_user_id uuid, p_message_id uuid)
returns boolean
language sql stable security definer set search_path = public as $$
  select not exists (
    select 1 from public.direct_messages
    where receiver_id = p_bot_user_id and sender_id = p_user_id and id <> p_message_id
  );
$$;
grant execute on function public.is_first_user_msg(uuid, uuid, uuid) to anon, authenticated, service_role;

-- Update match_bot_workflow to also handle 'first' (caller passes is_first flag)
create or replace function public.match_bot_workflow_v2(p_bot_id uuid, p_text text, p_is_first boolean)
returns public.bot_workflows
language sql stable security definer set search_path = public as $$
  select w.* from public.bot_workflows w
  where w.bot_id = p_bot_id and w.is_active = true
    and (
      (w.trigger_type = 'first' and p_is_first)
      or (w.trigger_type = 'any')
      or (w.trigger_type = 'start' and lower(p_text) in ('/start','start'))
      or (w.trigger_type = 'command' and lower(p_text) ~ ('^/' || lower(w.trigger_value) || '(\s|$)'))
      or (w.trigger_type = 'keyword' and position(lower(w.trigger_value) in lower(p_text)) > 0)
      or (w.trigger_type = 'regex' and p_text ~ w.trigger_value)
    )
  order by
    case w.trigger_type
      when 'first' then 0
      when 'command' then 1
      when 'start' then 2
      when 'regex' then 3
      when 'keyword' then 4
      else 5
    end,
    w.sort_order asc, w.created_at asc
  limit 1;
$$;
grant execute on function public.match_bot_workflow_v2(uuid, text, boolean) to anon, authenticated, service_role;;
