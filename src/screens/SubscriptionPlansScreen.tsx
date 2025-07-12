import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
// ADD THESE REDUX IMPORTS
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../redux/store";
import { fetchSubscriptionTiers } from "../redux/slices/subscriptionSlice";

interface SubscriptionTier {
  name: string;
  price: number;
  description: string;
  features: Record<string, any>;
  priceId?: string;
  popular?: boolean;
}

const SubscriptionPlansScreen: React.FC = () => {
  const navigation = useNavigation();
  // REPLACE LOCAL STATE WITH REDUX
  const dispatch = useDispatch<AppDispatch>();
  const {
    tiers,
    loading,
    error,
    current: subscription,
  } = useSelector((state: RootState) => state.subscription);

  const [selectedTier, setSelectedTier] = useState<string>("premium");

  useEffect(() => {
    dispatch(fetchSubscriptionTiers());
  }, [dispatch]);

  // ADD MORE DEBUGGING FOR WHEN DATA CHANGES
  useEffect(() => {
    console.log("📊 Subscription state updated:");
    console.log("- Loading:", loading);
    console.log("- Error:", error);
    console.log("- Number of tiers:", Object.keys(tiers).length);
    console.log("- Available tiers:", Object.keys(tiers));
  }, [tiers, loading, error]);

  const handleUpgrade = async () => {
    console.log("🎯 handleUpgrade called:");
    console.log("- Selected tier:", selectedTier);
    console.log("- Tier exists:", !!tiers[selectedTier]);
    console.log("- Tier data:", tiers[selectedTier]);
    console.log("- All available tiers:", Object.keys(tiers));

    try {
      if (!tiers[selectedTier]) {
        console.error("❌ Selected tier not found in available tiers");
        Alert.alert(
          "Error",
          `Selected tier "${selectedTier}" not available. Available tiers: ${Object.keys(
            tiers
          ).join(", ")}`
        );
        return;
      }

      navigation.navigate("Payment", {
        tier: selectedTier,
        priceId: tiers[selectedTier]?.priceId,
      } as never);
    } catch (error) {
      console.error("❌ Navigation error:", error);
      Alert.alert("Error", "Failed to start upgrade process");
    }
  };

  const TierCard: React.FC<{ tierKey: string; tier: SubscriptionTier }> = ({
    tierKey,
    tier,
  }) => {
    const isSelected = selectedTier === tierKey;
    const isPopular = tierKey === "premium";
    const isCurrentTier = subscription?.tier === tierKey.toUpperCase();

    // Check if this would be a downgrade
    const tierHierarchy = ["FREE", "ESSENTIAL", "PREMIUM", "VIP"];
    const currentTierIndex = tierHierarchy.indexOf(
      subscription?.tier || "FREE"
    );
    const selectedTierIndex = tierHierarchy.indexOf(tierKey.toUpperCase());
    const isDowngrade = currentTierIndex > selectedTierIndex;

    // Determine border and background colors
    const getBorderColor = () => {
      if (isCurrentTier) return "#10B981"; // Green for current
      if (isSelected) return "#FF6B9D"; // Pink for selected
      return "#E5E7EB"; // Gray for default
    };

    const getBackgroundColor = () => {
      if (isCurrentTier) return "#F0FDF4"; // Light green for current
      if (isSelected) return "#FFF5F8"; // Light pink for selected
      return "#FFFFFF"; // White for default
    };

    return (
      <TouchableOpacity
        className="mb-4 rounded-2xl p-6 border-2"
        style={{
          borderColor: getBorderColor(),
          backgroundColor: getBackgroundColor(),
        }}
        onPress={() => setSelectedTier(tierKey)}
        activeOpacity={0.8}
        disabled={isCurrentTier} // Disable if it's current tier
      >
        {/* Top-right badges */}
        {isCurrentTier && (
          <View
            className="absolute -top-3 right-4 px-3 py-1 rounded-full"
            style={{ backgroundColor: "#10B981" }}
          >
            <Text className="text-white text-xs font-bold">CURRENT PLAN</Text>
          </View>
        )}

        {isPopular && !isCurrentTier && (
          <View
            className="absolute -top-3 right-4 px-3 py-1 rounded-full"
            style={{ backgroundColor: "#FF6B9D" }}
          >
            <Text className="text-white text-xs font-bold">MOST POPULAR</Text>
          </View>
        )}

        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-1">
            <Text className="text-xl font-bold text-gray-900">{tier.name}</Text>
            <Text className="text-gray-600 text-sm">{tier.description}</Text>

            {/* Downgrade warning */}
            {isDowngrade && !isCurrentTier && (
              <View className="flex-row items-center mt-1">
                <Ionicons name="trending-down" size={14} color="#F59E0B" />
                <Text className="text-amber-600 text-xs font-medium ml-1">
                  This would be a downgrade
                </Text>
              </View>
            )}

            {/* Current tier indicator */}
            {isCurrentTier && (
              <View className="flex-row items-center mt-1">
                <Ionicons name="checkmark-circle" size={14} color="#10B981" />
                <Text className="text-green-600 text-xs font-medium ml-1">
                  Your current plan
                </Text>
              </View>
            )}
          </View>

          <View className="items-end">
            <Text className="text-2xl font-bold text-gray-900">
              {tier.price === 0 ? "Free" : `$${tier.price}`}
            </Text>
            {tier.price > 0 && (
              <Text className="text-gray-500 text-sm">/month</Text>
            )}
          </View>
        </View>

        <View className="space-y-2">
          {Object.entries(tier.features).map(([feature, value]) => (
            <FeatureRow key={feature} feature={feature} value={value} />
          ))}
        </View>

        {/* Selection indicator */}
        {isSelected && !isCurrentTier && (
          <View className="mt-4 flex-row items-center">
            <Ionicons name="checkmark-circle" size={20} color="#FF6B9D" />
            <Text className="ml-2 text-pink-500 font-medium">Selected</Text>
          </View>
        )}

        {/* Trial info for current tier */}
        {isCurrentTier &&
          subscription?.status === "TRIALING" &&
          subscription?.trialEnd && (
            <View className="mt-4 p-3 bg-blue-100 rounded-lg">
              <View className="flex-row items-center">
                <Ionicons name="gift" size={16} color="#3B82F6" />
                <Text className="ml-2 text-blue-700 text-sm font-medium">
                  Trial ends{" "}
                  {new Date(subscription.trialEnd).toLocaleDateString()}
                </Text>
              </View>
            </View>
          )}
      </TouchableOpacity>
    );
  };

  const FeatureRow: React.FC<{ feature: string; value: any }> = ({
    feature,
    value,
  }) => {
    const getFeatureText = (feature: string, value: any) => {
      switch (feature) {
        case "dailySwipes":
          return `${value === "unlimited" ? "Unlimited" : value} daily swipes`;
        case "superLikesPerDay":
          return `${value} super likes per day`;
        case "monthlyBoosts":
          return `${value} profile boosts per month`;
        case "seeWhoLikedYou":
          return value === "partial"
            ? "See 5 recent likes"
            : value
            ? "See who liked you"
            : "";
        case "passportMode":
          return value ? "Passport mode" : "";
        case "adFree":
          return value ? "Ad-free experience" : "";
        case "undoSwipes":
          return value ? "Undo swipes" : "";
        case "advancedFilters":
          return value ? "Advanced filters" : "";
        case "readReceipts":
          return value ? "Read receipts" : "";
        case "priorityDisplay":
          return value ? "Priority profile display" : "";
        case "messageBeforeMatch":
          return value ? "Message before matching" : "";
        case "vipBadge":
          return value ? "VIP badge" : "";
        case "prioritySupport":
          return value ? "Priority customer support" : "";
        case "profileReviews":
          return value ? "Monthly profile reviews" : "";
        default:
          return "";
      }
    };

    const featureText = getFeatureText(feature, value);
    if (!featureText) return null;

    return (
      <View className="flex-row items-center">
        <Ionicons
          name="checkmark"
          size={16}
          color={value ? "#10B981" : "#9CA3AF"}
        />
        <Text
          className="ml-2 text-sm"
          style={{ color: value ? "#374151" : "#9CA3AF" }}
        >
          {featureText}
        </Text>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 justify-center items-center">
          <Text>Loading subscription plans...</Text>
          <Text className="text-sm text-gray-500 mt-2">
            Check console for debugging info
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // ADD ERROR STATE DISPLAY
  if (error) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 justify-center items-center p-4">
          <Ionicons name="warning" size={48} color="#EF4444" />
          <Text className="text-lg font-bold text-red-600 mt-4 mb-2">
            Failed to Load Plans
          </Text>
          <Text className="text-gray-600 text-center mb-4">{error}</Text>
          <TouchableOpacity
            className="bg-blue-500 px-6 py-3 rounded-lg"
            onPress={() => {
              console.log("🔄 Retrying subscription tiers fetch...");
              dispatch(fetchSubscriptionTiers());
            }}
          >
            <Text className="text-white font-medium">Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ADD DEBUG INFO WHEN NO TIERS
  if (Object.keys(tiers).length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 justify-center items-center p-4">
          <Ionicons name="information-circle" size={48} color="#3B82F6" />
          <Text className="text-lg font-bold text-gray-900 mt-4 mb-2">
            No Subscription Tiers Found
          </Text>
          <Text className="text-gray-600 text-center mb-4">
            The subscription tiers are empty. Check the console for API
            debugging info.
          </Text>
          <TouchableOpacity
            className="bg-blue-500 px-6 py-3 rounded-lg mb-2"
            onPress={() => {
              console.log("🔄 Retrying subscription tiers fetch...");
              dispatch(fetchSubscriptionTiers());
            }}
          >
            <Text className="text-white font-medium">Retry</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="bg-gray-500 px-6 py-3 rounded-lg"
            onPress={() => navigation.goBack()}
          >
            <Text className="text-white font-medium">Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={24} color="#374151" />
        </TouchableOpacity>
        <Text className="text-lg font-bold">Choose Your Plan</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView className="flex-1 p-4">
        {/* Header Text */}
        <View className="mb-6">
          <Text className="text-2xl font-bold text-center text-gray-900 mb-2">
            Unlock Premium Features
          </Text>
          <Text className="text-gray-600 text-center">
            Get unlimited access to all dating features
          </Text>
        </View>

        {/* DEBUG INFO */}
        <View className="bg-gray-100 p-3 rounded-lg mb-4">
          <Text className="text-xs text-gray-600">
            Debug: {Object.keys(tiers).length} tiers loaded
          </Text>
          <Text className="text-xs text-gray-600">
            Available: {Object.keys(tiers).join(", ")}
          </Text>
          <Text className="text-xs text-gray-600">
            Selected: {selectedTier}
          </Text>
        </View>

        {/* Free Tier */}
        {tiers.free && <TierCard tierKey="free" tier={tiers.free} />}

        {/* Essential Tier */}
        {tiers.essential && (
          <TierCard tierKey="essential" tier={tiers.essential} />
        )}

        {/* Premium Tier */}
        {tiers.premium && <TierCard tierKey="premium" tier={tiers.premium} />}

        {/* VIP Tier */}
        {tiers.vip && <TierCard tierKey="vip" tier={tiers.vip} />}

        {/* Trial Info */}
        <View className="bg-blue-50 rounded-xl p-4 mb-6">
          <View className="flex-row items-center mb-2">
            <Ionicons name="gift" size={20} color="#3B82F6" />
            <Text className="ml-2 font-bold text-blue-900">
              7-Day Free Trial
            </Text>
          </View>
          <Text className="text-blue-800 text-sm">
            Try premium features risk-free. Cancel anytime during the trial.
          </Text>
        </View>
      </ScrollView>

      {/* Bottom Action Button */}
      <View className="p-4 border-t border-gray-200">
        <TouchableOpacity
          className="rounded-xl py-4 px-6"
          style={{ backgroundColor: "#FF6B9D" }}
          onPress={handleUpgrade}
          activeOpacity={0.8}
        >
          <Text className="text-white font-bold text-center text-lg">
            Start 7-Day Free Trial
          </Text>
        </TouchableOpacity>

        <Text className="text-xs text-gray-500 text-center mt-2">
          Cancel anytime. Terms and conditions apply.
        </Text>
      </View>
    </SafeAreaView>
  );
};

export default SubscriptionPlansScreen;
