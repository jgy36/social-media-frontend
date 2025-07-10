// src/screens/FeedScreen.tsx - Fixed Modal Layout
import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";
import PostList from "../components/feed/PostList";
import PostForm from "../components/feed/PostForm";

type FeedTab = "for-you" | "following" | "communities";

const FeedScreen = () => {
  const [activeTab, setActiveTab] = useState<FeedTab>("for-you");
  const [isPostModalVisible, setIsPostModalVisible] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const user = useSelector((state: RootState) => state.user);

  // Function to handle post creation and refresh feed
  const handlePostCreated = () => {
    console.log(
      "🎉 FeedScreen - Post created, closing modal and refreshing feed"
    );

    setIsPostModalVisible(false);

    // Trigger refresh by updating the refresh counter
    setRefreshTrigger((prev) => prev + 1);

    // Call the global refresh function for React Native
    if (global.refreshPostList) {
      console.log("🔄 FeedScreen - Calling global refresh function");
      global.refreshPostList();
    }
  };

  // Tab data for easier management
  const tabs = [
    { id: "for-you", label: "For you" },
    { id: "following", label: "Following" },
    { id: "communities", label: "Communities" },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#000" }}>
      <View className="flex-1 bg-black">
        {/* Header - Minimal X-style */}
        <View className="bg-black/95 backdrop-blur-md border-b border-gray-800">
          {/* Top section with logo/title */}
          <View className="px-4 pt-2 pb-3">
            <Text className="text-xl font-bold text-white">Home</Text>
          </View>

          {/* Tabs - X-style compact design with proper styling */}
          <View className="flex-row">
            {tabs.map((tab) => (
              <TouchableOpacity
                key={tab.id}
                onPress={() => setActiveTab(tab.id as FeedTab)}
                className="flex-1 pb-3 pt-1"
              >
                <Text
                  className="text-center text-[15px] font-medium"
                  style={{
                    color: activeTab === tab.id ? "#ffffff" : "#71767b",
                  }}
                >
                  {tab.label}
                </Text>
                {/* Active indicator - using style prop for dynamic styling */}
                <View
                  className="mt-3 h-1 rounded-full mx-auto"
                  style={{
                    width: activeTab === tab.id ? 32 : 0,
                    backgroundColor:
                      activeTab === tab.id ? "#1d9bf0" : "transparent",
                  }}
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Posts List with refresh trigger */}
        <View className="flex-1">
          <PostList
            activeTab={activeTab}
            key={`${activeTab}-${refreshTrigger}`}
          />
        </View>

        {/* Floating Action Button - X-style */}
        <TouchableOpacity
          className="absolute bottom-20 right-4 w-14 h-14 rounded-full items-center justify-center"
          style={{
            backgroundColor: "#1d9bf0",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 8,
            elevation: 8,
          }}
          onPress={() => {
            console.log("📝 FeedScreen - Opening post creation modal");
            setIsPostModalVisible(true);
          }}
        >
          <MaterialIcons name="add" size={24} color="white" />
        </TouchableOpacity>

        {/* Create Post Modal - Fixed Layout */}
        <Modal
          visible={isPostModalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => {
            console.log("❌ FeedScreen - Closing post modal without creating");
            setIsPostModalVisible(false);
          }}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            className="flex-1"
          >
            <View
              className="flex-1 justify-end"
              style={{ backgroundColor: "rgba(0, 0, 0, 0.4)" }}
            >
              <View
                className="bg-black rounded-t-2xl border-t border-gray-800"
                style={{ maxHeight: "80%", minHeight: "60%" }}
              >
                {/* Modal Header - X-style */}
                <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-800">
                  <TouchableOpacity
                    onPress={() => {
                      console.log("❌ FeedScreen - Cancel button pressed");
                      setIsPostModalVisible(false);
                    }}
                    className="px-2 py-1"
                  >
                    <Text className="text-white text-base">Cancel</Text>
                  </TouchableOpacity>

                  <Text className="text-white text-lg font-semibold">
                    New post
                  </Text>

                  <View className="w-12" />
                </View>

                {/* Modal Body - Fixed layout */}
                <View className="flex-1 px-4 py-4">
                  {/* Debug info in development */}
                  {__DEV__ && (
                    <View className="bg-blue-900/20 border border-blue-800 rounded-lg p-2 mb-2">
                      <Text className="text-blue-200 text-xs">
                        Debug: User={user.username || "Not logged in"}, Token=
                        {user.token ? "Present" : "Missing"}
                      </Text>
                    </View>
                  )}

                  <PostForm onPostCreated={handlePostCreated} />
                </View>
              </View>
            </View>
          </KeyboardAvoidingView>
        </Modal>
      </View>
    </SafeAreaView>
  );
};

export default FeedScreen;
