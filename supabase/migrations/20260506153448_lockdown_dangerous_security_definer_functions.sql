-- Security advisor flagged 67 SECURITY DEFINER functions callable by `anon`.
-- The financial / state-mutating ones I shipped this session must be
-- locked down — anon callers should never be able to settle P2P transfers
-- or credit a wallet. Postgres grants EXECUTE to PUBLIC by default, which
-- includes anon, so a GRANT to authenticated isn't enough — must also
-- REVOKE from PUBLIC + anon explicitly.

REVOKE EXECUTE ON FUNCTION public.accept_p2p_transfer(uuid)  FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.decline_p2p_transfer(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.cancel_p2p_transfer(uuid)  FROM PUBLIC, anon;

REVOKE EXECUTE ON FUNCTION public.credit_user_wallet_topup(uuid, bigint, text, text, text) FROM PUBLIC, anon, authenticated;
-- Wallet credit is service-role only; only the verify-user-wallet-topup
-- edge function (which authenticates the Stripe session) should call it.

-- Trigger helper functions should not be RPC-callable at all.
REVOKE EXECUTE ON FUNCTION public.tg_p2p_notify_receiver()         FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.tg_dispatch_notification_push()  FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.tg_post_like_notify_author()     FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.tg_post_comment_notify_author()  FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.tg_store_post_like_notify_owner()    FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.tg_store_post_comment_notify_owner() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.tg_user_follow_notify()          FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.tg_story_reaction_notify_author() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.tg_story_comment_notify_author() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.tg_message_reaction_notify_sender() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.tg_live_stream_started_notify_followers() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.tg_creator_subscription_notify() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.tg_membership_notify()           FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.tg_zivo_sub_notify()             FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.tg_loyalty_award_food_order()    FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.tg_loyalty_award_ride()          FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.tg_loyalty_award_lodging()       FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.tg_ride_status_notify_rider()    FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.tg_user_post_mentions()          FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.tg_post_comment_mentions()       FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.tg_channel_comment_notify_author() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.notify_mentions_in_text(uuid, text, text, text, text) FROM PUBLIC, anon, authenticated;

-- award_loyalty_points should only be invoked by the trigger functions,
-- never directly via RPC.
REVOKE EXECUTE ON FUNCTION public.award_loyalty_points(uuid, bigint, text, text) FROM PUBLIC, anon, authenticated;;
