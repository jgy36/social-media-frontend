// src/components/subscription/SubscriptionManager.tsx
import React, { useState } from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../../redux/store";
import { cancelSubscription } from "../../redux/slices/subscriptionSlice";
import { useNavigation } from "@react-navigation/native";

interface SubscriptionManagerProps {
  onManagePress?: () => void;
}

const SubscriptionManager: React.FC<SubscriptionManagerProps> = ({
  onManagePress,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation();
  const { current: subscription } = useSelector(
    (state: RootState) => state.subscription
  );
  const [processing, setProcessing] = useState(false);

  if (!subscription || subscription.tier === "FREE") {
    return null;
  }

  // Get tier styling
  const getTierStyling = () => {
    switch (subscription.tier) {
      case "ESSENTIAL":
        return {
          gradientColors: ["#3B82F6", "#60A5FA", "#93C5FD"],
          borderColor: "#3B82F6",
          textColor: "#1E40AF",
          badgeText: "💎 Essential",
        };
      case "PREMIUM":
        return {
          gradientColors: ["#8B5CF6", "#A78BFA", "#C4B5FD"],
          borderColor: "#8B5CF6",
          textColor: "#6D28D9",
          badgeText: "🥈 Premium",
        };
      case "VIP":
        return {
          gradientColors: ["#FFD700", "#FFA500", "#FFFF99"],
          borderColor: "#FFD700",
          textColor: "#B8860B",
          badgeText: "🥇 VIP",
        };
      default:
        return {
          gradientColors: ["#6B7280", "#9CA3AF", "#D1D5DB"],
          borderColor: "#6B7280",
          textColor: "#374151",
          badgeText: "🆓 Free",
        };
    }
  };

  const styling = getTierStyling();

  const handleManagePlans = () => {
    if (onManagePress) {
      onManagePress();
    } else {
      try {
        (navigation as any).navigate("SubscriptionPlans");
      } catch (error) {
        console.error("Navigation error:", error);
      }
    }
  };

  const handleCancelSubscription = () => {
    Alert.alert(
      "Cancel Subscription",
      `Are you sure you want to cancel your ${
        subscription.tier
      } subscription? You'll continue to have access until ${
        subscription.currentPeriodEnd
          ? new Date(subscription.currentPeriodEnd).toLocaleDateString()
          : "the end of your billing period"
      }.`,
      [
        {
          text: "Keep Subscription",
          style: "cancel",
        },
        {
          text: "Cancel Subscription",
          style: "destructive",
          onPress: async () => {
            setProcessing(true);
            try {
              await dispatch(cancelSubscription()).unwrap();
              Alert.alert(
                "Subscription Canceled",
                "Your subscription has been canceled. You'll continue to have access until the end of your current billing period."
              );
            } catch (error: any) {
              Alert.alert(
                "Error",
                "Failed to cancel subscription. Please try again or contact support."
              );
            } finally {
              setProcessing(false);
            }
          },
        },
      ]
    );
  };

  const getTrialStatus = () => {
    if (subscription.status === "TRIALING" && subscription.trialEnd) {
      const trialEnd = new Date(subscription.trialEnd);
      const now = new Date();
      const daysLeft = Math.ceil(
        (trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysLeft > 0) {
        return `${daysLeft} day${daysLeft === 1 ? "" : "s"} left in trial`;
      }
    }
    return null;
  };

  const trialStatus = getTrialStatus();

  return (
    <View className="mx-4 mt-4 mb-4">
      <LinearGradient
        colors={styling.gradientColors}
        className="rounded-2xl p-4"
        style={{
          borderWidth: 2,
          borderColor: styling.borderColor,
          shadowColor: styling.borderColor,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.2,
          shadowRadius: 8,
          elevation: 6,
        }}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Header */}
        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-row items-center">
            <Text
              className="text-lg font-bold mr-2"
              style={{ color: styling.textColor }}
            >
              {styling.badgeText}
            </Text>
            {subscription.status === "TRIALING" && (
              <View className="bg-blue-100 px-2 py-1 rounded-full">
                <Text className="text-blue-600 text-xs font-bold">TRIAL</Text>
              </View>
            )}
          </View>

          <Text
            className="text-lg font-bold"
            style={{ color: styling.textColor }}
          >
            ${subscription.monthlyPrice}/month
          </Text>
        </View>

        {/* Status */}
        <View className="mb-4">
          {subscription.cancelAtPeriodEnd ? (
            <View>
              <Text
                className="text-sm font-medium"
                style={{ color: "#DC2626" }}
              >
                ⚠️ Subscription canceled - downgrades to Free on{" "}
                {subscription.currentPeriodEnd
                  ? new Date(subscription.currentPeriodEnd).toLocaleDateString()
                  : "next billing date"}
              </Text>
              <Text
                className="text-xs mt-1"
                style={{ color: styling.textColor }}
              >
                You'll keep premium features until then
              </Text>
            </View>
          ) : trialStatus ? (
            <Text
              className="text-sm font-medium"
              style={{ color: styling.textColor }}
            >
              🎁 {trialStatus}
            </Text>
          ) : (
            <Text className="text-sm" style={{ color: styling.textColor }}>
              Renews on{" "}
              {subscription.currentPeriodEnd
                ? new Date(subscription.currentPeriodEnd).toLocaleDateString()
                : "next billing date"}
            </Text>
          )}
        </View>

        {/* Action Buttons */}
        <View className="flex-row space-x-3">
          <TouchableOpacity
            className="flex-1 bg-white rounded-xl py-3 px-4"
            onPress={handleManagePlans}
            activeOpacity={0.8}
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 2,
            }}
          >
            <View className="flex-row items-center justify-center">
              <Ionicons name="settings" size={16} color={styling.textColor} />
              <Text
                className="ml-2 font-semibold text-sm text-center"
                style={{ color: styling.textColor }}
              >
                Change Plan
              </Text>
            </View>
          </TouchableOpacity>

          {!subscription.cancelAtPeriodEnd && (
            <TouchableOpacity
              className="flex-1 bg-red-50 border border-red-200 rounded-xl py-3 px-4"
              onPress={handleCancelSubscription}
              disabled={processing}
              activeOpacity={0.8}
            >
              <View className="flex-row items-center justify-center">
                <Ionicons
                  name="close-circle"
                  size={16}
                  color={processing ? "#9CA3AF" : "#DC2626"}
                />
                <Text
                  className="ml-2 font-semibold text-sm text-center"
                  style={{ color: processing ? "#9CA3AF" : "#DC2626" }}
                >
                  {processing ? "Canceling..." : "Cancel"}
                </Text>
              </View>
            </TouchableOpacity>
          )}
        </View>

        {/* Already canceled notice */}
        {subscription.cancelAtPeriodEnd && (
          <View className="mt-3 p-3 bg-orange-100 rounded-xl">
            <Text className="text-orange-700 text-sm font-medium text-center">
              ⚠️ Subscription will cancel at period end
            </Text>
          </View>
        )}
      </LinearGradient>
    </View>
  );
};

export default SubscriptionManager;
