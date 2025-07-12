// src/screens/PaymentScreen.tsx - Updated to handle Free tier
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../redux/store";
import {
  upgradeSubscription,
  startTrial,
  cancelSubscription,
} from "../redux/slices/subscriptionSlice";

const PaymentScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useDispatch<AppDispatch>();
  const { tier, priceId } = (route.params as any) || {};

  const {
    tiers,
    current: subscription,
    loading,
  } = useSelector((state: RootState) => state.subscription);
  const [processing, setProcessing] = useState(false);

  console.log("🔍 PaymentScreen Debug:");
  console.log("- Selected tier:", tier);
  console.log("- Price ID:", priceId);
  console.log("- Current subscription tier:", subscription?.tier);
  console.log("- Is downgrading to free:", tier === "free");

  const selectedTier = tiers[tier];
  const isDowngradingToFree = tier === "free";
  const currentTier = subscription?.tier || "FREE";

  const handleAction = async () => {
    if (isDowngradingToFree) {
      handleDowngradeToFree();
    } else {
      handleStartTrial();
    }
  };

  const handleDowngradeToFree = async () => {
    Alert.alert(
      "Downgrade to Free",
      `Are you sure you want to downgrade from ${currentTier} to Free? You'll lose access to premium features at the end of your current billing period.`,
      [
        {
          text: "Keep Current Plan",
          style: "cancel",
        },
        {
          text: "Downgrade to Free",
          style: "destructive",
          onPress: async () => {
            setProcessing(true);
            try {
              console.log("📡 Canceling subscription to downgrade to free...");
              const result = await dispatch(cancelSubscription()).unwrap();
              console.log("✅ Successfully downgraded to free:", result);

              Alert.alert(
                "Downgraded to Free!",
                "Your subscription has been canceled. You'll keep your premium features until the end of your current billing period, then automatically switch to the free plan.",
                [
                  {
                    text: "OK",
                    onPress: () => navigation.goBack(),
                  },
                ]
              );
            } catch (error: any) {
              console.error("❌ Downgrade failed:", error);
              Alert.alert("Error", `Failed to downgrade: ${error.message}`);
            } finally {
              setProcessing(false);
            }
          },
        },
      ]
    );
  };

  const handleStartTrial = async () => {
    console.log("🚀 Starting trial for tier:", tier);
    setProcessing(true);

    try {
      console.log("📡 Calling startTrial API...");
      const result = await dispatch(startTrial(tier.toUpperCase())).unwrap();
      console.log("✅ Trial started successfully:", result);

      Alert.alert(
        "Trial Started!",
        result.message ||
          "Your 7-day free trial has begun. Enjoy premium features!",
        [
          {
            text: "OK",
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error: any) {
      console.error("❌ Trial start failed:", error);
      Alert.alert("Error", `Failed to start trial: ${error.message}`);
    } finally {
      setProcessing(false);
    }
  };

  if (!selectedTier) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 justify-center items-center">
          <Ionicons name="warning" size={48} color="#EF4444" />
          <Text className="text-lg font-bold text-red-600 mt-4">
            Invalid subscription tier
          </Text>
          <Text className="text-gray-600 mt-2 mb-4">
            Tier "{tier}" not found
          </Text>
          <TouchableOpacity
            className="bg-blue-500 px-6 py-3 rounded-lg"
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
        <Text className="text-lg font-bold">
          {isDowngradingToFree ? "Downgrade to Free" : "Start Free Trial"}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <View className="flex-1 p-4">
        {/* Plan Summary */}
        <View
          className="rounded-xl p-6 mb-6"
          style={{
            backgroundColor: isDowngradingToFree ? "#FEF2F2" : "#FDF2F8",
          }}
        >
          <Text className="text-2xl font-bold text-gray-900 mb-2">
            {selectedTier.name}
          </Text>
          <Text className="text-gray-600 mb-4">{selectedTier.description}</Text>
          <Text
            className="text-3xl font-bold"
            style={{ color: isDowngradingToFree ? "#DC2626" : "#EC4899" }}
          >
            {isDowngradingToFree ? "Free" : `$${selectedTier.price}/month`}
          </Text>
        </View>

        {/* Action Info */}
        <View
          className="rounded-xl p-6 mb-6"
          style={{
            backgroundColor: isDowngradingToFree ? "#FEF3C7" : "#DBEAFE",
          }}
        >
          <View className="flex-row items-center mb-3">
            <Ionicons
              name={isDowngradingToFree ? "warning" : "gift"}
              size={24}
              color={isDowngradingToFree ? "#D97706" : "#3B82F6"}
            />
            <Text
              className="ml-3 text-lg font-bold"
              style={{ color: isDowngradingToFree ? "#92400E" : "#1E40AF" }}
            >
              {isDowngradingToFree ? "Downgrade Warning" : "7-Day Free Trial"}
            </Text>
          </View>

          {isDowngradingToFree ? (
            <>
              <Text className="text-amber-800 mb-2">
                • You'll keep premium features until{" "}
                {subscription?.currentPeriodEnd
                  ? new Date(subscription.currentPeriodEnd).toLocaleDateString()
                  : "the end of your billing period"}
              </Text>
              <Text className="text-amber-800 mb-2">
                • After that, you'll switch to the free plan
              </Text>
              <Text className="text-amber-800">
                • You can resubscribe anytime
              </Text>
            </>
          ) : (
            <>
              <Text className="text-blue-800 mb-2">
                • Try all premium features for free
              </Text>
              <Text className="text-blue-800 mb-2">
                • Cancel anytime during trial
              </Text>
              <Text className="text-blue-800">
                • No charges until trial ends
              </Text>
            </>
          )}
        </View>

        {/* Features List */}
        <View className="bg-gray-50 rounded-xl p-6 mb-6">
          <Text className="text-lg font-bold text-gray-900 mb-4">
            {isDowngradingToFree ? "What you'll lose:" : "What you'll get:"}
          </Text>
          {Object.entries(selectedTier.features).map(([feature, value]) => {
            const featureText = getFeatureText(feature, value);
            if (!featureText) return null;

            return (
              <View key={feature} className="flex-row items-center mb-2">
                <Ionicons
                  name={isDowngradingToFree ? "close" : "checkmark"}
                  size={16}
                  color={isDowngradingToFree ? "#EF4444" : "#10B981"}
                />
                <Text className="ml-2 text-gray-700">{featureText}</Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* Bottom Action */}
      <View className="p-4 border-t border-gray-200">
        <TouchableOpacity
          className="rounded-xl py-4 px-6"
          style={{
            backgroundColor: processing
              ? "#D1D5DB"
              : isDowngradingToFree
              ? "#DC2626"
              : "#FF6B9D",
          }}
          onPress={handleAction}
          disabled={processing}
          activeOpacity={0.8}
        >
          {processing ? (
            <View className="flex-row items-center justify-center">
              <ActivityIndicator color="white" />
              <Text className="text-white font-bold ml-2">
                {isDowngradingToFree ? "Processing..." : "Starting Trial..."}
              </Text>
            </View>
          ) : (
            <Text className="text-white font-bold text-center text-lg">
              {isDowngradingToFree
                ? "Downgrade to Free"
                : "Start 7-Day Free Trial"}
            </Text>
          )}
        </TouchableOpacity>

        <Text className="text-xs text-gray-500 text-center mt-2">
          {isDowngradingToFree
            ? "This will cancel your current subscription"
            : "You can cancel anytime. No charges during trial period."}
        </Text>
      </View>
    </SafeAreaView>
  );
};

// Helper function for feature text (same as before)
const getFeatureText = (feature: string, value: any): string => {
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
        : "No access to likes";
    case "passportMode":
      return value ? "Passport mode" : "No passport mode";
    case "adFree":
      return value ? "Ad-free experience" : "Ads included";
    case "undoSwipes":
      return value ? "Undo swipes" : "No undo swipes";
    case "advancedFilters":
      return value ? "Advanced filters" : "Basic filters only";
    case "readReceipts":
      return value ? "Read receipts" : "No read receipts";
    case "priorityDisplay":
      return value ? "Priority profile display" : "Standard display";
    case "messageBeforeMatch":
      return value ? "Message before matching" : "Match required to message";
    case "vipBadge":
      return value ? "VIP badge" : "No VIP badge";
    case "prioritySupport":
      return value ? "Priority customer support" : "Standard support";
    case "profileReviews":
      return value ? "Monthly profile reviews" : "No profile reviews";
    default:
      return "";
  }
};

export default PaymentScreen;
