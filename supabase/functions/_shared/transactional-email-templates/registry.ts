/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import { template as partnerStoreIdRecovery } from './partner-store-id-recovery.tsx'
import { template as partnerStoreInvite } from './partner-store-invite.tsx'
import { template as employeeInvite } from './employee-invite.tsx'

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
}
