// src/utils/tokenUtils.ts - React Native version (Updated with age fields)
import AsyncStorage from "@react-native-async-storage/async-storage";

// Storage keys
const TOKEN_KEY = "authToken";
const USER_ID_KEY = "currentUserId";
const IS_AUTHENTICATED_KEY = "isAuthenticated";

// Updated user data interface with age fields
export interface UserData {
  id: string;
  username: string;
  email: string;
  displayName?: string;
  bio?: string;
  profileImageUrl?: string;
  role?: "USER" | "ADMIN";
  // NEW: Age-related fields for dating features
  age?: number;
  ageConfirmed?: boolean;
  eligibleForDating?: boolean;
}

/**
 * Set authentication token
 */
export const setToken = async (token: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(TOKEN_KEY, token);
  } catch (error) {
    console.error("Error storing token:", error);
  }
};

/**
 * Get authentication token
 */
export const getToken = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(TOKEN_KEY);
  } catch (error) {
    console.error("Error retrieving token:", error);
    return null;
  }
};

/**
 * Remove authentication token
 */
export const removeToken = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(TOKEN_KEY);
  } catch (error) {
    console.error("Error removing token:", error);
  }
};

/**
 * Set authentication status
 */
export const setAuthenticated = async (isAuth: boolean): Promise<void> => {
  try {
    await AsyncStorage.setItem(IS_AUTHENTICATED_KEY, isAuth.toString());
  } catch (error) {
    console.error("Error storing auth status:", error);
  }
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = async (): Promise<boolean> => {
  try {
    const authStatus = await AsyncStorage.getItem(IS_AUTHENTICATED_KEY);
    const token = await getToken();
    return authStatus === "true" && !!token;
  } catch (error) {
    console.error("Error checking auth status:", error);
    return false;
  }
};

/**
 * Get current user ID
 */
export const getUserId = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(USER_ID_KEY);
  } catch (error) {
    console.error("Error retrieving user ID:", error);
    return null;
  }
};

/**
 * Set user data (UPDATED to include age fields)
 */
export const setUserData = async (
  userData: Partial<UserData>
): Promise<void> => {
  try {
    if (userData.id) {
      await AsyncStorage.setItem(USER_ID_KEY, userData.id);

      // Store individual user properties with user ID prefix
      const userId = userData.id;
      const updates: Array<[string, string]> = [];

      if (userData.username) {
        updates.push([`user_${userId}_username`, userData.username]);
      }
      if (userData.email) {
        updates.push([`user_${userId}_email`, userData.email]);
      }
      if (userData.displayName !== undefined) {
        updates.push([`user_${userId}_displayName`, userData.displayName]);
      }
      if (userData.bio !== undefined) {
        updates.push([`user_${userId}_bio`, userData.bio]);
      }
      if (userData.profileImageUrl !== undefined) {
        updates.push([
          `user_${userId}_profileImageUrl`,
          userData.profileImageUrl,
        ]);
      }
      if (userData.role) {
        updates.push([`user_${userId}_role`, userData.role]);
      }

      // NEW: Age-related fields
      if (userData.age !== undefined) {
        updates.push([`user_${userId}_age`, userData.age.toString()]);
      }
      if (userData.ageConfirmed !== undefined) {
        updates.push([
          `user_${userId}_ageConfirmed`,
          userData.ageConfirmed.toString(),
        ]);
      }
      if (userData.eligibleForDating !== undefined) {
        updates.push([
          `user_${userId}_eligibleForDating`,
          userData.eligibleForDating.toString(),
        ]);
      }

      // Store all updates in parallel
      await AsyncStorage.multiSet(updates);
    }
  } catch (error) {
    console.error("Error storing user data:", error);
  }
};

/**
 * Get user data (UPDATED to include age fields)
 */
export const getUserData = async (): Promise<UserData> => {
  try {
    const userId = await AsyncStorage.getItem(USER_ID_KEY);

    if (!userId) {
      return {
        id: "",
        username: "",
        email: "",
        displayName: undefined,
        bio: undefined,
        profileImageUrl: undefined,
        role: undefined,
        age: undefined,
        ageConfirmed: undefined,
        eligibleForDating: undefined,
      };
    }

    // Get all user data in parallel (including new age fields)
    const keys = [
      `user_${userId}_username`,
      `user_${userId}_email`,
      `user_${userId}_displayName`,
      `user_${userId}_bio`,
      `user_${userId}_profileImageUrl`,
      `user_${userId}_role`,
      // NEW: Age-related keys
      `user_${userId}_age`,
      `user_${userId}_ageConfirmed`,
      `user_${userId}_eligibleForDating`,
    ];

    const values = await AsyncStorage.multiGet(keys);
    const userData: UserData = {
      id: userId,
      username: "",
      email: "",
    };

    // Map values back to userData object
    values.forEach(([key, value]) => {
      if (value) {
        if (key.endsWith("_username")) userData.username = value;
        else if (key.endsWith("_email")) userData.email = value;
        else if (key.endsWith("_displayName")) userData.displayName = value;
        else if (key.endsWith("_bio")) userData.bio = value;
        else if (key.endsWith("_profileImageUrl"))
          userData.profileImageUrl = value;
        else if (key.endsWith("_role"))
          userData.role = value as "USER" | "ADMIN";
        // NEW: Age-related fields
        else if (key.endsWith("_age")) userData.age = parseInt(value);
        else if (key.endsWith("_ageConfirmed"))
          userData.ageConfirmed = value === "true";
        else if (key.endsWith("_eligibleForDating"))
          userData.eligibleForDating = value === "true";
      }
    });

    return userData;
  } catch (error) {
    console.error("Error retrieving user data:", error);
    return {
      id: "",
      username: "",
      email: "",
      displayName: undefined,
      bio: undefined,
      profileImageUrl: undefined,
      role: undefined,
      age: undefined,
      ageConfirmed: undefined,
      eligibleForDating: undefined,
    };
  }
};

/**
 * Clear all user data and authentication (UPDATED to include age fields)
 */
export const clearUserData = async (): Promise<void> => {
  try {
    // Get current user ID to clear user-specific data
    const userId = await AsyncStorage.getItem(USER_ID_KEY);

    // Get all keys to find user-specific ones
    const allKeys = await AsyncStorage.getAllKeys();
    const keysToRemove = [
      TOKEN_KEY,
      USER_ID_KEY,
      IS_AUTHENTICATED_KEY,
      ...allKeys.filter((key) => userId && key.startsWith(`user_${userId}_`)),
    ];

    await AsyncStorage.multiRemove(keysToRemove);
  } catch (error) {
    console.error("Error clearing user data:", error);
  }
};

/**
 * Get specific user property
 */
export const getUserProperty = async (
  property: string
): Promise<string | null> => {
  try {
    const userId = await AsyncStorage.getItem(USER_ID_KEY);
    if (!userId) return null;

    return await AsyncStorage.getItem(`user_${userId}_${property}`);
  } catch (error) {
    console.error(`Error retrieving user property ${property}:`, error);
    return null;
  }
};

/**
 * Set specific user property
 */
export const setUserProperty = async (
  property: string,
  value: string
): Promise<void> => {
  try {
    const userId = await AsyncStorage.getItem(USER_ID_KEY);
    if (!userId) {
      console.warn("Cannot set user property: No user ID found");
      return;
    }

    await AsyncStorage.setItem(`user_${userId}_${property}`, value);
  } catch (error) {
    console.error(`Error storing user property ${property}:`, error);
  }
};

/**
 * Get user badges (React Native version)
 */
export const getUserBadges = async (): Promise<string[]> => {
  try {
    const userId = await AsyncStorage.getItem(USER_ID_KEY);
    if (!userId) return [];

    const badges = await AsyncStorage.getItem(`user_${userId}_userBadges`);
    return badges ? JSON.parse(badges) : [];
  } catch (error) {
    console.error("Error retrieving user badges:", error);
    return [];
  }
};

/**
 * Set user badges (React Native version)
 */
export const setUserBadges = async (badges: string[]): Promise<void> => {
  try {
    const userId = await AsyncStorage.getItem(USER_ID_KEY);
    if (!userId) {
      console.warn("Cannot set user badges: No user ID found");
      return;
    }

    await AsyncStorage.setItem(
      `user_${userId}_userBadges`,
      JSON.stringify(badges)
    );
  } catch (error) {
    console.error("Error storing user badges:", error);
  }
};

/**
 * Get joined communities
 */
export const getJoinedCommunities = async (): Promise<string[]> => {
  try {
    const userId = await AsyncStorage.getItem(USER_ID_KEY);
    if (!userId) return [];

    const communities = await AsyncStorage.getItem(
      `user_${userId}_joinedCommunities`
    );
    return communities ? JSON.parse(communities) : [];
  } catch (error) {
    console.error("Error retrieving joined communities:", error);
    return [];
  }
};

/**
 * Set joined communities
 */
export const setJoinedCommunities = async (
  communities: string[]
): Promise<void> => {
  try {
    const userId = await AsyncStorage.getItem(USER_ID_KEY);
    if (!userId) {
      console.warn("Cannot set joined communities: No user ID found");
      return;
    }

    await AsyncStorage.setItem(
      `user_${userId}_joinedCommunities`,
      JSON.stringify(communities)
    );
  } catch (error) {
    console.error("Error storing joined communities:", error);
  }
};

// ============================================================================
// NEW: AGE-RELATED HELPER FUNCTIONS
// ============================================================================

/**
 * Check if user has confirmed their age for dating
 */
export const isAgeConfirmed = async (): Promise<boolean> => {
  try {
    const userData = await getUserData();
    return userData.ageConfirmed === true;
  } catch (error) {
    console.error("Error checking age confirmation:", error);
    return false;
  }
};

/**
 * Check if user is eligible for dating features
 */
export const isDatingEligible = async (): Promise<boolean> => {
  try {
    const userData = await getUserData();
    return userData.eligibleForDating === true;
  } catch (error) {
    console.error("Error checking dating eligibility:", error);
    return false;
  }
};

/**
 * Get user's age
 */
export const getUserAge = async (): Promise<number | null> => {
  try {
    const userData = await getUserData();
    return userData.age || null;
  } catch (error) {
    console.error("Error getting user age:", error);
    return null;
  }
};

/**
 * Update age-related data specifically
 */
export const updateAgeData = async (ageData: {
  age?: number;
  ageConfirmed?: boolean;
  eligibleForDating?: boolean;
}): Promise<void> => {
  try {
    const userId = await AsyncStorage.getItem(USER_ID_KEY);
    if (!userId) {
      console.warn("Cannot update age data: No user ID found");
      return;
    }

    const updates: Array<[string, string]> = [];

    if (ageData.age !== undefined) {
      updates.push([`user_${userId}_age`, ageData.age.toString()]);
    }
    if (ageData.ageConfirmed !== undefined) {
      updates.push([
        `user_${userId}_ageConfirmed`,
        ageData.ageConfirmed.toString(),
      ]);
    }
    if (ageData.eligibleForDating !== undefined) {
      updates.push([
        `user_${userId}_eligibleForDating`,
        ageData.eligibleForDating.toString(),
      ]);
    }

    if (updates.length > 0) {
      await AsyncStorage.multiSet(updates);
    }
  } catch (error) {
    console.error("Error updating age data:", error);
  }
};
