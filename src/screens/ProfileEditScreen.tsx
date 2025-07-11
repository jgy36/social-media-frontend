// src/screens/ProfileEditScreen.tsx
import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import ProfileSettings from "../components/settings/ProfileSettings";

const ProfileEditScreen = () => {
  const navigation = useNavigation();

  return (
    <View className="flex-1 bg-black">
      {/* Header */}
      <View className="bg-black/95 backdrop-blur-md pt-12 pb-4 px-4 border-b border-gray-800">
        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="mr-4 p-2"
            activeOpacity={0.7}
          >
            <MaterialIcons name="arrow-back" size={22} color="#ffffff" />
          </TouchableOpacity>
          <View>
            <Text className="text-xl font-bold text-white">Edit Profile</Text>
            <Text className="text-sm text-gray-400">
              Update your profile information
            </Text>
          </View>
        </View>
      </View>

      {/* Content */}
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        {/* Profile Settings Form - Consistent styling */}
        <View className="px-4 py-2">
          <View className="bg-gray-950 rounded-xl border border-gray-800 p-4">
            <ProfileSettings />
          </View>
        </View>

        {/* Additional Info */}
        <View className="px-4 py-2">
          <View className="bg-gray-950 rounded-xl border border-gray-800 p-4">
            <View className="flex-row items-center mb-3">
              <MaterialIcons name="info-outline" size={20} color="#6B7280" />
              <Text className="text-gray-300 font-medium ml-2">
                Profile Tips
              </Text>
            </View>

            <View className="space-y-2">
              <View className="flex-row items-start">
                <View className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 mr-3" />
                <Text className="text-gray-400 text-sm flex-1">
                  Add a profile photo to help others recognize you
                </Text>
              </View>

              <View className="flex-row items-start">
                <View className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 mr-3" />
                <Text className="text-gray-400 text-sm flex-1">
                  Write a bio that shows your personality and interests
                </Text>
              </View>

              <View className="flex-row items-start">
                <View className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 mr-3" />
                <Text className="text-gray-400 text-sm flex-1">
                  Choose a display name that's easy to remember
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Privacy Notice */}
        <View className="px-4 py-2">
          <View className="bg-blue-950/30 rounded-xl border border-blue-800/50 p-4">
            <View className="flex-row items-center mb-2">
              <MaterialIcons name="shield" size={18} color="#3B82F6" />
              <Text className="text-blue-400 font-medium ml-2 text-sm">
                Privacy & Safety
              </Text>
            </View>
            <Text className="text-gray-400 text-xs leading-5">
              Your profile information helps others find and connect with you.
              You can control who sees your posts in Privacy Settings.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default ProfileEditScreen;
