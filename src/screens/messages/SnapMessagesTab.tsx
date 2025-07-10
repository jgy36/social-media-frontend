// src/screens/messages/SnapMessagesTab.tsx - All green, no pink
import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Image,
  RefreshControl,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import type { RootStackNavigationProp } from "@/navigation/types";
import {
  getEnhancedPhotoMessageConversations,
  EnhancedPhotoConversation,
} from "@/api/photoMessages";

interface SnapMessagesTabProps {
  onCameraIconPress?: (recipientId: number, recipientName: string) => void;
}

const SnapMessagesTab: React.FC<SnapMessagesTabProps> = ({
  onCameraIconPress,
}) => {
  const navigation = useNavigation<RootStackNavigationProp>();
  const currentUser = useSelector((state: RootState) => state.user);
  const [conversations, setConversations] = useState<
    EnhancedPhotoConversation[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadConversations = async () => {
    try {
      console.log("📱 Loading snap conversations...");
      const data = await getEnhancedPhotoMessageConversations();
      console.log(
        "📊 Snap conversations loaded:",
        data.length,
        "conversations"
      );

      setConversations(data);
    } catch (error) {
      console.error("❌ Failed to load conversations:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadConversations();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadConversations();
    }, [])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadConversations();
  }, []);

  const formatDetailedTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffTime / (1000 * 60));
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMinutes < 1) return "delivered now";
    if (diffMinutes < 60)
      return `delivered ${diffMinutes} minute${diffMinutes > 1 ? "s" : ""} ago`;
    if (diffHours < 24)
      return `delivered ${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    if (diffDays < 7)
      return `delivered ${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
    return `delivered ${date.toLocaleDateString()}`;
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));

    if (diffHours < 1) return "now";
    if (diffHours < 24) return `${diffHours}h`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d`;
    return date.toLocaleDateString();
  };

  const getConversationStatus = (conversation: EnhancedPhotoConversation) => {
    if (conversation.isNewMatch) {
      return {
        type: "newMatch",
        text: "New Match!",
        color: "#10B981", // Changed from #FF6B9D to green
        showSnapIcon: false,
      };
    }

    if (conversation.unreadCount > 0) {
      return {
        type: "receivedSnap",
        text: "New Snap",
        color: "#FF4757",
        showSnapIcon: true,
        snapOpened: false,
      };
    }

    if (conversation.lastMessage) {
      const isSentByCurrentUser =
        conversation.lastMessage.senderId === currentUser.id;
      const isMessageViewed = conversation.lastMessage.isViewed;

      if (isSentByCurrentUser) {
        return {
          type: "sentSnap",
          text: formatDetailedTime(conversation.lastMessageAt),
          color: "#8E8E93",
          showSnapIcon: true,
          snapOpened: isMessageViewed,
        };
      } else {
        return {
          type: "receivedSnap",
          text: formatDetailedTime(conversation.lastMessageAt),
          color: "#8E8E93",
          showSnapIcon: true,
          snapOpened: true,
        };
      }
    }

    if (conversation.isMatch) {
      return {
        type: "match",
        text: "Say hello! 👋",
        color: "#10B981", // Changed from #FF6B9D to green
        showSnapIcon: false,
      };
    }

    return {
      type: "noActivity",
      text: "Start a conversation",
      color: "#8E8E93",
      showSnapIcon: false,
    };
  };

  const renderSnapIcon = (status: any) => {
    if (!status.showSnapIcon) {
      if (status.type === "newMatch" || status.type === "match") {
        return (
          <MaterialIcons
            name="favorite"
            size={14}
            color={status.color}
            style={{ marginRight: 4 }}
          />
        );
      }
      return null;
    }

    if (status.type === "receivedSnap") {
      return (
        <View
          style={{
            width: 14,
            height: 14,
            borderRadius: 2,
            backgroundColor: status.snapOpened ? "transparent" : "#FF4757",
            borderWidth: status.snapOpened ? 1.5 : 0,
            borderColor: status.snapOpened ? "#FFFFFF" : "transparent",
            marginRight: 8,
          }}
        />
      );
    }

    if (status.type === "sentSnap") {
      const renderSingleChevron = () => (
        <View
          style={{
            width: 16,
            height: 14,
            marginLeft: 2,
            justifyContent: "center",
            alignItems: "center",
            position: "relative",
          }}
        >
          <View
            style={{
              width: 12,
              height: 12,
              borderRightWidth: 6,
              borderTopWidth: 6,
              borderRightColor: "#10B981",
              borderTopColor: "#10B981",
              transform: [{ rotate: "45deg" }],
              backgroundColor: "transparent",
            }}
          />
          {status.snapOpened && (
            <View
              style={{
                position: "absolute",
                width: 8,
                height: 8,
                borderRightWidth: 3,
                borderTopWidth: 3,
                borderRightColor: "#000000",
                borderTopColor: "#000000",
                transform: [{ rotate: "45deg" }],
                backgroundColor: "transparent",
              }}
            />
          )}
        </View>
      );

      return (
        <View
          style={{
            width: 52,
            height: 16,
            marginRight: 8,
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "row",
          }}
        >
          {renderSingleChevron()}
          {renderSingleChevron()}
          {renderSingleChevron()}
        </View>
      );
    }

    return null;
  };

  const renderConversation = ({
    item,
  }: {
    item: EnhancedPhotoConversation;
  }) => {
    const status = getConversationStatus(item);

    return (
      <TouchableOpacity
        onPress={() =>
          navigation.navigate("PhotoConversation", { userId: item.userId })
        }
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 16,
          paddingVertical: 12,
          backgroundColor: "#000000",
        }}
        activeOpacity={0.8}
      >
        <View style={{ position: "relative" }}>
          <Image
            source={{
              uri:
                item.profileImageUrl ||
                `https://api.dicebear.com/7.x/avataaars/svg?seed=${item.username}`,
            }}
            style={{
              width: 60,
              height: 60,
              borderRadius: 30,
              borderWidth: item.unreadCount > 0 ? 3 : 2,
              borderColor: item.unreadCount > 0 ? "#FF4757" : "#2F3542",
            }}
          />

          {item.isMatch && (
            <View
              style={{
                position: "absolute",
                bottom: -2,
                right: -2,
                backgroundColor: "#10B981", // Changed from #FF6B9D to green
                borderRadius: 10,
                width: 20,
                height: 20,
                justifyContent: "center",
                alignItems: "center",
                borderWidth: 2,
                borderColor: "#000000",
              }}
            >
              <MaterialIcons name="favorite" size={12} color="white" />
            </View>
          )}
        </View>

        <View style={{ flex: 1, marginLeft: 12 }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 4,
            }}
          >
            <Text
              style={{
                color: "#FFFFFF",
                fontSize: 16,
                fontWeight: "600",
                flex: 1,
              }}
            >
              {item.displayName || item.username}
            </Text>

            <Text
              style={{
                color: "#8E8E93",
                fontSize: 14,
              }}
            >
              {formatTime(item.lastMessageAt)}
            </Text>
          </View>

          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <View
              style={{ flexDirection: "row", alignItems: "center", flex: 1 }}
            >
              {renderSnapIcon(status)}

              <Text
                style={{
                  color: status.color,
                  fontSize: 14,
                  fontWeight: status.showSnapIcon ? "400" : "500",
                  flex: 1,
                }}
                numberOfLines={1}
              >
                {status.text}
              </Text>
            </View>

            {item.unreadCount > 0 && (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    color: "#8E8E93",
                    fontSize: 14,
                    marginRight: 4,
                  }}
                >
                  {item.unreadCount}
                </Text>
                <MaterialIcons
                  name="local-fire-department"
                  size={16}
                  color="#FFA502"
                />
              </View>
            )}
          </View>
        </View>

        <TouchableOpacity
          onPress={() => {
            if (onCameraIconPress) {
              onCameraIconPress(item.userId, item.displayName || item.username);
            } else {
              navigation.navigate("PhotoCamera", { recipientId: item.userId });
            }
          }}
          style={{
            width: 32,
            height: 32,
            borderRadius: 16,
            backgroundColor: "#2F3542",
            justifyContent: "center",
            alignItems: "center",
            marginLeft: 8,
          }}
        >
          <MaterialIcons name="camera-alt" size={18} color="#8E8E93" />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 32,
      }}
    >
      <View
        style={{
          width: 100,
          height: 100,
          borderRadius: 50,
          backgroundColor: "#2F3542",
          justifyContent: "center",
          alignItems: "center",
          marginBottom: 24,
        }}
      >
        <MaterialIcons name="photo-camera" size={40} color="#8E8E93" />
      </View>

      <Text
        style={{
          color: "#FFFFFF",
          fontSize: 20,
          fontWeight: "600",
          textAlign: "center",
          marginBottom: 8,
        }}
      >
        No Snaps Yet
      </Text>

      <Text
        style={{
          color: "#8E8E93",
          fontSize: 16,
          textAlign: "center",
          lineHeight: 22,
          marginBottom: 24,
        }}
      >
        Send a Snap to start the conversation!
      </Text>

      <TouchableOpacity
        onPress={() => navigation.navigate("Dating")}
        style={{
          backgroundColor: "#10B981", // Changed from #FF6B9D to green
          borderRadius: 25,
          paddingHorizontal: 24,
          paddingVertical: 12,
        }}
      >
        <Text
          style={{
            color: "#FFFFFF",
            fontSize: 16,
            fontWeight: "600",
          }}
        >
          Find Friends
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderHeader = () => (
    <View
      style={{
        paddingHorizontal: 16,
        paddingVertical: 16,
        backgroundColor: "#000000",
      }}
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Text
          style={{
            color: "#FFFFFF",
            fontSize: 24,
            fontWeight: "bold",
          }}
        >
          Chat
        </Text>

        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <TouchableOpacity
            style={{
              width: 32,
              height: 32,
              borderRadius: 16,
              backgroundColor: "#2F3542",
              justifyContent: "center",
              alignItems: "center",
              marginLeft: 12,
            }}
          >
            <MaterialIcons name="search" size={18} color="#8E8E93" />
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              width: 32,
              height: 32,
              borderRadius: 16,
              backgroundColor: "#FFFF00",
              justifyContent: "center",
              alignItems: "center",
              marginLeft: 12,
            }}
          >
            <MaterialIcons name="person-add" size={18} color="#000000" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#000000",
        }}
      >
        <MaterialIcons name="photo-camera" size={40} color="#8E8E93" />
        <Text style={{ color: "#8E8E93", marginTop: 12 }}>
          Loading chats...
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#000000" }}>
      <FlatList
        data={conversations}
        renderItem={renderConversation}
        keyExtractor={(item) => item.userId.toString()}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={loading ? null : renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#10B981" // Changed from #FF6B9D to green
            colors={["#10B981"]} // Changed from #FF6B9D to green
          />
        }
        showsVerticalScrollIndicator={false}
        style={{ backgroundColor: "#000000" }}
      />
    </View>
  );
};

export default SnapMessagesTab;
