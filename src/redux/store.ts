// src/redux/store.ts - React Native with redux-persist
import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer, createTransform } from "redux-persist";
import AsyncStorage from "@react-native-async-storage/async-storage";
import userReducer from "./slices/userSlice";
import postReducer from "./slices/postSlice";
import communityReducer from "./slices/communitySlice";
import notificationPreferencesReducer from "./slices/notificationPreferencesSlice";
import privacySettingsReducer from "./slices/privacySettingsSlice";
import badgeReducer from "./slices/badgeSlice";
import subscriptionReducer from "./slices/subscriptionSlice"; // ADD THIS

// Debug transform to log data being persisted
const DebugTransform = createTransform(
  // transform state on its way to being serialized and persisted
  (inboundState, key) => {
    console.log(
      `Redux-Persist: Saving state for ${key}`,
      JSON.stringify(inboundState).substring(0, 50) + "..."
    );
    return inboundState;
  },
  // transform state being rehydrated
  (outboundState, key) => {
    console.log(
      `Redux-Persist: Loaded state for ${key}`,
      JSON.stringify(outboundState).substring(0, 50) + "..."
    );
    return outboundState;
  }
);

// Configure persistence for each reducer
const userPersistConfig = {
  key: "user",
  storage: AsyncStorage,
  whitelist: [
    "id",
    "username",
    "email",
    "displayName",
    "bio",
    "profileImageUrl",
    "isAuthenticated",
    "role",
  ],
  transforms: [DebugTransform],
  debug: true,
  timeout: 30000,
};

const communitiesPersistConfig = {
  key: "communities",
  storage: AsyncStorage,
  whitelist: ["joinedCommunities", "featuredCommunities", "isSidebarOpen"],
  debug: true,
  timeout: 30000,
};

const notificationsPersistConfig = {
  key: "notificationPreferences",
  storage: AsyncStorage,
  whitelist: ["preferences", "communityPreferences"],
  debug: true,
  timeout: 30000,
};

const privacyPersistConfig = {
  key: "privacySettings",
  storage: AsyncStorage,
  whitelist: ["settings"],
  debug: true,
  timeout: 30000,
};

const badgesPersistConfig = {
  key: "badges",
  storage: AsyncStorage,
  whitelist: ["badges", "initialized"],
  blacklist: ["loading", "error"], // Don't persist loading/error states
  debug: true,
  timeout: 30000,
};

// ADD THIS - Subscription persistence config
const subscriptionPersistConfig = {
  key: "subscription",
  storage: AsyncStorage,
  whitelist: ["current", "tiers", "stripePublishableKey"],
  blacklist: ["loading", "error", "usage"], // Don't persist loading/error/usage states
  debug: true,
  timeout: 30000,
};

// Create persisted reducers
const persistedUserReducer = persistReducer(userPersistConfig, userReducer);
const persistedCommunityReducer = persistReducer(
  communitiesPersistConfig,
  communityReducer
);
const persistedNotificationsReducer = persistReducer(
  notificationsPersistConfig,
  notificationPreferencesReducer
);
const persistedPrivacyReducer = persistReducer(
  privacyPersistConfig,
  privacySettingsReducer
);
const persistedBadgeReducer = persistReducer(badgesPersistConfig, badgeReducer);
const persistedSubscriptionReducer = persistReducer(
  subscriptionPersistConfig,
  subscriptionReducer
); // ADD THIS

// Log when store is being configured
console.log("Configuring Redux store...");

export const store = configureStore({
  reducer: {
    user: persistedUserReducer,
    posts: postReducer, // Don't persist posts
    communities: persistedCommunityReducer,
    notificationPreferences: persistedNotificationsReducer,
    privacySettings: persistedPrivacyReducer,
    badges: persistedBadgeReducer,
    subscription: persistedSubscriptionReducer, // ADD THIS
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
      },
      immutableCheck: {
        ignoredPaths: ["_persist"],
      },
      thunk: {
        extraArgument: undefined,
      },
    }),
  devTools: process.env.NODE_ENV !== "production",
});

console.log("Store configuration complete, initializing persistor...");

export const persistor = persistStore(store, {}, () => {
  console.log("Redux store has been persisted and rehydrated");
  console.log(
    "Current store state:",
    JSON.stringify(store.getState().user).substring(0, 100) + "..."
  );
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

console.log("Redux setup complete");
