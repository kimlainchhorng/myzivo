
# Rider Help & Support Center

## Summary

Add a rider-focused Help & Support center with FAQ viewing, issue reporting with ride selection, and ticket tracking. This leverages the existing `support_tickets` table infrastructure with a new `ride_id` column for ride-specific tickets.

---

## Database Change Required

Add a `ride_id` column to the existing `support_tickets` table to link tickets to specific rides.

```sql
ALTER TABLE public.support_tickets 
ADD COLUMN IF NOT EXISTS ride_id uuid REFERENCES public.trips(id);

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_support_tickets_ride_id ON public.support_tickets(ride_id);
```

---

## File Changes Summary

| File | Action | Description |
|------|--------|-------------|
| `src/pages/help/RiderHelpPage.tsx` | Create | Main help page with FAQs and Report Issue button |
| `src/pages/help/NewTicketPage.tsx` | Create | Form to create support ticket with ride selection |
| `src/pages/help/MyTicketsPage.tsx` | Create | List of user's support tickets |
| `src/hooks/useRiderSupport.ts` | Create | Hook for rider-specific support operations |
| `src/App.tsx` | Modify | Add new /help routes |

---

## Page Details

### 1. RiderHelpPage (`/help`)

Features:
- Rider-focused FAQ accordion with mock data
- Categories: Payment, Driver, Rider, Safety, Lost Item
- "Report an Issue" button linking to `/help/new`
- Link to view existing tickets

```text
+------------------------------------------+
|  < Back                    Help Center   |
+------------------------------------------+
|                                          |
|  [Search FAQs...]                        |
|                                          |
|  FREQUENTLY ASKED QUESTIONS              |
|  +------------------------------------+  |
|  | How are fares calculated?       v  |  |
|  +------------------------------------+  |
|  | Why was I charged extra?        v  |  |
|  +------------------------------------+  |
|  | How do I report a lost item?    v  |  |
|  +------------------------------------+  |
|                                          |
|  +------------------------------------+  |
|  |  [!] Report an Issue              |  |
|  +------------------------------------+  |
|                                          |
|  View My Tickets (3)                     |
+------------------------------------------+
```

Mock FAQ data:
```typescript
const riderFAQs = [
  { category: "Payment", q: "How are ride fares calculated?", a: "..." },
  { category: "Payment", q: "Why was I charged a cancellation fee?", a: "..." },
  { category: "Driver", q: "My driver cancelled, what do I do?", a: "..." },
  { category: "Driver", q: "How do I rate my driver?", a: "..." },
  { category: "Safety", q: "How do I report a safety concern?", a: "..." },
  { category: "Lost Item", q: "I left something in the car", a: "..." },
  { category: "Rider", q: "How do I update my phone number?", a: "..." },
];
```

### 2. NewTicketPage (`/help/new`)

Form with fields:
- Category dropdown (payment, driver, rider, safety, lost_item, other)
- Subject (text input)
- Message (textarea)
- Optional ride selection (dropdown of recent rides)

```text
+------------------------------------------+
|  < Back               Report an Issue    |
+------------------------------------------+
|                                          |
|  Category *                              |
|  [ Select category...            v ]     |
|                                          |
|  Subject *                               |
|  [ Brief description of issue    ]       |
|                                          |
|  Message *                               |
|  +------------------------------------+  |
|  | Please describe your issue...     |  |
|  |                                    |  |
|  +------------------------------------+  |
|                                          |
|  Related Ride (optional)                 |
|  [ Select a recent ride...       v ]     |
|    - Today 2:30 PM - 123 Main St         |
|    - Yesterday - 456 Oak Ave             |
|                                          |
|  +------------------------------------+  |
|  |        Submit Request             |  |
|  +------------------------------------+  |
+------------------------------------------+
```

```typescript
// Form submission
const handleSubmit = async (data) => {
  const ticketNumber = `ZR-${Date.now().toString().slice(-6)}`;
  
  await supabase.from('support_tickets').insert({
    ticket_number: ticketNumber,
    user_id: user.id,
    category: data.category,
    subject: data.subject,
    description: data.message,
    ride_id: data.rideId || null,
    status: 'open',
    priority: data.category === 'safety' ? 'urgent' : 'normal',
  });
  
  toast.success('Ticket submitted successfully');
  navigate('/help/tickets');
};
```

### 3. MyTicketsPage (`/help/tickets`)

List of user's support tickets:
- Subject and ticket number
- Status badge (open, in_progress, resolved)
- Created date
- Link to ride if associated

```text
+------------------------------------------+
|  < Back                  My Tickets      |
+------------------------------------------+
|                                          |
|  [Active] [Resolved] [All]               |
|                                          |
|  +------------------------------------+  |
|  | #ZR-123456                  OPEN  |  |
|  | Driver was rude                    |  |
|  | Category: Driver                   |  |
|  | 2 hours ago                        |  |
|  +------------------------------------+  |
|                                          |
|  +------------------------------------+  |
|  | #ZR-123455             RESOLVED   |  |
|  | Overcharged for ride               |  |
|  | Category: Payment                  |  |
|  | 2 days ago                         |  |
|  +------------------------------------+  |
|                                          |
|  --- Empty State ---                     |
|  No tickets yet. Need help?              |
|  [Report an Issue]                       |
+------------------------------------------+
```

---

## Hook: useRiderSupport.ts

```typescript
// Fetch user's recent rides for selection
export function useRecentRides(limit = 10) {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['recent-rides', user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('trips')
        .select('id, pickup_address, dropoff_address, fare_amount, created_at, status')
        .eq('rider_id', user!.id)
        .order('created_at', { ascending: false })
        .limit(limit);
      return data || [];
    },
    enabled: !!user,
  });
}

// Fetch user's support tickets (filtered for ride-related)
export function useRiderTickets() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['rider-tickets', user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('support_tickets')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });
      return data || [];
    },
    enabled: !!user,
  });
}

// Create a rider support ticket
export function useCreateRiderTicket() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (data: {
      category: string;
      subject: string;
      message: string;
      rideId?: string;
    }) => {
      const ticketNumber = `ZR-${Date.now().toString().slice(-6)}`;
      
      const { error } = await supabase
        .from('support_tickets')
        .insert({
          ticket_number: ticketNumber,
          user_id: user?.id,
          category: data.category,
          subject: data.subject,
          description: data.message,
          ride_id: data.rideId || null,
          status: 'open',
          priority: data.category === 'safety' ? 'urgent' : 'normal',
        });

      if (error) throw error;
      return { ticketNumber };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rider-tickets'] });
      toast.success('Support ticket submitted');
    },
  });
}
```

---

## Route Updates in App.tsx

```typescript
// Lazy imports
const RiderHelpPage = lazy(() => import("./pages/help/RiderHelpPage"));
const NewTicketPage = lazy(() => import("./pages/help/NewTicketPage"));
const MyTicketsPage = lazy(() => import("./pages/help/MyTicketsPage"));

// Routes (protected, require authentication)
<Route path="/help" element={<SetupRequiredRoute><RiderHelpPage /></SetupRequiredRoute>} />
<Route path="/help/new" element={<SetupRequiredRoute><NewTicketPage /></SetupRequiredRoute>} />
<Route path="/help/tickets" element={<SetupRequiredRoute><MyTicketsPage /></SetupRequiredRoute>} />
```

---

## Categories

| Value | Label | Priority |
|-------|-------|----------|
| `payment` | Payment Issue | normal |
| `driver` | Driver Issue | normal |
| `rider` | Rider Account | normal |
| `safety` | Safety Concern | urgent |
| `lost_item` | Lost Item | high |
| `other` | Other | normal |

---

## UI Components Used

- `Card`, `CardContent`, `CardHeader`
- `Accordion`, `AccordionItem`, `AccordionTrigger`, `AccordionContent`
- `Select`, `SelectTrigger`, `SelectContent`, `SelectItem`
- `Input`, `Textarea`, `Label`
- `Button`, `Badge`
- `toast` from sonner

---

## Loading & Empty States

Each page includes:
- Loading skeleton while fetching data
- Empty state with helpful message and CTA
- Error handling with toast notifications

---

## Mobile Responsive

All pages follow existing mobile-first patterns:
- Full-width cards on mobile
- Touch-friendly tap targets (min 44px)
- Bottom navigation integration via `MobileBottomNav`
