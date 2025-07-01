// src/screens/dating/DatingDebugScreen.tsx - Updated with MatchTestingInterface
import React, { useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { generateMockUsers, clearMockData } from "@/api/mockData";
import { getPotentialMatches, getUserMatches } from "@/api/dating";
import { apiClient } from "@/api/apiClient";
import type { RootStackNavigationProp } from "@/navigation/types";
import MatchTestingInterface from "@/components/debug/MatchTestingInterface";

const DatingDebugScreen: React.FC = () => {
  const navigation = useNavigation<RootStackNavigationProp>();
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    potentialMatches: 0,
    currentMatches: 0,
  });

  const handleGenerateMockUsers = async (count: number) => {
    try {
      setLoading(true);
      await generateMockUsers(count);
      Alert.alert("Success", `Generated ${count} mock users!`);
      await refreshStats();
    } catch (error) {
      console.error("Failed to generate mock users:", error);
      Alert.alert(
        "Error",
        "Failed to generate mock users. Check console logs."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClearMockData = async () => {
    Alert.alert(
      "Clear Mock Data",
      "This will delete all mock users and their profiles. Are you sure?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              setLoading(true);
              await clearMockData();
              Alert.alert("Success", "Mock data cleared!");
              await refreshStats();
            } catch (error) {
              console.error("Failed to clear mock data:", error);
              Alert.alert(
                "Error",
                "Failed to clear mock data. Check console logs."
              );
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleDatabaseDebug = async () => {
    try {
      setLoading(true);
      console.log("🔍 Checking database...");

      const response = await apiClient.get("/dating/debug/database");
      const data = response.data;

      console.log("📊 Database Debug:", JSON.stringify(data, null, 2));

      Alert.alert(
        "Database Debug",
        `Database Contents:
• Total Users: ${data.totalUsers}
• Mock Users: ${data.mockUsers}
• Dating Profiles: ${data.totalDatingProfiles}
• Active Profiles: ${data.activeDatingProfiles}
• Potential Matches: ${data.potentialMatchesFromQuery}
• Your ID: ${data.currentUserId}

Check console for full details!`,
        [{ text: "OK" }]
      );
    } catch (error) {
      console.error("❌ Database debug failed:", error);
      Alert.alert("Error", "Database debug failed. Check console.");
    } finally {
      setLoading(false);
    }
  };

  const refreshStats = async () => {
    try {
      const [potential, matches] = await Promise.all([
        getPotentialMatches(),
        getUserMatches(),
      ]);

      setStats({
        potentialMatches: potential.length,
        currentMatches: matches.length,
      });
    } catch (error) {
      console.error("Failed to refresh stats:", error);
    }
  };

  React.useEffect(() => {
    refreshStats();
  }, []);

  const mockUserCounts = [5, 10, 20, 50];

  return (
    <SafeAreaView className="flex-1 bg-black">
      <StatusBar style="light" />

      {/* Header */}
      <View className="flex-row items-center justify-between px-6 py-4 border-b border-gray-800">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={28} color="white" />
        </TouchableOpacity>
        <Text className="text-white text-xl font-bold">Dating Debug</Text>
        <TouchableOpacity onPress={refreshStats}>
          <MaterialIcons name="refresh" size={28} color="#E91E63" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-6 py-4">
        {/* Stats Section */}
        <View className="bg-gray-900 rounded-xl p-6 mb-6">
          <Text className="text-white text-lg font-bold mb-4">
            Current Stats
          </Text>

          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-gray-400">Potential Matches:</Text>
            <Text className="text-white font-semibold">
              {stats.potentialMatches}
            </Text>
          </View>

          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-gray-400">Your Matches:</Text>
            <Text className="text-white font-semibold">
              {stats.currentMatches}
            </Text>
          </View>

          <TouchableOpacity
            onPress={refreshStats}
            className="bg-blue-500 rounded-lg py-3 mb-3"
          >
            <Text className="text-white text-center font-semibold">
              Refresh Stats
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleDatabaseDebug}
            className="bg-purple-500 rounded-lg py-3"
            disabled={loading}
            style={{ opacity: loading ? 0.6 : 1 }}
          >
            <Text className="text-white text-center font-semibold">
              🔍 Check Database
            </Text>
          </TouchableOpacity>
        </View>

        {/* 🎯 MATCH TESTING SECTION - Added here */}
        <View className="bg-gray-900 rounded-xl p-6 mb-6">
          <Text className="text-white text-lg font-bold mb-4">
            🎯 Match Testing
          </Text>
          <Text className="text-gray-400 mb-4">
            Test the matching system by creating pre-existing likes and checking
            match status.
          </Text>

          {/* This is where the MatchTestingInterface component goes */}
          <MatchTestingInterface />
        </View>

        {/* Mock Data Generation */}
        <View className="bg-gray-900 rounded-xl p-6 mb-6">
          <Text className="text-white text-lg font-bold mb-4">
            Generate Mock Users
          </Text>
          <Text className="text-gray-400 mb-4">
            Create fake users with dating profiles for testing the swiping
            functionality.
          </Text>

          <View className="flex-row flex-wrap gap-3 mb-4">
            {mockUserCounts.map((count) => (
              <TouchableOpacity
                key={count}
                onPress={() => handleGenerateMockUsers(count)}
                disabled={loading}
                className="bg-pink-500 rounded-lg px-4 py-3 flex-1 min-w-[80px]"
                style={{ opacity: loading ? 0.6 : 1 }}
              >
                <Text className="text-white text-center font-semibold">
                  {count} Users
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {loading && (
            <View className="flex-row items-center justify-center py-2">
              <ActivityIndicator size="small" color="#E91E63" />
              <Text className="text-gray-400 ml-2">Working...</Text>
            </View>
          )}
        </View>

        {/* Danger Zone */}
        <View className="bg-gray-900 rounded-xl p-6 border border-red-800 mb-6">
          <Text className="text-red-400 text-lg font-bold mb-4">
            ⚠️ Danger Zone
          </Text>
          <Text className="text-gray-400 mb-4">
            This will permanently delete all mock users and their dating
            profiles.
          </Text>

          <TouchableOpacity
            onPress={handleClearMockData}
            disabled={loading}
            className="bg-red-500 rounded-lg py-3"
            style={{ opacity: loading ? 0.6 : 1 }}
          >
            <Text className="text-white text-center font-semibold">
              Clear All Mock Data
            </Text>
          </TouchableOpacity>
        </View>

        {/* Quick Actions */}
        <View className="bg-gray-900 rounded-xl p-6 mb-6">
          <Text className="text-white text-lg font-bold mb-4">
            Quick Actions
          </Text>

          <TouchableOpacity
            onPress={() => navigation.navigate("DatingSetup")}
            className="bg-green-500 rounded-lg py-3 mb-3"
          >
            <Text className="text-white text-center font-semibold">
              Edit Dating Profile
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate("Dating")}
            className="bg-blue-500 rounded-lg py-3"
          >
            <Text className="text-white text-center font-semibold">
              Go to Dating Screen
            </Text>
          </TouchableOpacity>
        </View>

        {/* Bottom spacing */}
        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
};

export default DatingDebugScreen;
