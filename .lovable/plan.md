
Problem identified: the QR step is now working, but the phone confirmation step is failing. The screenshot error `"column reference "store_id" is ambiguous"` points to the SQL in `confirm_live_pair_session`, not `create_live_pair_session`.

What I found:
- `PairPage` loads successfully, so `get_live_pair_session` is working.
- The error appears when tapping `Confirm & Go Live`, which calls `confirm_live_pair_session`.
- In the original live-pairing migration, this function has:
  ```sql
  RETURNING id, store_id, status INTO session_id, store_id, status;
  ```
  Because `store_id` and `status` are also output parameter names, Postgres treats them as ambiguous inside the function body.

Plan:
1. Add a new migration that patches `public.confirm_live_pair_session`.
   - Replace the ambiguous `RETURNING ... INTO session_id, store_id, status` pattern with an unambiguous version.
   - Safest fix: use local variables like `v_session_id`, `v_store_id`, `v_status`, or return from `v_row` after the update.
2. Keep the rest of the pairing logic unchanged.
   - Preserve expiry checks, pending-only confirmation, and user-agent capture.
3. While patching, normalize the function style so column references are always qualified (`lps.store_id`, etc.) to avoid similar future errors.
4. Re-test the full pairing flow:
   - Desktop: open store live section and generate QR
   - Phone: open pair link
   - Tap `Confirm & Go Live`
   - Verify no toast error appears
   - Verify desktop session updates to `confirmed`
   - Verify phone redirects into `/go-live`
5. Quick regression check:
   - Cancel still works
   - Expired token still shows proper error
   - QR creation still works after the confirm fix

Technical details:
- Root cause is PL/pgSQL name shadowing between output columns and table columns.
- The broken line is in `supabase/migrations/20260417180144_4d8972bb-fbdb-4660-abb6-1078db260c23.sql` and also the later recreated function still inherits that behavior until patched by a new migration.
- Example safe pattern:
  ```sql
  DECLARE
    v_session_id uuid;
    v_store_id uuid;
    v_status text;
  BEGIN
    UPDATE public.live_pair_sessions lps
    SET status = 'confirmed', confirmed_at = now(), phone_user_agent = p_user_agent
    WHERE lps.id = v_row.id
    RETURNING lps.id, lps.store_id, lps.status
    INTO v_session_id, v_store_id, v_status;

    RETURN QUERY SELECT v_session_id, v_store_id, v_status;
  END;
  ```
- This is a backend SQL fix; no frontend change should be required unless we want better fallback error copy.

Optional follow-up after the fix:
- The current `create_live_pair_session` patch fetches from `public.stores`, while the original ownership logic used `public.store_profiles`. Since the QR already renders, this is not blocking, but I would verify the source so the phone screen shows the real shop name/avatar instead of falling back to “Your Shop”.
