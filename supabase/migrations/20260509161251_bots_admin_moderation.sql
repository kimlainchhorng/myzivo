-- Helper: is_bot_admin = admin OR moderator
create or replace function public.is_bot_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce(public.has_role(auth.uid(), 'admin'), false)
      or coalesce(public.has_role(auth.uid(), 'moderator'), false);
$$;
grant execute on function public.is_bot_admin() to authenticated;

-- Admin: list open reports with bot context
create or replace function public.admin_bot_reports(p_status text default 'open')
returns table (
  report_id uuid, bot_id uuid, bot_username text, bot_display_name text,
  bot_is_active boolean, reporter_id uuid, reason text, details text,
  status text, created_at timestamptz
)
language sql stable security definer set search_path = public as $$
  select r.id, r.bot_id, b.username, b.display_name, b.is_active,
         r.reporter_id, r.reason, r.details, r.status, r.created_at
  from public.bot_reports r
  join public.bots b on b.id = r.bot_id
  where public.is_bot_admin()
    and (p_status is null or p_status = '' or r.status = p_status)
  order by r.created_at desc
  limit 200;
$$;
grant execute on function public.admin_bot_reports(text) to authenticated;

-- Admin: take action on a report
create or replace function public.admin_review_report(
  p_report_id uuid, p_status text, p_deactivate_bot boolean default false
) returns void
language plpgsql security definer set search_path = public as $$
declare v_bot_id uuid;
begin
  if not public.is_bot_admin() then raise exception 'Not authorized'; end if;
  if p_status not in ('open','reviewed','dismissed','actioned') then raise exception 'invalid status'; end if;
  update public.bot_reports set status = p_status where id = p_report_id returning bot_id into v_bot_id;
  if p_deactivate_bot and v_bot_id is not null then
    update public.bots set is_active = false where id = v_bot_id;
  end if;
end $$;
grant execute on function public.admin_review_report(uuid, text, boolean) to authenticated;

-- Admin: feature/unfeature a bot
create or replace function public.admin_feature_bot(p_bot_id uuid, p_featured boolean)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.is_bot_admin() then raise exception 'Not authorized'; end if;
  update public.bots set featured = p_featured where id = p_bot_id;
end $$;
grant execute on function public.admin_feature_bot(uuid, boolean) to authenticated;

-- Admin: re-activate a bot (rare, after fixing reports)
create or replace function public.admin_set_bot_active(p_bot_id uuid, p_active boolean)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.is_bot_admin() then raise exception 'Not authorized'; end if;
  update public.bots set is_active = p_active where id = p_bot_id;
end $$;
grant execute on function public.admin_set_bot_active(uuid, boolean) to authenticated;

-- Admin: dashboard summary
create or replace function public.admin_bots_summary()
returns table (
  total_bots bigint, active_bots bigint, featured_bots bigint,
  open_reports bigint, total_reports bigint, total_ratings bigint
)
language sql stable security definer set search_path = public as $$
  select
    (select count(*) from public.bots),
    (select count(*) from public.bots where is_active = true),
    (select count(*) from public.bots where featured = true),
    (select count(*) from public.bot_reports where status = 'open'),
    (select count(*) from public.bot_reports),
    (select count(*) from public.bot_ratings)
  where public.is_bot_admin();
$$;
grant execute on function public.admin_bots_summary() to authenticated;;
