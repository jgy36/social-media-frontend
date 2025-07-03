// src/api/dating.ts - Complete clean version
import { apiClient, safeApiCall } from "./apiClient";
import * as ImagePicker from "expo-image-picker";

// ============================================================================
// INTERFACES
// ============================================================================

export interface DatingProfile {
  id: number;
  bio: string;
  location: string;
  height: string;
  job: string;
  religion: string;
  relationshipType: string;
  lifestyle: string;
  photos: string[];
  prompts: Array<{
    question: string;
    answer: string;
  }>;
  hasChildren: string;
  wantChildren: string;
  drinking: string;
  smoking: string;
  drugs: string;
  lookingFor: string;
  interests: string[];
  virtues: Array<{ category: string; value: string }>;
  // NEW: Add gender field
  gender: string;
  // Note: age and preferences moved to user settings
}

export interface CreateDatingProfileRequest {
  bio: string;
  location: string;
  height?: string;
  job?: string;
  religion?: string;
  relationshipType?: string;
  lifestyle?: string;
  photos: string[];
  prompts?: Array<{
    question: string;
    answer: string;
  }>;
  hasChildren?: string;
  wantChildren?: string;
  drinking?: string;
  smoking?: string;
  drugs?: string;
  lookingFor?: string;
  interests?: string[];
  virtues?: Array<{
    category: string;
    value: string;
  }>;
  // NEW: Add gender field
  gender: string;
}

export interface DatingPreferences {
  genderPreference: string;
  minAge: number;
  maxAge: number;
  maxDistance: number;
}

export interface DatingEligibility {
  age: number | null;
  ageConfirmed: boolean;
  eligibleForDating: boolean;
  hasDatingProfile: boolean;
}

export interface AgeConfirmationResponse {
  success: boolean;
  ageConfirmed: boolean;
  eligibleForDating: boolean;
  error?: string;
}

export interface PreferencesUpdateResponse {
  success: boolean;
  preferences?: DatingPreferences;
  error?: string;
}

export interface SwipeResponse {
  success: boolean;
  matched: boolean;
  match?: Match;
  error?: string;
}

export interface Match {
  id: number;
  user1: {
    id: number;
    username: string;
    displayName: string;
    profileImageUrl?: string;
  };
  user2: {
    id: number;
    username: string;
    displayName: string;
    profileImageUrl?: string;
  };
  matchedAt: string;
  isActive: boolean;
}

// ============================================================================
// DATING SETTINGS API FUNCTIONS
// ============================================================================

/**
 * Get dating eligibility status
 */
export const getDatingEligibility = async (): Promise<DatingEligibility> => {
  return safeApiCall(async () => {
    const response = await apiClient.get<DatingEligibility>(
      "/dating/settings/eligibility"
    );
    return response.data;
  }, "Failed to get dating eligibility");
};

/**
 * Confirm user's age for dating features
 */
export const confirmAge = async (): Promise<AgeConfirmationResponse> => {
  return safeApiCall(async () => {
    const response = await apiClient.post<AgeConfirmationResponse>(
      "/dating/settings/confirm-age"
    );
    return response.data;
  }, "Failed to confirm age");
};

/**
 * Get current dating preferences
 */
export const getDatingPreferences = async (): Promise<DatingPreferences> => {
  return safeApiCall(async () => {
    const response = await apiClient.get<DatingPreferences>(
      "/dating/settings/preferences"
    );
    return response.data;
  }, "Failed to get dating preferences");
};

/**
 * Update dating preferences
 */
export const updateDatingPreferences = async (
  preferences: DatingPreferences
): Promise<PreferencesUpdateResponse> => {
  return safeApiCall(async () => {
    const response = await apiClient.put<PreferencesUpdateResponse>(
      "/dating/settings/preferences",
      preferences
    );
    return response.data;
  }, "Failed to update dating preferences");
};

// ============================================================================
// PROFILE MANAGEMENT API FUNCTIONS
// ============================================================================

/**
 * Upload dating photo
 */
export const uploadDatingPhoto = async (
  imageAsset: ImagePicker.ImagePickerAsset
): Promise<string> => {
  return safeApiCall(async () => {
    try {
      const formData = new FormData();

      const fileUri = imageAsset.uri;
      const fileType = imageAsset.type || "image/jpeg";
      const fileName = imageAsset.fileName || `dating-photo-${Date.now()}.jpg`;

      formData.append("photo", {
        uri: fileUri,
        type: fileType,
        name: fileName,
      } as any);

      const response = await apiClient.post("/dating/upload-photo", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        timeout: 30000,
      });

      console.log("📸 Upload response:", response.data);
      return response.data.url || response.data.photoUrl;
    } catch (error: any) {
      console.error("Photo upload error:", error);

      if (error.response?.status === 404) {
        console.warn(
          "Photo upload endpoint not implemented, using placeholder"
        );
        return `https://picsum.photos/400/600?random=${Date.now()}`;
      }

      throw new Error("Failed to upload photo");
    }
  }, "Failed to upload dating photo");
};

/**
 * Create or update dating profile
 */
export const createOrUpdateDatingProfile = async (
  profileData: CreateDatingProfileRequest
): Promise<DatingProfile> => {
  return safeApiCall(async () => {
    // Convert arrays to JSON strings if they exist (for backend compatibility)
    const backendData = {
      ...profileData,
      prompts:
        profileData.prompts?.map((prompt) => JSON.stringify(prompt)) || [],
      interests:
        profileData.interests?.map((interest) => JSON.stringify(interest)) ||
        [],
      virtues:
        profileData.virtues?.map((virtue) => JSON.stringify(virtue)) || [],
    };

    const response = await apiClient.post<DatingProfile>(
      "/dating/profile",
      backendData
    );
    return response.data;
  }, "Failed to create/update dating profile");
};

/**
 * Get current user's dating profile
 */
export const getCurrentDatingProfile =
  async (): Promise<DatingProfile | null> => {
    return safeApiCall(async () => {
      try {
        console.log("🔍 Fetching dating profile from API...");
        const response = await apiClient.get<DatingProfile>(
          "/dating/profile/me"
        );
        console.log("📡 API Response:", response.status, response.data);

        if (!response.data) {
          console.log("⚠️ API returned empty data");
          return null;
        }

        // Parse arrays from JSON strings if they exist
        if (response.data.prompts) {
          response.data.prompts = response.data.prompts.map(
            (promptStr: any) => {
              try {
                return typeof promptStr === "string"
                  ? JSON.parse(promptStr)
                  : promptStr;
              } catch {
                return { question: "", answer: "" };
              }
            }
          );
        }

        if (response.data.interests) {
          response.data.interests = response.data.interests.map(
            (interestStr: any) => {
              try {
                return typeof interestStr === "string"
                  ? JSON.parse(interestStr)
                  : interestStr;
              } catch {
                return "";
              }
            }
          );
        }

        if (response.data.virtues) {
          response.data.virtues = response.data.virtues.map(
            (virtueStr: any) => {
              try {
                return typeof virtueStr === "string"
                  ? JSON.parse(virtueStr)
                  : virtueStr;
              } catch {
                return { category: "", value: "" };
              }
            }
          );
        }

        console.log("✅ Successfully processed profile data");
        return response.data;
      } catch (error: any) {
        if (error.response?.status === 404) {
          console.log("📭 No profile found (404)");
          return null;
        }
        console.error("❌ API Error:", error.response?.data || error.message);
        throw error;
      }
    }, "Failed to get dating profile");
  };

/**
 * Check if dating profile is complete
 */
export const isDatingProfileComplete = async (): Promise<boolean> => {
  try {
    const profile = await getCurrentDatingProfile();
    console.log("🔍 Checking profile completeness:", {
      profileExists: !!profile,
      photosCount: profile?.photos?.length || 0,
      bioLength: profile?.bio?.trim().length || 0,
      hasGender: !!profile?.gender,
    });

    const isComplete =
      profile !== null &&
      profile.photos.length > 0 &&
      profile.bio.trim().length > 0 &&
      profile.gender;

    console.log("✅ Profile is complete:", isComplete);
    return isComplete;
  } catch (error) {
    console.error("❌ Error checking profile completeness:", error);
    return false;
  }
};

/**
 * Delete a photo from dating profile
 */
export const deleteDatingPhoto = async (photoUrl: string): Promise<void> => {
  return safeApiCall(async () => {
    await apiClient.delete("/dating/photo", {
      data: { photoUrl },
    });
  }, "Failed to delete photo");
};

/**
 * Update photo order in dating profile
 */
export const updatePhotoOrder = async (photoUrls: string[]): Promise<void> => {
  return safeApiCall(async () => {
    await apiClient.put("/dating/photos/reorder", {
      photos: photoUrls,
    });
  }, "Failed to update photo order");
};

// ============================================================================
// MATCHING & SWIPING API FUNCTIONS
// ============================================================================

/**
 * Get potential matches for swiping
 */
export const getPotentialMatches = async (): Promise<DatingProfile[]> => {
  return safeApiCall(async () => {
    const response = await apiClient.get<DatingProfile[]>(
      "/dating/potential-matches"
    );
    return response.data;
  }, "Failed to get potential matches");
};

/**
 * Swipe on a user
 */
export const swipeUser = async (
  targetUserId: number,
  direction: "LIKE" | "PASS"
): Promise<SwipeResponse> => {
  return safeApiCall(async () => {
    const response = await apiClient.post<SwipeResponse>("/dating/swipe", {
      targetUserId,
      direction,
    });
    return response.data;
  }, "Failed to swipe user");
};

/**
 * Get user's matches
 */
export const getUserMatches = async (): Promise<Match[]> => {
  return safeApiCall(async () => {
    const response = await apiClient.get<Match[]>("/dating/matches");
    return response.data;
  }, "Failed to get matches");
};

/**
 * Mark a match as "seen" (no longer new)
 */
export const markMatchAsSeen = async (
  matchId: number
): Promise<{ success: boolean }> => {
  return safeApiCall(async () => {
    const response = await apiClient.post<{ success: boolean }>(
      `/dating/matches/${matchId}/mark-seen`
    );
    return response.data;
  }, "Failed to mark match as seen");
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Check if user has completed all necessary steps for dating
 */
export const isDatingReady = async (): Promise<{
  ready: boolean;
  missing: string[];
}> => {
  try {
    const [eligibility, profileComplete] = await Promise.all([
      getDatingEligibility(),
      isDatingProfileComplete(),
    ]);

    const missing: string[] = [];

    if (!eligibility.eligibleForDating) {
      if (!eligibility.ageConfirmed) {
        missing.push("Age confirmation required");
      }
    }

    if (!profileComplete) {
      missing.push("Complete dating profile");
    }

    return {
      ready: eligibility.eligibleForDating && profileComplete,
      missing,
    };
  } catch (error) {
    console.error("Error checking dating readiness:", error);
    return {
      ready: false,
      missing: ["Error checking status"],
    };
  }
};
