import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Alert,
  ActivityIndicator,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { boostProfile, getBoostStatus, BoostStatus } from "@/api/dating";

interface BoostModalProps {
  visible: boolean;
  onClose: () => void;
  onBoostSuccess?: () => void;
}

const BoostModal: React.FC<BoostModalProps> = ({
  visible,
  onClose,
  onBoostSuccess,
}) => {
  const { current: subscription } = useSelector(
    (state: RootState) => state.subscription
  );
  const [boostStatus, setBoostStatus] = useState<BoostStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState<string>("");

  // Load boost status when modal opens
  useEffect(() => {
    if (visible) {
      loadBoostStatus();
    }
  }, [visible]);

  // Update countdown timer
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (boostStatus?.isBoosted && boostStatus.boostEndsAt) {
      interval = setInterval(() => {
        const now = new Date();
        const endTime = new Date(boostStatus.boostEndsAt!);
        const diff = endTime.getTime() - now.getTime();

        if (diff <= 0) {
          setTimeLeft("Boost ended");
          loadBoostStatus(); // Refresh status
        } else {
          const minutes = Math.floor(diff / 60000);
          const seconds = Math.floor((diff % 60000) / 1000);
          setTimeLeft(`${minutes}:${seconds.toString().padStart(2, "0")}`);
        }
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [boostStatus]);

  const loadBoostStatus = async () => {
    try {
      const status = await getBoostStatus();
      setBoostStatus(status);
    } catch (error) {
      console.error("Failed to load boost status:", error);
    }
  };

  const handleBoost = async () => {
    if (!boostStatus?.canBoost) return;

    try {
      setLoading(true);
      const response = await boostProfile();

      if (response.success) {
        Alert.alert(
          "Profile Boosted! 🚀",
          "Your profile will be shown to 10x more people for the next 30 minutes!",
          [{ text: "Awesome!" }]
        );

        await loadBoostStatus(); // Refresh status
        onBoostSuccess?.();
      } else if (response.upgradeRequired) {
        Alert.alert(
          "Upgrade Required",
          "You've reached your monthly boost limit. Upgrade to get more boosts!",
          [
            { text: "Maybe Later", style: "cancel" },
            { text: "Upgrade", onPress: onClose }, // Will navigate to subscription
          ]
        );
      }
    } catch (error: any) {
      console.error("Failed to boost profile:", error);
      Alert.alert("Error", "Failed to boost profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getBoostLimits = () => {
    switch (subscription?.tier) {
      case "ESSENTIAL":
        return { monthly: 1, daily: "1 per month" };
      case "PREMIUM":
        return { monthly: 3, daily: "3 per month" };
      case "VIP":
        return { monthly: 4, daily: "1 per week" };
      default:
        return { monthly: 0, daily: "Not available" };
    }
  };

  const limits = getBoostLimits();

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.8)",
          justifyContent: "center",
          alignItems: "center",
          padding: 20,
        }}
      >
        <View
          style={{
            width: "100%",
            maxWidth: 400,
            backgroundColor: "white",
            borderRadius: 24,
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <LinearGradient
            colors={["#8B5CF6", "#A78BFA"]}
            style={{ padding: 24, alignItems: "center" }}
          >
            <View
              style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                backgroundColor: "rgba(255,255,255,0.2)",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 16,
              }}
            >
              <MaterialIcons name="trending-up" size={40} color="white" />
            </View>

            <Text
              style={{
                fontSize: 24,
                fontWeight: "bold",
                color: "white",
                textAlign: "center",
                marginBottom: 8,
              }}
            >
              Profile Boost 🚀
            </Text>

            <Text
              style={{
                fontSize: 16,
                color: "rgba(255,255,255,0.9)",
                textAlign: "center",
                lineHeight: 22,
              }}
            >
              Get 10x more profile views for 30 minutes
            </Text>
          </LinearGradient>

          {/* Content */}
          <View style={{ padding: 24 }}>
            {boostStatus?.isBoosted ? (
              // Currently Boosted
              <View style={{ alignItems: "center", marginBottom: 24 }}>
                <View
                  style={{
                    backgroundColor: "#10B981",
                    borderRadius: 50,
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                    marginBottom: 12,
                  }}
                >
                  <Text style={{ color: "white", fontWeight: "bold" }}>
                    ⚡ BOOST ACTIVE
                  </Text>
                </View>

                <Text
                  style={{
                    fontSize: 32,
                    fontWeight: "bold",
                    color: "#8B5CF6",
                    marginBottom: 4,
                  }}
                >
                  {timeLeft}
                </Text>

                <Text style={{ color: "#6B7280", textAlign: "center" }}>
                  Your profile is being shown to more people right now!
                </Text>
              </View>
            ) : (
              // Not Boosted
              <View style={{ marginBottom: 24 }}>
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: "bold",
                    color: "#111827",
                    marginBottom: 16,
                  }}
                >
                  How Boost Works:
                </Text>

                {[
                  "📈 10x more profile views",
                  "⏰ Lasts for 30 minutes",
                  "👀 Get seen by more people",
                  "💕 Increase your match rate",
                ].map((benefit, index) => (
                  <View
                    key={index}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginBottom: 12,
                    }}
                  >
                    <Text style={{ fontSize: 16, color: "#374151" }}>
                      {benefit}
                    </Text>
                  </View>
                ))}

                <Text
                  style={{
                    color: "#6B7280",
                    fontSize: 14,
                    textAlign: "center",
                    marginTop: 16,
                  }}
                >
                  Your plan: {limits.daily}
                </Text>
              </View>
            )}

            {/* Action Buttons */}
            <View style={{ gap: 12 }}>
              {boostStatus?.canBoost && !boostStatus.isBoosted && (
                <TouchableOpacity
                  onPress={handleBoost}
                  disabled={loading}
                  style={{
                    backgroundColor: loading ? "#D1D5DB" : "#8B5CF6",
                    borderRadius: 16,
                    paddingVertical: 16,
                    paddingHorizontal: 24,
                  }}
                  activeOpacity={0.8}
                >
                  {loading ? (
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <ActivityIndicator color="white" />
                      <Text
                        style={{
                          color: "white",
                          fontSize: 18,
                          fontWeight: "bold",
                          marginLeft: 8,
                        }}
                      >
                        Boosting...
                      </Text>
                    </View>
                  ) : (
                    <Text
                      style={{
                        color: "white",
                        fontSize: 18,
                        fontWeight: "bold",
                        textAlign: "center",
                      }}
                    >
                      Boost My Profile 🚀
                    </Text>
                  )}
                </TouchableOpacity>
              )}

              <TouchableOpacity
                onPress={onClose}
                style={{
                  paddingVertical: 12,
                  paddingHorizontal: 24,
                }}
                activeOpacity={0.7}
              >
                <Text
                  style={{
                    color: "#6B7280",
                    fontSize: 16,
                    textAlign: "center",
                  }}
                >
                  {boostStatus?.isBoosted ? "Close" : "Maybe Later"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default BoostModal;
