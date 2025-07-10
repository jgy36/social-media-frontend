// src/screens/messages/SnapMainScreen.tsx - With memories navigation
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

interface PreSelectedRecipient {
  userId: number;
  name: string;
}

const SnapMainScreen = () => {
  const navigation = useNavigation();

  const [activeTab, setActiveTab] = useState<
    "messages" | "camera" | "contacts"
  >("camera");
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [preSelectedRecipient, setPreSelectedRecipient] =
    useState<PreSelectedRecipient | null>(null);

  const translateX = useRef(new Animated.Value(0)).current;
  const activeTabRef = useRef(activeTab);

  useEffect(() => {
    console.log("✅ Active tab state changed to:", activeTab);
    activeTabRef.current = activeTab;
  }, [activeTab]);

  const handleCameraIconPress = (
    recipientId: number,
    recipientName: string
  ) => {
    console.log(
      "📸 Camera icon pressed for:",
      recipientName,
      "ID:",
      recipientId
    );
    setPreSelectedRecipient({ userId: recipientId, name: recipientName });
    setCapturedPhoto(null);
    setActiveTab("camera");
  };

  const handleDeselectRecipient = () => {
    console.log("❌ Deselecting recipient");
    setPreSelectedRecipient(null);
  };

  const handlePhotoCapture = (photoUri: string) => {
    console.log("📷 Photo captured, switching to contacts tab");
    setCapturedPhoto(photoUri);
    setActiveTab("contacts");
  };

  const handlePhotoSent = () => {
    console.log("✅ Photo sent successfully");
    setCapturedPhoto(null);
    setPreSelectedRecipient(null);
    setActiveTab("messages");
  };

  const handleGoBackToCamera = () => {
    console.log("⬅️ Going back to camera from contacts");
    setActiveTab("camera");
  };

  // ADDED: Navigate to memories function
  const handleNavigateToMemories = () => {
    console.log("📚 Navigating to memories");
    // @ts-ignore - Navigation type might not include Memories yet
    navigation.navigate("Memories");
  };

  const switchTab = (tab: "messages" | "camera" | "contacts") => {
    console.log("🔄 Switching from", activeTab, "to", tab);
    setActiveTab(tab);

    if (tab === "camera" && !preSelectedRecipient && !capturedPhoto) {
      setCapturedPhoto(null);
    }

    if (tab === "messages") {
      setCapturedPhoto(null);
      setPreSelectedRecipient(null);
    }
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        const isHorizontalSwipe =
          Math.abs(gestureState.dx) > Math.abs(gestureState.dy);
        const isSignificantSwipe = Math.abs(gestureState.dx) > 30;
        return isHorizontalSwipe && isSignificantSwipe;
      },
      onPanResponderGrant: () => {
        console.log("Gesture started on tab:", activeTabRef.current);
      },
      onPanResponderMove: (evt, gestureState) => {
        if (Math.abs(gestureState.dx) < width * 0.3) {
          translateX.setValue(gestureState.dx * 0.1);
        }
      },
      onPanResponderRelease: (evt, gestureState) => {
        const currentTab = activeTabRef.current;
        const swipeThreshold = 50;

        Animated.spring(translateX, {
          toValue: 0,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }).start();

        if (gestureState.dx > swipeThreshold) {
          if (currentTab === "contacts") {
            handleGoBackToCamera();
          } else if (currentTab === "camera") {
            switchTab("messages");
          }
        } else if (gestureState.dx < -swipeThreshold) {
          if (currentTab === "messages") {
            switchTab("camera");
          } else if (currentTab === "camera") {
            switchTab("contacts");
          }
        }
      },
      onPanResponderTerminate: () => {
        Animated.spring(translateX, {
          toValue: 0,
          useNativeDriver: true,
        }).start();
      },
    })
  ).current;

  const renderTabContent = () => {
    switch (activeTab) {
      case "messages":
        return <SnapMessagesTab onCameraIconPress={handleCameraIconPress} />;
      case "camera":
        return (
          <SnapCameraTab
            onPhotoCapture={handlePhotoCapture}
            onNavigateToContacts={() => setActiveTab("contacts")}
            onNavigateToMemories={handleNavigateToMemories} // ADDED: Pass the memories function
            preSelectedRecipient={preSelectedRecipient}
            onDeselectRecipient={handleDeselectRecipient}
            capturedPhoto={capturedPhoto}
            onResetPhoto={() => setCapturedPhoto(null)}
          />
        );
      case "contacts":
        return (
          <SnapContactsTab
            capturedPhoto={capturedPhoto}
            onPhotoSent={handlePhotoSent}
            onGoBack={handleGoBackToCamera}
            preSelectedRecipient={preSelectedRecipient}
          />
        );
      default:
        return (
          <SnapCameraTab
            onPhotoCapture={handlePhotoCapture}
            onNavigateToContacts={() => setActiveTab("contacts")}
            onNavigateToMemories={handleNavigateToMemories} // ADDED: Pass the memories function here too
            preSelectedRecipient={preSelectedRecipient}
            onDeselectRecipient={handleDeselectRecipient}
            capturedPhoto={capturedPhoto}
            onResetPhoto={() => setCapturedPhoto(null)}
          />
        );
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-black">
      <View className="flex-row justify-center items-center py-3 bg-black bg-opacity-80">
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

      <View className="flex-1" {...panResponder.panHandlers}>
        {renderTabContent()}
      </View>
    </SafeAreaView>
  );
};

export default SnapMainScreen;
