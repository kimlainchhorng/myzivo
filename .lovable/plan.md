
## What’s actually happening (step-by-step)

1. **Your database trigger blocks every new user unless their email exists in `public.signup_allowlist`.**
   - The trigger code is:
     ```sql
     IF NOT EXISTS (SELECT 1 FROM public.signup_allowlist WHERE email = LOWER(NEW.email)) THEN
       RAISE EXCEPTION 'Email not on allowlist: %', NEW.email;
     END IF;
     ```
2. You reported “**Invited email still blocked**”.
3. I checked the database contents in the environment the app is currently using (Test), and:
   - `signup_allowlist` is **empty**:
     - Query result: `[]`
4. Therefore, **even “invited” emails will be blocked** until you actually insert them into the allowlist table in the correct environment.

## Why it feels like it “still won’t work”
- The system is working as designed: **it is enforcing invite-only**, but **no invites exist** in the allowlist table yet.
- Also note: Lovable has **Test vs Live** environments. If you added invites in Live but are testing on Preview (Test), it will still be empty (and vice versa).

---

## Immediate fix (no code changes required)

### Step 1 — Add at least one allowlisted email in the correct environment
In Supabase Dashboard → SQL Editor, run (replace with your email):

```sql
insert into public.signup_allowlist (email, invited_by)
values ('you@yourdomain.com', 'manual');
```

Important:
- Do this in the **same environment you’re testing**:
  - Preview URL typically hits **Test**.
  - Published URL hits **Live**.

### Step 2 — Re-test Google sign-in
- Go to `/login` → Continue with Google → choose that exact email.
- It should now pass the trigger and proceed to `/setup`.

---

## Verification / debugging steps (to confirm root cause)

### Step 3 — Confirm the allowlist entry exists
Run:

```sql
select email, created_at, used_at
from public.signup_allowlist
order by created_at desc
limit 20;
```

You should see your email in the results.

### Step 4 — If it still blocks, check whether the invite got marked “used”
If `used_at` is set, then the system will treat it as already consumed (depending on your flow). Check:

```sql
select email, used_at
from public.signup_allowlist
where email = lower('you@yourdomain.com');
```

If `used_at` is non-null and you need to re-test signup with the same email, you can clear it:

```sql
update public.signup_allowlist
set used_at = null
where email = lower('you@yourdomain.com');
```

---

## Code improvements to prevent this confusion (implementation follow-up)

### Step 5 — Add an Admin “Invite List” UI inside the app
So you don’t need to manually run SQL every time:
- Create an admin-only page (guarded by `has_role(..., 'admin')`) to:
  - Add email
  - See whether it’s used
  - Optionally reset `used_at` for re-invites

### Step 6 — Add a “No invites configured” warning for admins (optional)
- If `signup_allowlist` is empty, show an admin-only banner explaining that all signups will be blocked until invites are added.

### Step 7 — Add a small “Invite yourself” seed (optional)
- In a migration, insert 1–2 known admin emails into `signup_allowlist` so first-time setup is never blocked.

---

## Acceptance criteria (what “working” looks like)
- With an email present in `signup_allowlist`, Google sign-in:
  - No longer results in the “Email not on allowlist” rejection
  - Creates profile
  - Redirects to `/setup`
- With an email NOT present in `signup_allowlist`, Google sign-in:
  - Gets blocked
  - User sees the “not authorized” message on `/` (your Index.tsx handler)

---

## What I need from you (1 detail)
- Are you testing on **Preview** or **Published** right now?
  - Preview = Test DB
  - Published = Live DB
  - This matters because you must insert the invite into the same environment’s database.
