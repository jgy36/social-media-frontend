// src/components/subscription/UpgradeBanner.tsx - Updated
import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import SubscriptionManager from "./SubscriptionManager";

interface UpgradeBannerProps {
  mode?: "social" | "dating";
  onPress?: () => void;
}

const UpgradeBanner: React.FC<UpgradeBannerProps> = ({
  mode = "dating",
  onPress,
}) => {
  const navigation = useNavigation();
  const { current: subscription } = useSelector(
    (state: RootState) => state.subscription
  );

  const currentTier = subscription?.tier || "FREE";

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      try {
        (navigation as any).navigate("SubscriptionPlans");
      } catch (error) {
        console.error("Navigation error:", error);
      }
    }
  };

  // Show subscription manager for paid users
  if (currentTier !== "FREE") {
    return <SubscriptionManager onManagePress={onPress} />;
  }

  // Show upgrade banner for free users
  const getContent = () => {
    if (mode === "social") {
      return {
        title: "Upgrade Your Social Experience",
        subtitle: "Remove ads, boost posts & get a verified badge",
      };
    } else {
      return {
        title: "Unlock Your Dating Potential",
        subtitle: "Get unlimited swipes, see who likes you & more",
      };
    }
  };

  const content = getContent();

  return (
    <LinearGradient
      colors={["#FF6B9D", "#FF8E8E", "#FFB347"]}
      className="mx-4 mt-4 mb-4"
      style={{
        borderRadius: 16,
        padding: 16,
        minHeight: 80,
      }}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-1 mr-3" style={{ flex: 1 }}>
          <Text
            className="text-white font-bold mb-1"
            style={{
              fontSize: 16,
              lineHeight: 20,
            }}
            numberOfLines={1}
          >
            {content.title}
          </Text>
          <Text
            className="text-white/90"
            style={{
              fontSize: 12,
              lineHeight: 16,
            }}
            numberOfLines={2}
          >
            {content.subtitle}
          </Text>
        </View>
        <TouchableOpacity
          className="bg-white"
          style={{
            borderRadius: 10,
            paddingHorizontal: 18,
            paddingVertical: 12,
            minWidth: 75,
            alignSelf: "center",
          }}
          onPress={handlePress}
          activeOpacity={0.8}
        >
          <Text
            className="text-pink-500 font-bold text-center"
            style={{ fontSize: 13 }}
            numberOfLines={1}
          >
            Upgrade
          </Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

export default UpgradeBanner;
