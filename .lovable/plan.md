## QR Clock In/Out System

### Flow
1. **Store → Employee**: Store Time Clock page displays a rotating QR code. Employee scans it from their Personal Dashboard to clock in/out.
2. **Employee → Admin**: Employee's Personal Dashboard shows their personal rotating QR. Admin scans it from the Time Clock dashboard.

### Security
- QR codes rotate every **3 minutes** using a `clock_qr_tokens` table
- Tokens are one-time use (marked as `used` after scan)
- Server validates token + employee + store match

### Database Migration
- **`clock_qr_tokens`** table: `id`, `store_id`, `employee_id` (nullable — null for store QR), `token` (unique random string), `token_type` (store/employee), `expires_at`, `used_at`, `created_at`
- RLS: Store owners can manage store tokens; employees can manage their own tokens

### Edge Function
- **`clock-qr`**: Generates/validates QR tokens server-side
  - `POST /generate` — creates a new rotating token
  - `POST /validate` — validates scanned token and performs clock in/out

### Frontend Components
1. **StoreQRDisplay** — Shows rotating QR on admin Time Clock page
2. **EmployeeQRDisplay** — Shows personal rotating QR on Personal Dashboard  
3. **QRScannerModal** — Camera-based QR scanner (used by both employee & admin)
4. Update **Personal Dashboard** clock-in button → opens QR scanner
5. Update **Time Clock** admin page → add QR display + scanner

### Files to Create/Edit
- `supabase/functions/clock-qr/index.ts` (new edge function)
- `src/components/clock/StoreQRDisplay.tsx` (new)
- `src/components/clock/EmployeeQRDisplay.tsx` (new)
- `src/components/clock/QRScannerModal.tsx` (new)
- Update Personal Dashboard clock-in flow
- Update admin Time Clock section
