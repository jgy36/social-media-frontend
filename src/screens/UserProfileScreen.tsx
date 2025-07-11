// src/screens/UserProfileScreen.tsx - Enhanced with swipeable tabs
import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  RefreshControl,
  ActivityIndicator,
  PanResponder,
  Animated,
  Dimensions,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { PostType } from "@/types/post";
import Post from "@/components/feed/Post";
import FollowButton from "@/components/profile/FollowButton";
import MessageButton from "@/components/profile/MessageButton";
import UserStats from "@/components/profile/UserStats";
import UserBadges from "@/components/profile/UserBadges";
import {
  getFollowStatus,
  getPostsByUsername,
  checkAccountPrivacy,
  getUserProfile,
} from "@/api/users";
import { getUserDatingProfile, checkMatchStatus } from "@/api/dating";
import { DatingProfile } from "@/types/dating";

const { width } = Dimensions.get("window");

interface UserProfile {
  id: number;
  username: string;
  displayName?: string;
  bio?: string;
  profileImageUrl?: string;
  joinDate: string;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  isFollowing?: boolean;
  isPrivate?: boolean;
}

const UserProfileScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { username } = route.params as { username: string };

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [datingProfile, setDatingProfile] = useState<DatingProfile | null>(
    null
  );
  const [posts, setPosts] = useState<PostType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"social" | "dating">("social");
  const [isMatched, setIsMatched] = useState(false);
  const [loadingDatingProfile, setLoadingDatingProfile] = useState(false);
  const [activePostTab, setActivePostTab] = useState("posts");

  const translateX = useRef(new Animated.Value(0)).current;
  const activeTabRef = useRef(activeTab);

  // Update ref when tab changes
  React.useEffect(() => {
    activeTabRef.current = activeTab;
  }, [activeTab]);

  // Get current user from Redux store
  const currentUser = useSelector((state: RootState) => state.user);
  const isAuthenticated = !!currentUser.token;

  // Check if this is the current user's profile
  const isCurrentUserProfile = profile?.username === currentUser.username;

  const fetchProfileData = async (isRefresh = false) => {
    if (!username) return;

    if (!isRefresh) setIsLoading(true);
    setError(null);

    try {
      // Fetch user profile
      const userProfile = await getUserProfile(username);
      if (!userProfile) {
        setError("User not found");
        return;
      }

      // Get follow status and privacy info
      if (userProfile.id) {
        try {
          const [followStatus, isPrivate] = await Promise.all([
            getFollowStatus(userProfile.id),
            checkAccountPrivacy(userProfile.id),
          ]);

          userProfile.isFollowing = followStatus.isFollowing;
          userProfile.followersCount = followStatus.followersCount;
          userProfile.followingCount = followStatus.followingCount;
          userProfile.isPrivate = isPrivate;
        } catch (followErr) {
          console.warn("Could not fetch follow status or privacy:", followErr);
        }
      }

      setProfile(userProfile);

      // Fetch posts
      try {
        const userPosts = await getPostsByUsername(username);
        if (Array.isArray(userPosts)) {
          const sortedPosts = [...userPosts].sort((a, b) => {
            return (
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
          });
          setPosts(sortedPosts);
        } else {
          setPosts([]);
        }
      } catch (postsError) {
        console.error("Could not fetch posts:", postsError);
        setPosts([]);
      }

      // Check if matched (for dating profile access)
      if (userProfile.id && userProfile.id !== currentUser.id) {
        try {
          const matched = await checkMatchStatus(userProfile.id);
          setIsMatched(matched);
        } catch (matchError) {
          console.warn("Could not check match status:", matchError);
        }
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
      setError("Failed to load user profile");
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const fetchDatingProfile = async () => {
    if (!profile?.id || loadingDatingProfile) return;

    setLoadingDatingProfile(true);
    try {
      const userDatingProfile = await getUserDatingProfile(profile.id);
      setDatingProfile(userDatingProfile);
    } catch (error) {
      console.error("Failed to load dating profile:", error);
      setDatingProfile(null);
    } finally {
      setLoadingDatingProfile(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, [username]);

  // Fetch dating profile when switching to dating tab
  useEffect(() => {
    if (
      activeTab === "dating" &&
      profile?.id &&
      !datingProfile &&
      !loadingDatingProfile
    ) {
      fetchDatingProfile();
    }
  }, [activeTab, profile?.id]);

  const handleFollowChange = (
    isFollowing: boolean,
    followerCount: number,
    followingCount: number
  ) => {
    if (profile) {
      setProfile({
        ...profile,
        isFollowing,
        followersCount: followerCount,
        followingCount: followingCount,
      });
    }
  };

  const handleStatsChange = (
    newFollowersCount: number,
    newFollowingCount: number
  ) => {
    if (profile) {
      setProfile({
        ...profile,
        followersCount: newFollowersCount,
        followingCount: newFollowingCount,
      });
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchProfileData(true);
    if (activeTab === "dating") {
      fetchDatingProfile();
    }
  };

  // Pan responder for swipe gestures
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        // Only allow swipe if user has dating tab available
        if (!isMatched && !isCurrentUserProfile) return false;
        const isHorizontalSwipe =
          Math.abs(gestureState.dx) > Math.abs(gestureState.dy);
        const isSignificantSwipe = Math.abs(gestureState.dx) > 30;
        return isHorizontalSwipe && isSignificantSwipe;
      },
      onPanResponderMove: (evt, gestureState) => {
        if (Math.abs(gestureState.dx) < width * 0.3) {
          translateX.setValue(gestureState.dx * 0.1);
        }
      },
      onPanResponderRelease: (evt, gestureState) => {
        const currentTab = activeTabRef.current;
        const swipeThreshold = 50;

        Animated.spring(translateX, {
          toValue: 0,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }).start();

        if (gestureState.dx > swipeThreshold) {
          // Swipe right - go to social
          if (currentTab === "dating") {
            setActiveTab("social");
          }
        } else if (gestureState.dx < -swipeThreshold) {
          // Swipe left - go to dating
          if (currentTab === "social") {
            setActiveTab("dating");
          }
        }
      },
      onPanResponderTerminate: () => {
        Animated.spring(translateX, {
          toValue: 0,
          useNativeDriver: true,
        }).start();
      },
    })
  ).current;

  const renderDatingProfile = () => {
    if (loadingDatingProfile) {
      return (
        <View className="flex-1 items-center justify-center py-16">
          <ActivityIndicator size="large" color="#E91E63" />
          <Text className="text-gray-400 mt-4">Loading dating profile...</Text>
        </View>
      );
    }

    if (!isMatched && !isCurrentUserProfile) {
      return (
        <View className="flex-1 items-center justify-center py-16 px-8">
          <MaterialIcons name="lock" size={80} color="#6B7280" />
          <Text className="text-white text-xl font-semibold mt-6 mb-2">
            Dating Profile Locked
          </Text>
          <Text className="text-gray-400 text-base text-center leading-6">
            You can only view dating profiles of people you've matched with. Try
            swiping in the Dating section to find them!
          </Text>
        </View>
      );
    }

    if (!datingProfile) {
      return (
        <View className="flex-1 items-center justify-center py-16 px-8">
          <MaterialIcons name="favorite-border" size={80} color="#6B7280" />
          <Text className="text-white text-xl font-semibold mt-6 mb-2">
            No Dating Profile
          </Text>
          <Text className="text-gray-400 text-base text-center leading-6">
            This user hasn't created a dating profile yet.
          </Text>
        </View>
      );
    }

    // Render the dating profile (similar to ProfileScreen)
    return (
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{ backgroundColor: "#f8f9fa" }}
      >
        {/* Name and Age */}
        <View className="mx-4 mt-4">
          <Text className="text-3xl font-bold text-gray-800 mb-2">
            {profile?.displayName || profile?.username}, {datingProfile.age}
          </Text>
        </View>

        {/* First Photo */}
        <View className="mx-4 mt-4 bg-white rounded-3xl overflow-hidden shadow-lg">
          <Image
            source={{
              uri:
                (datingProfile.photos && datingProfile.photos[0]) ||
                `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile?.username}`,
            }}
            className="w-full h-[450px]"
            resizeMode="cover"
          />
        </View>

        {/* Bio */}
        <View className="mx-4 mt-4 bg-white rounded-3xl p-6 shadow-lg">
          <Text className="text-gray-800 text-lg leading-6">
            {datingProfile.bio}
          </Text>
        </View>

        {/* Vitals and Info */}
        <View className="mx-4 mt-4 bg-white rounded-3xl p-6 shadow-lg">
          <View className="space-y-3 mb-6">
            {datingProfile.height && (
              <View className="flex-row items-center">
                <MaterialIcons name="height" size={20} color="#666" />
                <Text className="ml-3 text-gray-800 text-base">
                  {datingProfile.height}
                </Text>
              </View>
            )}

            {datingProfile.location && (
              <View className="flex-row items-center">
                <MaterialIcons name="location-on" size={20} color="#666" />
                <Text className="ml-3 text-gray-800 text-base">
                  {datingProfile.location}
                </Text>
              </View>
            )}

            {datingProfile.job && (
              <View className="flex-row items-center">
                <MaterialIcons name="work" size={20} color="#666" />
                <Text className="ml-3 text-gray-800 text-base">
                  {datingProfile.job}
                </Text>
              </View>
            )}

            {datingProfile.hasChildren && (
              <View className="flex-row items-center">
                <MaterialIcons name="child-care" size={20} color="#666" />
                <Text className="ml-3 text-gray-800 text-base">
                  {datingProfile.hasChildren}
                </Text>
              </View>
            )}

            {datingProfile.wantChildren && (
              <View className="flex-row items-center">
                <MaterialIcons name="favorite" size={20} color="#666" />
                <Text className="ml-3 text-gray-800 text-base">
                  {datingProfile.wantChildren}
                </Text>
              </View>
            )}

            {datingProfile.drinking && (
              <View className="flex-row items-center">
                <Text className="text-gray-800 text-base mr-3">🍷</Text>
                <Text className="text-gray-800 text-base">
                  {datingProfile.drinking}
                </Text>
              </View>
            )}

            {datingProfile.smoking && datingProfile.smoking !== "No" && (
              <View className="flex-row items-center">
                <Text className="text-gray-800 text-base mr-3">🚬</Text>
                <Text className="text-gray-800 text-base">
                  {datingProfile.smoking}
                </Text>
              </View>
            )}
          </View>

          {/* Lifestyle section */}
          {(datingProfile.religion ||
            datingProfile.relationshipType ||
            datingProfile.lifestyle) && (
            <View className="space-y-3 mb-6 pt-4 border-t border-gray-200">
              {datingProfile.religion && (
                <View className="flex-row items-center">
                  <MaterialIcons name="church" size={20} color="#666" />
                  <Text className="ml-3 text-gray-800 text-base">
                    {datingProfile.religion}
                  </Text>
                </View>
              )}

              {datingProfile.relationshipType && (
                <View className="flex-row items-center">
                  <MaterialIcons name="favorite" size={20} color="#666" />
                  <Text className="ml-3 text-gray-800 text-base">
                    {datingProfile.relationshipType}
                  </Text>
                </View>
              )}

              {datingProfile.lifestyle && (
                <View className="flex-row items-center">
                  <MaterialIcons name="people" size={20} color="#666" />
                  <Text className="ml-3 text-gray-800 text-base">
                    {datingProfile.lifestyle}
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* Looking for */}
          {datingProfile.lookingFor && (
            <View className="pt-4 border-t border-gray-200">
              <Text className="text-gray-600 text-sm font-medium mb-2">
                Looking for
              </Text>
              <Text className="text-gray-800 text-base leading-6">
                {datingProfile.lookingFor}
              </Text>
            </View>
          )}
        </View>

        {/* Additional Photos with Prompts */}
        {datingProfile.photos &&
          datingProfile.photos.length > 1 &&
          datingProfile.photos.slice(1).map((photo: string, index: number) => (
            <View key={`photo-section-${index}`}>
              <View className="mx-4 mt-4 bg-white rounded-3xl overflow-hidden shadow-lg">
                <Image
                  source={{ uri: photo }}
                  className="w-full h-[450px]"
                  resizeMode="cover"
                />
              </View>

              {/* Prompt if available */}
              {datingProfile.prompts &&
                datingProfile.prompts[index] &&
                datingProfile.prompts[index].question && (
                  <View className="mx-4 mt-4 bg-white rounded-3xl p-6 shadow-lg">
                    <Text className="text-gray-600 text-sm font-medium mb-2">
                      {datingProfile.prompts[index].question}
                    </Text>
                    <Text className="text-gray-800 text-lg leading-6">
                      {datingProfile.prompts[index].answer}
                    </Text>
                  </View>
                )}
            </View>
          ))}

        <View className="h-20" />
      </ScrollView>
    );
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-black items-center justify-center">
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text className="mt-4 text-gray-400">Loading profile...</Text>
      </View>
    );
  }

  if (error || !profile) {
    return (
      <View className="flex-1 bg-black">
        <View className="flex-row items-center p-4 border-b border-gray-700">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="mr-4"
          >
            <MaterialIcons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-lg font-semibold text-white">Profile</Text>
        </View>
        <View className="flex-1 items-center justify-center p-6">
          <Text className="text-red-500 text-center">
            {error || "User not found"}
          </Text>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="mt-4 bg-blue-500 px-6 py-2 rounded-lg"
          >
            <Text className="text-white font-medium">Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View
      className="flex-1"
      style={{
        backgroundColor: activeTab === "dating" ? "#f8f9fa" : "#000000",
      }}
    >
      {/* Header - Minimal with back button and tabs */}
      <View
        className="border-b"
        style={{
          backgroundColor:
            activeTab === "dating" ? "#ffffff" : "rgba(0,0,0,0.95)",
          borderBottomColor: activeTab === "dating" ? "#e5e7eb" : "#374151",
        }}
      >
        <View className="flex-row items-center px-4 py-2 pt-6">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="mr-4"
          >
            <MaterialIcons
              name="arrow-back"
              size={24}
              color={activeTab === "dating" ? "#000000" : "#ffffff"}
            />
          </TouchableOpacity>
          <Text
            className="text-lg font-semibold"
            style={{ color: activeTab === "dating" ? "#000000" : "#ffffff" }}
          >
            Profile
          </Text>
        </View>

        {/* Tab Selector - Only show if user has dating profile or is matched */}
        {(isMatched || isCurrentUserProfile || activeTab === "dating") && (
          <View className="flex-row px-4 pb-3">
            <TouchableOpacity
              onPress={() => setActiveTab("social")}
              className="mr-8 pb-2"
              style={{
                borderBottomWidth: activeTab === "social" ? 2 : 0,
                borderBottomColor:
                  activeTab === "social" ? "#3b82f6" : "transparent",
              }}
            >
              <Text
                className="text-base font-medium"
                style={{
                  color:
                    activeTab === "social"
                      ? activeTab === "dating"
                        ? "#000000"
                        : "#ffffff"
                      : activeTab === "dating"
                      ? "#6b7280"
                      : "#9ca3af",
                }}
              >
                Social
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setActiveTab("dating")}
              className="pb-2"
              style={{
                borderBottomWidth: activeTab === "dating" ? 2 : 0,
                borderBottomColor:
                  activeTab === "dating" ? "#ec4899" : "transparent",
              }}
            >
              <Text
                className="text-base font-medium"
                style={{
                  color:
                    activeTab === "dating"
                      ? activeTab === "dating"
                        ? "#000000"
                        : "#ffffff"
                      : activeTab === "dating"
                      ? "#6b7280"
                      : "#9ca3af",
                }}
              >
                Dating {isMatched && <Text className="text-xs">✨</Text>}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Content */}
      <Animated.View
        className="flex-1"
        style={{ transform: [{ translateX }] }}
        {...panResponder.panHandlers}
      >
        {activeTab === "social" ? (
          <ScrollView
            className="flex-1"
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
              />
            }
          >
            {/* Profile Section - Updated layout */}
            <View className="px-4 py-2">
              {/* Profile Header - Redesigned */}
              <View className="flex-row items-start mb-4">
                {/* Larger Profile Image */}
                <Image
                  source={{
                    uri:
                      profile.profileImageUrl ||
                      `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.username}`,
                  }}
                  className="w-28 h-28 rounded-full border-2 border-gray-700 mr-4"
                />

                {/* Name, Username and Action Buttons next to image */}
                <View className="flex-1 justify-center">
                  <Text className="text-2xl font-bold text-white mb-1">
                    {profile.displayName || profile.username}
                  </Text>
                  <Text className="text-gray-400 text-base mb-3">
                    @{profile.username}
                  </Text>

                  {/* Action Buttons */}
                  {!isAuthenticated ? (
                    <TouchableOpacity
                      onPress={() => navigation.navigate("Login")}
                      className="border border-gray-600 px-4 py-2 rounded-full self-start"
                    >
                      <Text className="text-white text-sm font-medium">
                        Log in
                      </Text>
                    </TouchableOpacity>
                  ) : isCurrentUserProfile ? (
                    <TouchableOpacity
                      onPress={() => navigation.navigate("Settings")}
                      className="border border-gray-600 px-4 py-2 rounded-full self-start"
                    >
                      <Text className="text-white text-sm font-medium">
                        Edit profile
                      </Text>
                    </TouchableOpacity>
                  ) : (
                    <View className="space-y-2">
                      <FollowButton
                        userId={profile.id}
                        initialIsFollowing={profile.isFollowing}
                        onFollowChange={handleFollowChange}
                      />
                      <MessageButton
                        username={profile.username}
                        userId={profile.id}
                      />
                    </View>
                  )}
                </View>
              </View>

              {/* Bio */}
              {profile.bio && (
                <Text className="text-white text-sm leading-5 mb-3">
                  {profile.bio}
                </Text>
              )}

              {/* Join Date */}
              <View className="flex-row items-center mb-4">
                <MaterialIcons
                  name="calendar-today"
                  size={14}
                  color="#71767b"
                />
                <Text className="ml-2 text-sm text-gray-400">
                  Joined{" "}
                  {profile.joinDate
                    ? new Date(profile.joinDate).toLocaleDateString("en-US", {
                        month: "long",
                        year: "numeric",
                      })
                    : "Recently"}
                </Text>
              </View>

              {/* Stats */}
              <View className="mb-4">
                <UserStats
                  userId={profile.id}
                  postsCount={posts.length}
                  followersCount={profile.followersCount}
                  followingCount={profile.followingCount}
                  onFollowChange={handleStatsChange}
                />
              </View>

              {/* Badges Section */}
              <View className="mb-4">
                <UserBadges
                  userId={profile.id}
                  isCurrentUser={isCurrentUserProfile}
                />
              </View>
            </View>

            {/* Secondary Navigation Tabs */}
            <View className="border-b border-gray-800">
              <View className="px-4">
                <View className="flex-row">
                  <TouchableOpacity
                    className="mr-8 pb-4"
                    onPress={() => setActivePostTab("posts")}
                  >
                    <Text
                      className={`font-semibold text-base ${
                        activePostTab === "posts"
                          ? "text-white"
                          : "text-gray-400"
                      }`}
                    >
                      Posts
                    </Text>
                    {activePostTab === "posts" && (
                      <View className="mt-2 h-0.5 w-12 bg-blue-500 rounded-full" />
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="mr-8 pb-4"
                    onPress={() => setActivePostTab("replies")}
                  >
                    <Text
                      className={`font-medium text-base ${
                        activePostTab === "replies"
                          ? "text-white"
                          : "text-gray-400"
                      }`}
                    >
                      Replies
                    </Text>
                    {activePostTab === "replies" && (
                      <View className="mt-2 h-0.5 w-12 bg-blue-500 rounded-full" />
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="mr-8 pb-4"
                    onPress={() => setActivePostTab("media")}
                  >
                    <Text
                      className={`font-medium text-base ${
                        activePostTab === "media"
                          ? "text-white"
                          : "text-gray-400"
                      }`}
                    >
                      Media
                    </Text>
                    {activePostTab === "media" && (
                      <View className="mt-2 h-0.5 w-12 bg-blue-500 rounded-full" />
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="pb-4"
                    onPress={() => setActivePostTab("likes")}
                  >
                    <Text
                      className={`font-medium text-base ${
                        activePostTab === "likes"
                          ? "text-white"
                          : "text-gray-400"
                      }`}
                    >
                      Likes
                    </Text>
                    {activePostTab === "likes" && (
                      <View className="mt-2 h-0.5 w-12 bg-blue-500 rounded-full" />
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Posts Section */}
            <View className="bg-black">
              {/* Section Title */}
              <View className="px-4 py-4">
                <Text className="text-white text-xl font-bold">
                  {profile.displayName || profile.username}'s Posts
                </Text>
              </View>

              {/* Posts Content */}
              {isAuthenticated ? (
                posts.length > 0 ? (
                  posts.map((post) => (
                    <View key={post.id}>
                      <Post post={post} />
                    </View>
                  ))
                ) : (
                  <View className="p-8 items-center">
                    {profile.isPrivate &&
                    !profile.isFollowing &&
                    !isCurrentUserProfile ? (
                      <>
                        <MaterialIcons name="lock" size={48} color="#71767b" />
                        <Text className="text-lg font-medium text-white mt-4">
                          Private Account
                        </Text>
                        <Text className="text-gray-400 text-center mt-2">
                          Follow this user to see their posts.
                        </Text>
                      </>
                    ) : (
                      <>
                        <MaterialIcons
                          name="post-add"
                          size={48}
                          color="#71767b"
                        />
                        <Text className="text-lg font-medium text-white mt-4">
                          No posts yet
                        </Text>
                        <Text className="text-gray-400 text-center mt-2">
                          This user hasn't posted anything.
                        </Text>
                      </>
                    )}
                  </View>
                )
              ) : (
                <View className="p-8 items-center">
                  <MaterialIcons name="login" size={48} color="#71767b" />
                  <Text className="text-lg font-medium text-white mt-4">
                    Login Required
                  </Text>
                  <Text className="text-gray-400 text-center mt-2">
                    You need to be logged in to view this user's posts.
                  </Text>
                  <TouchableOpacity
                    onPress={() => navigation.navigate("Login")}
                    className="bg-blue-500 px-6 py-3 rounded-lg mt-4"
                  >
                    <Text className="text-white font-medium">Log In</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* Bottom spacing for tab bar */}
            <View className="h-20" />
          </ScrollView>
        ) : (
          // Dating Profile Content
          renderDatingProfile()
        )}
      </Animated.View>
    </View>
  );
};

export default UserProfileScreen;
