// src/api/subscription.ts
import { apiClient } from "./apiClient"; // ADD the curly braces

export interface SubscriptionTier {
  name: string;
  price: number;
  description: string;
  features: Record<string, any>;
  priceId?: string;
  popular?: boolean;
}

export interface UsageData {
  dailySwipesUsed: number;
  dailySwipeLimit: number;
  dailySuperLikesUsed: number;
  dailySuperLikeLimit: number;
  monthlyBoostsUsed: number;
  monthlyBoostLimit: number;
  swipeUsagePercent: number;
  superLikeUsagePercent: number;
  boostUsagePercent: number;
}

export interface SubscriptionDTO {
  id: number;
  tier: "FREE" | "ESSENTIAL" | "PREMIUM" | "VIP";
  status: string;
  currentPeriodStart?: string;
  currentPeriodEnd?: string;
  trialEnd?: string;
  cancelAtPeriodEnd?: boolean;
  displayName: string;
  monthlyPrice: number;
  description: string;
  dailySwipesUsed: number;
  dailySuperLikesUsed: number;
  monthlyBoostsUsed: number;
  dailySwipeLimit: number;
  dailySuperLikeLimit: number;
  monthlyBoostLimit: number;
}

// Get subscription tiers
export const getSubscriptionTiers = async (): Promise<{
  tiers: Record<string, SubscriptionTier>;
  stripePublishableKey: string;
}> => {
  const response = await apiClient.get("/subscription/tiers");
  return response.data;
};

// Get current user's subscription
export const getCurrentSubscription = async (): Promise<SubscriptionDTO> => {
  const response = await apiClient.get("/subscription/current");
  return response.data;
};

// Get usage statistics
export const getUsageStats = async (): Promise<UsageData> => {
  const response = await apiClient.get("/subscription/usage");
  return response.data;
};

// Setup payment intent
export const setupPayment = async (): Promise<{
  clientSecret: string;
  customerId: string;
}> => {
  const response = await apiClient.post("/subscription/setup-payment");
  return response.data;
};

// Upgrade subscription
export const upgradeSubscription = async (
  tier: string,
  paymentMethodId?: string
): Promise<{
  success: boolean;
  message: string;
  subscription: SubscriptionDTO;
}> => {
  const response = await apiClient.post("/subscription/upgrade", {
    tier,
    paymentMethodId,
  });
  return response.data;
};

// Cancel subscription
export const cancelSubscription = async (): Promise<{
  success: boolean;
  message: string;
  subscription: SubscriptionDTO;
}> => {
  const response = await apiClient.post("/subscription/cancel");
  return response.data;
};

// Check if user can perform action
export const canPerformAction = async (
  action: string
): Promise<{
  canPerform: boolean;
  currentTier: string;
  reason?: string;
  upgradeRequired?: boolean;
}> => {
  const response = await apiClient.get(`/subscription/can-perform/${action}`);
  return response.data;
};

// Add this to your subscription API (src/api/subscription.ts)
// src/api/subscription.ts - Add this function
export const startTrial = async (
  tier: string
): Promise<{
  success: boolean;
  message: string;
  subscription: SubscriptionDTO;
}> => {
  const response = await apiClient.post("/subscription/start-trial", { tier });
  return response.data;
};
