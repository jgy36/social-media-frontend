// src/components/dating/SwipeCards.tsx - EXACT ProfileScreen Layout + FIXED swiping + FIXED buttons
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
import { getPotentialMatches, swipeUser } from "@/api/dating";
import { DatingProfile } from "@/types/dating";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import MatchCelebrationModal from "@/components/dating/MatchCelebrationModal";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");
const CARD_WIDTH = screenWidth - 32;
const CARD_HEIGHT = screenHeight * 0.72;

interface SwipeCardsProps {
  onMatch: (matchData: any) => void;
}

const SwipeCards: React.FC<SwipeCardsProps> = ({ onMatch }) => {
  const [profiles, setProfiles] = useState<DatingProfile[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  // Match celebration state
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [matchData, setMatchData] = useState<any>(null);

  // Get current user
  const currentUser = useSelector((state: RootState) => state.user);

  // Animation values only for card transitions
  const cardOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    loadPotentialMatches();
  }, []);

  const loadPotentialMatches = async () => {
    try {
      setLoading(true);
      console.log("🔍 Loading potential matches...");
      const matches = await getPotentialMatches();
      console.log("📊 API returned:", matches);
      console.log("📊 Number of profiles:", matches?.length || 0);

      if (matches && matches.length > 0) {
        console.log("📊 First profile:", matches[0]);
      }

      setProfiles(matches);
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

  const handleSwipe = async (direction: "LIKE" | "PASS") => {
    if (currentIndex >= profiles.length) return;

    const currentProfile = profiles[currentIndex];

    console.log(`🎯 ${direction} on ${currentProfile.user.username}`);

    // Simple fade out animation
    Animated.timing(cardOpacity, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start(() => {
      console.log("✅ Moving to next card");
      // Reset opacity and move to next card
      cardOpacity.setValue(1);
      setCurrentIndex((prev) => prev + 1);
    });

    try {
      // Call API
      const response = await swipeUser(currentProfile.user.id, direction);

      // Check for match - this is the key integration!
      if (response.matched && response.match) {
        console.log("🎉 IT'S A MATCH!", response.match);

        // Set match data for celebration modal
        setMatchData(response.match);
        setShowMatchModal(true);

        // Also call the original onMatch callback
        onMatch(response.match);
      }
    } catch (error) {
      console.error("Failed to swipe:", error);
      Alert.alert("Error", "Failed to record swipe. Please try again.");
    }
  };

  // Parse JSON fields safely
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
        {/* Name Above First Photo - EXACTLY like ProfileScreen */}
        <View className="mx-4 mt-4">
          <Text className="text-3xl font-bold text-gray-800 mb-2">
            {profile.user.displayName || profile.user.username}, {profile.age}
          </Text>
        </View>

        {/* First Photo Card - EXACTLY like ProfileScreen */}
        <View className="mx-4 mt-4 bg-white rounded-3xl overflow-hidden shadow-lg">
          <Image
            source={{
              uri:
                (profile.photos && profile.photos[0]) ||
                `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.user.username}`,
            }}
            className="w-full h-[450px]"
            resizeMode="cover"
          />
        </View>

        {/* Bio Card - EXACTLY like ProfileScreen */}
        <View className="mx-4 mt-4 bg-white rounded-3xl p-6 shadow-lg">
          <Text className="text-gray-800 text-lg leading-6">{profile.bio}</Text>
        </View>

        {/* Combined Vitals, Lifestyle & Looking For Card - EXACTLY like ProfileScreen */}
        <View className="mx-4 mt-4 bg-white rounded-3xl p-6 shadow-lg">
          {/* Vitals Section (stacked, no bubbles) */}
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

            {profile.hasChildren && (
              <View className="flex-row items-center">
                <MaterialIcons name="child-care" size={20} color="#666" />
                <Text className="ml-3 text-gray-800 text-base">
                  {profile.hasChildren}
                </Text>
              </View>
            )}

            {profile.wantChildren && (
              <View className="flex-row items-center">
                <MaterialIcons name="favorite" size={20} color="#666" />
                <Text className="ml-3 text-gray-800 text-base">
                  {profile.wantChildren}
                </Text>
              </View>
            )}

            {profile.drinking && (
              <View className="flex-row items-center">
                <Text className="text-gray-800 text-base mr-3">🍷</Text>
                <Text className="text-gray-800 text-base">
                  {profile.drinking}
                </Text>
              </View>
            )}

            {profile.smoking && profile.smoking !== "No" && (
              <View className="flex-row items-center">
                <Text className="text-gray-800 text-base mr-3">🚬</Text>
                <Text className="text-gray-800 text-base">
                  {profile.smoking}
                </Text>
              </View>
            )}

            {profile.drugs && profile.drugs !== "No" && (
              <View className="flex-row items-center">
                <MaterialIcons name="local-pharmacy" size={20} color="#666" />
                <Text className="ml-3 text-gray-800 text-base">
                  {profile.drugs} drugs
                </Text>
              </View>
            )}
          </View>

          {/* Lifestyle Section (stacked, no bubbles) */}
          {(profile.religion ||
            profile.relationshipType ||
            profile.lifestyle) && (
            <View className="space-y-3 mb-6 pt-4 border-t border-gray-200">
              {profile.religion && (
                <View className="flex-row items-center">
                  <MaterialIcons name="church" size={20} color="#666" />
                  <Text className="ml-3 text-gray-800 text-base">
                    {profile.religion}
                  </Text>
                </View>
              )}

              {profile.relationshipType && (
                <View className="flex-row items-center">
                  <MaterialIcons name="favorite" size={20} color="#666" />
                  <Text className="ml-3 text-gray-800 text-base">
                    {profile.relationshipType}
                  </Text>
                </View>
              )}

              {profile.lifestyle && (
                <View className="flex-row items-center">
                  <MaterialIcons name="people" size={20} color="#666" />
                  <Text className="ml-3 text-gray-800 text-base">
                    {profile.lifestyle}
                  </Text>
                </View>
              )}
            </View>
          )}

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

        {/* Additional Photos with Prompts Between - EXACTLY like ProfileScreen */}
        {profile.photos &&
          profile.photos.length > 1 &&
          profile.photos.slice(1).map((photo: string, index: number) => (
            <View key={`photo-section-${index}`}>
              {/* Photo Card */}
              <View className="mx-4 mt-4 bg-white rounded-3xl overflow-hidden shadow-lg">
                <Image
                  source={{ uri: photo }}
                  className="w-full h-[450px]"
                  resizeMode="cover"
                />
              </View>

              {/* Prompt Card (if available) */}
              {prompts && prompts[index] && prompts[index].question && (
                <View className="mx-4 mt-4 bg-white rounded-3xl p-6 shadow-lg">
                  <Text className="text-gray-600 text-sm font-medium mb-2">
                    {prompts[index].question}
                  </Text>
                  <Text className="text-gray-800 text-lg leading-6">
                    {prompts[index].answer}
                  </Text>
                </View>
              )}
            </View>
          ))}

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
          // Top card - simple opacity animation
          opacity: cardOpacity,
          zIndex: 1000,
        }
      : {
          // Background cards - static positioning
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
        {/* Profile Content - Your EXACT ProfileScreen Layout */}
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

      {/* BUTTONS - Positioned even lower on screen */}
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
        {/* RED X BUTTON */}
        <TouchableOpacity
          onPress={() => handleSwipe("PASS")}
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

        {/* GREEN HEART BUTTON */}
        <TouchableOpacity
          onPress={() => handleSwipe("LIKE")}
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
    </View>
  );
};

export default SwipeCards;
