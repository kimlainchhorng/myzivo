-- Allow admins to update pricing rows from the admin Price Control page
create policy "Admins can update service pricing"
on public.service_pricing
for update
to authenticated
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));;
