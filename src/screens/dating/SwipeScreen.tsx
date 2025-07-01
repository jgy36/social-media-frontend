// src/screens/dating/SwipeScreen.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  StatusBar,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { RootStackNavigationProp } from "@/navigation/types";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { isDatingProfileComplete, getUserMatches } from "@/api/dating";
import SwipeCards from "@/components/dating/SwipeCards";

const SwipeScreen = () => {
  const navigation = useNavigation<RootStackNavigationProp>();
  const user = useSelector((state: RootState) => state.user);

  const [hasCompletedProfile, setHasCompletedProfile] = useState(false);
  const [loading, setLoading] = useState(true);
  const [matchCount, setMatchCount] = useState(0);

  useEffect(() => {
    checkDatingProfile();
    loadMatchCount();
  }, []);

  const checkDatingProfile = async () => {
    try {
      const isComplete = await isDatingProfileComplete();
      setHasCompletedProfile(isComplete);

      if (!isComplete) {
        // Redirect to profile setup
        Alert.alert(
          "Complete Your Dating Profile",
          "You need to complete your dating profile before you can start swiping!",
          [
            {
              text: "Set Up Now",
              onPress: () => navigation.navigate("DatingSetup"),
            },
            {
              text: "Go Back",
              style: "cancel",
              onPress: () => navigation.goBack(),
            },
          ]
        );
      }
    } catch (error) {
      console.error("Failed to check dating profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadMatchCount = async () => {
    try {
      const matches = await getUserMatches();
      setMatchCount(matches.length);
    } catch (error) {
      console.error("Failed to load match count:", error);
    }
  };

  const handleNewMatch = (matchData: any) => {
    // Update match count
    setMatchCount((prev) => prev + 1);

    // Show match notification
    Alert.alert(
      "It's a Match! 💕",
      `You and ${
        matchData.user2.displayName || matchData.user2.username
      } liked each other!`,
      [
        {
          text: "Send Message",
          onPress: () =>
            navigation.navigate("PhotoConversation", {
              userId: matchData.user2.id,
            }),
        },
        {
          text: "Keep Swiping",
          style: "cancel",
        },
      ]
    );
  };

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleSettingsPress = () => {
    navigation.navigate("DatingSetup");
  };

  const handleMatchesPress = () => {
    // Navigate back to main Dating screen with matches tab
    navigation.navigate("Dating");
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-black items-center justify-center">
        <StatusBar barStyle="light-content" backgroundColor="#000000" />
        <Text className="text-white text-lg">Loading...</Text>
      </SafeAreaView>
    );
  }

  if (!hasCompletedProfile) {
    return (
      <SafeAreaView className="flex-1 bg-black">
        <StatusBar barStyle="light-content" backgroundColor="#000000" />

        {/* Header */}
        <View className="flex-row items-center justify-between px-4 py-3">
          <TouchableOpacity onPress={handleBackPress}>
            <MaterialIcons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-white text-lg font-semibold">Discover</Text>
          <View className="w-6" />
        </View>

        {/* Profile Setup Prompt */}
        <View className="flex-1 items-center justify-center px-8">
          <MaterialIcons name="favorite" size={80} color="#E91E63" />

          <Text className="text-white text-2xl font-bold text-center mt-6 mb-4">
            Complete Your Profile
          </Text>

          <Text className="text-gray-400 text-base text-center mb-8 leading-6">
            Add photos and complete your dating profile to start discovering
            amazing people near you.
          </Text>

          <TouchableOpacity
            onPress={() => navigation.navigate("DatingSetup")}
            className="bg-pink-500 rounded-full px-8 py-4 mb-4"
          >
            <Text className="text-white font-semibold text-lg">
              Complete Profile
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleBackPress} className="py-2">
            <Text className="text-gray-400 text-base">Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-black">
      <StatusBar barStyle="light-content" backgroundColor="#000000" />

      {/* Minimal Header */}
      <View className="flex-row items-center justify-between px-4 py-3">
        <TouchableOpacity onPress={handleBackPress}>
          <MaterialIcons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>

        <View className="flex-row items-center">
          <MaterialIcons name="favorite" size={20} color="#E91E63" />
          <Text className="text-white text-lg font-semibold ml-2">
            Discover
          </Text>
        </View>

        <View className="flex-row">
          {/* Matches Button */}
          <TouchableOpacity
            onPress={handleMatchesPress}
            className="mr-3 relative"
          >
            <MaterialIcons name="people" size={24} color="white" />
            {matchCount > 0 && (
              <View className="absolute -top-2 -right-2 bg-pink-500 rounded-full min-w-[18px] h-[18px] items-center justify-center">
                <Text className="text-white text-xs font-bold">
                  {matchCount > 99 ? "99+" : matchCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
          // ADD this button somewhere in your ProfileScreen.tsx (near other
          buttons/options) // Debug Button
          <TouchableOpacity
            onPress={() => navigation.navigate("Debug")}
            style={{
              backgroundColor: "#E91E63",
              padding: 15,
              borderRadius: 8,
              marginVertical: 10,
              alignItems: "center",
            }}
          >
            <Text
              style={{
                color: "white",
                fontWeight: "bold",
                fontSize: 16,
              }}
            >
              🐛 Dating Debug & Mock Users
            </Text>
          </TouchableOpacity>
          // end debug button // Make sure you import navigation at the top: //
          import {useNavigation} from "@react-navigation/native"; // const
          navigation = useNavigation();
          {/* Settings Button */}
          <TouchableOpacity onPress={handleSettingsPress}>
            <MaterialIcons name="settings" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Swipe Cards - Full Screen Experience */}
      <View className="flex-1">
        <SwipeCards onMatch={handleNewMatch} />
      </View>

      {/* Bottom Tip */}
      <View className="px-4 pb-2">
        <Text className="text-center text-gray-500 text-xs">
          Swipe right to like • Swipe left to pass • Tap buttons to choose
        </Text>
      </View>
    </SafeAreaView>
  );
};

export default SwipeScreen;
