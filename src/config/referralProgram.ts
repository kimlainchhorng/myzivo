/**
 * Referral Program Configuration
 * Rewards structure for user referrals
 */

export interface ReferralTierBonus {
  count: number;
  bonus: number;
  title: string;
  description: string;
}

export interface ReferralRewards {
  newUser: {
    credit: number;
    miles: number;
    description: string;
  };
  referrer: {
    creditPerReferral: number;
    milesPerReferral: number;
    tierBonuses: ReferralTierBonus[];
  };
}

export const REFERRAL_REWARDS: ReferralRewards = {
  newUser: {
    credit: 10, // $10 travel credit
    miles: 2500, // bonus miles
    description: "Get $10 off your first booking + 2,500 ZIVO Miles",
  },
  referrer: {
    creditPerReferral: 10,
    milesPerReferral: 2500,
    tierBonuses: [
      {
        count: 3,
        bonus: 5000,
        title: "Starter",
        description: "Refer 3 friends and earn 5,000 bonus miles",
      },
      {
        count: 10,
        bonus: 15000,
        title: "Advocate",
        description: "Refer 10 friends and earn 15,000 bonus miles",
      },
      {
        count: 25,
        bonus: 50000,
        title: "Ambassador",
        description: "Refer 25 friends and become a ZIVO Ambassador with 50,000 bonus miles",
      },
    ],
  },
};

export const REFERRAL_TERMS = [
  "Referred friend must be a new ZIVO user",
  "Credit is applied after friend's first completed booking",
  "Miles are credited within 48 hours of booking completion",
  "Referral credits expire after 12 months",
  "ZIVO reserves the right to modify program terms",
];

export const SHARE_MESSAGES = {
  default: "Join me on ZIVO and get $10 off your first trip! Use my referral link:",
  email: {
    subject: "You're invited to ZIVO - Get $10 off your first trip!",
    body: "Hey! I've been using ZIVO to book my trips and thought you'd love it. Sign up with my link and you'll get $10 off your first booking plus 2,500 bonus miles!",
  },
  twitter: "I just discovered @ZIVOtravel - amazing deals on flights, hotels & more! Get $10 off your first trip:",
  whatsapp: "Check out ZIVO for amazing travel deals! Sign up with my link and get $10 off + 2,500 bonus miles 🎉",
};
