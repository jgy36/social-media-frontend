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
  const [tiers, setTiers] = useState<Record<string, SubscriptionTier>>({});
  const [selectedTier, setSelectedTier] = useState<string>("premium");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubscriptionTiers();
  }, []);

  const fetchSubscriptionTiers = async () => {
    try {
      const response = await fetch("/api/subscription/tiers");
      const data = await response.json();
      setTiers(data.tiers);
    } catch (error) {
      console.error("Error fetching subscription tiers:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async () => {
    try {
      navigation.navigate("PaymentScreen", {
        tier: selectedTier,
        priceId: tiers[selectedTier]?.priceId,
      } as never);
    } catch (error) {
      Alert.alert("Error", "Failed to start upgrade process");
    }
  };

  const TierCard: React.FC<{ tierKey: string; tier: SubscriptionTier }> = ({
    tierKey,
    tier,
  }) => {
    const isSelected = selectedTier === tierKey;
    const isPopular = tierKey === "premium";

    return (
      <TouchableOpacity
        className="mb-4 rounded-2xl p-6 border-2"
        style={{
          borderColor: isSelected ? "#FF6B9D" : "#E5E7EB",
          backgroundColor: isSelected ? "#FFF5F8" : "#FFFFFF",
        }}
        onPress={() => setSelectedTier(tierKey)}
        activeOpacity={0.8}
      >
        {isPopular && (
          <View
            className="absolute -top-3 right-4 px-3 py-1 rounded-full"
            style={{ backgroundColor: "#FF6B9D" }}
          >
            <Text className="text-white text-xs font-bold">MOST POPULAR</Text>
          </View>
        )}

        <View className="flex-row items-center justify-between mb-3">
          <View>
            <Text className="text-xl font-bold text-gray-900">{tier.name}</Text>
            <Text className="text-gray-600 text-sm">{tier.description}</Text>
          </View>
          <View className="items-end">
            <Text className="text-2xl font-bold text-gray-900">
              ${tier.price}
            </Text>
            <Text className="text-gray-500 text-sm">/month</Text>
          </View>
        </View>

        <View className="space-y-2">
          {Object.entries(tier.features).map(([feature, value]) => (
            <FeatureRow key={feature} feature={feature} value={value} />
          ))}
        </View>

        {isSelected && (
          <View className="mt-4 flex-row items-center">
            <Ionicons name="checkmark-circle" size={20} color="#FF6B9D" />
            <Text className="ml-2 text-pink-500 font-medium">Selected</Text>
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
