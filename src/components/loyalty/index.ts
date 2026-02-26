/**
 * Loyalty Components - Real implementations using useLoyaltyPoints hook
 */
export { default as PointsBalanceCard } from "./PointsBalanceCard";
export { default as TierProgressCard } from "./TierProgressCard";

// Stubs for unused components (to prevent import errors)
const Stub = (_props: any) => null;
export const PointsEarningList = Stub;
export const RedemptionOptions = Stub;
export const ReferralCard = Stub;
export const TierComparisonTable = Stub;
export const PointsCheckoutReminder = Stub;
