// src/redux/slices/subscriptionSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import {
  getCurrentSubscription,
  getUsageStats,
  getSubscriptionTiers,
  upgradeSubscription as upgradeSubscriptionAPI,
  cancelSubscription as cancelSubscriptionAPI,
  startTrial as startTrialAPI, // ADD THIS LINE
  SubscriptionDTO,
  UsageData,
  SubscriptionTier,
} from "../../api/subscription";

// ADD THIS DEBUG LINE TO VERIFY IMPORT
console.log("🔍 Imported startTrialAPI:", typeof startTrialAPI);

interface SubscriptionState {
  current: SubscriptionDTO | null;
  usage: UsageData | null;
  tiers: Record<string, SubscriptionTier>;
  stripePublishableKey: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: SubscriptionState = {
  current: null,
  usage: null,
  tiers: {},
  stripePublishableKey: null,
  loading: false,
  error: null,
};

// Async thunks
export const fetchCurrentSubscription = createAsyncThunk(
  "subscription/fetchCurrent",
  async () => {
    return await getCurrentSubscription();
  }
);

export const fetchUsageStats = createAsyncThunk(
  "subscription/fetchUsage",
  async () => {
    return await getUsageStats();
  }
);

export const fetchSubscriptionTiers = createAsyncThunk(
  "subscription/fetchTiers",
  async () => {
    return await getSubscriptionTiers();
  }
);

export const upgradeSubscription = createAsyncThunk(
  "subscription/upgrade",
  async ({
    tier,
    paymentMethodId,
  }: {
    tier: string;
    paymentMethodId?: string;
  }) => {
    return await upgradeSubscriptionAPI(tier, paymentMethodId);
  }
);

export const cancelSubscription = createAsyncThunk(
  "subscription/cancel",
  async () => {
    return await cancelSubscriptionAPI();
  }
);

export const startTrial = createAsyncThunk(
  "subscription/startTrial",
  async (tier: string) => {
    console.log("🎁 Redux thunk: Starting trial for tier:", tier);
    console.log("🔍 startTrialAPI function:", typeof startTrialAPI);

    if (typeof startTrialAPI !== "function") {
      throw new Error("startTrialAPI is not properly imported");
    }

    return await startTrialAPI(tier);
  }
);

const subscriptionSlice = createSlice({
  name: "subscription",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    updateUsage: (state, action: PayloadAction<Partial<UsageData>>) => {
      if (state.usage) {
        state.usage = { ...state.usage, ...action.payload };
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch current subscription
      .addCase(fetchCurrentSubscription.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCurrentSubscription.fulfilled, (state, action) => {
        state.loading = false;
        state.current = action.payload;
      })
      .addCase(fetchCurrentSubscription.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch subscription";
      })

      // Fetch usage stats
      .addCase(fetchUsageStats.fulfilled, (state, action) => {
        state.usage = action.payload;
      })

      // Fetch subscription tiers
      .addCase(fetchSubscriptionTiers.fulfilled, (state, action) => {
        state.tiers = action.payload.tiers;
        state.stripePublishableKey = action.payload.stripePublishableKey;
      })

      // Upgrade subscription
      .addCase(upgradeSubscription.fulfilled, (state, action) => {
        state.current = action.payload.subscription;
      })

      // Cancel subscription
      .addCase(cancelSubscription.fulfilled, (state, action) => {
        state.current = action.payload.subscription;
      })

      // In the extraReducers section, ADD these cases after your existing ones:
      .addCase(startTrial.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(startTrial.fulfilled, (state, action) => {
        console.log("✅ Redux: Trial started successfully:", action.payload);
        state.current = action.payload.subscription;
        state.loading = false;
        state.error = null;
      })
      .addCase(startTrial.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to start trial";
      });
  },
});

export const { clearError, updateUsage } = subscriptionSlice.actions;
export default subscriptionSlice.reducer;
