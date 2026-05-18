create or replace function public.create_bot_row(
  p_owner uuid, p_bot_user_id uuid, p_username text,
  p_display_name text, p_description text
) returns table (bot_id uuid, token text)
language plpgsql security definer set search_path = public, extensions as $$
declare
  v_bot_id uuid := gen_random_uuid();
  v_token text;
  v_token_hash text;
begin
  v_token := replace(v_bot_id::text, '-', '') || ':' || encode(extensions.gen_random_bytes(24), 'hex');
  v_token_hash := encode(extensions.digest(v_token, 'sha256'), 'hex');
  insert into public.bots (id, bot_user_id, owner_id, username, display_name, description, token_hash)
  values (v_bot_id, p_bot_user_id, p_owner, p_username, p_display_name, p_description, v_token_hash);
  return query select v_bot_id, v_token;
end $$;
revoke all on function public.create_bot_row(uuid, uuid, text, text, text) from public;
-- only service role should call this (from edge function);
