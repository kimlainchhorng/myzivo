## Hotels & Resorts Admin — Completion Pass

I audited every lodging section under `src/components/admin/store/lodging/` and the wiring in `AdminStoreEditPage.tsx`. The shell, sidebar, and most data-heavy tabs (Rooms, Reservations, Calendar, Front Desk, Housekeeping, Maintenance, Amenities, Property Profile) are solid. Six tabs are still **read-only summary stubs** with no editing, and several common hotel-operations features are missing entirely.

This plan finishes those tabs and adds the missing upgrades.

---

### 1. Convert read-only stub tabs into real editors

These tabs currently only count linked data and bounce users to other tabs. They will become first-class editors with their own persistence.

| Tab | Today | Upgrade |
|---|---|---|
| **Dining & Meal Plans** | Counts meal plans, lists badges | Add inline editor for meal plans (BB / HB / FB / AI), breakfast hours, restaurant hours, room-service window, dietary options, kids menu toggle |
| **Experiences & Tours** | Filters add-ons by category | Dedicated experiences catalog (name, type, duration, price, capacity, included items, photo) saved on the property — independent of room add-ons |
| **Spa & Wellness** | Filters add-ons | Wellness service catalog (treatment, duration, price, therapist, room) + spa hours + booking lead-time |
| **Transport & Transfers** | Filters add-ons | Transfer pricing matrix (airport / pier / city → property, one-way & round-trip, vehicle type, capacity), parking rates, shuttle schedule |
| **Policies & Rules** | Reads property profile | In-place editor for cancellation policy, deposit %, child policy, pet policy, smoking, quiet hours, party rules, payment methods, currencies, taxes |
| **Reviews & Guest Feedback** | Counts checked-out stays | Real review inbox: list reviews, star breakdown, public reply, flag/dispute, request-review CTA after checkout |

### 2. New tabs / features (upgrades)

- **Channel Manager** (`lodge-channels`) — Connect / sync Booking.com, Expedia, Airbnb, Agoda via iCal import + iCal export per room. Status indicator, last-sync time, manual re-sync, conflict warnings.
- **Payouts & Finance** (`lodge-payouts`) — Earnings, pending payout, payout schedule, bank account, tax info, downloadable monthly statements (CSV/PDF). Reuses existing `payment-payouts` plumbing where possible.
- **Employees / Staff** (`lodge-staff`) — The Employees page the user is on shows zeros. Wire it into `store_employees` with hotel-specific roles (Front desk, Housekeeping, Maintenance, F&B, Spa, Manager), shift schedule, payroll summary.
- **Promotions & Discounts** (`lodge-promos`) — Promo codes, last-minute %, early-bird %, length-of-stay discount, mobile-only rate, member-only rate.
- **Taxes & Fees** (within Policies) — VAT %, city/tourism tax (per night / per stay / per guest), service charge %, resort fee.
- **Inbox / Messaging** (`lodge-inbox`) — Unified guest messaging thread per reservation (pre-arrival, in-stay, post-stay) tied to existing chat infrastructure.

### 3. Polish to existing tabs

- **Overview**: real "next best action" wired to the new editors (currently links to read-only tabs that can’t fix the issue).
- **Rooms & Rates**: bulk edit (apply rate / restriction to N rooms at once), copy room type, photo reorder drag.
- **Reservations**: quick filters (Today / This week / VIP / Unpaid), export CSV, send confirmation email button.
- **Calendar**: drag to extend stay, color legend, block-out date range UI.
- **Front Desk**: walk-in booking shortcut, key card status, late-checkout request approval.
- **Housekeeping**: assign-by-staff member dropdown (uses new Staff tab), priority flag, photo upload on completion.
- **Property Profile**: add Wi-Fi password (guest-visible), local emergency contacts, language(s) spoken at front desk, accepted ID types.
- **Setup checklist / completion meter**: include the new tabs so the progress % is honest.

### 4. Backend (Supabase)

New tables (all RLS by `store_id` ownership via `store_profiles.owner_id`):

- `lodging_meal_plans` (store_id, code, name, includes, hours)
- `lodging_experiences` (store_id, name, type, duration_min, price_cents, capacity, photo_url, active)
- `lodging_wellness_services` (store_id, name, duration_min, price_cents, therapist, active)
- `lodging_transfers` (store_id, from_location, to_location, vehicle_type, one_way_cents, round_trip_cents, capacity)
- `lodging_promotions` (store_id, code, type, value, starts_at, ends_at, conditions jsonb)
- `lodging_taxes` (store_id, name, rate_pct, basis, applies_to)
- `lodging_channel_connections` (store_id, room_id, channel, ical_import_url, ical_export_token, last_sync_at, status)
- `lodging_reviews` (store_id, reservation_id, guest_id, rating, body, reply, replied_at, flagged)

Edge functions:
- `lodging-ical-sync` — Pull external iCal feeds on a schedule, write blocked dates into `room_availability`.
- `lodging-ical-export` — Serve per-room iCal feed using export token.
- `lodging-request-review` — Send post-checkout review email/notification.

### 5. Out of scope (intentionally)

- Real-time PMS (Opera/Cloudbeds) integration — iCal channel manager only for now.
- Native POS for restaurant/spa billing — reuse existing folio/charges flow.
- Multi-property group dashboard — single property scope per store.

---

### Suggested build order

1. Backend migrations (tables + RLS) + types regen.
2. Convert the 6 stub tabs into real editors (Dining, Experiences, Wellness, Transport, Policies, Reviews).
3. Add new tabs: Channel Manager, Payouts, Staff, Promotions, Inbox.
4. Polish pass on Rooms/Reservations/Calendar/Front Desk/Housekeeping/Property Profile.
5. Update setup checklist + completion meter to include new sections.

Approve and I'll start executing in this order. If you want a different priority (e.g. Reviews + Channel Manager first because they unlock revenue), tell me and I'll resequence.
