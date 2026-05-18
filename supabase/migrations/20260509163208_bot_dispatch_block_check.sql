-- Block trigger: when a blocked user DMs the bot, block the message at the source.
-- We do this in a trigger so dispatch doesn't even run.
create or replace function public.tg_drop_blocked_bot_dms() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if exists (
    select 1 from public.bot_blocks bb
    join public.bots b on b.id = bb.bot_id
    where b.bot_user_id = new.receiver_id and bb.user_id = new.sender_id
  ) then
    return null;  -- silently drop the message
  end if;
  return new;
end $$;
drop trigger if exists trg_drop_blocked_bot_dms on public.direct_messages;
create trigger trg_drop_blocked_bot_dms before insert on public.direct_messages
  for each row execute function public.tg_drop_blocked_bot_dms();;
