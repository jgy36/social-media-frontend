// src/api/mockData.ts - CREATE THIS FILE
import { apiClient, safeApiCall } from "./apiClient";

/**
 * Generate mock users for testing dating functionality
 */
export const generateMockUsers = async (count: number = 20): Promise<void> => {
  return safeApiCall(async () => {
    console.log(`🎭 Generating ${count} mock users...`);
    const response = await apiClient.post("/dating/generate-mock-users", null, {
      params: { count },
    });
    console.log("✅ Mock users generated:", response.data);
    return response.data;
  }, "Failed to generate mock users");
};

/**
 * Clear all mock data
 */
export const clearMockData = async (): Promise<void> => {
  return safeApiCall(async () => {
    console.log("🧹 Clearing mock data...");
    const response = await apiClient.delete("/dating/clear-mock-data");
    console.log("✅ Mock data cleared:", response.data);
    return response.data;
  }, "Failed to clear mock data");
};
