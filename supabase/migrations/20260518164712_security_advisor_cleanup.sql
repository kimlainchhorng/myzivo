-- Security advisor cleanup for the currently linked Supabase project.
-- These changes are intentionally narrow: remove broad public list access,
-- make view/RPC execution safer, and preserve public object URL behavior.

-- Security-definer views bypass caller RLS by default. Let callers use their
-- own permissions when reading the public bot directory.
alter view if exists public.bots_directory
  set (security_invoker = true);

-- Keep the public bot directory readable after security_invoker starts
-- applying the caller's RLS policies on public.bots.
drop policy if exists "Anon can view active bots" on public.bots;
create policy "Anon can view active bots"
  on public.bots for select
  to anon
  using (is_active = true);

-- Pin mutable search paths reported by Supabase advisors.
alter function public.bbq_generate_order_number()
  set search_path = public, extensions;

alter function public.bbq_set_updated_at()
  set search_path = public, extensions;

alter function public.deliveries_set_updated_at()
  set search_path = public, extensions;

-- OTP helpers use pgcrypto functions; include extensions in the execution
-- search path so unqualified pgcrypto calls resolve consistently.
create extension if not exists pgcrypto with schema extensions;

alter function public.ensure_job_otp(uuid, integer, integer, text)
  set search_path = public, extensions;

alter function public.verify_job_otp_and_complete(uuid, text)
  set search_path = public, extensions;

alter function public.get_job_otp_plain(uuid, text)
  set search_path = public, extensions;

-- Public buckets remain public for direct object URLs, but broad SELECT
-- policies let clients enumerate bucket contents. Drop the listing policies.
drop policy if exists "market photos public read" on storage.objects;
drop policy if exists "Anyone can view store assets" on storage.objects;
drop policy if exists "store_posts_select_public" on storage.objects;

-- These privileged functions should not be callable by anonymous users.
do $$
declare
  target_name text;
  target_function regprocedure;
begin
  foreach target_name in array array[
    'admin_bot_reports',
    'admin_bots_summary',
    'admin_feature_bot',
    'admin_review_report',
    'admin_set_bot_active',
    'cleanup_expired_device_link_tokens',
    'deliveries_dispatch_after_insert',
    'deliveries_status_notify_after_update',
    'expire_stale_marketplace_offers'
  ]
  loop
    for target_function in
      select p.oid::regprocedure
      from pg_proc p
      join pg_namespace n on n.oid = p.pronamespace
      where n.nspname = 'public'
        and p.proname = target_name
    loop
      execute format('revoke execute on function %s from public', target_function);
      execute format('revoke execute on function %s from anon', target_function);
      execute format('grant execute on function %s to service_role', target_function);

      if target_name like 'admin\_%' escape '\' then
        execute format('grant execute on function %s to authenticated', target_function);
      end if;
    end loop;
  end loop;
end;
$$;
