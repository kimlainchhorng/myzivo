
# Invoice Access for Business Users — Implementation Plan

## Overview
Add an invoices section at `/account/invoices` where business account members can view and download their company invoices as PDFs. This page will display invoice number, date, amount, and status (paid/unpaid), with PDF download functionality.

## Current State Analysis

### What Already Exists
| Feature | Status | Location |
|---------|--------|----------|
| `invoices` database table | Exists | Supabase (id, business_id, invoice_number, amount, status, issued_at, due_at) |
| `BusinessInvoiceList` component | Exists | `src/components/business/BusinessInvoiceList.tsx` (uses mock data) |
| Business membership hook | Exists | `src/hooks/useBusinessMembership.ts` |
| PDF export pattern | Exists | `src/hooks/useItineraryExport.ts` (print dialog approach) |
| Account page patterns | Exists | `src/pages/account/` directory |

### What's Missing
| Feature | Status | Description |
|---------|--------|-------------|
| Dedicated invoices page | Missing | `/account/invoices` route |
| Real invoices hook | Missing | Fetch from `invoices` table |
| PDF generation for invoices | Missing | Generate downloadable invoice PDF |
| Navigation link | Missing | Add to MobileAccount menu |

---

## Implementation Plan

### 1) Create Business Invoices Hook

**File to Create:** `src/hooks/useBusinessInvoices.ts`

**Purpose:** Fetch invoices from the database for the user's business account.

**Implementation:**
```text
- Query `invoices` table filtered by business_id
- Join with business_account_users to verify membership
- Return invoice list with sorting by date
- Include loading and error states
```

**Return Interface:**
```text
interface Invoice {
  id: string;
  invoiceNumber: string;
  amount: number;
  status: "paid" | "pending" | "overdue";
  issuedAt: string;
  dueAt: string | null;
}

interface UseBusinessInvoicesReturn {
  invoices: Invoice[];
  isLoading: boolean;
  error: Error | null;
  totalPaid: number;
  totalPending: number;
  totalOverdue: number;
}
```

---

### 2) Create Invoice PDF Generator Hook

**File to Create:** `src/hooks/useInvoicePdfExport.ts`

**Purpose:** Generate and download invoice PDFs using the print dialog pattern.

**Implementation:**
- Generate styled HTML invoice document
- Include company name, invoice number, date, line items, total
- Open in new window and trigger print dialog (Save as PDF)
- Follow pattern from `useItineraryExport.ts`

**Template Structure:**
```text
ZIVO INVOICE
─────────────────────
Invoice #: INV-2024-0042
Date: March 1, 2024
Due Date: March 15, 2024

Bill To:
[Company Name]
[Billing Email]

Amount Due: $2,450.00
Status: PAID / PENDING

─────────────────────
Powered by ZIVO
```

---

### 3) Create Business Invoices Page

**File to Create:** `src/pages/account/BusinessInvoicesPage.tsx`

**Purpose:** Dedicated page for viewing and downloading invoices.

**UI Layout:**
```text
┌─────────────────────────────────────────────────┐
│ ← Invoices                         [FileText]   │
├─────────────────────────────────────────────────┤
│                                                 │
│ ┌───────────┐ ┌───────────┐ ┌───────────┐      │
│ │ Paid      │ │ Pending   │ │ Overdue   │      │
│ │ $3,340    │ │ $1,250    │ │ $325      │      │
│ └───────────┘ └───────────┘ └───────────┘      │
│                                                 │
│ ┌───────────────────────────────────────────┐  │
│ │ [Search invoices...]      [Filter: All ▾] │  │
│ └───────────────────────────────────────────┘  │
│                                                 │
│ ┌───────────────────────────────────────────┐  │
│ │ INV-2024-0042            Paid    $2,450  │  │
│ │ Mar 1, 2024                      [PDF ↓] │  │
│ ├───────────────────────────────────────────┤  │
│ │ INV-2024-0043          Pending   $1,250  │  │
│ │ Mar 5, 2024                      [PDF ↓] │  │
│ ├───────────────────────────────────────────┤  │
│ │ INV-2024-0041          Overdue     $325  │  │
│ │ Feb 15, 2024                     [PDF ↓] │  │
│ └───────────────────────────────────────────┘  │
│                                                 │
│ ┌───────────────────────────────────────────┐  │
│ │ ⓘ Invoices are generated for orders      │  │
│ │   billed to your company account.        │  │
│ └───────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
```

**Features:**
- Summary cards showing paid, pending, overdue totals
- Search by invoice number
- Filter by status (all, paid, pending, overdue)
- List of invoices with key details
- PDF download button per invoice
- Empty state when no invoices
- Redirect to business account page if not a member

---

### 4) Update Navigation and Routes

**File to Modify:** `src/pages/mobile/MobileAccount.tsx`

**Changes:**
- Add "Invoices" menu item under Business Account (only visible if member)
- Icon: `FileText`
- Path: `/account/invoices`

**Updated accountItems array:**
```text
{ 
  icon: Building2, 
  label: businessMembership?.company?.name || "Business Account", 
  path: "/account/business"
},
// NEW: Only show if business member
...(businessMembership?.isMember ? [{
  icon: FileText,
  label: "Invoices",
  path: "/account/invoices"
}] : []),
```

**File to Modify:** `src/App.tsx`

**Changes:**
- Add lazy import for BusinessInvoicesPage
- Add protected route: `/account/invoices`

---

### 5) Database RLS Policy (if needed)

**Migration:** Add RLS policy to ensure users can only view invoices for their business.

```text
CREATE POLICY "Users can view invoices for their business"
  ON public.invoices
  FOR SELECT
  USING (
    business_id IN (
      SELECT business_id 
      FROM public.business_account_users 
      WHERE user_id = auth.uid()
    )
  );
```

---

## File Summary

### New Files (3)
| File | Purpose |
|------|---------|
| `src/hooks/useBusinessInvoices.ts` | Fetch invoices from database |
| `src/hooks/useInvoicePdfExport.ts` | Generate PDF for download |
| `src/pages/account/BusinessInvoicesPage.tsx` | Invoices list page |

### Modified Files (2)
| File | Changes |
|------|---------|
| `src/pages/mobile/MobileAccount.tsx` | Add Invoices menu item |
| `src/App.tsx` | Add route and lazy import |

### Database Changes (1 migration)
| Change | Description |
|--------|-------------|
| RLS policy | Ensure users can only view their company's invoices |

---

## Invoice Status Logic

| Status | Condition | Display |
|--------|-----------|---------|
| Paid | `status = 'paid'` | Green badge with checkmark |
| Pending | `status = 'pending'` AND `due_at >= now()` | Amber badge with clock |
| Overdue | `status = 'pending'` AND `due_at < now()` | Red badge with alert |

---

## PDF Content Structure

The generated PDF will include:

1. **Header**: ZIVO logo/branding
2. **Invoice Details**: Number, issue date, due date
3. **Bill To**: Company name, billing email
4. **Amount**: Total amount with currency
5. **Status**: Clear paid/pending indicator
6. **Footer**: ZIVO contact info, compliance note

---

## Access Control

| User State | Behavior |
|------------|----------|
| Not logged in | Redirect to login |
| Not a business member | Show message with link to join company |
| Business member | Show invoices for their company |
| Business admin | Same view (admin features in future) |

---

## Empty States

| State | Display |
|-------|---------|
| No invoices yet | "No invoices yet. Invoices will appear here when you make orders billed to your company." |
| No matching search | "No invoices match your search." |
| Error loading | "Failed to load invoices. Please try again." |

---

## Summary

This implementation provides:

1. **Dedicated invoices page** at `/account/invoices`
2. **Real-time data** from the `invoices` database table
3. **Key invoice details** — number, date, amount, status
4. **PDF download** via print dialog (Save as PDF)
5. **Search and filter** for easy navigation
6. **Summary cards** showing totals by status
7. **Proper access control** — only business members can view
8. **Navigation integration** — accessible from account menu

The feature leverages existing patterns (BusinessInvoiceList component design, useItineraryExport PDF approach) while connecting to the real invoices table in the database.
