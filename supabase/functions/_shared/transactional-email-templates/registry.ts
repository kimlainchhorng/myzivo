/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import { template as partnerStoreIdRecovery } from './partner-store-id-recovery.tsx'
import { template as partnerStoreInvite } from './partner-store-invite.tsx'
import { template as employeeInvite } from './employee-invite.tsx'
import { template as lodgingReceiptReady } from './lodging-receipt-ready.tsx'
import { template as lodgingAddonStatus } from './lodging-addon-status.tsx'
import { template as lodgingCancellationUpdate } from './lodging-cancellation-update.tsx'
import { template as lodgingRescheduleUpdate } from './lodging-reschedule-update.tsx'
import { template as lodgingBookingConfirmed } from './lodging-booking-confirmed.tsx'
import { template as eatsOrderConfirmed } from './eats-order-confirmed.tsx'
import { template as lodgingRefundIssued } from './lodging-refund-issued.tsx'
import { template as eatsRefundIssued } from './eats-refund-issued.tsx'
import { template as groceryOrderConfirmed } from './grocery-order-confirmed.tsx'
import { template as newDeviceLogin } from './new-device-login.tsx'
import { template as countryChangeLogin } from './country-change-login.tsx'

export type TemplateEntry<Props = Record<string, unknown>> = {
  component: React.ComponentType<Props>
  subject: string | ((props: Props) => string)
  displayName?: string
  previewData?: Props
  to?: string
}

export const TEMPLATES: Record<string, TemplateEntry<any>> = {
  'partner-store-id-recovery': partnerStoreIdRecovery,
  'partner-store-invite': partnerStoreInvite,
  'employee-invite': employeeInvite,
  'lodging-receipt-ready': lodgingReceiptReady,
  'lodging-addon-status': lodgingAddonStatus,
  'lodging-cancellation-update': lodgingCancellationUpdate,
  'lodging-reschedule-update': lodgingRescheduleUpdate,
  'lodging-booking-confirmed': lodgingBookingConfirmed,
  'eats-order-confirmed': eatsOrderConfirmed,
  'lodging-refund-issued': lodgingRefundIssued,
  'eats-refund-issued': eatsRefundIssued,
  'grocery-order-confirmed': groceryOrderConfirmed,
  'new-device-login': newDeviceLogin,
  'country-change-login': countryChangeLogin,
}
