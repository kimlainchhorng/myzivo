
# Invite-Only Renter Beta Mode - Implementation Plan

## Overview
Implement a controlled renter beta system for the ZIVO P2P Car Rental Marketplace. This feature allows admins to control who can book cars through an invite-only waitlist system, ensuring platform safety during early-stage launch.

---

## Database Schema Changes

### 1. New Table: `p2p_renter_waitlist`
Store beta waitlist entries from public users.

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key |
| `full_name` | text | User's full name |
| `email` | text | Email address (unique) |
| `city` | text | Requested city |
| `status` | text | pending / invited / joined / expired |
| `created_at` | timestamp | When they joined waitlist |

### 2. New Table: `p2p_renter_invites`
Track invitations sent to waitlisted users.

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key |
| `email` | text | Invited email |
| `invite_code` | text | Unique invite code |
| `expires_at` | timestamp | Invite expiration (optional) |
| `used` | boolean | Whether invite was used |
| `used_at` | timestamp | When invite was redeemed |
| `created_by` | uuid | Admin who created invite |
| `waitlist_id` | uuid | FK to waitlist entry (if from waitlist) |
| `created_at` | timestamp | When invite was created |

### 3. New System Settings
Add to existing `system_settings` table:

| Key | Value | Description |
|-----|-------|-------------|
| `p2p_renter_beta_mode` | `true` | Enable invite-only renter beta |
| `p2p_renter_beta_city` | `"Los Angeles"` | Current beta city |
| `p2p_renter_beta_message` | `"We're launching with limited spots..."` | Custom waitlist message |

---

## New Files to Create

```text
src/pages/beta/
├── RenterWaitlist.tsx           - Public waitlist signup page

src/pages/admin/modules/
├── AdminRenterInvitesModule.tsx - Admin invite management panel

src/hooks/
├── useRenterBetaSettings.ts     - Hooks for renter beta settings
├── useRenterWaitlist.ts         - Hooks for waitlist operations
├── useRenterInvites.ts          - Hooks for invite management

supabase/functions/
├── send-renter-invite/          - Edge function to send invite emails
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/App.tsx` | Add `/beta/waitlist` route |
| `src/pages/admin/AdminPanel.tsx` | Add "Renter Invites" nav item |
| `src/hooks/useP2PSettings.ts` | Add renter beta settings queries |
| `src/pages/p2p/P2PVehicleSearch.tsx` | Add beta mode check/redirect |
| `src/pages/p2p/P2PVehicleDetail.tsx` | Block booking for non-invited users |
| `src/pages/verify/RenterVerification.tsx` | Validate invite code at start |
| `src/pages/verify/VerificationStatus.tsx` | Add "Beta User" badge display |

---

## Implementation Details

### 1. RenterWaitlist.tsx (Waitlist Page)

**Route**: `/beta/waitlist`

**Design**:
- Headline: "Join the ZIVO Car Rental Beta"
- Subtext: "We're launching in [CITY] with limited spots to ensure safety and quality."
- Form fields: Full name, Email, City
- Submit: Save to `p2p_renter_waitlist` table
- Success: Show "Thanks! We'll invite you soon."

```tsx
// Form structure
<Card className="max-w-md mx-auto">
  <CardHeader>
    <div className="inline-flex items-center gap-2 bg-amber-500/10 text-amber-600 px-3 py-1 rounded-full mb-4">
      <Lock className="h-4 w-4" />
      <span className="text-sm font-medium">Private Beta</span>
    </div>
    <CardTitle>Join the ZIVO Car Rental Beta</CardTitle>
    <CardDescription>
      {betaSettings?.betaMessage || 
        `We're launching in ${betaSettings?.betaCity || "select cities"} with limited spots to ensure safety and quality.`}
    </CardDescription>
  </CardHeader>
  <CardContent>
    <form onSubmit={handleSubmit}>
      <Input name="full_name" placeholder="Full Name" required />
      <Input name="email" type="email" placeholder="Email" required />
      <Input name="city" placeholder="Your City" required />
      <Button type="submit">Join Waitlist</Button>
    </form>
  </CardContent>
</Card>
```

### 2. AdminRenterInvitesModule.tsx (Admin Panel)

**Features**:

**Stats Cards**:
- Waitlist Count
- Invites Sent
- Invites Used
- Active Beta Renters

**Waitlist Table**:
| Column | Data |
|--------|------|
| Name | Full name |
| Email | Email address |
| City | Requested city |
| Joined | Date |
| Status | Badge |
| Actions | Send Invite button |

**Invites Table**:
| Column | Data |
|--------|------|
| Email | Invited email |
| Invite Code | Short code |
| Expires | Date (if set) |
| Used | Yes/No |
| Created | Date |
| Actions | Copy link, Revoke |

**Admin Actions**:
- Send invite to waitlist entry
- Generate manual invite (for email not on waitlist)
- Set expiration for invites
- Revoke unused invites

### 3. useRenterBetaSettings.ts

Extend P2P settings for renter beta mode:

```typescript
export function useRenterBetaSettings() {
  return useQuery({
    queryKey: ["renterBetaSettings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("system_settings")
        .select("key, value")
        .in("key", [
          "p2p_renter_beta_mode",
          "p2p_renter_beta_city", 
          "p2p_renter_beta_message"
        ]);
      
      return {
        betaMode: parseBoolean(findByKey(data, "p2p_renter_beta_mode")),
        betaCity: parseString(findByKey(data, "p2p_renter_beta_city")),
        betaMessage: parseString(findByKey(data, "p2p_renter_beta_message")),
      };
    },
  });
}

// Check if user has valid invite
export function useRenterInviteStatus(email?: string) {
  return useQuery({
    queryKey: ["renterInviteStatus", email],
    queryFn: async () => {
      if (!email) return null;
      
      const { data } = await supabase
        .from("p2p_renter_invites")
        .select("*")
        .eq("email", email.toLowerCase())
        .eq("used", false)
        .gt("expires_at", new Date().toISOString())
        .maybeSingle();
      
      return data;
    },
    enabled: !!email,
  });
}
```

### 4. useRenterWaitlist.ts

```typescript
// Join waitlist
export function useJoinWaitlist() {
  return useMutation({
    mutationFn: async ({ fullName, email, city }: WaitlistInput) => {
      const { data, error } = await supabase
        .from("p2p_renter_waitlist")
        .insert({
          full_name: fullName,
          email: email.toLowerCase(),
          city,
          status: "pending",
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
  });
}

// Admin: Get waitlist entries
export function useAdminWaitlist(status?: string) {
  return useQuery({
    queryKey: ["adminRenterWaitlist", status],
    queryFn: async () => {
      let query = supabase
        .from("p2p_renter_waitlist")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (status && status !== "all") {
        query = query.eq("status", status);
      }
      
      return query;
    },
  });
}
```

### 5. useRenterInvites.ts

```typescript
// Admin: Create invite
export function useCreateRenterInvite() {
  return useMutation({
    mutationFn: async ({ email, expiresInDays, waitlistId }: CreateInviteInput) => {
      const inviteCode = generateInviteCode(); // 8 char alphanumeric
      
      const { data, error } = await supabase
        .from("p2p_renter_invites")
        .insert({
          email: email.toLowerCase(),
          invite_code: inviteCode,
          expires_at: expiresInDays 
            ? addDays(new Date(), expiresInDays).toISOString() 
            : null,
          waitlist_id: waitlistId,
          created_by: user.id,
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Update waitlist status if from waitlist
      if (waitlistId) {
        await supabase
          .from("p2p_renter_waitlist")
          .update({ status: "invited" })
          .eq("id", waitlistId);
      }
      
      return data;
    },
  });
}

// Admin: Send invite email
export function useSendInviteEmail() {
  return useMutation({
    mutationFn: async ({ inviteId }: { inviteId: string }) => {
      const response = await supabase.functions.invoke("send-renter-invite", {
        body: { inviteId },
      });
      
      if (response.error) throw response.error;
      return response.data;
    },
  });
}

// Validate invite code
export function useValidateInviteCode() {
  return useMutation({
    mutationFn: async ({ code }: { code: string }) => {
      const { data, error } = await supabase
        .from("p2p_renter_invites")
        .select("*")
        .eq("invite_code", code.toUpperCase())
        .eq("used", false)
        .maybeSingle();
      
      if (error) throw error;
      if (!data) throw new Error("Invalid or expired invite code");
      
      // Check expiration
      if (data.expires_at && new Date(data.expires_at) < new Date()) {
        throw new Error("Invite code has expired");
      }
      
      return data;
    },
  });
}

// Mark invite as used
export function useRedeemInvite() {
  return useMutation({
    mutationFn: async ({ inviteId }: { inviteId: string }) => {
      const { error } = await supabase
        .from("p2p_renter_invites")
        .update({
          used: true,
          used_at: new Date().toISOString(),
        })
        .eq("id", inviteId);
      
      if (error) throw error;
    },
  });
}
```

### 6. send-renter-invite Edge Function

```typescript
// supabase/functions/send-renter-invite/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const FROM_EMAIL = "ZIVO <noreply@hizivo.com>";
const BASE_URL = "https://hizivo.com";

serve(async (req) => {
  const { inviteId } = await req.json();
  
  // Fetch invite details
  const { data: invite } = await supabaseClient
    .from("p2p_renter_invites")
    .select("*, p2p_renter_waitlist(full_name)")
    .eq("id", inviteId)
    .single();
  
  const firstName = invite.p2p_renter_waitlist?.full_name?.split(" ")[0] || "there";
  const inviteLink = `${BASE_URL}/verify/driver?invite=${invite.invite_code}`;
  
  // Send email via Resend
  const emailHtml = `
    <h1>You're Invited to ZIVO Car Rentals</h1>
    <p>Hi ${firstName},</p>
    <p>You're invited to join the ZIVO car rental beta in your city.</p>
    <p>Book cars from local owners with insurance included.</p>
    <p><a href="${inviteLink}">Get Started</a></p>
    <p>— ZIVO Team</p>
  `;
  
  await sendEmail(invite.email, "You're invited to try ZIVO Car Rentals", emailHtml);
  
  return new Response(JSON.stringify({ success: true }));
});
```

### 7. P2P Search/Detail Page Integration

**P2PVehicleSearch.tsx**:
```tsx
// Check beta mode at component level
const { data: betaSettings } = useRenterBetaSettings();
const { user } = useAuth();

// If beta mode and not logged in, show waitlist banner
{betaSettings?.betaMode && !user && (
  <Card className="mb-6 bg-amber-500/5 border-amber-500/20">
    <CardContent className="py-4">
      <div className="flex items-center gap-4">
        <Lock className="h-8 w-8 text-amber-500" />
        <div>
          <h3 className="font-semibold">Private Beta</h3>
          <p className="text-sm text-muted-foreground">
            ZIVO car rentals are currently invite-only.
          </p>
        </div>
        <Button onClick={() => navigate("/beta/waitlist")} className="ml-auto">
          Join Waitlist
        </Button>
      </div>
    </CardContent>
  </Card>
)}
```

**P2PVehicleDetail.tsx booking check**:
```tsx
const handleBook = async () => {
  // Existing login check
  if (!user) {
    navigate("/login", { state: { from: location } });
    return;
  }
  
  // Check beta mode
  if (betaSettings?.betaMode) {
    // Check if user has used an invite (is verified renter)
    const { data: renterProfile } = await supabase
      .from("renter_profiles")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();
    
    if (!renterProfile) {
      // Check for valid invite
      const { data: invite } = await supabase
        .from("p2p_renter_invites")
        .select("id")
        .eq("email", user.email?.toLowerCase())
        .maybeSingle();
      
      if (!invite) {
        toast.error("Car rentals are invite-only during beta. Join our waitlist!");
        navigate("/beta/waitlist");
        return;
      }
    }
  }
  
  // Continue with existing verification check...
};
```

### 8. RenterVerification.tsx Updates

Add invite code handling:

```tsx
// Get invite code from URL
const [searchParams] = useSearchParams();
const inviteCode = searchParams.get("invite");

// Validate invite on mount
useEffect(() => {
  if (inviteCode && betaSettings?.betaMode) {
    validateInvite.mutate({ code: inviteCode });
  }
}, [inviteCode]);

// Show invite code input if beta mode and no code in URL
{betaSettings?.betaMode && !inviteCode && !existingProfile && (
  <Card className="mb-6">
    <CardContent className="py-4">
      <div className="space-y-4">
        <Label>Invite Code</Label>
        <div className="flex gap-2">
          <Input
            placeholder="Enter your invite code"
            value={manualInviteCode}
            onChange={(e) => setManualInviteCode(e.target.value.toUpperCase())}
            maxLength={8}
          />
          <Button 
            onClick={() => validateInvite.mutate({ code: manualInviteCode })}
            disabled={!manualInviteCode || validateInvite.isPending}
          >
            Verify
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Don't have an invite code? <Link to="/beta/waitlist">Join the waitlist</Link>
        </p>
      </div>
    </CardContent>
  </Card>
)}
```

### 9. VerificationStatus.tsx Updates

Add Beta User badge:

```tsx
{profile?.verification_status === "approved" && (
  <div className="flex items-center gap-2 justify-center">
    <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/30">
      <Sparkles className="h-3 w-3 mr-1" />
      Beta User
    </Badge>
  </div>
)}
```

---

## Database Migration Summary

```sql
-- Create waitlist table
CREATE TABLE p2p_renter_waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  city TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'invited', 'joined', 'expired')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create invites table
CREATE TABLE p2p_renter_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  invite_code TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ,
  used BOOLEAN DEFAULT false,
  used_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id),
  waitlist_id UUID REFERENCES p2p_renter_waitlist(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_renter_waitlist_email ON p2p_renter_waitlist(email);
CREATE INDEX idx_renter_waitlist_status ON p2p_renter_waitlist(status);
CREATE INDEX idx_renter_invites_code ON p2p_renter_invites(invite_code);
CREATE INDEX idx_renter_invites_email ON p2p_renter_invites(email);

-- Insert beta settings
INSERT INTO system_settings (key, value, description, category, is_public)
VALUES 
  ('p2p_renter_beta_mode', 'true', 'Enable invite-only renter beta', 'p2p', false),
  ('p2p_renter_beta_city', '"Los Angeles"', 'Current beta city', 'p2p', true),
  ('p2p_renter_beta_message', '"We''re launching in select cities with limited spots to ensure safety and quality."', 'Waitlist message', 'p2p', true)
ON CONFLICT (key) DO NOTHING;

-- Enable RLS
ALTER TABLE p2p_renter_waitlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE p2p_renter_invites ENABLE ROW LEVEL SECURITY;

-- RLS: Anyone can insert to waitlist
CREATE POLICY "Anyone can join waitlist"
  ON p2p_renter_waitlist FOR INSERT
  WITH CHECK (true);

-- RLS: Admin can view all waitlist
CREATE POLICY "Admin can view waitlist"
  ON p2p_renter_waitlist FOR SELECT
  USING (public.is_admin(auth.uid()));

-- RLS: Admin can update waitlist
CREATE POLICY "Admin can update waitlist"
  ON p2p_renter_waitlist FOR UPDATE
  USING (public.is_admin(auth.uid()));

-- RLS: Admin full access to invites
CREATE POLICY "Admin full access to invites"
  ON p2p_renter_invites FOR ALL
  USING (public.is_admin(auth.uid()));

-- RLS: Users can check their own invite
CREATE POLICY "Users can check own invite"
  ON p2p_renter_invites FOR SELECT
  USING (lower(email) = lower(auth.jwt()->>'email'));
```

---

## UI/UX Flow

```text
Public User wants to rent a car
         │
         ▼
   Beta Mode Active?
         │
    Yes ─┼─ No
         │      │
         ▼      ▼
  Has Invite? ───── Normal Flow
         │
    No ──┼── Yes
         │       │
         ▼       ▼
┌─────────────────────────────────────────┐
│  /beta/waitlist                         │
│                                         │
│  "Join the ZIVO Car Rental Beta"        │
│  Form: Name, Email, City                │
│                                         │
│  [Submit] → "Thanks! We'll invite you." │
└─────────────────────────────────────────┘
         │
         ▼ (Admin sends invite)
┌─────────────────────────────────────────┐
│  User receives email with invite link   │
│                                         │
│  Link: /verify/driver?invite=ABC123     │
└─────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│  /verify/driver                         │
│                                         │
│  Invite code validated ✓                │
│  Complete driver verification           │
│  License + Selfie upload                │
└─────────────────────────────────────────┘
         │
         ▼
   Admin approves verification
         │
         ▼
┌─────────────────────────────────────────┐
│  User can now book cars!                │
│                                         │
│  Shows "Beta User" badge                │
└─────────────────────────────────────────┘
```

---

## Admin Panel Navigation Updates

Add to `navItems` in AdminPanel.tsx:

```typescript
{ id: "renter-invites", label: "Renter Invites", icon: Mail }
```

Add module switch case:

```typescript
case "renter-invites":
  return <AdminRenterInvitesModule />;
```

---

## Summary of Changes

| Action | File | Description |
|--------|------|-------------|
| Create | `src/pages/beta/RenterWaitlist.tsx` | Public waitlist signup page |
| Create | `src/pages/admin/modules/AdminRenterInvitesModule.tsx` | Admin invite management |
| Create | `src/hooks/useRenterBetaSettings.ts` | Beta settings hooks (extend existing) |
| Create | `src/hooks/useRenterWaitlist.ts` | Waitlist hooks |
| Create | `src/hooks/useRenterInvites.ts` | Invite management hooks |
| Create | `supabase/functions/send-renter-invite/` | Invite email edge function |
| Modify | `src/App.tsx` | Add `/beta/waitlist` route |
| Modify | `src/pages/admin/AdminPanel.tsx` | Add Renter Invites nav item |
| Modify | `src/pages/p2p/P2PVehicleSearch.tsx` | Add beta banner for non-invited users |
| Modify | `src/pages/p2p/P2PVehicleDetail.tsx` | Block booking for non-invited users |
| Modify | `src/pages/verify/RenterVerification.tsx` | Add invite code validation |
| Modify | `src/pages/verify/VerificationStatus.tsx` | Add Beta User badge |
| Database | Migration | Create tables, settings, RLS policies |

---

## Security Considerations

1. **Invite Codes**: 8-character alphanumeric, unique per invite
2. **Expiration**: Optional expiration date for invites
3. **Single Use**: Invites marked as used after redemption
4. **RLS**: Waitlist insert is public, all other operations admin-only
5. **Email Validation**: Lowercase email comparison for consistency
6. **Rate Limiting**: Consider adding rate limits to waitlist signup

---

## Email Template

**Subject**: You're invited to try ZIVO Car Rentals

**Body**:
```
Hi {{name}},

You're invited to join the ZIVO car rental beta in {{city}}.

Book cars from local owners with insurance included.

Get started here:
{{invite_link}}

— ZIVO Team
```
