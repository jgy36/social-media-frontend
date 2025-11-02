// src/components/dating/LikesList.tsx - Component for "Who Liked Me" feature
import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
  RefreshControl,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { DatingProfile, likeUserBack } from "@/api/dating";

interface LikesListProps {
  likes: DatingProfile[];
  onLikePress: (profile: DatingProfile) => void;
  onRefresh: () => void;
  onNewMatch?: (matchData: any) => void;
}

const LikesList: React.FC<LikesListProps> = ({
  likes,
  onLikePress,
  onRefresh,
  onNewMatch,
}) => {
  const { current: subscription } = useSelector(
    (state: RootState) => state.subscription
  );
  const [refreshing, setRefreshing] = useState(false);
  const [likingBack, setLikingBack] = useState<number | null>(null);

  const hasAccess = () => {
    return subscription?.tier !== "FREE";
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await onRefresh();
    setRefreshing(false);
  };

  const handleLikeBack = async (profile: DatingProfile) => {
    if (!hasAccess()) {
      Alert.alert(
        "Upgrade Required",
        "Upgrade to see who liked you and like them back!",
        [{ text: "OK" }]
      );
      return;
    }

    try {
      setLikingBack(profile.id);
      console.log("💕 Liking back user:", profile.user?.username);

      const response = await likeUserBack(profile.user?.id || profile.id);

      if (response.matched && response.match) {
        console.log("🎉 It's a match from like back!", response.match);

        Alert.alert(
          "It's a Match! 💕",
          `You and ${
            profile.user?.displayName || profile.user?.username
          } liked each other!`,
          [{ text: "Awesome!" }]
        );

        // Notify parent component about the new match
        onNewMatch?.(response.match);
      } else {
        // Liked back successfully but no match yet
        Alert.alert(
          "Like Sent! 💚",
          `You liked ${
            profile.user?.displayName || profile.user?.username
          } back!`,
          [{ text: "Great!" }]
        );
      }

      // Refresh the list to remove this profile
      setTimeout(() => {
        onRefresh();
      }, 1000);
    } catch (error: any) {
      console.error("❌ Failed to like back:", error);
      Alert.alert("Error", "Failed to like back. Please try again.");
    } finally {
      setLikingBack(null);
    }
  };

  const renderLikeItem = ({ item: profile }: { item: DatingProfile }) => {
    const isLikingBack = likingBack === profile.id;

    return (
      <View
        style={{
          backgroundColor: "white",
          marginHorizontal: 16,
          marginVertical: 8,
          borderRadius: 16,
          padding: 16,
          flexDirection: "row",
          alignItems: "center",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 4,
        }}
      >
        {/* Profile Photo */}
        <TouchableOpacity
          onPress={() => onLikePress(profile)}
          style={{
            width: 80,
            height: 80,
            borderRadius: 40,
            overflow: "hidden",
            marginRight: 16,
          }}
        >
          <Image
            source={{
              uri:
                (profile.photos && profile.photos[0]) ||
                `https://api.dicebear.com/7.x/avataaars/svg?seed=${
                  profile.user?.username || "default"
                }`,
            }}
            style={{ width: "100%", height: "100%" }}
            resizeMode="cover"
          />

          {/* Blur overlay for free users */}
          {!hasAccess() && (
            <View
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: "rgba(0,0,0,0.6)",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <MaterialIcons name="lock" size={24} color="white" />
            </View>
          )}
        </TouchableOpacity>

        {/* Profile Info */}
        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontSize: 18,
              fontWeight: "bold",
              color: "#111827",
              marginBottom: 4,
            }}
          >
            {hasAccess()
              ? `${
                  profile.user?.displayName ||
                  profile.user?.username ||
                  "Unknown"
                }, ${profile.age || profile.user?.age || "?"}`
              : "Someone liked you!"}
          </Text>

          {hasAccess() && profile.bio && (
            <Text
              style={{
                color: "#6B7280",
                fontSize: 14,
                marginBottom: 8,
              }}
              numberOfLines={2}
            >
              {profile.bio}
            </Text>
          )}

          {hasAccess() && profile.location && (
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <MaterialIcons name="location-on" size={16} color="#9CA3AF" />
              <Text style={{ color: "#9CA3AF", fontSize: 12, marginLeft: 4 }}>
                {profile.location}
              </Text>
            </View>
          )}

          {!hasAccess() && (
            <Text style={{ color: "#9CA3AF", fontSize: 14 }}>
              Upgrade to see who liked you
            </Text>
          )}
        </View>

        {/* Action Button */}
        {hasAccess() ? (
          <TouchableOpacity
            onPress={() => handleLikeBack(profile)}
            disabled={isLikingBack}
            style={{
              backgroundColor: isLikingBack ? "#D1D5DB" : "#10B981",
              borderRadius: 25,
              paddingHorizontal: 20,
              paddingVertical: 10,
              minWidth: 80,
              alignItems: "center",
            }}
            activeOpacity={0.8}
          >
            {isLikingBack ? (
              <MaterialIcons name="hourglass-empty" size={20} color="white" />
            ) : (
              <MaterialIcons name="favorite" size={20} color="white" />
            )}
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={{
              backgroundColor: "#8B5CF6",
              borderRadius: 20,
              paddingHorizontal: 16,
              paddingVertical: 8,
            }}
            activeOpacity={0.8}
          >
            <Text style={{ color: "white", fontSize: 12, fontWeight: "bold" }}>
              Upgrade
            </Text>
          </TouchableOpacity>
        )}
      </View>
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
      <MaterialIcons name="favorite-border" size={80} color="#9CA3AF" />
      <Text
        style={{
          color: "white",
          fontSize: 24,
          fontWeight: "bold",
          textAlign: "center",
          marginTop: 16,
          marginBottom: 8,
        }}
      >
        No Likes Yet
      </Text>
      <Text
        style={{
          color: "#9CA3AF",
          fontSize: 16,
          textAlign: "center",
          lineHeight: 24,
        }}
      >
        {hasAccess()
          ? "When someone likes you, they'll appear here. Keep swiping to get noticed!"
          : "Upgrade to see who likes you and get more matches!"}
      </Text>
    </View>
  );

  const renderHeader = () => (
    <View style={{ padding: 16 }}>
      {!hasAccess() && (
        <View
          style={{
            backgroundColor: "#8B5CF6",
            borderRadius: 12,
            padding: 16,
            marginBottom: 16,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 8,
            }}
          >
            <MaterialIcons name="visibility" size={24} color="white" />
            <Text
              style={{
                color: "white",
                fontSize: 18,
                fontWeight: "bold",
                marginLeft: 8,
              }}
            >
              See Who Likes You
            </Text>
          </View>
          <Text style={{ color: "white", fontSize: 14, lineHeight: 20 }}>
            Upgrade to see everyone who's already liked you and get instant
            matches!
          </Text>
        </View>
      )}

      {hasAccess() && likes.length > 0 && (
        <Text
          style={{
            color: "white",
            fontSize: 18,
            fontWeight: "bold",
            marginBottom: 8,
          }}
        >
          {likes.length} {likes.length === 1 ? "person likes" : "people like"}{" "}
          you
        </Text>
      )}
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#000000" }}>
      <FlatList
        data={likes}
        renderItem={renderLikeItem}
        keyExtractor={(item) => `like-${item.id}`}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#E91E63"
          />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          flexGrow: 1,
          paddingBottom: 32,
        }}
      />
    </View>
  );
};

export default LikesList;
