
-- Fix: Scope audit log SELECT to business owners/members only
DROP POLICY IF EXISTS "Admins can view audit logs" ON public.business_invoice_audit_log;

CREATE POLICY "Business users can view their audit logs"
ON public.business_invoice_audit_log FOR SELECT
TO authenticated
USING (
  invoice_id IN (
    SELECT bi.id FROM public.business_invoices bi
    WHERE bi.business_id IN (
      SELECT ba.id FROM public.business_accounts ba WHERE ba.owner_id = auth.uid()
    )
    OR bi.business_id IN (
      SELECT bau.business_id FROM public.business_account_users bau WHERE bau.user_id = auth.uid()
    )
  )
);
;
