// src/api/privacySettings.ts - FIXED VERSION
import { apiClient, safeApiCall } from "./apiClient";

/**
 * Interface for privacy settings (updated for social media + dating app)
 */
export interface PrivacySettings {
  publicProfile: boolean; // This should map to 'public_profile' in DB
  showPoliticalAffiliation: boolean;
  showPostHistory: boolean;
  showVotingRecord: boolean;
  allowDirectMessages: boolean;
  allowFollowers: boolean;
  allowSearchIndexing: boolean;
  dataSharing: boolean;

  // Dating/match privacy settings
  showPostsToMatches: boolean;
  maxPostsForMatches: number;
  matchPostsTimeLimit: number;
  showFollowersToMatches: boolean;
  showFollowingToMatches: boolean;
}

/**
 * Default privacy settings (updated)
 */
export const defaultPrivacySettings: PrivacySettings = {
  publicProfile: true, // Make sure this is explicitly set
  showPoliticalAffiliation: false,
  showPostHistory: true,
  showVotingRecord: false,
  allowDirectMessages: true,
  allowFollowers: true,
  allowSearchIndexing: true,
  dataSharing: false,

  // Dating/match defaults
  showPostsToMatches: true,
  maxPostsForMatches: 10,
  matchPostsTimeLimit: 30,
  showFollowersToMatches: false,
  showFollowingToMatches: false,
};

/**
 * Initialize privacy settings for a new user
 * THIS IS THE KEY MISSING FUNCTION
 */
export const initializePrivacySettings = async (): Promise<{
  success: boolean;
  message?: string;
}> => {
  return safeApiCall(async () => {
    console.log(
      "Initializing privacy settings with defaults:",
      defaultPrivacySettings
    );

    const response = await apiClient.post<{
      success: boolean;
      message?: string;
    }>("/users/privacy-settings/initialize", defaultPrivacySettings);

    console.log("Privacy settings initialization response:", response.data);
    return response.data;
  }, "Failed to initialize privacy settings");
};

/**
 * Get the user's privacy settings with fallback to defaults
 * @returns The user's privacy settings
 */
export const getPrivacySettings = async (): Promise<PrivacySettings> => {
  return safeApiCall(async () => {
    try {
      const response = await apiClient.get<PrivacySettings>(
        "/users/privacy-settings"
      );
      return response.data;
    } catch (error: any) {
      // If privacy settings don't exist (404 or similar), initialize them
      if (error.response?.status === 404 || error.response?.status === 500) {
        console.log("Privacy settings not found, initializing with defaults");

        const initResult = await initializePrivacySettings();
        if (initResult.success) {
          // Try again after initialization
          const response = await apiClient.get<PrivacySettings>(
            "/users/privacy-settings"
          );
          return response.data;
        } else {
          console.warn("Failed to initialize privacy settings, using defaults");
          return defaultPrivacySettings;
        }
      }
      throw error;
    }
  }, "Failed to get privacy settings");
};

/**
 * Update the user's privacy settings
 * @param settings The updated privacy settings
 * @returns Success status
 */
export const updatePrivacySettings = async (
  settings: PrivacySettings
): Promise<{ success: boolean; message?: string }> => {
  return safeApiCall(async () => {
    // Ensure all required fields are present
    const completeSettings = {
      ...defaultPrivacySettings,
      ...settings,
    };

    const response = await apiClient.put<{
      success: boolean;
      message?: string;
    }>("/users/privacy-settings", completeSettings);
    return response.data;
  }, "Failed to update privacy settings");
};

/**
 * Ensure privacy settings exist for current user
 * Call this after user registration or login
 */
export const ensurePrivacySettingsExist = async (): Promise<boolean> => {
  try {
    console.log("Ensuring privacy settings exist for current user");

    // Try to get existing settings
    const settings = await getPrivacySettings();

    if (settings) {
      console.log("Privacy settings found or created successfully");
      return true;
    }

    return false;
  } catch (error) {
    console.error("Failed to ensure privacy settings exist:", error);
    return false;
  }
};

/**
 * Get posts that a viewer is allowed to see from a user (for matches)
 * @param userId The user whose posts to view
 * @returns Filtered posts based on privacy settings
 */
export const getVisiblePostsForViewer = async (
  userId: number
): Promise<any[]> => {
  return safeApiCall(async () => {
    const response = await apiClient.get(`/users/${userId}/visible-posts`);
    return response.data;
  }, "Failed to get visible posts");
};

/**
 * Check if viewer can see user's social profile
 * @param userId The user to check
 * @returns Whether the profile can be viewed
 */
export const canViewSocialProfile = async (
  userId: number
): Promise<boolean> => {
  return safeApiCall(async () => {
    const response = await apiClient.get(`/users/${userId}/can-view-profile`);
    return response.data.canView;
  }, "Failed to check profile visibility");
};

/**
 * Check if viewer can see user's follower/following lists
 * @param userId The user to check
 * @returns Permissions for viewing lists
 */
export const getFollowListPermissions = async (
  userId: number
): Promise<{
  canViewFollowers: boolean;
  canViewFollowing: boolean;
}> => {
  return safeApiCall(async () => {
    const response = await apiClient.get(
      `/users/${userId}/follow-list-permissions`
    );
    return response.data;
  }, "Failed to get follow list permissions");
};

/**
 * Toggle a single privacy setting
 * @param setting The name of the setting to toggle
 * @returns The updated privacy settings
 */
export const togglePrivacySetting = async (
  setting: keyof PrivacySettings
): Promise<PrivacySettings> => {
  return safeApiCall(async () => {
    // First get current settings
    const currentSettings = await getPrivacySettings();

    // Toggle the specified setting
    const updatedSettings = {
      ...currentSettings,
      [setting]: !currentSettings[setting],
    };

    // Update the settings
    await updatePrivacySettings(updatedSettings);

    return updatedSettings;
  }, `Failed to toggle ${setting} setting`);
};

/**
 * Reset privacy settings to default values
 * @returns Success status
 */
export const resetPrivacySettings = async (): Promise<{
  success: boolean;
  message?: string;
}> => {
  return safeApiCall(async () => {
    const response = await apiClient.post<{
      success: boolean;
      message?: string;
    }>("/users/privacy-settings/reset");
    return response.data;
  }, "Failed to reset privacy settings");
};
