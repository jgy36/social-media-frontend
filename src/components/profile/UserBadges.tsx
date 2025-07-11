// src/components/profile/UserBadges.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/redux/store";
import { getBadgeById } from "@/types/badges";
import BadgeSelector from "./BadgeSelector";
import { clearBadges, fetchUserBadges } from "@/redux/slices/badgeSlice";
import { getUserBadges } from "@/api/badges";

interface UserBadgesProps {
  userId?: number;
  isCurrentUser?: boolean;
  badges?: string[];
  className?: string;
  onModalOpen?: () => void; // NEW: Callback for when modal opens
  onModalClose?: () => void; // NEW: Callback for when modal closes
}

const UserBadges: React.FC<UserBadgesProps> = ({
  userId,
  isCurrentUser = false,
  badges: propBadges,
  className = "",
  onModalOpen, // NEW
  onModalClose, // NEW
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);
  const {
    badges: userBadges,
    loading,
    initialized,
  } = useSelector((state: RootState) => state.badges);
  const [displayBadges, setDisplayBadges] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const currentUserId = useSelector((state: RootState) => state.user.id);

  // Reset badges when user changes
  useEffect(() => {
    if (isCurrentUser && userId && currentUserId && userId !== currentUserId) {
      console.log("Current user changed, clearing badges");
      dispatch(clearBadges());
    }
  }, [userId, currentUserId, isCurrentUser, dispatch]);

  // Fetch badges for non-current users
  useEffect(() => {
    async function fetchUserBadgesForOtherUser() {
      if (!userId || (isCurrentUser && userId === currentUserId)) {
        return;
      }

      try {
        setIsLoading(true);
        console.log(`Fetching badges for user ${userId}`);
        const badges = await getUserBadges(userId);
        setDisplayBadges(badges);
      } catch (error) {
        console.error(`Error fetching badges for user ${userId}:`, error);
      } finally {
        setIsLoading(false);
      }
    }

    if (!propBadges && userId) {
      fetchUserBadgesForOtherUser();
    }
  }, [userId, propBadges, isCurrentUser, currentUserId]);

  // Determine which badges to display
  useEffect(() => {
    if (propBadges) {
      setDisplayBadges(propBadges);
    } else if (isCurrentUser && userId === currentUserId) {
      setDisplayBadges(userBadges);
    }
  }, [propBadges, userBadges, isCurrentUser, userId, currentUserId]);

  // NEW: Handle modal open/close with callbacks
  const handleModalOpen = () => {
    setIsSelectorOpen(true);
    onModalOpen?.(); // Notify parent component
  };

  const handleModalClose = () => {
    setIsSelectorOpen(false);
    onModalClose?.(); // Notify parent component
  };

  // Show loading state
  if (isLoading || (isCurrentUser && loading && !initialized)) {
    return (
      <View className="mt-4">
        <ActivityIndicator size="small" color="#3B82F6" />
        <Text className="text-sm text-gray-600 dark:text-gray-400 mt-2">
          Loading badges...
        </Text>
      </View>
    );
  }

  // If no badges and not current user's profile, don't render anything
  if (displayBadges.length === 0 && !isCurrentUser) {
    return null;
  }

  const Badge = ({ badgeId }: { badgeId: string }) => {
    const badge = getBadgeById(badgeId);
    if (!badge) return null;

    return (
      <View className="bg-gray-100 dark:bg-gray-800 rounded-full px-3 py-1 mr-2 mb-2">
        <Text className="text-sm text-gray-700 dark:text-gray-300">
          {badge.name}
        </Text>
      </View>
    );
  };

  return (
    <View className={className}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingRight: 20 }}
      >
        <View className="flex-row flex-wrap">
          {displayBadges.length > 0 ? (
            displayBadges.map((badgeId) => (
              <Badge key={badgeId} badgeId={badgeId} />
            ))
          ) : isCurrentUser ? (
            <Text className="text-sm text-gray-600 dark:text-gray-400 italic py-2">
              No badges selected yet.
            </Text>
          ) : null}
        </View>
      </ScrollView>

      {isCurrentUser && userId === currentUserId && (
        <Pressable
          onPress={handleModalOpen} // NEW: Use the handler instead
          disabled={loading}
          className="mt-3 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg"
          style={{ alignSelf: "flex-start" }}
        >
          <Text className="text-gray-700 dark:text-gray-300 font-medium">
            {displayBadges.length > 0 ? "Edit Badges" : "Add Badges"}
          </Text>
        </Pressable>
      )}

      <BadgeSelector
        isOpen={isSelectorOpen}
        onClose={handleModalClose} // NEW: Use the handler instead
        selectedBadges={displayBadges}
      />
    </View>
  );
};

export default UserBadges;
