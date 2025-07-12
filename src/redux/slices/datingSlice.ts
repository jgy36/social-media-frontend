// src/redux/slices/datingSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import {
  DatingProfile, // ADD this back
  PotentialMatch,
  Match,
  SwipeDirection,
  SwipeAction, // This comes from the types file
  getPotentialMatches,
  swipeUser,
  getUserMatches,
  getCurrentDatingProfile,
} from "../../api/dating";

interface DatingState {
  currentProfile: DatingProfile | null;
  potentialMatches: PotentialMatch[]; // Change from DatingProfile[]
  matches: Match[];
  swipeHistory: SwipeAction[];
  loading: boolean;
  error: string | null;

  // Subscription-related state
  canSuperLike: boolean;
  canUndoSwipe: boolean;
  superLikesRemaining: number;

  // UI state
  showPaywallModal: boolean;
  paywallFeature: string | null;
  lastSwipeAction: SwipeAction | null;
}

const initialState: DatingState = {
  currentProfile: null,
  potentialMatches: [],
  matches: [],
  swipeHistory: [],
  loading: false,
  error: null,

  canSuperLike: false,
  canUndoSwipe: false,
  superLikesRemaining: 0,

  showPaywallModal: false,
  paywallFeature: null,
  lastSwipeAction: null,
};

// Async thunks
export const fetchPotentialMatches = createAsyncThunk(
  "dating/fetchPotentialMatches",
  async () => {
    return await getPotentialMatches();
  }
);

export const fetchMatches = createAsyncThunk(
  "dating/fetchMatches",
  async () => {
    return await getUserMatches();
  }
);

export const fetchCurrentDatingProfile = createAsyncThunk(
  "dating/fetchCurrentProfile",
  async () => {
    return await getCurrentDatingProfile();
  }
);

export const performSwipe = createAsyncThunk(
  "dating/performSwipe",
  async ({
    targetUserId,
    direction,
  }: {
    targetUserId: number;
    direction: "LIKE" | "PASS" | "SUPER_LIKE";
  }) => {
    const response = await swipeUser(targetUserId, direction);
    return {
      targetUserId,
      direction,
      timestamp: Date.now(),
      response,
    };
  }
);

// Super Like with subscription check
export const performSuperLike = createAsyncThunk(
  "dating/performSuperLike",
  async (targetUserId: number, { getState, rejectWithValue }) => {
    const state = getState() as { dating: DatingState };

    // Check if user can super like
    if (!state.dating.canSuperLike || state.dating.superLikesRemaining <= 0) {
      return rejectWithValue("super_like_limit_exceeded");
    }

    const response = await swipeUser(targetUserId, "SUPER_LIKE");
    return {
      targetUserId,
      direction: "SUPER_LIKE" as const,
      timestamp: Date.now(),
      response,
    };
  }
);

export const undoLastSwipe = createAsyncThunk(
  "dating/undoLastSwipe",
  async (_, { getState, rejectWithValue }) => {
    const state = getState() as { dating: DatingState };

    if (!state.dating.canUndoSwipe || !state.dating.lastSwipeAction) {
      return rejectWithValue("undo_not_available");
    }

    // In a real implementation, you'd call an API endpoint
    // For now, we'll just return the action to undo
    return state.dating.lastSwipeAction;
  }
);

const datingSlice = createSlice({
  name: "dating",
  initialState,
  reducers: {
    // UI actions
    showPaywall: (state, action: PayloadAction<string>) => {
      state.showPaywallModal = true;
      state.paywallFeature = action.payload;
    },
    hidePaywall: (state) => {
      state.showPaywallModal = false;
      state.paywallFeature = null;
    },

    // Update subscription status
    updateSubscriptionLimits: (
      state,
      action: PayloadAction<{
        canSuperLike: boolean;
        canUndoSwipe: boolean;
        superLikesRemaining: number;
      }>
    ) => {
      state.canSuperLike = action.payload.canSuperLike;
      state.canUndoSwipe = action.payload.canUndoSwipe;
      state.superLikesRemaining = action.payload.superLikesRemaining;
    },

    // Clear error
    clearError: (state) => {
      state.error = null;
    },

    // Remove profile from potential matches (after swiping)
    removeProfileFromMatches: (state, action: PayloadAction<number>) => {
      state.potentialMatches = state.potentialMatches.filter(
        (profile) => profile.user.id !== action.payload
      );
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch potential matches
      .addCase(fetchPotentialMatches.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPotentialMatches.fulfilled, (state, action) => {
        state.loading = false;
        state.potentialMatches = action.payload;
      })
      .addCase(fetchPotentialMatches.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch matches";
      })

      // Fetch matches
      .addCase(fetchMatches.fulfilled, (state, action) => {
        state.matches = action.payload;
      })

      // Fetch current profile
      .addCase(fetchCurrentDatingProfile.fulfilled, (state, action) => {
        state.currentProfile = action.payload;
      })

      // Perform swipe
      .addCase(performSwipe.fulfilled, (state, action) => {
        const swipeAction = {
          targetUserId: action.payload.targetUserId,
          direction: action.payload.direction,
          timestamp: action.payload.timestamp,
        };

        state.swipeHistory.push(swipeAction);
        state.lastSwipeAction = swipeAction;

        // Remove from potential matches
        state.potentialMatches = state.potentialMatches.filter(
          (profile) => profile.user.id !== action.payload.targetUserId
        );

        // If it was a match, add to matches
        if (action.payload.response.matched && action.payload.response.match) {
          state.matches.unshift(action.payload.response.match);
        }
      })

      // Super like
      .addCase(performSuperLike.fulfilled, (state, action) => {
        const swipeAction = {
          targetUserId: action.payload.targetUserId,
          direction: action.payload.direction,
          timestamp: action.payload.timestamp,
        };

        state.swipeHistory.push(swipeAction);
        state.lastSwipeAction = swipeAction;
        state.superLikesRemaining = Math.max(0, state.superLikesRemaining - 1);

        // Remove from potential matches
        state.potentialMatches = state.potentialMatches.filter(
          (profile) => profile.user.id !== action.payload.targetUserId
        );

        // If it was a match, add to matches
        if (action.payload.response.matched && action.payload.response.match) {
          state.matches.unshift(action.payload.response.match);
        }
      })
      .addCase(performSuperLike.rejected, (state, action) => {
        if (action.payload === "super_like_limit_exceeded") {
          state.showPaywallModal = true;
          state.paywallFeature = "super_like";
        }
      })

      // Undo swipe
      .addCase(undoLastSwipe.fulfilled, (state, action) => {
        // Remove the last swipe from history
        state.swipeHistory = state.swipeHistory.slice(0, -1);
        state.lastSwipeAction =
          state.swipeHistory[state.swipeHistory.length - 1] || null;

        // In a real implementation, you'd also re-add the profile to potential matches
        // For now, we'll just clear the last action
      })
      .addCase(undoLastSwipe.rejected, (state, action) => {
        if (action.payload === "undo_not_available") {
          state.showPaywallModal = true;
          state.paywallFeature = "undo_swipe";
        }
      });
  },
});

export const {
  showPaywall,
  hidePaywall,
  updateSubscriptionLimits,
  clearError,
  removeProfileFromMatches,
} = datingSlice.actions;

export default datingSlice.reducer;
