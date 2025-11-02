// src/api/dating.ts - Complete updated version with new features
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
  gender: string;
  age?: number;
  user?: any;
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
  gender: string;
  age?: number;
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
  superLike?: boolean;
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

export interface PotentialMatch extends DatingProfile {
  user: {
    id: number;
    username: string;
    displayName: string;
    email: string;
    profileImageUrl?: string;
    age?: number;
    ageConfirmed?: boolean;
    eligibleForDating?: boolean;
    lastActive?: string;
  };
  distance?: number;
  compatibility?: number;
}

// NEW INTERFACES FOR NEW FEATURES
export interface DatingFilters {
  location?: string;
  education?: string;
  lifestyle?: string;
  religion?: string;
  relationshipType?: string;
  drinking?: string;
  smoking?: string;
  hasChildren?: string;
  wantChildren?: string;
}

export interface UndoSwipeResponse {
  success: boolean;
  message?: string;
  undoneProfile?: DatingProfile;
  direction?: string;
  error?: string;
}

export interface BoostStatus {
  isBoosted: boolean;
  canBoost: boolean;
  boostEndsAt?: string;
  minutesLeft?: number;
}

export interface BoostResponse {
  success: boolean;
  message?: string;
  boostEndsAt?: string;
  boostDurationMinutes?: number;
  error?: string;
  upgradeRequired?: boolean;
}

export interface SubscriptionStatus {
  tier: string;
  canSwipe: boolean;
  canSuperLike: boolean;
  canBoost: boolean;
  hasPassportMode: boolean;
  canSeeWhoLikedMe: boolean;
  canUndoSwipes: boolean;
  hasAdvancedFilters: boolean;
  dailySwipesUsed: number;
  dailySwipeLimit: number;
  dailySuperLikesUsed: number;
  dailySuperLikeLimit: number;
  monthlyBoostsUsed: number;
  monthlyBoostLimit: number;
}

// ============================================================================
// DATING SETTINGS API FUNCTIONS
// ============================================================================

export const getDatingEligibility = async (): Promise<DatingEligibility> => {
  return safeApiCall(async () => {
    const response = await apiClient.get<DatingEligibility>(
      "/dating/settings/eligibility"
    );
    return response.data;
  }, "Failed to get dating eligibility");
};

export const confirmAge = async (): Promise<AgeConfirmationResponse> => {
  return safeApiCall(async () => {
    const response = await apiClient.post<AgeConfirmationResponse>(
      "/dating/settings/confirm-age"
    );
    return response.data;
  }, "Failed to confirm age");
};

export const getDatingPreferences = async (): Promise<DatingPreferences> => {
  return safeApiCall(async () => {
    const response = await apiClient.get<DatingPreferences>(
      "/dating/settings/preferences"
    );
    return response.data;
  }, "Failed to get dating preferences");
};

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

export const createOrUpdateDatingProfile = async (
  profileData: CreateDatingProfileRequest
): Promise<DatingProfile> => {
  return safeApiCall(async () => {
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

export const isDatingProfileComplete = async (): Promise<boolean> => {
  try {
    const profile = await getCurrentDatingProfile();
    console.log("🔍 Checking profile completeness:", {
      profileExists: !!profile,
      photosCount: profile?.photos?.length || 0,
      bioLength: profile?.bio?.trim().length || 0,
      hasGender: !!profile?.gender,
      profileAge: profile?.age,
      userAge: profile?.user?.age,
    });

    const isComplete =
      profile !== null &&
      profile.photos.length > 0 &&
      profile.bio.trim().length > 0 &&
      profile.gender &&
      (profile.age || profile.user?.age);

    console.log("✅ Profile is complete:", isComplete);
    return isComplete;
  } catch (error) {
    console.error("❌ Error checking profile completeness:", error);
    return false;
  }
};

export const deleteDatingPhoto = async (photoUrl: string): Promise<void> => {
  return safeApiCall(async () => {
    await apiClient.delete("/dating/photo", {
      data: { photoUrl },
    });
  }, "Failed to delete photo");
};

export const updatePhotoOrder = async (photoUrls: string[]): Promise<void> => {
  return safeApiCall(async () => {
    await apiClient.put("/dating/photos/reorder", {
      photos: photoUrls,
    });
  }, "Failed to update photo order");
};

// ============================================================================
// MATCHING & SWIPING API FUNCTIONS (UPDATED WITH FILTERS)
// ============================================================================

export const getPotentialMatches = async (
  filters?: DatingFilters
): Promise<PotentialMatch[]> => {
  return safeApiCall(async () => {
    // Build query parameters
    const params = new URLSearchParams();
    params.append("useAlgorithm", "false");

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value.trim() !== "") {
          params.append(key, value);
        }
      });
    }

    const response = await apiClient.get<any[]>(
      `/dating/potential-matches?${params.toString()}`
    );

    // Transform backend DatingProfile[] to PotentialMatch[]
    const transformedProfiles: PotentialMatch[] = response.data.map(
      (profile: any) => ({
        ...profile,
        user: {
          id: profile.user?.id || profile.id,
          username: profile.user?.username || `user_${profile.id}`,
          displayName:
            profile.user?.displayName ||
            profile.user?.username ||
            `User ${profile.id}`,
          email: profile.user?.email || "",
          profileImageUrl: profile.user?.profileImageUrl,
          age: profile.age || profile.user?.age,
          ageConfirmed: profile.user?.ageConfirmed || true,
          eligibleForDating: profile.user?.eligibleForDating || true,
          lastActive: profile.user?.lastActive,
        },
        distance: undefined,
        compatibility: undefined,
      })
    );

    console.log("✅ Transformed profiles with filters:", transformedProfiles);
    return transformedProfiles;
  }, "Failed to get potential matches");
};

export const swipeUser = async (
  targetUserId: number,
  direction: "LIKE" | "PASS" | "SUPER_LIKE"
): Promise<SwipeResponse> => {
  return safeApiCall(async () => {
    const response = await apiClient.post<SwipeResponse>(
      `/dating/swipe?targetUserId=${targetUserId}&direction=${direction}`
    );
    return response.data;
  }, "Failed to swipe user");
};

export const getUserMatches = async (): Promise<Match[]> => {
  return safeApiCall(async () => {
    const response = await apiClient.get<Match[]>("/dating/matches");
    return response.data;
  }, "Failed to get matches");
};

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
// NEW FEATURES API FUNCTIONS
// ============================================================================

// UNDO SWIPE
export const undoLastSwipe = async (): Promise<UndoSwipeResponse> => {
  return safeApiCall(async () => {
    const response = await apiClient.post<UndoSwipeResponse>(
      "/dating/undo-swipe"
    );
    return response.data;
  }, "Failed to undo swipe");
};

// BOOST FEATURES
export const boostProfile = async (): Promise<BoostResponse> => {
  return safeApiCall(async () => {
    const response = await apiClient.post<BoostResponse>("/dating/boost");
    return response.data;
  }, "Failed to boost profile");
};

export const getBoostStatus = async (): Promise<BoostStatus> => {
  return safeApiCall(async () => {
    const response = await apiClient.get<BoostStatus>("/dating/boost/status");
    return response.data;
  }, "Failed to get boost status");
};

// WHO LIKED ME
export const getWhoLikedMe = async (): Promise<DatingProfile[]> => {
  return safeApiCall(async () => {
    const response = await apiClient.get<{
      likes: DatingProfile[];
      count: number;
      tier: string;
    }>("/dating/who-liked-me");
    return response.data.likes;
  }, "Failed to get who liked you");
};

export const likeUserBack = async (
  targetUserId: number
): Promise<SwipeResponse> => {
  return safeApiCall(async () => {
    const response = await apiClient.post<SwipeResponse>(
      `/dating/like-back?targetUserId=${targetUserId}`
    );
    return response.data;
  }, "Failed to like user back");
};

// SUBSCRIPTION STATUS
export const getSubscriptionStatus = async (): Promise<SubscriptionStatus> => {
  return safeApiCall(async () => {
    const response = await apiClient.get<SubscriptionStatus>(
      "/dating/subscription-status"
    );
    return response.data;
  }, "Failed to get subscription status");
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

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

export const getUserDatingProfile = async (
  userId: number
): Promise<DatingProfile | null> => {
  return safeApiCall(async () => {
    try {
      const response = await apiClient.get<DatingProfile>(
        `/dating/profile/user/${userId}`
      );

      if (response.data && response.data.prompts) {
        response.data.prompts = response.data.prompts.map((promptStr: any) => {
          try {
            return typeof promptStr === "string"
              ? JSON.parse(promptStr)
              : promptStr;
          } catch {
            return { question: "", answer: "" };
          }
        });
      }

      if (response.data && response.data.interests) {
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

      if (response.data && response.data.virtues) {
        response.data.virtues = response.data.virtues.map((virtueStr: any) => {
          try {
            return typeof virtueStr === "string"
              ? JSON.parse(virtueStr)
              : virtueStr;
          } catch {
            return { category: "", value: "" };
          }
        });
      }

      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      if (error.response?.status === 403) {
        throw new Error("You can only view dating profiles of matched users");
      }
      throw error;
    }
  }, "Failed to get user's dating profile");
};

export const checkMatchStatus = async (userId: number): Promise<boolean> => {
  return safeApiCall(async () => {
    try {
      const response = await apiClient.get<{ isMatched: boolean }>(
        `/dating/match-status/${userId}`
      );
      return response.data.isMatched;
    } catch (error) {
      return false;
    }
  }, "Failed to check match status");
};
