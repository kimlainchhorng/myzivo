/**
 * Marketing Lib - Stub
 */

export interface MarketingCampaign {
  id: string;
  name: string;
  status: string;
  type: string;
  start_date?: string;
  end_date?: string;
  created_at: string;
  updated_at: string;
  [key: string]: any;
}

export interface CampaignTargetCriteria {
  role?: string;
  city?: string;
  [key: string]: any;
}

export async function getCampaigns() { return [] as MarketingCampaign[]; }
export async function getCampaign(_id: string) { return null as MarketingCampaign | null; }
export async function createCampaign(_data: any) { return {} as MarketingCampaign; }
export async function updateCampaign(_id: string, _data: any) { return {} as MarketingCampaign; }
export async function deleteCampaign(_id: string) { return; }
export async function getCampaignStats(_id: string) { return {} as any; }
export async function getAggregateMarketingStats() { return {} as any; }
export async function getTargetedUsers(_criteria: CampaignTargetCriteria, _limit?: number) { return [] as any[]; }
export async function getTargetPreviewCount(_criteria: CampaignTargetCriteria) { return 0; }
export async function getCampaignDeliveries(_id: string, _limit?: number) { return [] as any[]; }
export async function getUserPromoWallet(_userId: string) { return [] as any[]; }
export async function markPromoUsed(_promoId: string) { return; }
export async function executeCampaign(_id: string) { return { success: true, users_targeted: 0 } as { success: boolean; users_targeted: number; error?: string }; }
