// src/screens/ProfileScreen.tsx - Complete with updated layout and new fields
import { MaterialIcons } from "@expo/vector-icons";
import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from "react-native";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { getCurrentDatingProfile, isDatingProfileComplete } from "@/api/dating";

import UserBadges from "../components/profile/UserBadges";
import UserStats from "../components/profile/UserStats";
import ProfilePosts from "../components/profile/ProfilePosts";

// Silent error boundary - keeps components working without visible errors
const ErrorBoundary = ({
  children,
  fallback = null,
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) => {
  try {
    return <>{children}</>;
  } catch (error) {
    console.error("Component error:", error);
    return <>{fallback}</>;
  }
};

const ProfileScreen = () => {
  const navigation = useNavigation();
  const user = useSelector((state: RootState) => state.user);
  const [activeTab, setActiveTab] = useState<"social" | "dating">("social");
  const [datingProfile, setDatingProfile] = useState<any>(null);
  const [hasDatingProfile, setHasDatingProfile] = useState(false);

  const checkDatingProfile = useCallback(async () => {
    try {
      console.log("🔄 Refreshing dating profile...");
      const hasProfile = await isDatingProfileComplete();
      setHasDatingProfile(hasProfile);

      if (hasProfile) {
        const profile = await getCurrentDatingProfile();
        console.log("📸 Loaded photos:", profile?.photos);
        setDatingProfile(profile);

        // ADD THESE NEW CONSOLE LOGS HERE:
        console.log("🔍 Loaded dating profile:", profile);
        console.log("📊 Vitals & Vices:", {
          hasChildren: profile?.hasChildren,
          wantChildren: profile?.wantChildren,
          drinking: profile?.drinking,
          smoking: profile?.smoking,
          drugs: profile?.drugs,
          lookingFor: profile?.lookingFor,
        });
      } else {
        setDatingProfile(null);
      }
    } catch (error) {
      console.error("Failed to check dating profile:", error);
    }
  }, []);

  // Initial load on mount
  useEffect(() => {
    checkDatingProfile();
  }, [checkDatingProfile]);

  // Refresh when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      console.log("📱 ProfileScreen focused - refreshing profile");
      checkDatingProfile();
    }, [checkDatingProfile])
  );

  const navigateToSettings = () => {
    navigation.navigate("Settings" as never);
  };

  const setupDatingProfile = () => {
    navigation.navigate("DatingSetup" as never);
  };

  const userId = user.id;

  return (
    <SafeAreaView
      className="flex-1"
      style={{
        backgroundColor: activeTab === "dating" ? "#f8f9fa" : "#000000",
      }}
    >
      {/* Header */}
      <View
        className="border-b"
        style={{
          backgroundColor:
            activeTab === "dating" ? "#ffffff" : "rgba(0,0,0,0.95)",
          borderBottomColor: activeTab === "dating" ? "#e5e7eb" : "#374151",
        }}
      >
        <View className="flex-row justify-between items-center px-4 py-3 pt-12">
          <View className="flex-1">
            <Text
              className="text-xl font-bold"
              style={{ color: activeTab === "dating" ? "#000000" : "#ffffff" }}
            >
              {user.displayName || user.username}
            </Text>
            <Text
              className="text-sm"
              style={{ color: activeTab === "dating" ? "#6b7280" : "#9ca3af" }}
            >
              @{user.username}
            </Text>
          </View>
          <TouchableOpacity
            onPress={navigateToSettings}
            className="p-2"
            activeOpacity={0.7}
          >
            <MaterialIcons
              name="settings"
              size={24}
              color={activeTab === "dating" ? "#000000" : "#ffffff"}
            />
          </TouchableOpacity>
        </View>

        {/* Tab Selector */}
        <View className="flex-row px-4 pb-3">
          <TouchableOpacity
            onPress={() => setActiveTab("social")}
            className="mr-8 pb-2"
            style={{
              borderBottomWidth: activeTab === "social" ? 2 : 0,
              borderBottomColor:
                activeTab === "social" ? "#3b82f6" : "transparent",
            }}
          >
            <Text
              className="text-base font-medium"
              style={{
                color:
                  activeTab === "social"
                    ? activeTab === "dating"
                      ? "#000000"
                      : "#ffffff"
                    : activeTab === "dating"
                    ? "#6b7280"
                    : "#9ca3af",
              }}
            >
              Social
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveTab("dating")}
            className="pb-2"
            style={{
              borderBottomWidth: activeTab === "dating" ? 2 : 0,
              borderBottomColor:
                activeTab === "dating" ? "#ec4899" : "transparent",
            }}
          >
            <Text
              className="text-base font-medium"
              style={{
                color:
                  activeTab === "dating"
                    ? activeTab === "dating"
                      ? "#000000"
                      : "#ffffff"
                    : activeTab === "dating"
                    ? "#6b7280"
                    : "#9ca3af",
              }}
            >
              Dating
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {activeTab === "social" ? (
          // Social Media Profile (keep existing)
          <>
            <View className="px-4 py-6">
              <View className="flex-row justify-between items-start mb-6">
                <View className="flex-1 mr-4">
                  <Image
                    source={{
                      uri:
                        user.profileImageUrl ||
                        `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`,
                    }}
                    className="w-20 h-20 rounded-full border-2 border-gray-700 mb-4"
                  />
                  <View className="mb-3">
                    <Text className="text-xl font-bold text-white mb-1">
                      {user.displayName || user.username}
                    </Text>
                    <Text className="text-gray-400 text-base">
                      @{user.username}
                    </Text>
                  </View>
                  {user.bio && (
                    <Text className="text-white text-sm leading-5 mb-3">
                      {user.bio}
                    </Text>
                  )}
                  <View className="flex-row items-center">
                    <MaterialIcons
                      name="calendar-today"
                      size={14}
                      color="#71767b"
                    />
                    <Text className="ml-2 text-sm text-gray-400">
                      Joined{" "}
                      {(user as any).joinDate
                        ? new Date((user as any).joinDate).toLocaleDateString(
                            "en-US",
                            {
                              month: "long",
                              year: "numeric",
                            }
                          )
                        : "Recently"}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={navigateToSettings}
                  className="border border-gray-600 px-4 py-2 rounded-full"
                >
                  <Text className="text-white text-sm font-medium">
                    Edit profile
                  </Text>
                </TouchableOpacity>
              </View>

              {userId && (
                <ErrorBoundary>
                  <View className="mb-6">
                    <UserStats userId={userId} />
                  </View>
                </ErrorBoundary>
              )}

              {userId && (
                <ErrorBoundary>
                  <View className="mb-6">
                    <UserBadges userId={userId} isCurrentUser={true} />
                  </View>
                </ErrorBoundary>
              )}
            </View>

            <View className="border-b border-gray-800">
              <View className="px-4">
                <View className="flex-row">
                  <TouchableOpacity className="mr-8 pb-4">
                    <Text className="text-white font-semibold text-base">
                      Posts
                    </Text>
                    <View className="mt-2 h-0.5 w-12 bg-blue-500 rounded-full" />
                  </TouchableOpacity>
                  <TouchableOpacity className="mr-8 pb-4">
                    <Text className="text-gray-400 font-medium text-base">
                      Replies
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity className="mr-8 pb-4">
                    <Text className="text-gray-400 font-medium text-base">
                      Media
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity className="pb-4">
                    <Text className="text-gray-400 font-medium text-base">
                      Likes
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <View className="bg-black">
              <ErrorBoundary
                fallback={
                  <View className="p-6 items-center">
                    <MaterialIcons name="post-add" size={48} color="#71767b" />
                    <Text className="text-gray-400 text-sm mt-2">
                      Unable to load posts
                    </Text>
                  </View>
                }
              >
                <ProfilePosts />
              </ErrorBoundary>
            </View>
          </>
        ) : (
          // Dating Profile - Updated Layout with Bio Between Photos
          <View>
            {hasDatingProfile && datingProfile ? (
              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Edit Profile Button */}
                <View className="mx-4 mt-2 mb-4">
                  <TouchableOpacity
                    onPress={setupDatingProfile}
                    className="bg-black rounded-full py-3 px-6 shadow-lg"
                  >
                    <Text className="text-white text-center font-semibold text-base">
                      Edit Profile
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Move Name Above First Photo */}
                <View className="mx-4 mt-4">
                  <Text className="text-3xl font-bold text-gray-800 mb-2">
                    {user.displayName || user.username}, {datingProfile.age}
                  </Text>
                </View>

                {/* First Photo Card */}
                <View className="mx-4 mt-4 bg-white rounded-3xl overflow-hidden shadow-lg">
                  <Image
                    source={{
                      uri:
                        (datingProfile.photos && datingProfile.photos[0]) ||
                        `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`,
                    }}
                    className="w-full h-[450px]"
                    resizeMode="cover"
                    key={datingProfile.photos?.[0] || "default"}
                  />
                </View>

                {/* Bio Card */}
                <View className="mx-4 mt-4 bg-white rounded-3xl p-6 shadow-lg">
                  <Text className="text-gray-800 text-lg leading-6">
                    {datingProfile.bio}
                  </Text>
                </View>

                {/* Combined Vitals, Lifestyle & Looking For Card */}
                <View className="mx-4 mt-4 bg-white rounded-3xl p-6 shadow-lg">
                  {/* Vitals Section (stacked, no bubbles) */}
                  <View className="space-y-3 mb-6">
                    {datingProfile.height && (
                      <View className="flex-row items-center">
                        <MaterialIcons name="height" size={20} color="#666" />
                        <Text className="ml-3 text-gray-800 text-base">
                          {datingProfile.height}
                        </Text>
                      </View>
                    )}

                    {datingProfile.location && (
                      <View className="flex-row items-center">
                        <MaterialIcons
                          name="location-on"
                          size={20}
                          color="#666"
                        />
                        <Text className="ml-3 text-gray-800 text-base">
                          {datingProfile.location}
                        </Text>
                      </View>
                    )}

                    {datingProfile.job && (
                      <View className="flex-row items-center">
                        <MaterialIcons name="work" size={20} color="#666" />
                        <Text className="ml-3 text-gray-800 text-base">
                          {datingProfile.job}
                        </Text>
                      </View>
                    )}

                    {datingProfile.hasChildren && (
                      <View className="flex-row items-center">
                        <MaterialIcons
                          name="child-care"
                          size={20}
                          color="#666"
                        />
                        <Text className="ml-3 text-gray-800 text-base">
                          {datingProfile.hasChildren}
                        </Text>
                      </View>
                    )}

                    {datingProfile.wantChildren && (
                      <View className="flex-row items-center">
                        <MaterialIcons name="favorite" size={20} color="#666" />
                        <Text className="ml-3 text-gray-800 text-base">
                          {datingProfile.wantChildren}
                        </Text>
                      </View>
                    )}

                    {datingProfile.drinking && (
                      <View className="flex-row items-center">
                        <Text className="text-gray-800 text-base mr-3">🍷</Text>
                        <Text className="text-gray-800 text-base">
                          {datingProfile.drinking}
                        </Text>
                      </View>
                    )}

                    {datingProfile.smoking &&
                      datingProfile.smoking !== "No" && (
                        <View className="flex-row items-center">
                          <Text className="text-gray-800 text-base mr-3">
                            🚬
                          </Text>
                          <Text className="text-gray-800 text-base">
                            {datingProfile.smoking}
                          </Text>
                        </View>
                      )}

                    {datingProfile.drugs && datingProfile.drugs !== "No" && (
                      <View className="flex-row items-center">
                        <MaterialIcons
                          name="local-pharmacy"
                          size={20}
                          color="#666"
                        />
                        <Text className="ml-3 text-gray-800 text-base">
                          {datingProfile.drugs} drugs
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* Lifestyle Section (stacked, no bubbles) */}
                  {(datingProfile.religion ||
                    datingProfile.relationshipType ||
                    datingProfile.lifestyle) && (
                    <View className="space-y-3 mb-6 pt-4 border-t border-gray-200">
                      {datingProfile.religion && (
                        <View className="flex-row items-center">
                          <MaterialIcons name="church" size={20} color="#666" />
                          <Text className="ml-3 text-gray-800 text-base">
                            {datingProfile.religion}
                          </Text>
                        </View>
                      )}

                      {datingProfile.relationshipType && (
                        <View className="flex-row items-center">
                          <MaterialIcons
                            name="favorite"
                            size={20}
                            color="#666"
                          />
                          <Text className="ml-3 text-gray-800 text-base">
                            {datingProfile.relationshipType}
                          </Text>
                        </View>
                      )}

                      {datingProfile.lifestyle && (
                        <View className="flex-row items-center">
                          <MaterialIcons name="people" size={20} color="#666" />
                          <Text className="ml-3 text-gray-800 text-base">
                            {datingProfile.lifestyle}
                          </Text>
                        </View>
                      )}
                    </View>
                  )}

                  {/* Looking For Section */}
                  {datingProfile.lookingFor && (
                    <View className="pt-4 border-t border-gray-200">
                      <Text className="text-gray-600 text-sm font-medium mb-2">
                        Looking for
                      </Text>
                      <Text className="text-gray-800 text-base leading-6">
                        {datingProfile.lookingFor}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Remove the old separate cards - Basic Info Card, horizontal sliding bar, etc. */}

                {/* Additional Photos with Prompts Between */}
                {datingProfile.photos &&
                  datingProfile.photos.length > 1 &&
                  datingProfile.photos
                    .slice(1)
                    .map((photo: string, index: number) => (
                      <View key={`photo-section-${index}`}>
                        {/* Photo Card */}
                        <View className="mx-4 mt-4 bg-white rounded-3xl overflow-hidden shadow-lg">
                          <Image
                            source={{ uri: photo }}
                            className="w-full h-[450px]"
                            resizeMode="cover"
                            key={photo}
                          />
                        </View>

                        {/* Prompt Card (if available) */}
                        {datingProfile.prompts &&
                          datingProfile.prompts[index] &&
                          datingProfile.prompts[index].question && (
                            <View className="mx-4 mt-4 bg-white rounded-3xl p-6 shadow-lg">
                              <Text className="text-gray-600 text-sm font-medium mb-2">
                                {datingProfile.prompts[index].question}
                              </Text>
                              <Text className="text-gray-800 text-lg leading-6">
                                {datingProfile.prompts[index].answer}
                              </Text>
                            </View>
                          )}
                      </View>
                    ))}

                <View className="h-8" />
              </ScrollView>
            ) : (
              // No Dating Profile - Setup Prompt
              <View className="items-center py-16 px-4">
                <MaterialIcons name="favorite" size={80} color="#E91E63" />

                <Text className="text-gray-800 text-2xl font-bold text-center mt-6 mb-4">
                  Set Up Your Dating Profile
                </Text>

                <Text className="text-gray-600 text-base text-center mb-8 leading-6">
                  Create your dating profile to start meeting amazing people.
                  Add photos, write about yourself, and set your preferences.
                </Text>

                <TouchableOpacity
                  onPress={setupDatingProfile}
                  className="bg-pink-500 rounded-full px-8 py-4"
                >
                  <Text className="text-white font-semibold text-lg">
                    Get Started
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {/* Bottom spacing for tab bar */}
        <View className="h-20" />
      </ScrollView>
    </SafeAreaView>
  );
  // Add this button somewhere in your ProfileScreen.tsx
  <TouchableOpacity
    onPress={() => navigation.navigate("Debug")}
    className="bg-gray-800 rounded-lg py-3 px-4 mb-3"
  >
    <Text className="text-white text-center font-semibold">
      🐛 Debug & Testing
    </Text>
  </TouchableOpacity>;
};

export default ProfileScreen;
