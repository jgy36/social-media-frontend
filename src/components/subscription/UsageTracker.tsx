// src/components/subscription/UsageTracker.tsx
import React, { useEffect } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../../redux/store";
import { fetchUsageStats } from "../../redux/slices/subscriptionSlice";

interface UsageTrackerProps {
  onUpgradePress?: () => void;
}

const UsageTracker: React.FC<UsageTrackerProps> = ({ onUpgradePress }) => {
  const dispatch = useDispatch<AppDispatch>();
  const {
    usage,
    current: subscription,
    loading,
  } = useSelector((state: RootState) => state.subscription);

  useEffect(() => {
    dispatch(fetchUsageStats());
  }, [dispatch]);

  if (loading || !usage) {
    return null;
  }

  // Get tier-specific styling
  const getTierStyling = () => {
    const tier = subscription?.tier || "FREE";

    switch (tier) {
      case "ESSENTIAL":
        return {
          gradientColors: ["#3B82F6", "#60A5FA", "#93C5FD"], // Blue gradient
          textColor: "#1E40AF",
          borderColor: "#3B82F6",
          badgeText: "💎 Essential",
          badgeGradient: ["#2563EB", "#3B82F6"],
        };
      case "PREMIUM":
        return {
          gradientColors: ["#C0C0C0", "#E5E5E5", "#F8F8FF"], // Silver gradient
          textColor: "#4B5563",
          borderColor: "#C0C0C0",
          badgeText: "🥈 Premium",
          badgeGradient: ["#6B7280", "#9CA3AF"],
        };
      case "VIP":
        return {
          gradientColors: ["#FFD700", "#FFA500", "#FFFF99"], // Gold gradient
          textColor: "#B8860B",
          borderColor: "#FFD700",
          badgeText: "🥇 VIP",
          badgeGradient: ["#D97706", "#F59E0B"],
        };
      default: // FREE
        return {
          gradientColors: ["#FFFFFF", "#F9FAFB", "#FFFFFF"], // White/light gray
          textColor: "#374151",
          borderColor: "#E5E7EB",
          badgeText: "🆓 Free",
          badgeGradient: ["#6B7280", "#9CA3AF"],
        };
    }
  };

  const styling = getTierStyling();

  const ProgressBar: React.FC<{
    used: number;
    limit: number;
    label: string;
    icon: string;
  }> = ({ used, limit, label, icon }) => {
    const percentage = limit === -1 ? 0 : Math.min((used / limit) * 100, 100);
    const isUnlimited = limit === -1;
    const isNearLimit = percentage > 80;

    return (
      <View className="mb-4">
        <View className="flex-row items-center justify-between mb-2">
          <View className="flex-row items-center">
            <Ionicons name={icon as any} size={16} color={styling.textColor} />
            <Text
              className="ml-2 text-sm font-semibold"
              style={{ color: styling.textColor }}
            >
              {label}
            </Text>
          </View>
          <Text
            className="text-sm font-medium"
            style={{ color: styling.textColor }}
          >
            {isUnlimited ? "Unlimited" : `${used}/${limit}`}
          </Text>
        </View>

        {!isUnlimited && (
          <View
            className="h-3 rounded-full overflow-hidden"
            style={{ backgroundColor: "rgba(0,0,0,0.1)" }}
          >
            <LinearGradient
              colors={
                isNearLimit ? ["#EF4444", "#DC2626"] : ["#10B981", "#059669"]
              }
              className="h-full rounded-full"
              style={{ width: `${percentage}%` }}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            />
          </View>
        )}

        {!isUnlimited && isNearLimit && (
          <Text
            className="text-xs mt-1 font-medium"
            style={{ color: "#EF4444" }}
          >
            {used >= limit ? "Limit reached" : "Almost at limit"}
          </Text>
        )}
      </View>
    );
  };

  return (
    <View className="mx-4 mb-4">
      <LinearGradient
        colors={styling.gradientColors}
        className="rounded-2xl p-5 shadow-lg"
        style={{
          borderWidth: 2,
          borderColor: styling.borderColor,
          shadowColor: styling.borderColor,
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.25,
          shadowRadius: 12,
          elevation: 10,
        }}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Header with tier badge */}
        <View className="flex-row items-center justify-between mb-5">
          <View className="flex-row items-center">
            <LinearGradient
              colors={styling.badgeGradient}
              className="px-4 py-2 rounded-full mr-3"
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.2,
                shadowRadius: 4,
                elevation: 3,
              }}
            >
              <Text className="text-white text-sm font-bold">
                {styling.badgeText}
              </Text>
            </LinearGradient>
            <Text
              className="text-xl font-bold"
              style={{ color: styling.textColor }}
            >
              Usage
            </Text>
          </View>

          {subscription?.tier === "FREE" && (
            <TouchableOpacity onPress={onUpgradePress}>
              <LinearGradient
                colors={["#FF6B9D", "#FF8E8E"]}
                className="px-4 py-2 rounded-full"
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{
                  shadowColor: "#FF6B9D",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.3,
                  shadowRadius: 4,
                  elevation: 3,
                }}
              >
                <Text className="text-white font-bold text-sm">Upgrade</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
        </View>

        {/* Usage bars */}
        <ProgressBar
          used={usage.dailySwipesUsed}
          limit={usage.dailySwipeLimit}
          label="Swipes"
          icon="heart"
        />

        <ProgressBar
          used={usage.dailySuperLikesUsed}
          limit={usage.dailySuperLikeLimit}
          label="Super Likes"
          icon="star"
        />

        <ProgressBar
          used={usage.monthlyBoostsUsed}
          limit={usage.monthlyBoostLimit}
          label="Boosts This Month"
          icon="trending-up"
        />

        {/* Trial info if applicable */}
        {subscription?.status === "TRIALING" && subscription?.trialEnd && (
          <View
            className="mt-4 p-4 rounded-xl"
            style={{ backgroundColor: "rgba(59, 130, 246, 0.2)" }}
          >
            <View className="flex-row items-center">
              <Ionicons name="gift" size={18} color="#FFFFFF" />
              <Text className="ml-2 text-white font-semibold text-sm">
                Trial ends{" "}
                {new Date(subscription.trialEnd).toLocaleDateString()}
              </Text>
            </View>
          </View>
        )}
      </LinearGradient>
    </View>
  );
};

export default UsageTracker;
