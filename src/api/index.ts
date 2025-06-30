// src/api/index.ts
// Export the API client
export * from "./apiClient";

// Export all API modules
import * as auth from "./auth";
import * as posts from "./posts";
import * as communities from "./communities";
import * as users from "./users";
import * as search from "./search";
import * as security from "./security";
import * as notificationPreferences from "./notificationPreferences";
import * as privacySettings from "./privacySettings";
import * as accountManagement from "./accountManagement";
import * as messages from "./messages";
import * as notifications from "./notifications";
import * as badges from "./badges";
import * as dating from "./dating";
import * as photoMessages from "./photoMessages";

// Export individual modules
export {
  auth,
  posts,
  communities,
  users,
  search,
  security,
  notificationPreferences,
  privacySettings,
  accountManagement,
  messages,
  notifications,
  badges,
  dating,
  photoMessages,
};

// Export types
export * from "./types";

// Create a unified API object
const api = {
  auth,
  posts,
  communities,
  users,
  search,
  security,
  notificationPreferences,
  privacySettings,
  accountManagement,
  messages,
  notifications,
  badges,
  dating,
  photoMessages,
};

export default api;
