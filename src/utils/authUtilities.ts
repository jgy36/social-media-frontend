// src/utils/authUtils.ts - NEW FILE for handling post-auth initialization
import { getCurrentUser } from "@/api/users";
import { ensurePrivacySettingsExist } from "@/api/privacySettings";
import { setUserData } from "@/utils/tokenUtils";

/**
 * Complete post-authentication setup
 * Call this after successful login or registration
 */
export const completeAuthSetup = async (): Promise<boolean> => {
  try {
    console.log("🔧 Starting post-authentication setup...");

    // 1. Get current user profile
    const userProfile = await getCurrentUser();
    if (!userProfile) {
      console.error("Failed to get user profile during auth setup");
      return false;
    }

    console.log("✅ User profile loaded:", userProfile.username);

    // 2. Ensure privacy settings exist (this is critical!)
    const privacyInitialized = await ensurePrivacySettingsExist();
    if (!privacyInitialized) {
      console.error("Failed to initialize privacy settings");
      // Don't fail the entire auth process, but log the issue
    } else {
      console.log("✅ Privacy settings verified/initialized");
    }

    // 3. Update local storage with complete user data
    await setUserData({
      id: String(userProfile.id),
      username: userProfile.username || "",
      email: userProfile.email || "",
      displayName: userProfile.displayName || "",
      bio: userProfile.bio || "",
      profileImageUrl: userProfile.profileImageUrl,
    });

    console.log("✅ Auth setup completed successfully");
    return true;
  } catch (error) {
    console.error("❌ Auth setup failed:", error);
    return false;
  }
};

/**
 * Verify that a user has all required settings
 * Use this for existing users who might be missing privacy settings
 */
export const verifyUserSetup = async (): Promise<boolean> => {
  try {
    console.log("🔍 Verifying user setup completeness...");

    // Check if privacy settings exist
    const privacyOk = await ensurePrivacySettingsExist();
    if (!privacyOk) {
      console.warn("Privacy settings verification failed");
      return false;
    }

    console.log("✅ User setup verification completed");
    return true;
  } catch (error) {
    console.error("❌ User setup verification failed:", error);
    return false;
  }
};
