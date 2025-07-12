// src/components/subscription/PaywallModal.tsx
import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Image,
  Dimensions,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";

const { width, height } = Dimensions.get("window");

interface PaywallModalProps {
  visible: boolean;
  feature: string | null;
  onClose: () => void;
  onUpgrade: () => void;
}

const PaywallModal: React.FC<PaywallModalProps> = ({
  visible,
  feature,
  onClose,
  onUpgrade,
}) => {
  const navigation = useNavigation();

  const getFeatureInfo = (feature: string) => {
    switch (feature) {
      case "super_like":
        return {
          title: "Out of Super Likes! ⭐",
          description:
            "You've used all your daily super likes. Upgrade to get more!",
          icon: "star",
          color: "#FFD700",
          benefits: [
            "5-10 Super Likes per day",
            "3x more likely to match",
            "Stand out from the crowd",
          ],
        };
      case "undo_swipe":
        return {
          title: "Undo That Swipe! ↩️",
          description:
            "Accidentally swiped left? Undo swipes are available with premium!",
          icon: "undo",
          color: "#10B981",
          benefits: [
            "Undo accidental swipes",
            "Never miss a connection",
            "Take back that 'no'",
          ],
        };
      case "boost":
        return {
          title: "Boost Your Profile! 🚀",
          description: "Get 10x more profile views for 30 minutes!",
          icon: "trending-up",
          color: "#8B5CF6",
          benefits: [
            "10x more profile views",
            "Be seen by more people",
            "Get matches faster",
          ],
        };
      case "see_likes":
        return {
          title: "See Who Likes You! 👀",
          description: "Don't guess - see everyone who already likes you!",
          icon: "visibility",
          color: "#F59E0B",
          benefits: [
            "See all your likes",
            "Skip the guessing game",
            "Instant matches guaranteed",
          ],
        };
      default:
        return {
          title: "Upgrade to Premium! 💎",
          description: "Unlock all premium dating features!",
          icon: "diamond",
          color: "#E91E63",
          benefits: [
            "Unlimited features",
            "Better matches",
            "Premium experience",
          ],
        };
    }
  };

  const featureInfo = getFeatureInfo(feature || "");

  const handleUpgrade = () => {
    onClose();
    (navigation as any).navigate("SubscriptionPlans");
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
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
            width: width * 0.9,
            maxWidth: 400,
            backgroundColor: "white",
            borderRadius: 24,
            overflow: "hidden",
          }}
        >
          {/* Header with gradient */}
          <LinearGradient
            colors={[featureInfo.color, featureInfo.color + "80"]}
            style={{
              padding: 24,
              alignItems: "center",
            }}
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
              <MaterialIcons
                name={featureInfo.icon as any}
                size={40}
                color="white"
              />
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
              {featureInfo.title}
            </Text>

            <Text
              style={{
                fontSize: 16,
                color: "rgba(255,255,255,0.9)",
                textAlign: "center",
                lineHeight: 22,
              }}
            >
              {featureInfo.description}
            </Text>
          </LinearGradient>

          {/* Benefits */}
          <View style={{ padding: 24 }}>
            <Text
              style={{
                fontSize: 18,
                fontWeight: "bold",
                color: "#111827",
                marginBottom: 16,
              }}
            >
              With Premium you get:
            </Text>

            {featureInfo.benefits.map((benefit, index) => (
              <View
                key={index}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 12,
                }}
              >
                <MaterialIcons
                  name="check-circle"
                  size={20}
                  color={featureInfo.color}
                />
                <Text
                  style={{
                    fontSize: 16,
                    color: "#374151",
                    marginLeft: 12,
                    flex: 1,
                  }}
                >
                  {benefit}
                </Text>
              </View>
            ))}

            {/* CTA Buttons */}
            <View style={{ marginTop: 24, gap: 12 }}>
              <TouchableOpacity
                onPress={handleUpgrade}
                style={{
                  backgroundColor: featureInfo.color,
                  borderRadius: 16,
                  paddingVertical: 16,
                  paddingHorizontal: 24,
                }}
                activeOpacity={0.8}
              >
                <Text
                  style={{
                    color: "white",
                    fontSize: 18,
                    fontWeight: "bold",
                    textAlign: "center",
                  }}
                >
                  Start 7-Day Free Trial
                </Text>
              </TouchableOpacity>

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
                  Maybe Later
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default PaywallModal;
