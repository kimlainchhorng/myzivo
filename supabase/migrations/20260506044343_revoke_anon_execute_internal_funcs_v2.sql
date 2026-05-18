-- Tighten EXECUTE on SECURITY DEFINER functions that should never run as anon.
-- (Trigger fns + authenticated-only RPCs.) auth_precheck_login,
-- auth_record_login_attempt, get_cv_by_share_code, get_shared_document, and
-- cleanup_expired_device_link_tokens stay public — those are intentional.
DO $$
DECLARE
  signatures text[] := ARRAY[
    'public.ar_recalc_invoice_payment()',
    'public.claim_employee_invite(_token text)',
    'public.fan_jobs_to_service_orders()',
    'public.fan_post_report_to_queue()',
    'public.get_profile_protected_fields(profile_id uuid)',
    'public.is_lodge_store_manager(_store_id uuid, _user_id uuid)',
    'public.is_lodge_store_owner(_store_id uuid)',
    'public.mirror_product_status_to_service()',
    'public.notify_lodging_host_new_paid_booking()',
    'public.notify_lodging_host_refund()',
    'public.notify_mentions_in_text(p_actor_id uuid, p_text text, p_template text, p_title text, p_action_url text)',
    'public.notify_merchant_new_paid_order()',
    'public.record_legal_acknowledgment(p_role text, p_document_key text, p_document_version text, p_meta jsonb)',
    'public.record_push_subscription(p_role text, p_platform text, p_endpoint text, p_p256dh text, p_auth_secret text, p_fcm_token text, p_apns_token text, p_device_id text, p_user_agent text)',
    'public.tg_channel_comment_notify_author()',
    'public.tg_post_comment_mentions()',
    'public.tg_store_post_comment_mentions()',
    'public.tg_user_post_mentions()',
    'public.toggle_channel_post_pin(p_post_id uuid)',
    'public.toggle_unified_comment_pin(_comment_id uuid)',
    'public.zivo_accept_offer(p_offer_id uuid)',
    'public.zivo_driver_heartbeat(p_lat double precision, p_lng double precision)',
    'public.zivo_invoke_recompute_etas()',
    'public.zivo_mark_messages_read(p_order_id uuid)',
    'public.zivo_nearest_drivers(p_lat double precision, p_lng double precision, p_radius_km numeric, p_limit integer)',
    'public.zivo_redeem_service_promo(p_promo_id uuid, p_order_id uuid, p_discount_cents integer)',
    'public.zivo_send_service_message(p_order_id uuid, p_body text, p_audience text, p_attachments jsonb)',
    'public.zivo_transition_status(p_order_id uuid, p_to_status service_order_status, p_meta jsonb)',
    'public.zivo_validate_service_promo(p_code text, p_kind text, p_subtotal_cents integer, p_delivery_fee_cents integer)'
  ];
  sig text;
  ok_count int := 0;
  fail_count int := 0;
BEGIN
  FOREACH sig IN ARRAY signatures LOOP
    BEGIN
      EXECUTE format('REVOKE EXECUTE ON FUNCTION %s FROM anon', sig);
      ok_count := ok_count + 1;
    EXCEPTION WHEN OTHERS THEN
      fail_count := fail_count + 1;
      RAISE WARNING 'Skipped % (%): %', sig, SQLSTATE, SQLERRM;
    END;
  END LOOP;
  RAISE NOTICE 'Revoked anon EXECUTE on % functions (% failed)', ok_count, fail_count;
END $$;;
