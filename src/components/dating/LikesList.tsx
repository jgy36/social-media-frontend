// src/components/dating/LikesList.tsx - COMPLETE FILE
import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Image,
  Alert,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { useNavigation } from "@react-navigation/native";
import type { RootStackNavigationProp } from "@/navigation/types";
import { swipeUser, likeUserBack } from "@/api/dating";
import ProfileViewModal from "./ProfileViewModal";
import MatchCelebrationModal from "./MatchCelebrationModal";

interface LikesListProps {
  likes: any[];
  onLikePress: (profile: any) => void;
  onRefresh: () => void;
  onNewMatch?: (matchData: any) => void;
}

const LikesList: React.FC<LikesListProps> = ({
  likes,
  onLikePress,
  onRefresh,
  onNewMatch,
}) => {
  const navigation = useNavigation<RootStackNavigationProp>();
  const { current: subscription } = useSelector(
    (state: RootState) => state.subscription
  );
  const user = useSelector((state: RootState) => state.user);

  const [selectedProfile, setSelectedProfile] = useState<any>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [matchData, setMatchData] = useState<any>(null);

  const isFreeTier = !subscription || subscription.tier === "FREE";
  const isEssentialTier = subscription?.tier === "ESSENTIAL";

  const handleLikeBack = async (profile: any) => {
    try {
      console.log("🔄 Liking back user:", profile.user?.id);

      const response = await likeUserBack(profile.user?.id);

      if (response.matched) {
        console.log("🎉 IT'S A MATCH!", response.match);

        setMatchData(response.match);
        setShowMatchModal(true);

        onNewMatch?.(response.match);
        onRefresh();
      }
    } catch (error) {
      console.error("❌ Failed to like back:", error);
      Alert.alert("Error", "Failed to send like. Please try again.");
    }
  };

  const handleViewProfile = (profile: any) => {
    setSelectedProfile(profile);
    setShowProfileModal(true);
  };

  const handleProfileAction = (
    action: "like" | "pass",
    matched?: boolean,
    matchData?: any
  ) => {
    setShowProfileModal(false);
    setSelectedProfile(null);

    if (matched && matchData) {
      setMatchData(matchData);
      setShowMatchModal(true);
      onNewMatch?.(matchData);
    }

    onRefresh();
  };

  const renderLike = ({
    item: profile,
    index,
  }: {
    item: any;
    index: number;
  }) => {
    const shouldBlur = isFreeTier || (isEssentialTier && index >= 5);

    return (
      <TouchableOpacity
        className="flex-row items-center p-4 border-b border-gray-800"
        onPress={() => {
          if (shouldBlur) {
            navigation.navigate("SubscriptionPlans");
          } else {
            handleViewProfile(profile);
          }
        }}
      >
        {/* Profile Image */}
        <View className="relative mr-4">
          <Image
            source={{
              uri:
                profile.photos?.[0] ||
                `https://api.dicebear.com/7.x/avataaars/svg?seed=${
                  profile.user?.username || "default"
                }`,
            }}
            className="w-16 h-16 rounded-full"
            style={{
              opacity: shouldBlur ? 0.3 : 1,
            }}
          />

          {shouldBlur && (
            <View className="absolute inset-0 items-center justify-center">
              <MaterialIcons name="lock" size={20} color="#E91E63" />
            </View>
          )}

          {/* Like indicator */}
          <View className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full items-center justify-center border-2 border-black">
            <MaterialIcons name="favorite" size={16} color="white" />
          </View>
        </View>

        {/* Profile Info */}
        <View className="flex-1">
          <Text
            className="text-white font-semibold text-lg"
            style={{ opacity: shouldBlur ? 0.5 : 1 }}
          >
            {shouldBlur
              ? "Someone"
              : profile.user?.displayName ||
                profile.user?.username ||
                "Unknown"}
          </Text>
          <Text
            className="text-gray-400 text-sm mt-1"
            style={{ opacity: shouldBlur ? 0.5 : 1 }}
          >
            {shouldBlur
              ? "Liked your profile"
              : `${profile.age || "??"} • ${
                  profile.location || "Unknown location"
                }`}
          </Text>
        </View>

        {/* Action Buttons */}
        <View className="flex-row">
          {shouldBlur ? (
            <TouchableOpacity
              className="bg-pink-500 rounded-full px-4 py-2"
              onPress={() => navigation.navigate("SubscriptionPlans")}
            >
              <Text className="text-white font-semibold text-sm">Upgrade</Text>
            </TouchableOpacity>
          ) : (
            <View className="flex-row">
              {/* Pass Button */}
              <TouchableOpacity
                className="w-10 h-10 bg-gray-600 rounded-full items-center justify-center mr-3"
                onPress={(e) => {
                  e.stopPropagation();
                  Alert.alert("Pass", "Profile removed from likes");
                }}
              >
                <MaterialIcons name="close" size={16} color="white" />
              </TouchableOpacity>

              {/* Like Back Button */}
              <TouchableOpacity
                className="w-10 h-10 bg-green-500 rounded-full items-center justify-center"
                onPress={(e) => {
                  e.stopPropagation();
                  handleLikeBack(profile);
                }}
              >
                <MaterialIcons name="favorite" size={16} color="white" />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderHeader = () => (
    <View className="p-4 border-b border-gray-800">
      <View className="flex-row items-center justify-between">
        <Text className="text-gray-400 text-sm">
          {likes.length} like{likes.length !== 1 ? "s" : ""}
        </Text>

        {isFreeTier && (
          <TouchableOpacity
            onPress={() => navigation.navigate("SubscriptionPlans")}
            className="bg-pink-500 rounded-full px-3 py-1"
          >
            <Text className="text-white text-xs font-semibold">See All</Text>
          </TouchableOpacity>
        )}
      </View>

      {isFreeTier && (
        <View className="mt-3 p-3 bg-pink-600/20 border border-pink-600/50 rounded-xl">
          <Text className="text-pink-300 font-medium text-sm">
            💎 Upgrade to see who likes you
          </Text>
          <Text className="text-pink-200 text-xs mt-1">
            Get unlimited access to all your likes with Essential or higher
          </Text>
        </View>
      )}

      {isEssentialTier && likes.length > 5 && (
        <View className="mt-3 p-3 bg-blue-600/20 border border-blue-600/50 rounded-xl">
          <Text className="text-blue-300 font-medium text-sm">
            🥈 Showing your 5 most recent likes
          </Text>
          <Text className="text-blue-200 text-xs mt-1">
            Upgrade to Premium to see all {likes.length} likes
          </Text>
        </View>
      )}
    </View>
  );

  const renderEmpty = () => (
    <View className="flex-1 items-center justify-center py-16">
      <MaterialIcons name="favorite-border" size={80} color="#6B7280" />
      <Text className="text-white text-xl font-semibold mt-6 mb-2">
        No Likes Yet
      </Text>
      <Text className="text-gray-400 text-base text-center px-8 leading-6">
        Keep swiping and updating your profile! Likes will appear here when
        people like you.
      </Text>

      <TouchableOpacity
        onPress={onRefresh}
        className="bg-pink-500 rounded-full px-6 py-3 mt-6"
      >
        <Text className="text-white font-semibold">Refresh</Text>
      </TouchableOpacity>
    </View>
  );

  if (likes.length === 0) {
    return renderEmpty();
  }

  return (
    <View className="flex-1">
      <FlatList
        data={likes}
        renderItem={renderLike}
        keyExtractor={(item, index) => `${item.id || index}`}
        ListHeaderComponent={renderHeader}
        showsVerticalScrollIndicator={false}
        refreshing={false}
        onRefresh={onRefresh}
        ItemSeparatorComponent={() => <View className="h-px bg-gray-800" />}
      />

      <ProfileViewModal
        visible={showProfileModal}
        profile={selectedProfile}
        onClose={() => {
          setShowProfileModal(false);
          setSelectedProfile(null);
        }}
        onAction={handleProfileAction}
      />

      <MatchCelebrationModal
        visible={showMatchModal}
        match={matchData}
        currentUserId={user.id || 0}
        onClose={() => {
          setShowMatchModal(false);
          setMatchData(null);
        }}
      />
    </View>
  );
};

export default LikesList;
