// src/api/auth.ts - Updated with birthday registration
import { apiClient, safeApiCall } from "./apiClient";
import { LoginRequest, AuthResponse, ApiResponse } from "./types";
import {
  setToken,
  setUserData,
  clearUserData,
  getUserData,
  setAuthenticated,
  getUserId,
} from "@/utils/tokenUtils";
import { getToken } from "@/utils/tokenUtils";

// Updated registration interface to include birthday
export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  displayName: string;
  dateOfBirth: string; // YYYY-MM-DD format
}

/**
 * Login a user - React Native version
 */
export const login = async (
  credentials: LoginRequest
): Promise<AuthResponse> => {
  return safeApiCall(async () => {
    try {
      const response = await apiClient.post<AuthResponse>(
        "/auth/login",
        credentials,
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

      // Check if 2FA is required
      if (response.data.requires2FA) {
        return response.data;
      }

      // If we get a token from the server (normal login), store it
      if (response.data.token) {
        await setToken(response.data.token);
        await setAuthenticated(true);

        // Store user info in AsyncStorage
        if (response.data.user?.id) {
          await setUserData({
            id: response.data.user.id.toString(),
            username: response.data.user.username || "",
            email: response.data.user.email || "",
            displayName: response.data.user.displayName || undefined,
            bio: response.data.user.bio || undefined,
            profileImageUrl: response.data.user.profileImageUrl || undefined,
            role: (response.data.user.role as "USER" | "ADMIN") || "USER",
          });
        }
      }

      return response.data;
    } catch (error: any) {
      // Handle specific error cases
      if (error.response?.data?.errorCode === "EMAIL_NOT_VERIFIED") {
        throw new Error(
          error.response.data.message ||
            "Please verify your email before logging in"
        );
      }
      throw error;
    }
  }, "Login error");
};

/**
 * Register a new user with birthday - React Native version
 */
export const register = async (
  userData: RegisterRequest
): Promise<ApiResponse<AuthResponse>> => {
  return safeApiCall(async () => {
    console.log("Registering user with data:", {
      ...userData,
      password: "********", // Hide password in logs
    });

    const response = await apiClient.post<ApiResponse<AuthResponse>>(
      "/auth/register",
      userData
    );

    // Store user data in AsyncStorage for immediate access
    if (response.data.success && response.data.data?.user) {
      const user = response.data.data.user;

      // Set all userData in AsyncStorage
      if (user.id) {
        const userId = user.id.toString();
        await setUserData({
          id: userId,
          username: user.username,
          email: user.email,
          displayName:
            user.displayName || userData.displayName || userData.username,
          bio: user.bio,
          profileImageUrl: user.profileImageUrl,
        });

        await setAuthenticated(true);
        console.log("User data stored with ID:", user.id);
      }
    }

    return response.data;
  }, "Registration error");
};

/**
 * Logout the current user - React Native version
 */
export const logout = async (): Promise<void> => {
  try {
    // Get the current user ID before logout
    const currentUserId = await getUserId();

    // Call logout endpoint
    await apiClient.post("/auth/logout", {});

    // Clean up all storage
    await clearUserData();
  } catch (err) {
    console.error("Logout error:", err);
    // Continue with local logout even if API call fails
    await clearUserData();
  }
};

/**
 * Refresh the authentication token - React Native version
 */
export const refreshToken = async (): Promise<boolean> => {
  return safeApiCall(async () => {
    const response = await apiClient.post<{ token?: string }>(
      "/auth/refresh",
      {}
    );

    // If we receive a token from the server, store it
    if (response.data && response.data.token) {
      await setToken(response.data.token);
    }

    // Mark as authenticated since the token was refreshed
    await setAuthenticated(true);

    return true;
  }, "Token refresh error");
};

/**
 * Check the current authentication status - React Native version
 */
export const checkAuthStatus = async (): Promise<boolean> => {
  try {
    // Check if a token exists first
    const token = await getToken();
    if (!token) {
      console.log("No token found, skipping auth check");
      await setAuthenticated(false);
      return false;
    }

    // Only make API call if token exists
    const response = await apiClient.get<{
      id?: number;
      username?: string;
      email?: string;
      displayName?: string;
      bio?: string;
      profileImageUrl?: string;
      age?: number; // NEW: Include age from birthday
      ageConfirmed?: boolean; // NEW: Include age confirmation status
      eligibleForDating?: boolean; // NEW: Include dating eligibility
    }>("/users/me");

    // If successful, update current user info
    if (response.data && response.data.id) {
      // Mark as authenticated
      await setAuthenticated(true);

      // Store user data including new age-related fields
      await setUserData({
        id: response.data.id.toString(),
        username: response.data.username || "",
        email: response.data.email || "",
        displayName: response.data.displayName || undefined,
        bio: response.data.bio || undefined,
        profileImageUrl: response.data.profileImageUrl || undefined,
        age: response.data.age, // NEW: Store calculated age
        ageConfirmed: response.data.ageConfirmed, // NEW: Store age confirmation status
        eligibleForDating: response.data.eligibleForDating, // NEW: Store dating eligibility
      });

      return true;
    }

    return false;
  } catch (err) {
    console.error("Auth status check failed:", err);
    await setAuthenticated(false);
    return false;
  }
};

/**
 * Get current user information - React Native version
 * Returns an object with user data from AsyncStorage including age info
 */
export const getCurrentUserInfo = async (): Promise<{
  userId: string | null;
  username: string | null;
  email: string | null;
  displayName: string | null;
  bio: string | null;
  profileImageUrl: string | null;
  age: number | null; // NEW: Include age
  ageConfirmed: boolean | null; // NEW: Include age confirmation
  eligibleForDating: boolean | null; // NEW: Include dating eligibility
}> => {
  const userData = await getUserData();

  return {
    userId: userData.id || null,
    username: userData.username || null,
    email: userData.email || null,
    displayName: userData.displayName || null,
    bio: userData.bio || null,
    profileImageUrl: userData.profileImageUrl || null,
    age: userData.age || null, // NEW
    ageConfirmed: userData.ageConfirmed || null, // NEW
    eligibleForDating: userData.eligibleForDating || null, // NEW
  };
};

/**
 * Check and restore user session - React Native version
 */
export const checkAndRestoreSession = async (): Promise<boolean> => {
  try {
    // First check if we're actually authenticated with the server
    const isAuthenticated = await checkAuthStatus();

    if (!isAuthenticated) {
      return false;
    }

    return true;
  } catch (err) {
    console.error("Error restoring session:", err);
    return false;
  }
};

/**
 * Login with communities - React Native version
 */
export const loginWithCommunities = async (
  credentials: LoginRequest
): Promise<AuthResponse> => {
  try {
    // First perform the normal login
    const loginResponse = await login(credentials);

    // If login successful, now restore communities
    if (loginResponse && loginResponse.token) {
      try {
        // Import redux store and thunks
        const { store } = await import("@/redux/store");
        const { fetchAndRestoreUserCommunities } = await import(
          "@/redux/slices/communitySlice"
        );

        // Dispatch the thunk to restore communities
        store.dispatch(fetchAndRestoreUserCommunities());

        console.log("Communities restoration initiated");
      } catch (communitiesError) {
        console.error(
          "Error restoring communities after login:",
          communitiesError
        );
      }
    }

    return loginResponse;
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
};

/**
 * Response type for username availability check
 */
interface UsernameAvailabilityResponse {
  available: boolean;
  message?: string;
}

/**
 * Verify 2FA code and complete login - React Native version
 */
export const verify2FA = async (
  tempToken: string,
  code: string
): Promise<AuthResponse> => {
  return safeApiCall(async () => {
    const response = await apiClient.post<AuthResponse>(
      "/auth/verify-2fa",
      {
        tempToken,
        code,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      }
    );

    // If verification successful, store token and user data
    if (response.data.token) {
      await setToken(response.data.token);
      await setAuthenticated(true);

      // Store user info in AsyncStorage
      if (response.data.user?.id) {
        await setUserData({
          id: response.data.user.id.toString(),
          username: response.data.user.username || "",
          email: response.data.user.email || "",
          displayName: response.data.user.displayName || undefined,
          bio: response.data.user.bio || undefined,
          profileImageUrl: response.data.user.profileImageUrl || undefined,
          role: (response.data.user.role as "USER" | "ADMIN") || "USER",
        });
      }
    }

    return response.data;
  }, "2FA verification failed");
};

/**
 * Check if a username is available - React Native version
 */
export const checkUsernameAvailability = async (
  username: string
): Promise<{
  available: boolean;
  message: string | null;
}> => {
  if (!username || username.length < 3) {
    return {
      available: false,
      message: "Username must be at least 3 characters",
    };
  }

  try {
    const response = await apiClient.post<UsernameAvailabilityResponse>(
      `/auth/check-username`,
      { username },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    return {
      available: response.data.available,
      message: response.data.message || null,
    };
  } catch (error: unknown) {
    console.error("Error checking username availability:", error);
    return {
      available: false,
      message: "Error checking username availability. Please try again.",
    };
  }
};

// NEW: Verify email functions for birthday registration
/**
 * Verify email with code
 */
export const verifyEmailCode = async (
  code: string
): Promise<{
  success: boolean;
  message?: string;
  error?: string;
}> => {
  return safeApiCall(async () => {
    const response = await apiClient.post("/auth/verify-email", { code });
    return response.data;
  }, "Failed to verify email");
};

/**
 * Resend verification email
 */
export const resendVerificationEmail = async (
  email: string
): Promise<{
  success: boolean;
  message?: string;
  error?: string;
}> => {
  return safeApiCall(async () => {
    const response = await apiClient.post("/auth/resend-verification", {
      email,
    });
    return response.data;
  }, "Failed to resend verification email");
};

/**
 * Request password reset
 */
export const requestPasswordReset = async (
  email: string
): Promise<{
  success: boolean;
  message?: string;
  error?: string;
}> => {
  return safeApiCall(async () => {
    const response = await apiClient.post("/auth/forgot-password", { email });
    return response.data;
  }, "Failed to request password reset");
};

/**
 * Reset password with token
 */
export const resetPassword = async (
  token: string,
  newPassword: string
): Promise<{
  success: boolean;
  message?: string;
  error?: string;
}> => {
  return safeApiCall(async () => {
    const response = await apiClient.post("/auth/reset-password", {
      token,
      newPassword,
    });
    return response.data;
  }, "Failed to reset password");
};
