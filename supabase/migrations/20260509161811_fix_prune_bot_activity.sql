drop trigger if exists trg_prune_bot_activity on public.bot_activity;
drop function if exists public.prune_bot_activity();

-- Row-level prune (cheap; only runs delete when over threshold)
create or replace function public.prune_bot_activity() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if (select count(*) from public.bot_activity where bot_id = new.bot_id) > 600 then
    delete from public.bot_activity
    where id in (
      select id from public.bot_activity where bot_id = new.bot_id
      order by id desc offset 500
    );
  end if;
  return new;
end $$;
create trigger trg_prune_bot_activity after insert on public.bot_activity
  for each row execute function public.prune_bot_activity();;
