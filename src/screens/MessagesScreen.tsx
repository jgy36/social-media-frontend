// src/screens/MessagesScreen.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  Image,
  RefreshControl,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { RootStackNavigationProp } from "@/navigation/types";
import { getPhotoMessageConversations } from "@/api/photoMessages";

interface PhotoConversation {
  userId: number;
  username: string;
  displayName: string;
  profileImageUrl?: string;
  unreadCount: number;
  lastMessageAt: string;
}

const MessagesScreen = () => {
  const navigation = useNavigation<RootStackNavigationProp>();
  const [conversations, setConversations] = useState<PhotoConversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async (isRefresh = false) => {
    try {
      if (!isRefresh) setLoading(true);
      const convos = await getPhotoMessageConversations();
      setConversations(convos);
    } catch (error) {
      console.error("Failed to load conversations:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadConversations(true);
  };

  const formatLastMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffTime / (1000 * 60));
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMinutes < 1) return "now";
    if (diffMinutes < 60) return `${diffMinutes}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return date.toLocaleDateString();
  };

  const renderConversation = ({ item }: { item: PhotoConversation }) => (
    <TouchableOpacity
      className="flex-row items-center p-4 border-b border-gray-800"
      onPress={() =>
        navigation.navigate("PhotoConversation", { userId: item.userId })
      }
    >
      {/* Profile Image */}
      <View className="relative mr-4">
        <Image
          source={{
            uri:
              item.profileImageUrl ||
              `https://api.dicebear.com/7.x/avataaars/svg?seed=${item.username}`,
          }}
          className="w-14 h-14 rounded-full"
        />
        {item.unreadCount > 0 && (
          <View className="absolute -top-1 -right-1 bg-red-500 rounded-full min-w-[20px] h-[20px] items-center justify-center">
            <Text className="text-white text-xs font-bold">
              {item.unreadCount > 99 ? "99+" : item.unreadCount}
            </Text>
          </View>
        )}
      </View>

      {/* Conversation Info */}
      <View className="flex-1">
        <Text className="text-white font-semibold text-lg">
          {item.displayName || item.username}
        </Text>
        <Text className="text-gray-400 text-sm mt-1">
          {item.unreadCount > 0 ? "New photo message" : "Photo conversation"}
        </Text>
      </View>

      {/* Time and Camera Icon */}
      <View className="items-end">
        <Text className="text-gray-400 text-xs mb-1">
          {formatLastMessageTime(item.lastMessageAt)}
        </Text>
        <MaterialIcons name="photo-camera" size={20} color="#E91E63" />
      </View>
    </TouchableOpacity>
  );

  const renderEmpty = () => (
    <View className="flex-1 items-center justify-center py-16">
      <MaterialIcons name="photo-camera" size={80} color="#6B7280" />
      <Text className="text-white text-xl font-semibold mt-6 mb-2">
        No Conversations Yet
      </Text>
      <Text className="text-gray-400 text-base text-center px-8 leading-6">
        Send photo messages to your matches to start conversations that
        disappear after viewing!
      </Text>

      <TouchableOpacity
        onPress={() => navigation.navigate("Dating")}
        className="bg-pink-500 rounded-full px-6 py-3 mt-6"
      >
        <Text className="text-white font-semibold">Find Matches</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-black">
      {/* Header */}
      <View className="px-4 py-3 border-b border-gray-800">
        <View className="flex-row items-center justify-between">
          <Text className="text-xl font-bold text-white">Snap</Text>

          <View className="flex-row">
            <TouchableOpacity
              onPress={() => navigation.navigate("PhotoCamera", {})}
              className="w-10 h-10 bg-pink-500 rounded-full items-center justify-center"
            >
              <MaterialIcons name="camera-alt" size={20} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        <Text className="text-gray-400 text-sm mt-2">
          Photo messages disappear after viewing
        </Text>
      </View>

      {/* Conversations List */}
      <View className="flex-1">
        {loading ? (
          <View className="flex-1 items-center justify-center">
            <Text className="text-white">Loading conversations...</Text>
          </View>
        ) : (
          <FlatList
            data={conversations}
            renderItem={renderConversation}
            keyExtractor={(item) => item.userId.toString()}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                tintColor="#E91E63"
              />
            }
            ListEmptyComponent={renderEmpty}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>

      {/* Bottom Tips */}
      <View className="px-4 py-2 border-t border-gray-800">
        <Text className="text-center text-gray-500 text-xs">
          📸 Tap camera to send • 💕 Messages from matches appear here
        </Text>
      </View>
    </SafeAreaView>
  );
};

export default MessagesScreen;
