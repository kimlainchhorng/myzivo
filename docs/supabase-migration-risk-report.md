# Supabase Migration Risk Report

Generated: 2026-05-18T17:24:03.237Z

## Summary

- Local migrations: 1343
- Remote migrations: 1253
- Matched versions: 1253
- Local-only pending migrations: 90
- Remote-only missing local migrations: 0
- Invalid local filenames: 0
- Duplicate local versions: 0
- Duplicate local SQL hashes: 1

## Pending Local Migrations

- High risk: 59
- Medium risk: 28
- Low risk: 3

### High Risk

| Version | File | Signals |
|---|---|---|
| 20260330173000 | `20260330173000_8b4f4f26-7036-4e35-9d37-65ab70f88df4.sql` | drops database objects |
| 20260405131000 | `20260405131000_device_tokens_unique_token.sql` | deletes or truncates data |
| 20260406020001 | `20260406020001_meta_capi_bridge_webhooks.sql` | drops database objects, adds security definer code |
| 20260406091500 | `20260406091500_super_app_architecture.sql` | drops database objects, adds security definer code |
| 20260406093000 | `20260406093000_launch_security_deeplink_pulse.sql` | drops database objects |
| 20260406094500 | `20260406094500_admin_wallet_ledger.sql` | drops database objects |
| 20260411124500 | `20260411124500_chat_security_enforcement.sql` | drops database objects, revokes privileges, adds security definer code |
| 20260411133500 | `20260411133500_chat_security_rate_limit.sql` | adds security definer code |
| 20260411143000 | `20260411143000_chat_sender_quarantine_controls.sql` | deletes or truncates data, revokes privileges, adds security definer code |
| 20260411152000 | `20260411152000_chat_resilience_limits.sql` | adds security definer code |
| 20260411160000 | `20260411160000_security_sentinel_project.sql` | drops database objects, revokes privileges, adds security definer code |
| 20260411170000 | `20260411170000_auth_shield_lockout.sql` | revokes privileges, adds security definer code |
| 20260411175000 | `20260411175000_auth_shield_admin_controls.sql` | deletes or truncates data, adds security definer code |
| 20260411183000 | `20260411183000_auth_shield_anomaly_detection.sql` | adds security definer code |
| 20260411190000 | `20260411190000_auth_shield_playbooks.sql` | drops database objects, adds security definer code |
| 20260429220000 | `20260429220000_lodge_rate_plans.sql` | deletes or truncates data |
| 20260429230000 | `20260429230000_security_hardening.sql` | drops database objects, deletes or truncates data, revokes privileges, adds security definer code |
| 20260429230001 | `20260429230001_user_posts_visibility_location.sql` | drops database objects |
| 20260429240000 | `20260429240000_backfill_storage_paths.sql` | drops database objects |
| 20260429240001 | `20260429240001_increment_user_post_views.sql` | adds security definer code |
| 20260429250000 | `20260429250000_post_actions_tables.sql` | drops database objects |
| 20260429260001 | `20260429260001_post_reactions.sql` | drops database objects |
| 20260429270000 | `20260429270000_post_view_share_counts.sql` | drops database objects, revokes privileges, adds security definer code |
| 20260430000000 | `20260430000000_post_reposts.sql` | drops database objects, deletes or truncates data, revokes privileges, adds security definer code |
| 20260430010000 | `20260430010000_social_notifications_and_comment_hearts.sql` | drops database objects, deletes or truncates data, revokes privileges, adds security definer code |
| 20260430020001 | `20260430020001_fix_social_notification_triggers.sql` | drops database objects, adds security definer code |
| 20260430040001 | `20260430040001_comment_pinning.sql` | revokes privileges, adds security definer code |
| 20260430050001 | `20260430050001_post_comments_pin_and_edit.sql` | revokes privileges, adds security definer code |
| 20260430060001 | `20260430060001_post_comments_notification_trigger.sql` | drops database objects, adds security definer code |
| 20260501100000 | `20260501100000_threat_intel.sql` | drops database objects, revokes privileges, adds security definer code |
| 20260501110000 | `20260501110000_auto_block_threat.sql` | revokes privileges, adds security definer code |
| 20260501120000 | `20260501120000_blocklist_cleanup.sql` | deletes or truncates data, revokes privileges, adds security definer code |
| 20260501130000 | `20260501130000_user_blocklist.sql` | drops database objects, revokes privileges, adds security definer code |
| 20260501140000 | `20260501140000_auto_revoke_blocked_sessions.sql` | drops database objects, revokes privileges, adds security definer code |
| 20260501150000 | `20260501150000_new_device_login_alert.sql` | drops database objects, revokes privileges, adds security definer code |
| 20260501160000 | `20260501160000_my_recent_logins.sql` | revokes privileges, adds security definer code |
| 20260501170000 | `20260501170000_audit_admin_pii_read.sql` | revokes privileges, adds security definer code |
| 20260501180000 | `20260501180000_login_country_tracking.sql` | drops database objects, revokes privileges, adds security definer code |
| 20260502140000 | `20260502140000_daily_coin_reward.sql` | drops database objects, adds security definer code |
| 20260503181500 | `20260503181500_post_comments_pinning.sql` | revokes privileges, adds security definer code |
| 20260505180000 | `20260505180000_chat_super_app_features.sql` | drops database objects |
| 20260505190000 | `20260505190000_p2p_transfers_and_expenses.sql` | drops database objects |
| 20260505200000 | `20260505200000_user_wallet_loyalty_partner.sql` | drops database objects |
| 20260506211527 | `20260506211527_get_nearby_drivers_freshness_filter.sql` | adds security definer code |
| 20260507165352 | `20260507165352_fix_user_followers_triggers.sql` | drops database objects |
| 20260508120000 | `20260508120000_bots_botfather.sql` | drops database objects, revokes privileges, adds security definer code |
| 20260509120000 | `20260509120000_unified_notifications.sql` | drops database objects, adds security definer code |
| 20260509130000 | `20260509130000_notifications_followups.sql` | drops database objects, adds security definer code |
| 20260509140000 | `20260509140000_provider_side_notifications.sql` | drops database objects, adds security definer code |
| 20260509150000 | `20260509150000_notification_logs_admin_read.sql` | drops database objects |
| 20260509160000 | `20260509160000_hotel_detail_rpc.sql` | adds security definer code |
| 20260509170000 | `20260509170000_live_and_payout_notifications.sql` | drops database objects, adds security definer code |
| 20260509200000 | `20260509200000_grouped_social_notifications.sql` | drops database objects, adds security definer code |
| 20260509210000 | `20260509210000_notifications_snooze.sql` | adds security definer code |
| 20260509230000 | `20260509230000_make_like_trigger_nonfatal.sql` | adds security definer code |
| 20260516120000 | `20260516120000_api_performance_indexes_access_rpc.sql` | adds security definer code |
| 20260518164712 | `20260518164712_security_advisor_cleanup.sql` | drops database objects, revokes privileges |
| 20260518230000 | `20260518230000_saved_collections.sql` | drops database objects |
| 20260518230100 | `20260518230100_post_products.sql` | drops database objects |

### Medium Risk

| Version | File | Signals |
|---|---|---|
| 20260429154352 | `20260429154352_lodge_handover_notes.sql` | changes RLS policies, changes storage/auth schemas, alters tables |
| 20260429160000 | `20260429160000_lodge_group_bookings.sql` | changes RLS policies, changes storage/auth schemas, alters tables, changes triggers |
| 20260429162000 | `20260429162000_lodge_notification_templates.sql` | changes RLS policies, changes storage/auth schemas, alters tables, changes triggers |
| 20260429163000 | `20260429163000_lodge_yield_rules.sql` | changes RLS policies, changes storage/auth schemas, alters tables |
| 20260429164000 | `20260429164000_lodge_inventory.sql` | changes RLS policies, changes storage/auth schemas, alters tables, changes triggers |
| 20260429170000 | `20260429170000_lodge_room_service.sql` | changes RLS policies, changes storage/auth schemas, alters tables, changes triggers |
| 20260429171000 | `20260429171000_lodge_gift_vouchers.sql` | changes RLS policies, changes storage/auth schemas, alters tables |
| 20260429172000 | `20260429172000_lodge_parking.sql` | changes RLS policies, changes storage/auth schemas, alters tables, changes triggers |
| 20260429180000 | `20260429180000_lodge_wakeup_calls.sql` | changes RLS policies, changes storage/auth schemas, alters tables |
| 20260429181000 | `20260429181000_lodge_laundry.sql` | changes RLS policies, changes storage/auth schemas, alters tables, changes triggers |
| 20260429182000 | `20260429182000_lodge_complaints.sql` | changes RLS policies, changes storage/auth schemas, alters tables, changes triggers |
| 20260429210000 | `20260429210000_lodge_rooms_public_read.sql` | changes RLS policies |
| 20260429250001 | `20260429250001_user_posts_realtime.sql` | changes publications or realtime identity |
| 20260429260000 | `20260429260000_post_comments_realtime.sql` | changes publications or realtime identity |
| 20260430020000 | `20260430020000_blocked_link_attempts.sql` | changes RLS policies, changes storage/auth schemas, alters tables |
| 20260430030000 | `20260430030000_comment_threading.sql` | alters tables |
| 20260430040000 | `20260430040000_ar_shop_settings_column.sql` | alters tables |
| 20260430050000 | `20260430050000_booking_to_workorder_link.sql` | alters tables |
| 20260430060000 | `20260430060000_ar_estimates_share_token.sql` | changes RLS policies, alters tables |
| 20260430070000 | `20260430070000_ar_workorder_share_token.sql` | changes RLS policies, alters tables |
| 20260430080000 | `20260430080000_ar_service_catalog.sql` | changes RLS policies, changes storage/auth schemas, alters tables, changes triggers |
| 20260430090000 | `20260430090000_ar_customer_notes.sql` | changes RLS policies, changes storage/auth schemas, alters tables |
| 20260503181000 | `20260503181000_post_comments_post_id_to_text.sql` | alters tables |
| 20260505184000 | `20260505184000_review_and_rating_system.sql` | changes RLS policies, changes storage/auth schemas, alters tables, changes triggers |
| 20260505210000 | `20260505210000_super_app_mega_features.sql` | changes RLS policies, changes storage/auth schemas, alters tables |
| 20260506220000 | `20260506220000_employee_workflow.sql` | changes RLS policies, changes storage/auth schemas, alters tables, changes triggers |
| 20260507200000 | `20260507200000_of_creator_discovery_filter.sql` | changes grants, alters tables |
| 20260518170000 | `20260518170000_story_overlays_and_filters.sql` | changes RLS policies, changes storage/auth schemas, alters tables |

### Low Risk

| Version | File | Signals |
|---|---|---|
| 20260429200000 | `20260429200000_seed_koh_sdach_resort.sql` | schema additive or data-safe pattern |
| 20260509180000 | `20260509180000_notifications_cron_schedule.sql` | schema additive or data-safe pattern |
| 20260509190000 | `20260509190000_weekly_digest_schedule.sql` | schema additive or data-safe pattern |

