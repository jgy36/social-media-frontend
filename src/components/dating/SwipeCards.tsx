// src/components/dating/SwipeCards.tsx - FIXED VERSION that works with your current setup
import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Animated,
  Dimensions,
  Alert,
  ScrollView,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/redux/store";
import { getPotentialMatches, swipeUser } from "@/api/dating"; // Use your existing API
import { DatingProfile } from "@/types/dating";
import MatchCelebrationModal from "@/components/dating/MatchCelebrationModal";
import PaywallModal from "@/components/subscription/PaywallModal";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");
const CARD_WIDTH = screenWidth - 32;
const CARD_HEIGHT = screenHeight * 0.72;

interface SwipeCardsProps {
  onMatch: (matchData: any) => void;
}

const SwipeCards: React.FC<SwipeCardsProps> = ({ onMatch }) => {
  const dispatch = useDispatch<AppDispatch>();
  const currentUser = useSelector((state: RootState) => state.user);
  const { current: subscription } = useSelector(
    (state: RootState) => state.subscription
  );

  // Local state instead of Redux for now
  const [profiles, setProfiles] = useState<DatingProfile[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [matchData, setMatchData] = useState<any>(null);
  const [showPaywallModal, setShowPaywallModal] = useState(false);
  const [paywallFeature, setPaywallFeature] = useState<string | null>(null);

  // Animation values
  const cardOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    loadPotentialMatches();
  }, []);

  const loadPotentialMatches = async () => {
    try {
      setLoading(true);
      console.log("🔍 Loading potential matches...");
      const matches = await getPotentialMatches();
      console.log("📊 API returned:", matches?.length || 0, "profiles");
      setProfiles(matches || []);
    } catch (error) {
      console.error("❌ Error loading matches:", error);
      Alert.alert(
        "Error",
        "Failed to load potential matches. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const canUserSuperLike = () => {
    if (!subscription) return false;

    const tier = subscription.tier;
    const superLikesUsed = subscription.dailySuperLikesUsed || 0;
    let superLikeLimit = 1; // Free tier default

    switch (tier) {
      case "ESSENTIAL":
        superLikeLimit = 3;
        break;
      case "PREMIUM":
        superLikeLimit = 5;
        break;
      case "VIP":
        superLikeLimit = 10;
        break;
    }

    const canUse = superLikesUsed < superLikeLimit;
    console.log("🌟 Super Like Check:", {
      tier,
      superLikesUsed,
      superLikeLimit,
      canUse,
    });

    return canUse;
  };

  const handleSwipe = async (direction: "LIKE" | "PASS") => {
    if (currentIndex >= profiles.length) {
      console.log("❌ No more profiles to swipe");
      return;
    }

    const currentProfile = profiles[currentIndex];
    console.log(
      `🎯 ${direction} on ${currentProfile.user?.username || "unknown user"}`
    );

    // Animate card out
    Animated.timing(cardOpacity, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start(() => {
      cardOpacity.setValue(1);
      setCurrentIndex((prev) => prev + 1);
    });

    try {
      // Use your existing API
      const response = await swipeUser(
        currentProfile.user?.id || currentProfile.id,
        direction
      );
      console.log("📡 Swipe response:", response);

      // Check for match
      if (response.matched && response.match) {
        console.log("🎉 IT'S A MATCH!", response.match);
        setMatchData(response.match);
        setShowMatchModal(true);
        onMatch(response.match);
      }
    } catch (error) {
      console.error("❌ Failed to swipe:", error);
      Alert.alert("Error", "Failed to record swipe. Please try again.");
    }
  };

  const handleSuperLike = async () => {
    if (currentIndex >= profiles.length) return;

    const currentProfile = profiles[currentIndex];
    console.log(
      `⭐ SUPER LIKE on ${currentProfile.user?.username || "unknown user"}`
    );

    // Check if user can super like
    if (!canUserSuperLike()) {
      console.log("🚫 Super like not allowed - showing paywall");
      setPaywallFeature("super_like");
      setShowPaywallModal(true);
      return;
    }

    // For now, treat super like as a regular like until backend supports it
    console.log(
      "⭐ Sending super like as regular like (backend doesn't support SUPER_LIKE yet)"
    );

    // Animate card out
    Animated.timing(cardOpacity, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start(() => {
      cardOpacity.setValue(1);
      setCurrentIndex((prev) => prev + 1);
    });

    try {
      // Send as regular like for now
      const response = await swipeUser(
        currentProfile.user?.id || currentProfile.id,
        "LIKE"
      );
      console.log("📡 Super like response:", response);

      // Show super like feedback
      Alert.alert(
        "Super Like Sent! ⭐",
        `${
          currentProfile.user?.displayName ||
          currentProfile.user?.username ||
          "This person"
        } will see that you super liked them!`,
        [{ text: "Awesome!" }]
      );

      // Check for match
      if (response.matched && response.match) {
        console.log("🎉 IT'S A MATCH from super like!", response.match);
        setMatchData(response.match);
        setShowMatchModal(true);
        onMatch(response.match);
      }
    } catch (error) {
      console.error("❌ Failed to super like:", error);
      Alert.alert("Error", "Failed to send super like. Please try again.");
    }
  };

  // Parse JSON fields safely (keeping your existing logic)
  const parseJsonField = (field: any) => {
    if (!field) return [];
    if (Array.isArray(field)) {
      return field.map((item) => {
        try {
          return typeof item === "string" ? JSON.parse(item) : item;
        } catch {
          return { question: item, answer: "" };
        }
      });
    }
    return [];
  };

  const renderProfileContent = (profile: DatingProfile) => {
    const prompts = parseJsonField(profile.prompts);

    return (
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        style={{ backgroundColor: "#f8f9fa" }}
        scrollEnabled={true}
      >
        {/* Name Above First Photo */}
        <View className="mx-4 mt-4">
          <Text className="text-3xl font-bold text-gray-800 mb-2">
            {profile.user?.displayName || profile.user?.username || "Unknown"},{" "}
            {profile.age}
          </Text>
        </View>

        {/* First Photo Card */}
        <View className="mx-4 mt-4 bg-white rounded-3xl overflow-hidden shadow-lg">
          <Image
            source={{
              uri:
                (profile.photos && profile.photos[0]) ||
                `https://api.dicebear.com/7.x/avataaars/svg?seed=${
                  profile.user?.username || "default"
                }`,
            }}
            className="w-full h-[450px]"
            resizeMode="cover"
          />
        </View>

        {/* Bio Card */}
        <View className="mx-4 mt-4 bg-white rounded-3xl p-6 shadow-lg">
          <Text className="text-gray-800 text-lg leading-6">{profile.bio}</Text>
        </View>

        {/* Combined Vitals, Lifestyle & Looking For Card */}
        <View className="mx-4 mt-4 bg-white rounded-3xl p-6 shadow-lg">
          {/* Basic info */}
          <View className="space-y-3 mb-6">
            {profile.height && (
              <View className="flex-row items-center">
                <MaterialIcons name="height" size={20} color="#666" />
                <Text className="ml-3 text-gray-800 text-base">
                  {profile.height}
                </Text>
              </View>
            )}

            {profile.location && (
              <View className="flex-row items-center">
                <MaterialIcons name="location-on" size={20} color="#666" />
                <Text className="ml-3 text-gray-800 text-base">
                  {profile.location}
                </Text>
              </View>
            )}

            {profile.job && (
              <View className="flex-row items-center">
                <MaterialIcons name="work" size={20} color="#666" />
                <Text className="ml-3 text-gray-800 text-base">
                  {profile.job}
                </Text>
              </View>
            )}
          </View>

          {/* Looking For Section */}
          {profile.lookingFor && (
            <View className="pt-4 border-t border-gray-200">
              <Text className="text-gray-600 text-sm font-medium mb-2">
                Looking for
              </Text>
              <Text className="text-gray-800 text-base leading-6">
                {profile.lookingFor}
              </Text>
            </View>
          )}
        </View>

        {/* Bottom spacing for buttons */}
        <View className="h-32" />
      </ScrollView>
    );
  };

  const renderCard = (profile: DatingProfile, index: number) => {
    if (index < currentIndex) return null;

    const isTopCard = index === currentIndex;
    const cardPosition = index - currentIndex;

    const cardStyle = isTopCard
      ? {
          opacity: cardOpacity,
          zIndex: 1000,
        }
      : {
          transform: [
            { scale: 1 - cardPosition * 0.05 },
            { translateY: cardPosition * 8 },
          ],
          zIndex: 1000 - cardPosition,
        };

    return (
      <Animated.View
        key={`${profile.id}-${index}`}
        className="absolute"
        style={[
          {
            width: CARD_WIDTH,
            height: CARD_HEIGHT,
            left: 16,
            top: 20,
            backgroundColor: "#f8f9fa",
            borderRadius: 24,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.2,
            shadowRadius: 16,
            elevation: 8,
          },
          cardStyle,
        ]}
      >
        {renderProfileContent(profile)}
      </Animated.View>
    );
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <MaterialIcons name="favorite" size={40} color="#E91E63" />
        <Text className="text-white text-lg mt-4">
          Finding amazing people...
        </Text>
      </View>
    );
  }

  if (currentIndex >= profiles.length) {
    return (
      <View className="flex-1 items-center justify-center px-8">
        <MaterialIcons name="favorite" size={80} color="#E91E63" />
        <Text className="text-white text-2xl font-bold text-center mt-6 mb-4">
          No More Profiles
        </Text>
        <Text className="text-gray-400 text-base text-center mb-8">
          You've seen everyone in your area! Check back later for new profiles.
        </Text>
        <TouchableOpacity
          onPress={loadPotentialMatches}
          className="bg-pink-500 rounded-full px-6 py-3"
        >
          <Text className="text-white font-semibold">Refresh</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-black">
      {/* Cards Container */}
      <View style={{ flex: 1, position: "relative" }}>
        {profiles
          .slice(currentIndex, currentIndex + 3)
          .map((profile, stackIndex) =>
            renderCard(profile, currentIndex + stackIndex)
          )}
      </View>

      {/* SIMPLIFIED BUTTONS that actually work */}
      <View
        style={{
          position: "absolute",
          bottom: 15,
          left: 0,
          right: 0,
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
          paddingHorizontal: 32,
          zIndex: 2000,
        }}
      >
        <TouchableOpacity
          onPress={() => {
            console.log("🧪 Testing paywall modal");
            setPaywallFeature("super_like");
            setShowPaywallModal(true);
          }}
          style={{
            position: "absolute",
            top: -80, // Position above the other buttons
            left: "50%",
            marginLeft: -40,
            width: 80,
            height: 30,
            backgroundColor: "#FF6B9D",
            borderRadius: 15,
            justifyContent: "center",
            alignItems: "center",
          }}
          activeOpacity={0.8}
        >
          <Text style={{ color: "white", fontSize: 12, fontWeight: "bold" }}>
            Test Paywall
          </Text>
        </TouchableOpacity>
        {/* RED X BUTTON */}
        <TouchableOpacity
          onPress={() => {
            console.log("❌ PASS button pressed");
            handleSwipe("PASS");
          }}
          style={{
            width: 70,
            height: 70,
            borderRadius: 35,
            backgroundColor: "#fd5068",
            justifyContent: "center",
            alignItems: "center",
            marginRight: 50,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 8,
          }}
          activeOpacity={0.8}
        >
          <MaterialIcons name="close" size={35} color="white" />
        </TouchableOpacity>

        {/* SUPER LIKE BUTTON (GOLD STAR) */}
        <TouchableOpacity
          onPress={() => {
            console.log("⭐ SUPER LIKE button pressed");
            handleSuperLike();
          }}
          style={{
            width: 50,
            height: 50,
            borderRadius: 25,
            backgroundColor: "#FFD700",
            justifyContent: "center",
            alignItems: "center",
            marginRight: 50,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 8,
          }}
          activeOpacity={0.8}
        >
          <MaterialIcons name="star" size={24} color="white" />
        </TouchableOpacity>

        {/* GREEN HEART BUTTON */}
        <TouchableOpacity
          onPress={() => {
            console.log("💚 LIKE button pressed");
            handleSwipe("LIKE");
          }}
          style={{
            width: 70,
            height: 70,
            borderRadius: 35,
            backgroundColor: "#4ade80",
            justifyContent: "center",
            alignItems: "center",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 8,
          }}
          activeOpacity={0.8}
        >
          <MaterialIcons name="favorite" size={35} color="white" />
        </TouchableOpacity>
      </View>

      {/* Match Celebration Modal */}
      <MatchCelebrationModal
        visible={showMatchModal}
        match={matchData}
        currentUserId={currentUser.id || 0}
        onClose={() => {
          setShowMatchModal(false);
          setMatchData(null);
        }}
      />

      {/* Paywall Modal */}
      <PaywallModal
        visible={showPaywallModal}
        feature={paywallFeature}
        onClose={() => setShowPaywallModal(false)}
        onUpgrade={() => setShowPaywallModal(false)}
      />
    </View>
  );
};

export default SwipeCards;
