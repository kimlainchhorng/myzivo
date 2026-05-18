create or replace function public.my_bot_conversations()
returns table (
  bot_id uuid, bot_user_id uuid, username text, display_name text,
  avatar_url text, last_message text, last_at timestamptz, unread_count bigint
)
language sql stable security definer set search_path = public as $$
  with me as (select auth.uid() as uid),
  pairs as (
    select b.id as bot_id, b.bot_user_id, b.username, b.display_name, b.avatar_url,
           max(dm.created_at) as last_at,
           (
             select dm2.message from public.direct_messages dm2
             where (dm2.sender_id = b.bot_user_id and dm2.receiver_id = (select uid from me))
                or (dm2.sender_id = (select uid from me) and dm2.receiver_id = b.bot_user_id)
             order by dm2.created_at desc limit 1
           ) as last_message,
           coalesce((
             select count(*) from public.direct_messages dm3
             where dm3.sender_id = b.bot_user_id
               and dm3.receiver_id = (select uid from me)
               and dm3.is_read = false
           ), 0) as unread_count
    from public.bots b
    join public.direct_messages dm
      on dm.sender_id = b.bot_user_id and dm.receiver_id = (select uid from me)
      or dm.sender_id = (select uid from me) and dm.receiver_id = b.bot_user_id
    where b.is_active = true
    group by b.id
  )
  select bot_id, bot_user_id, username, display_name, avatar_url,
         last_message, last_at, unread_count
  from pairs
  order by last_at desc
  limit 50;
$$;
grant execute on function public.my_bot_conversations() to authenticated;;
