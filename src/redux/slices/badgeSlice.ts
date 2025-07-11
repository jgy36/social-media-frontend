// src/redux/slices/badgeSlice.ts
import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getUserId } from "@/utils/tokenUtils";
import { getUserBadges, saveUserBadges } from "@/api/badges";

// Key for storage
const USER_BADGES_KEY = "userBadges";

interface BadgeState {
  badges: string[]; // Array of badge IDs
  initialized: boolean;
  loading: boolean;
  error: string | null;
}

// Initial state with default values
const initialState: BadgeState = {
  badges: [],
  initialized: false,
  loading: false,
  error: null,
};

// Helper to load badges from AsyncStorage with proper user isolation
const loadUserBadges = async (): Promise<string[]> => {
  try {
    const userId = await getUserId();
    if (!userId) return [];

    const savedBadges = await AsyncStorage.getItem(
      `user_${userId}_${USER_BADGES_KEY}`
    );
    if (savedBadges) {
      const parsed = JSON.parse(savedBadges);
      return Array.isArray(parsed) ? parsed : [];
    }
  } catch (err) {
    console.error("Error loading user badges:", err);
  }

  return [];
};

// Helper to save badges to AsyncStorage
const saveUserBadgesToStorage = async (badges: string[]) => {
  try {
    const userId = await getUserId();
    if (!userId) return;

    console.log(`Saving badges for user ${userId}:`, badges);

    await AsyncStorage.setItem(
      `user_${userId}_${USER_BADGES_KEY}`,
      JSON.stringify(badges)
    );
  } catch (err) {
    console.error("Error saving user badges to storage:", err);
  }
};

// Helper to clear badges from AsyncStorage
const clearUserBadgesFromStorage = async () => {
  try {
    const userId = await getUserId();
    if (!userId) return;

    await AsyncStorage.removeItem(`user_${userId}_${USER_BADGES_KEY}`);
  } catch (err) {
    console.error("Error clearing user badges:", err);
  }
};

// Fetch user badges from the server
export const fetchUserBadges = createAsyncThunk(
  "badges/fetchFromServer",
  async (_, { rejectWithValue }) => {
    try {
      const badges = await getUserBadges();
      return badges;
    } catch (error) {
      console.error("Error fetching user badges:", error);
      return rejectWithValue(
        error instanceof Error ? error.message : "Failed to fetch badges"
      );
    }
  }
);

// Initialize badges from AsyncStorage
export const initializeBadges = createAsyncThunk(
  "badges/initialize",
  async (_, { rejectWithValue }) => {
    try {
      const badges = await loadUserBadges();
      return badges;
    } catch (error) {
      console.error("Error initializing badges:", error);
      return rejectWithValue("Failed to initialize badges");
    }
  }
);

// Save badges to server and local storage
export const saveBadges = createAsyncThunk(
  "badges/save",
  async (badges: string[], { rejectWithValue }) => {
    try {
      // Save to server first
      const result = await saveUserBadges(badges);

      if (!result.success) {
        throw new Error("Failed to save badges to server");
      }

      // Save to local storage
      await saveUserBadgesToStorage(badges);

      return badges;
    } catch (error) {
      console.error("Error saving badges:", error);
      return rejectWithValue(
        error instanceof Error ? error.message : "Failed to save badges"
      );
    }
  }
);

const badgeSlice = createSlice({
  name: "badges",
  initialState,
  reducers: {
    // Clear all badges (used during logout)
    clearBadges: (state) => {
      state.badges = [];
      state.initialized = false;
      state.loading = false;
      state.error = null;

      // Clear from storage asynchronously (don't await in reducer)
      clearUserBadgesFromStorage().catch((err) =>
        console.error("Error clearing badges from storage:", err)
      );
    },

    // Reset error state
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Handle initializeBadges
    builder
      .addCase(initializeBadges.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(initializeBadges.fulfilled, (state, action) => {
        state.loading = false;
        state.badges = Array.isArray(action.payload) ? action.payload : [];
        state.initialized = true;
        state.error = null;
      })
      .addCase(initializeBadges.rejected, (state, action) => {
        state.loading = false;
        state.badges = [];
        state.initialized = true;
        state.error = action.payload as string;
      });

    // Handle fetchUserBadges
    builder
      .addCase(fetchUserBadges.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserBadges.fulfilled, (state, action) => {
        state.loading = false;
        state.badges = Array.isArray(action.payload) ? action.payload : [];
        state.initialized = true;
        state.error = null;

        // Save to storage asynchronously (don't await in reducer)
        saveUserBadgesToStorage(state.badges).catch((err) =>
          console.error("Error saving badges to storage:", err)
        );
      })
      .addCase(fetchUserBadges.rejected, (state, action) => {
        state.loading = false;
        state.initialized = true;
        state.error = action.payload as string;
      });

    // Handle saveBadges
    builder
      .addCase(saveBadges.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(saveBadges.fulfilled, (state, action) => {
        state.loading = false;
        state.badges = Array.isArray(action.payload) ? action.payload : [];
        state.error = null;
      })
      .addCase(saveBadges.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearBadges, clearError } = badgeSlice.actions;

// Keep the old actions for backwards compatibility
export const setBadges = (badges: string[]) => saveBadges(badges);
export const addBadge = (badge: string) => (dispatch: any, getState: any) => {
  const currentBadges = getState().badges.badges;
  if (!currentBadges.includes(badge) && currentBadges.length < 10) {
    dispatch(saveBadges([...currentBadges, badge]));
  }
};
export const removeBadge =
  (badge: string) => (dispatch: any, getState: any) => {
    const currentBadges = getState().badges.badges;
    dispatch(saveBadges(currentBadges.filter((b) => b !== badge)));
  };

export default badgeSlice.reducer;
