export interface UserState {
  isAdmin: boolean;
  isPaid: boolean;            // From DB Standard Purchase
  euFundsUnlocked: boolean;   // From DB EU Funds Purchase
  subscriptionActive: boolean;// From DB Subscription
  promoCodeTier: string | null; // "standard", "eu-funds", "full-access"
  unlockedPlans: string[];    // Legacy unlocked plans for specific documents
  currentDocName?: string;    // Current doc name to check against unlockedPlans
}

export interface UserPermissions {
  hideAds: boolean;
  canExportPremium: boolean;
  canAccessEuFunds: boolean;
  canEditFreely: boolean;
  unlimitedTones: boolean;
  isStudioPaid: boolean;      // General legacy check if they have at least standard
  isPlanPaid: boolean;        // Same as above
}

export function getUserPermissions(state: UserState): UserPermissions {
  const { 
    isAdmin, 
    isPaid, 
    euFundsUnlocked, 
    subscriptionActive, 
    promoCodeTier, 
    unlockedPlans, 
    currentDocName 
  } = state;

  // 1. Are they FULL ACCESS? (Admin, Subscriber, or Full Access Promo)
  const isFullAccess = isAdmin || subscriptionActive || promoCodeTier === "full-access";

  // 2. Are they EU FUNDS? (Bought EU Funds package, EU Funds Promo, or Full Access)
  const hasEuFunds = isFullAccess || euFundsUnlocked || promoCodeTier === "eu-funds";

  // 3. Are they STANDARD? (Bought Standard, has EU funds, unlocked this specific doc, or Standard Promo)
  const isStandard = hasEuFunds || isPaid || promoCodeTier === "standard" || (currentDocName ? unlockedPlans.includes(currentDocName) : false);

  return {
    hideAds: isStandard,
    canExportPremium: isStandard,
    canAccessEuFunds: hasEuFunds,
    canEditFreely: isStandard,
    unlimitedTones: hasEuFunds,
    isStudioPaid: isStandard,
    isPlanPaid: isStandard
  };
}
