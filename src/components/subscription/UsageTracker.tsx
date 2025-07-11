import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface UsageData {
  dailySwipesUsed: number;
  dailySwipeLimit: number;
  dailySuperLikesUsed: number;
  dailySuperLikeLimit: number;
  monthlyBoostsUsed: number;
  monthlyBoostLimit: number;
}

interface UsageTrackerProps {
  onUpgradePress?: () => void;
}

const UsageTracker: React.FC<UsageTrackerProps> = ({ onUpgradePress }) => {
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsage();
  }, []);

  const fetchUsage = async () => {
    try {
      // TODO: Replace with your actual token retrieval method
      // You might get this from Redux store, AsyncStorage, or context
      const token = "your_auth_token_here";

      const response = await fetch("/api/subscription/usage", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      setUsage(data);
    } catch (error) {
      console.error("Error fetching usage:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !usage) {
    return null;
  }

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
            <Ionicons name={icon as any} size={16} color="#6B7280" />
            <Text className="ml-2 text-sm font-medium text-gray-700">
              {label}
            </Text>
          </View>
          <Text className="text-sm text-gray-600">
            {isUnlimited ? "Unlimited" : `${used}/${limit}`}
          </Text>
        </View>

        {!isUnlimited && (
          <View className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <View
              className="h-full rounded-full"
              style={{
                width: `${percentage}%`,
                backgroundColor: isNearLimit ? "#EF4444" : "#10B981",
              }}
            />
          </View>
        )}

        {!isUnlimited && isNearLimit && (
          <Text className="text-xs text-red-600 mt-1">
            {used >= limit ? "Limit reached" : "Almost at limit"}
          </Text>
        )}
      </View>
    );
  };

  return (
    <View className="bg-white rounded-xl p-4 mx-4 mb-4 shadow-sm border border-gray-100">
      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-lg font-bold text-gray-900">Daily Usage</Text>
        <TouchableOpacity onPress={onUpgradePress}>
          <Text className="text-pink-500 font-medium text-sm">Upgrade</Text>
        </TouchableOpacity>
      </View>

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
    </View>
  );
};

export default UsageTracker;
