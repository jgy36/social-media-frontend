// src/components/dating/MatchCelebrationModal.tsx - Tinder-style match celebration
import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Image,
  Animated,
  Dimensions,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { RootStackNavigationProp } from "@/navigation/types";

const { width, height } = Dimensions.get("window");

interface MatchData {
  id: number;
  user1: {
    id: number;
    username: string;
    displayName: string;
    profileImageUrl?: string;
  };
  user2: {
    id: number;
    username: string;
    displayName: string;
    profileImageUrl?: string;
  };
  matchedAt: string;
}

interface MatchCelebrationModalProps {
  visible: boolean;
  match: MatchData | null;
  currentUserId: number;
  onClose: () => void;
}

const MatchCelebrationModal: React.FC<MatchCelebrationModalProps> = ({
  visible,
  match,
  currentUserId,
  onClose,
}) => {
  const navigation = useNavigation<RootStackNavigationProp>();
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible && match) {
      // Animate in
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Reset animations
      scaleAnim.setValue(0);
      fadeAnim.setValue(0);
    }
  }, [visible, match]);

  if (!match) return null;

  // Get the other user (not the current user)
  const otherUser =
    match.user1.id === currentUserId ? match.user2 : match.user1;

  const handleSendPhoto = () => {
    onClose();
    navigation.navigate("PhotoCamera", { recipientId: otherUser.id });
  };

  const handleSendMessage = () => {
    onClose();
    navigation.navigate("PhotoConversation", { userId: otherUser.id });
  };

  const handleKeepSwiping = () => {
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.9)",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
            width: width * 0.9,
            maxWidth: 400,
            backgroundColor: "white",
            borderRadius: 24,
            padding: 24,
            alignItems: "center",
          }}
        >
          {/* Match Header */}
          <View style={{ alignItems: "center", marginBottom: 32 }}>
            <Text
              style={{
                fontSize: 32,
                fontWeight: "bold",
                color: "#E91E63",
                marginBottom: 8,
              }}
            >
              It's a Match! 💕
            </Text>
            <Text
              style={{
                fontSize: 16,
                color: "#666",
                textAlign: "center",
              }}
            >
              You and {otherUser.displayName || otherUser.username} liked each
              other
            </Text>
          </View>

          {/* Profile Photos */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 32,
            }}
          >
            {/* Current User Photo */}
            <Image
              source={{
                uri: `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUserId}`,
              }}
              style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                borderWidth: 3,
                borderColor: "#E91E63",
              }}
            />

            {/* Heart Icon */}
            <View
              style={{
                marginHorizontal: 20,
                backgroundColor: "#E91E63",
                borderRadius: 20,
                padding: 8,
              }}
            >
              <MaterialIcons name="favorite" size={24} color="white" />
            </View>

            {/* Other User Photo */}
            <Image
              source={{
                uri:
                  otherUser.profileImageUrl ||
                  `https://api.dicebear.com/7.x/avataaars/svg?seed=${otherUser.username}`,
              }}
              style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                borderWidth: 3,
                borderColor: "#E91E63",
              }}
            />
          </View>

          {/* Action Buttons */}
          <View style={{ width: "100%", gap: 12 }}>
            {/* Send Snap Button */}
            <TouchableOpacity
              onPress={handleSendPhoto}
              style={{
                backgroundColor: "#E91E63",
                borderRadius: 25,
                paddingVertical: 16,
                paddingHorizontal: 24,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <MaterialIcons name="photo-camera" size={20} color="white" />
              <Text
                style={{
                  color: "white",
                  fontSize: 16,
                  fontWeight: "600",
                  marginLeft: 8,
                }}
              >
                Send a Snap
              </Text>
            </TouchableOpacity>

            {/* Send Message Button */}
            <TouchableOpacity
              onPress={handleSendMessage}
              style={{
                backgroundColor: "transparent",
                borderWidth: 2,
                borderColor: "#E91E63",
                borderRadius: 25,
                paddingVertical: 14,
                paddingHorizontal: 24,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <MaterialIcons name="message" size={20} color="#E91E63" />
              <Text
                style={{
                  color: "#E91E63",
                  fontSize: 16,
                  fontWeight: "600",
                  marginLeft: 8,
                }}
              >
                Start Chatting
              </Text>
            </TouchableOpacity>

            {/* Keep Swiping Button */}
            <TouchableOpacity
              onPress={handleKeepSwiping}
              style={{
                paddingVertical: 12,
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  color: "#999",
                  fontSize: 14,
                  fontWeight: "500",
                }}
              >
                Keep Swiping
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

export default MatchCelebrationModal;
