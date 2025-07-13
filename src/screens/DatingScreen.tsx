// src/screens/DatingScreen.tsx - Updated with "Who Liked Me" tab
import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  PanResponder,
  Animated,
  Dimensions,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import type { RootStackNavigationProp } from "@/navigation/types";
import {
  isDatingProfileComplete,
  getCurrentDatingProfile,
  getUserMatches,
  getWhoLikedMe, // ADD THIS IMPORT
} from "@/api/dating";
import SwipeCards from "@/components/dating/SwipeCards";
import MatchesList from "@/components/dating/MatchesList";
import LikesList from "@/components/dating/LikesList"; // WE'LL CREATE THIS

const { width } = Dimensions.get("window");

const DatingScreen = () => {
  const navigation = useNavigation<RootStackNavigationProp>();
  const user = useSelector((state: RootState) => state.user);

  const [hasCompletedProfile, setHasCompletedProfile] = useState(false);
  const [activeTab, setActiveTab] = useState<"discover" | "matches" | "likes">(
    "discover"
  ); // ADD "likes"
  const [matches, setMatches] = useState<any[]>([]);
  const [likes, setLikes] = useState<any[]>([]); // ADD THIS STATE
  const [likeCount, setLikeCount] = useState(0); // ADD THIS STATE
  const [loading, setLoading] = useState(true);
  const [showBoostModal, setShowBoostModal] = useState(false);

  const translateX = useRef(new Animated.Value(0)).current;
  const activeTabRef = useRef(activeTab);

  // Update ref when tab changes
  React.useEffect(() => {
    activeTabRef.current = activeTab;
  }, [activeTab]);

  useEffect(() => {
    checkDatingProfile();
    loadMatches();
    loadLikes(); // ADD THIS
  }, []);

  const checkDatingProfile = async () => {
    try {
      const isComplete = await isDatingProfileComplete();
      setHasCompletedProfile(isComplete);

      if (!isComplete) {
        Alert.alert(
          "Complete Your Dating Profile",
          "You need to complete your dating profile before you can start swiping!",
          [
            {
              text: "Set Up Now",
              onPress: () => navigation.navigate("DatingSetup"),
            },
            {
              text: "Later",
              style: "cancel",
            },
          ]
        );
      }
    } catch (error) {
      console.error("Failed to check dating profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadMatches = async () => {
    try {
      const userMatches = await getUserMatches();
      setMatches(userMatches);
    } catch (error) {
      console.error("Failed to load matches:", error);
    }
  };

  // ADD THIS NEW FUNCTION
  const loadLikes = async () => {
    try {
      const userLikes = await getWhoLikedMe();
      setLikes(userLikes);
      setLikeCount(userLikes.length);
    } catch (error) {
      console.error("Failed to load likes:", error);
      // If user doesn't have permission, set count to 0
      setLikes([]);
      setLikeCount(0);
    }
  };

  const handleNewMatch = (matchData: any) => {
    setMatches((prev) => [matchData, ...prev]);

    Alert.alert(
      "It's a Match! 💕",
      `You and ${
        matchData.user2.displayName || matchData.user2.username
      } liked each other!`,
      [
        {
          text: "Send Message",
          onPress: () =>
            navigation.navigate("PhotoConversation", {
              userId: matchData.user2.id,
            }),
        },
        {
          text: "Keep Swiping",
          style: "cancel",
        },
      ]
    );
  };

  // Update pan responder to handle 3 tabs
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        if (!hasCompletedProfile) return false;
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
          // Swipe right - go to previous tab
          if (currentTab === "matches") {
            setActiveTab("discover");
          } else if (currentTab === "likes") {
            setActiveTab("matches");
          }
        } else if (gestureState.dx < -swipeThreshold) {
          // Swipe left - go to next tab
          if (currentTab === "discover") {
            setActiveTab("matches");
          } else if (currentTab === "matches") {
            setActiveTab("likes");
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

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-black items-center justify-center">
        <Text className="text-white">Loading...</Text>
      </SafeAreaView>
    );
  }

  if (!hasCompletedProfile) {
    return (
      <SafeAreaView className="flex-1 bg-black">
        {/* Header */}
        <View className="px-4 py-3 border-b border-gray-800">
          <Text className="text-xl font-bold text-white">Dating</Text>
        </View>

        {/* Profile Setup Prompt */}
        <View className="flex-1 items-center justify-center px-8">
          <MaterialIcons name="favorite" size={80} color="#E91E63" />

          <Text className="text-white text-2xl font-bold text-center mt-6 mb-4">
            Welcome to Dating!
          </Text>

          <Text className="text-gray-400 text-base text-center mb-8 leading-6">
            Complete your dating profile to start discovering amazing people
            near you. Add photos, write a bio, and set your preferences.
          </Text>

          <TouchableOpacity
            onPress={() => navigation.navigate("DatingSetup")}
            className="bg-pink-500 rounded-full px-8 py-4 mb-4"
          >
            <Text className="text-white font-semibold text-lg">
              Complete Your Profile
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="py-2"
          >
            <Text className="text-gray-400 text-base">Maybe Later</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-black">
      {/* Header */}
      <View className="px-4 py-3 border-b border-gray-800">
        <View className="flex-row items-center justify-between">
          <Text className="text-xl font-bold text-white">Dating</Text>

          <TouchableOpacity
            onPress={() => navigation.navigate("DatingSettings")}
            className="p-2"
          >
            <MaterialIcons name="settings" size={24} color="#9CA3AF" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setShowBoostModal(true)}
            className="p-2 mr-2"
          >
            <MaterialIcons name="trending-up" size={24} color="#8B5CF6" />
          </TouchableOpacity>
          <BoostModal
            visible={showBoostModal}
            onClose={() => setShowBoostModal(false)}
            onBoostSuccess={() => {
              console.log("Profile boosted successfully!");
              // Optionally refresh data
            }}
          />
        </View>

        {/* Tab Selector - NOW WITH 3 TABS */}
        <View className="flex-row mt-4">
          <TouchableOpacity
            onPress={() => setActiveTab("discover")}
            className="mr-8 pb-2"
            style={{
              borderBottomWidth: activeTab === "discover" ? 2 : 0,
              borderBottomColor:
                activeTab === "discover" ? "#E91E63" : "transparent",
            }}
          >
            <Text
              className="text-base font-medium"
              style={{
                color: activeTab === "discover" ? "#ffffff" : "#9ca3af",
              }}
            >
              Discover
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveTab("matches")}
            className="mr-8 pb-2"
            style={{
              borderBottomWidth: activeTab === "matches" ? 2 : 0,
              borderBottomColor:
                activeTab === "matches" ? "#E91E63" : "transparent",
            }}
          >
            <Text
              className="text-base font-medium"
              style={{
                color: activeTab === "matches" ? "#ffffff" : "#9ca3af",
              }}
            >
              Matches ({matches.length})
            </Text>
          </TouchableOpacity>

          {/* ADD NEW LIKES TAB */}
          <TouchableOpacity
            onPress={() => setActiveTab("likes")}
            className="pb-2"
            style={{
              borderBottomWidth: activeTab === "likes" ? 2 : 0,
              borderBottomColor:
                activeTab === "likes" ? "#E91E63" : "transparent",
            }}
          >
            <Text
              className="text-base font-medium"
              style={{
                color: activeTab === "likes" ? "#ffffff" : "#9ca3af",
              }}
            >
              Likes ({likeCount})
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      <Animated.View
        className="flex-1"
        style={{ transform: [{ translateX }] }}
        {...panResponder.panHandlers}
      >
        {activeTab === "discover" ? (
          <SwipeCards onMatch={handleNewMatch} />
        ) : activeTab === "matches" ? (
          <MatchesList
            matches={matches}
            onMatchPress={(match) => {
              const otherUser =
                match.user1.id === user.id ? match.user2 : match.user1;
              navigation.navigate("UserProfile", {
                username: otherUser.username,
              });
            }}
          />
        ) : (
          // ADD LIKES LIST COMPONENT
          // In DatingScreen.tsx, update the LikesList usage:
          <LikesList
            likes={likes}
            onLikePress={(profile) => {
              console.log("Liked profile:", profile);
            }}
            onRefresh={loadLikes}
            onNewMatch={(matchData) => {
              // ADD THIS CALLBACK
              console.log("🎉 New match from likes:", matchData);

              // Add to matches list
              setMatches((prev) => [matchData, ...prev]);

              // Refresh both lists
              loadMatches();
              loadLikes();
            }}
          />
        )}
      </Animated.View>
    </SafeAreaView>
  );
};

export default DatingScreen;
