export type PayoutProvider = "paypal" | "stripe" | "lemonsqueezy" | "paddle" | "kofi" | "custom";

export interface StoreSettings {
  username: string;
  storeTitle: string;
  logoUrl?: string;

  // Centralized Payout Settings (Global Multi-Gateway)
  payoutProvider?: PayoutProvider;
  payoutPaypalHandle?: string;
  payoutStripeUrl?: string;
  payoutLemonSqueezyUrl?: string;
  payoutPaddleUrl?: string;
  payoutKofiUrl?: string;
  payoutCustomUrl?: string;
  totalEarnings?: number;
  pendingEarnings?: number;

  // Hero Banner Settings & Visibility Toggles
  showHero: boolean;
  heroBadge: string;
  showHeroBadge: boolean;
  heroTitle: string;
  showHeroTitle: boolean;
  heroDescription: string;
  showHeroDescription: boolean;
  heroImageUrl: string;

  // Bundle Offer Card Settings
  showBundle: boolean;
  bundleBadge: string;
  bundleTitle: string;
  bundleDescription: string;
  bundleButtonText: string;
  bundleUrl: string;
  bundleDownloadUrl?: string; // Direct cloud vault or private download link for instant buyer delivery

  // Promotional Coupon Strip Settings
  showPromoStrip: boolean;
  promoBadge: string;
  promoTitle: string;
  promoDescription: string;
  promoCode: string;
}

// Factory function to initialize default store configuration for new creators
export function createDefaultStoreSettings(username: string, displayName?: string): StoreSettings {
  const userKey = (username || "creator").toLowerCase();
  const formattedTitle = displayName || `${userKey.charAt(0).toUpperCase() + userKey.slice(1)} Store`;

  return {
    username: userKey,
    storeTitle: formattedTitle,
    logoUrl: "",

    payoutProvider: "paypal",
    payoutPaypalHandle: userKey,
    payoutStripeUrl: "",
    payoutLemonSqueezyUrl: "",
    payoutPaddleUrl: "",
    payoutKofiUrl: "",
    payoutCustomUrl: "",
    totalEarnings: 0,
    pendingEarnings: 0,

    showHero: true,
    heroBadge: "Featured Digital Assets",
    showHeroBadge: false,
    heroTitle: "Premium Digital Products & Resources",
    showHeroTitle: false,
    heroDescription: "Curated collection of production-ready digital files, e-books, and creative assets.",
    showHeroDescription: false,
    heroImageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1600&q=80",

    showBundle: false,
    bundleBadge: "Bundle Offer",
    bundleTitle: "Save Up to 60% on All Collections",
    bundleDescription: "Unlock instant access to the complete digital asset library.",
    bundleButtonText: "Get Complete Bundle",
    bundleUrl: "",
    bundleDownloadUrl: "",

    showPromoStrip: false,
    promoBadge: "Limited Time Offer",
    promoTitle: "Get 30% Off Your First Order",
    promoDescription: "Apply this coupon code at checkout to claim your launch discount.",
    promoCode: "CURIOLOT30",
  };
}

declare global {
  var globalStoreSettings: Record<string, StoreSettings> | undefined;
}

if (!globalThis.globalStoreSettings) {
  globalThis.globalStoreSettings = {
    aries: createDefaultStoreSettings("aries", "Aries Store"),
  };
}

export function getStoreSettings(username: string, displayName?: string): StoreSettings {
  const userKey = (username || "creator").toLowerCase();
  if (globalThis.globalStoreSettings?.[userKey]) {
    return globalThis.globalStoreSettings[userKey];
  }

  const initialSettings = createDefaultStoreSettings(userKey, displayName);
  if (!globalThis.globalStoreSettings) {
    globalThis.globalStoreSettings = {};
  }
  globalThis.globalStoreSettings[userKey] = initialSettings;
  return initialSettings;
}

export function updateStoreSettings(username: string, updates: Partial<StoreSettings>): StoreSettings {
  if (!globalThis.globalStoreSettings) {
    globalThis.globalStoreSettings = {};
  }
  const userKey = (username || "creator").toLowerCase();
  const current = getStoreSettings(userKey);
  const updated = { ...current, ...updates };
  globalThis.globalStoreSettings[userKey] = updated;
  return updated;
}