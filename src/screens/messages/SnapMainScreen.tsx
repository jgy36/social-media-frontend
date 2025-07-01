// src/screens/messages/SnapMainScreen.tsx - Snapchat-style 3-tab navigator with swipe
import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  PanResponder,
  Animated,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import SnapMessagesTab from "./SnapMessagesTab";
import SnapCameraTab from "./SnapCameraTab";
import SnapContactsTab from "./SnapContactsTab";

const { width } = Dimensions.get("window");

const SnapMainScreen = () => {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState<
    "messages" | "camera" | "contacts"
  >("camera");
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);

  // Animation values for smooth transitions
  const translateX = useRef(new Animated.Value(0)).current;
  const panRef = useRef<any>(null);
  const activeTabRef = useRef(activeTab); // Track current tab for gesture handler

  // Debug state changes
  useEffect(() => {
    console.log("✅ Active tab state changed to:", activeTab);
    activeTabRef.current = activeTab; // Update ref when state changes
  }, [activeTab]);

  // Handle photo capture from camera tab
  const handlePhotoCapture = (photoUri: string) => {
    setCapturedPhoto(photoUri);
    setActiveTab("contacts"); // Switch to contacts to send
  };

  // Handle photo sent successfully
  const handlePhotoSent = () => {
    setCapturedPhoto(null);
    setActiveTab("messages"); // Go back to messages
  };

  // Handle tab swipe or navigation
  const switchTab = (tab: "messages" | "camera" | "contacts") => {
    console.log("🔄 Switching from", activeTab, "to", tab);
    setActiveTab(tab);
    if (tab === "camera") {
      setCapturedPhoto(null); // Clear any captured photo when going to camera
    }
  };

  // Swipe gesture handler
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        // Only respond to horizontal swipes that are significant
        const isHorizontalSwipe =
          Math.abs(gestureState.dx) > Math.abs(gestureState.dy);
        const isSignificantSwipe = Math.abs(gestureState.dx) > 30;
        return isHorizontalSwipe && isSignificantSwipe;
      },
      onPanResponderGrant: () => {
        console.log("Gesture started on tab:", activeTabRef.current);
      },
      onPanResponderMove: (evt, gestureState) => {
        // Minimal visual feedback during swipe
        if (Math.abs(gestureState.dx) < width * 0.3) {
          translateX.setValue(gestureState.dx * 0.1); // Very subtle movement
        }
      },
      onPanResponderRelease: (evt, gestureState) => {
        const currentTab = activeTabRef.current; // Use ref instead of state
        console.log(
          "Gesture ended. dx:",
          gestureState.dx,
          "Current tab:",
          currentTab
        );

        const swipeThreshold = 50; // Lower threshold for easier swiping

        // Reset animation
        Animated.spring(translateX, {
          toValue: 0,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }).start();

        // Simple, explicit tab switching logic
        if (gestureState.dx > swipeThreshold) {
          // Swipe right - go backward
          console.log("Swiping right from:", currentTab);
          if (currentTab === "contacts") {
            console.log("Moving to camera");
            switchTab("camera");
          } else if (currentTab === "camera") {
            console.log("Moving to messages");
            switchTab("messages");
          }
        } else if (gestureState.dx < -swipeThreshold) {
          // Swipe left - go forward
          console.log("Swiping left from:", currentTab);
          if (currentTab === "messages") {
            console.log("Moving to camera");
            switchTab("camera");
          } else if (currentTab === "camera") {
            console.log("Moving to contacts");
            switchTab("contacts");
          }
        }
      },
      onPanResponderTerminate: () => {
        // Reset animation if gesture is cancelled
        Animated.spring(translateX, {
          toValue: 0,
          useNativeDriver: true,
        }).start();
      },
    })
  ).current;

  const renderTabContent = () => {
    console.log("🎬 Rendering tab content for:", activeTab);
    switch (activeTab) {
      case "messages":
        return <SnapMessagesTab />;
      case "camera":
        return (
          <SnapCameraTab
            onPhotoCapture={handlePhotoCapture}
            onNavigateToContacts={() => setActiveTab("contacts")}
          />
        );
      case "contacts":
        return (
          <SnapContactsTab
            capturedPhoto={capturedPhoto}
            onPhotoSent={handlePhotoSent}
            onGoBack={() => setActiveTab("camera")}
          />
        );
      default:
        return (
          <SnapCameraTab
            onPhotoCapture={handlePhotoCapture}
            onNavigateToContacts={() => setActiveTab("contacts")}
          />
        );
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-black">
      {/* Top Tab Indicators */}
      <View className="flex-row justify-center items-center py-3 bg-black bg-opacity-80">
        {/* Messages Tab */}
        <TouchableOpacity
          onPress={() => switchTab("messages")}
          className="flex-1 items-center py-2"
        >
          <MaterialIcons
            name="chat-bubble"
            size={20}
            style={{
              color:
                activeTab === "messages" ? "#FFFFFF" : "rgba(255,255,255,0.4)",
            }}
          />
        </TouchableOpacity>

        {/* Camera Tab */}
        <TouchableOpacity
          onPress={() => switchTab("camera")}
          className="flex-1 items-center py-2"
        >
          <MaterialIcons
            name="camera-alt"
            size={24}
            style={{
              color:
                activeTab === "camera" ? "#FFFFFF" : "rgba(255,255,255,0.4)",
            }}
          />
        </TouchableOpacity>

        {/* Contacts Tab */}
        <TouchableOpacity
          onPress={() => switchTab("contacts")}
          className="flex-1 items-center py-2"
        >
          <MaterialIcons
            name="people"
            size={20}
            style={{
              color:
                activeTab === "contacts" ? "#FFFFFF" : "rgba(255,255,255,0.4)",
            }}
          />
        </TouchableOpacity>
      </View>

      {/* Tab Content with Swipe Gesture */}
      <View className="flex-1" {...panResponder.panHandlers}>
        {renderTabContent()}
      </View>

      {/* Bottom Navigation Hint */}
      {activeTab === "camera" && (
        <View className="absolute bottom-24 left-0 right-0 items-center">
          <View className="bg-black bg-opacity-60 px-4 py-2 rounded-full">
            <Text className="text-white text-xs">
              ← Messages • Camera • Contacts →
            </Text>
          </View>
        </View>
      )}

      {/* Swipe Hint for first-time users */}
      {activeTab === "camera" && (
        <View className="absolute bottom-32 left-0 right-0 items-center">
          <View className="bg-black bg-opacity-40 px-3 py-1 rounded-full">
            <Text className="text-white text-xs opacity-70">
              Swipe to navigate
            </Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

export default SnapMainScreen;
