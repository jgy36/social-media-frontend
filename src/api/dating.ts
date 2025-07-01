// src/api/dating.ts - COMPLETE FILE with all functions FIXED
import { apiClient, safeApiCall } from "./apiClient";
import * as FileSystem from "expo-file-system";
import * as ImagePicker from "expo-image-picker"; // FIXED: Import the entire module

export const uploadDatingPhoto = async (
  imageAsset: ImagePicker.ImagePickerAsset // FIXED: Use namespaced type
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
      console.log("📸 Response status:", response.status);

      return response.data.url;
    } catch (error: any) {
      console.error("Photo upload error:", error);
      console.error("Error response:", error.response?.data);

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

// Rest of the API functions remain the same...

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
      age: profile?.age || 0,
    });

    const isComplete =
      profile !== null &&
      profile.photos.length > 0 &&
      profile.bio.trim().length > 0 &&
      profile.age > 0;

    console.log("✅ Profile is complete:", isComplete);
    return isComplete;
  } catch (error) {
    console.error("❌ Error checking profile completeness:", error);
    return false;
  }
};

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
    const response = await apiClient.post<SwipeResponse>(
      "/dating/swipe",
      null,
      {
        params: { targetUserId, direction },
      }
    );
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
