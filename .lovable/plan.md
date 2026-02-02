
# Invite-Only Owner Beta Mode - Implementation Plan

## Overview
Add a controlled onboarding experience for early-stage launch by implementing an invite-only beta mode for car owners. This feature will allow admins to toggle beta mode, show appropriate messaging to applicants, and provide better review workflow tools.

---

## Database Changes

### New System Settings
Add new entries to the existing `system_settings` table:

| Key | Value | Category | Description |
|-----|-------|----------|-------------|
| `p2p_owner_beta_mode` | `true` | `p2p` | Enable invite-only owner beta mode |
| `p2p_beta_cities` | `["Los Angeles", "Miami"]` | `p2p` | Cities accepting beta applications |
| `p2p_beta_message` | `"We are currently accepting a limited number of owners for our private beta. Applications are reviewed manually."` | `p2p` | Custom beta message to display |

### Modify `car_owner_profiles` Table
Add a notes field for admin review:

```sql
ALTER TABLE car_owner_profiles
  ADD COLUMN admin_review_notes TEXT,
  ADD COLUMN reviewed_by UUID REFERENCES auth.users(id),
  ADD COLUMN reviewed_at TIMESTAMPTZ;
```

---

## File Structure

### New Files to Create

```text
src/hooks/useP2PSettings.ts             - Hooks for P2P-specific settings
```

### Files to Modify

```text
src/pages/ListYourCar.tsx               - Add beta banner/badge
src/pages/owner/OwnerApply.tsx          - Add beta messaging and city selection
src/pages/admin/AdminPanel.tsx          - Add P2P Settings nav item
src/pages/admin/modules/AdminP2POwnersModule.tsx - Add notes field and beta controls
src/components/admin/AdminSystemSettings.tsx     - (optional) Add P2P category
```

---

## Implementation Details

### 1. useP2PSettings.ts Hook

Create a hook to fetch P2P-specific settings:

```typescript
// Fetch P2P beta mode settings
export function useP2PBetaSettings() {
  return useQuery({
    queryKey: ["p2pBetaSettings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("system_settings")
        .select("*")
        .in("key", [
          "p2p_owner_beta_mode",
          "p2p_beta_cities",
          "p2p_beta_message"
        ]);
      
      if (error) throw error;
      
      // Parse and return settings object
      return {
        betaMode: parseBoolean(findByKey(data, "p2p_owner_beta_mode")),
        betaCities: parseArray(findByKey(data, "p2p_beta_cities")),
        betaMessage: parseString(findByKey(data, "p2p_beta_message")),
      };
    },
  });
}

// Admin: Update beta settings
export function useUpdateP2PBetaSetting() {
  // ... mutation to update system_settings
}
```

---

### 2. ListYourCar.tsx Updates

Add a "Private Beta" banner when beta mode is enabled:

```tsx
// In Hero section, add after the "Earn up to $1,500/month" badge:
{betaSettings?.betaMode && (
  <div className="inline-flex items-center gap-2 bg-amber-500/10 text-amber-600 px-4 py-2 rounded-full mb-4">
    <Lock className="h-4 w-4" />
    <span className="text-sm font-medium">Private Beta</span>
  </div>
)}

// Add beta cities callout:
{betaSettings?.betaMode && betaSettings.betaCities?.length > 0 && (
  <Card className="bg-muted/50 border-amber-500/20 mb-8">
    <CardContent className="py-4 text-center">
      <p className="text-sm text-muted-foreground">
        Currently accepting applications in:{" "}
        <span className="font-medium text-foreground">
          {betaSettings.betaCities.join(", ")}
        </span>
      </p>
    </CardContent>
  </Card>
)}
```

---

### 3. OwnerApply.tsx Updates

Add beta mode messaging in Step 1 (Personal Information):

**Before the form, add beta alert card:**

```tsx
{betaSettings?.betaMode && (
  <Card className="mb-6 border-amber-500/20 bg-amber-500/5">
    <CardContent className="py-4">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-full bg-amber-500/10">
          <Lock className="h-5 w-5 text-amber-600" />
        </div>
        <div>
          <h3 className="font-semibold flex items-center gap-2">
            Private Beta
            <Badge variant="outline" className="text-amber-600 border-amber-500/30">
              Limited Access
            </Badge>
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            {betaSettings.betaMessage || 
              "We are currently accepting a limited number of owners. Applications are reviewed manually."}
          </p>
          {betaSettings.betaCities?.length > 0 && (
            <p className="text-sm text-muted-foreground mt-2">
              <span className="font-medium">Available cities: </span>
              {betaSettings.betaCities.join(", ")}
            </p>
          )}
        </div>
      </div>
    </CardContent>
  </Card>
)}
```

**In Step 4 (Complete), add pending review messaging:**

```tsx
{betaSettings?.betaMode && (
  <div className="text-center text-muted-foreground mt-4">
    <Clock className="h-6 w-6 mx-auto mb-2 text-amber-500" />
    <p className="font-medium">Application Under Review</p>
    <p className="text-sm">
      Our team will review your application within 2-3 business days.
      You'll receive an email once approved.
    </p>
  </div>
)}
```

---

### 4. AdminP2POwnersModule.tsx Updates

**Add Beta Mode Toggle Section at the top:**

```tsx
<Card className="mb-6">
  <CardHeader>
    <CardTitle className="flex items-center gap-2">
      <Lock className="h-5 w-5" />
      Owner Beta Mode
    </CardTitle>
    <CardDescription>
      Control owner onboarding access
    </CardDescription>
  </CardHeader>
  <CardContent className="space-y-4">
    <div className="flex items-center justify-between">
      <div>
        <Label>Invite-Only Mode</Label>
        <p className="text-sm text-muted-foreground">
          When enabled, only approved owners can list vehicles
        </p>
      </div>
      <Switch
        checked={betaSettings?.betaMode}
        onCheckedChange={(checked) => updateBetaSetting("p2p_owner_beta_mode", checked)}
      />
    </div>
    
    {betaSettings?.betaMode && (
      <>
        <Separator />
        <div className="space-y-2">
          <Label>Beta Cities (comma-separated)</Label>
          <Input
            placeholder="Los Angeles, Miami, Austin"
            value={betaCitiesInput}
            onChange={(e) => setBetaCitiesInput(e.target.value)}
            onBlur={() => updateBetaSetting("p2p_beta_cities", parseCities(betaCitiesInput))}
          />
        </div>
        <div className="space-y-2">
          <Label>Beta Message</Label>
          <Textarea
            placeholder="Custom message for beta applicants..."
            value={betaMessageInput}
            onChange={(e) => setBetaMessageInput(e.target.value)}
            onBlur={() => updateBetaSetting("p2p_beta_message", betaMessageInput)}
            rows={3}
          />
        </div>
      </>
    )}
  </CardContent>
</Card>
```

**Add Notes Field in Owner Detail Modal:**

```tsx
// In the owner detail modal, add after Contact Info section:
<div className="space-y-2">
  <Label>Admin Review Notes</Label>
  <Textarea
    placeholder="Add notes about this application..."
    value={reviewNotes}
    onChange={(e) => setReviewNotes(e.target.value)}
    rows={3}
  />
  <p className="text-xs text-muted-foreground">
    Internal notes - not visible to the owner
  </p>
</div>

// Update the approve/reject handlers to save notes:
const handleApproveOwner = async (owner: AdminOwnerListItem) => {
  await updateStatus.mutateAsync({ 
    ownerId: owner.id, 
    status: "verified",
    adminNotes: reviewNotes,
  });
};
```

**Enhance the Owner Table to show review status:**

```tsx
// Add column for "Reviewed" date
<TableHead>Reviewed</TableHead>

// In row:
<TableCell>
  {owner.reviewed_at ? (
    <span className="text-sm">
      {format(new Date(owner.reviewed_at), "MMM d, yyyy")}
    </span>
  ) : (
    <Badge variant="outline" className="text-amber-600">
      Pending
    </Badge>
  )}
</TableCell>
```

---

### 5. useAdminP2P.ts Hook Updates

Modify `useUpdateOwnerStatus` to include notes:

```typescript
mutationFn: async ({ 
  ownerId, 
  status,
  adminNotes,
}: { 
  ownerId: string; 
  status: CarOwnerStatus;
  adminNotes?: string;
}) => {
  const { data, error } = await supabase
    .from("car_owner_profiles")
    .update({ 
      status,
      admin_review_notes: adminNotes,
      reviewed_by: user?.id,
      reviewed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", ownerId)
    .select()
    .single();
  
  if (error) throw error;
  return data;
},
```

---

## Database Migration Summary

```sql
-- Add admin review columns to car_owner_profiles
ALTER TABLE car_owner_profiles
  ADD COLUMN IF NOT EXISTS admin_review_notes TEXT,
  ADD COLUMN IF NOT EXISTS reviewed_by UUID,
  ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ;

-- Insert P2P beta mode settings
INSERT INTO system_settings (key, value, description, category, is_public)
VALUES 
  ('p2p_owner_beta_mode', 'true', 'Enable invite-only owner beta mode', 'p2p', false),
  ('p2p_beta_cities', '["Los Angeles", "Miami"]', 'Cities accepting beta applications', 'p2p', true),
  ('p2p_beta_message', '"We are currently accepting a limited number of owners for our private beta. Applications are reviewed manually."', 'Custom beta message to display', 'p2p', true)
ON CONFLICT (key) DO NOTHING;
```

---

## UI/UX Flow

```text
Owner visits /list-your-car
         │
         ▼
┌─────────────────────────────────────────┐
│  "Private Beta" badge visible           │
│  Beta cities listed                     │
│  Click "Get Started"                    │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│  /owner/apply                           │
│                                         │
│  Beta messaging card at top:            │
│  "We are currently accepting a          │
│   limited number of owners for our      │
│   private beta in [CITY]. Applications  │
│   are reviewed manually."               │
│                                         │
│  [Complete application steps...]        │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│  Application Submitted                  │
│                                         │
│  "Application Under Review"             │
│  "Our team will review within 2-3       │
│   business days."                       │
│                                         │
│  Status: PENDING                        │
└────────────────┬────────────────────────┘
                 │
                 ▼
         Admin reviews in /admin → P2P Owners
                 │
                 ▼
┌─────────────────────────────────────────┐
│  Admin Review Panel                     │
│                                         │
│  [Beta Mode Toggle: ON/OFF]             │
│  [Beta Cities: Input]                   │
│  [Beta Message: Textarea]               │
│                                         │
│  Owner Detail Modal:                    │
│  - All current fields                   │
│  - Admin Notes textarea                 │
│  - [Approve] [Reject] buttons           │
└─────────────────────────────────────────┘
                 │
         ┌───────┴───────┐
         │               │
    Approved         Rejected
         │               │
         ▼               ▼
   Owner can now    Owner notified
   list vehicles    (future: email)
```

---

## Summary of Changes

| Action | File | Description |
|--------|------|-------------|
| Create | `src/hooks/useP2PSettings.ts` | Hooks for P2P beta settings |
| Modify | `src/pages/ListYourCar.tsx` | Add Private Beta badge and cities callout |
| Modify | `src/pages/owner/OwnerApply.tsx` | Add beta messaging card and pending review notice |
| Modify | `src/pages/admin/modules/AdminP2POwnersModule.tsx` | Add beta mode toggle, notes field |
| Modify | `src/hooks/useAdminP2P.ts` | Update mutation to include admin notes |
| Modify | `src/types/p2p.ts` | Add admin review fields to types |
| Database | Migration | Add columns and insert settings |

---

## Security Considerations

1. **RLS**: Beta settings with `is_public: true` can be read by anyone (needed for frontend display)
2. **Admin-Only Updates**: Only admins can toggle beta mode or update settings
3. **Notes Privacy**: `admin_review_notes` not exposed to owners via RLS policies

---

## Future Enhancements

1. **Email Notifications**: Notify owners when application is approved/rejected
2. **Waitlist**: Add email capture for cities not yet in beta
3. **Auto-Approval**: Option to auto-approve owners who meet certain criteria
4. **Beta Invite Codes**: Generate unique invite codes for referrals
