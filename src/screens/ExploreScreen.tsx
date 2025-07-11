// src/screens/ExploreScreen.tsx - Enhanced with swipeable tabs
import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  FlatList,
  Image,
  PanResponder,
  Animated,
  Dimensions,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { RootStackNavigationProp } from "@/navigation/types";
import { useSearchAll } from "@/hooks/useApi";
import { searchHashtags } from "@/api/search";

const { width } = Dimensions.get("window");

// Define proper types for search results
interface ApiSearchResult {
  id?: number;
  type: "user" | "hashtag" | "community" | "post";
  title: string;
  subtitle?: string;
  username?: string;
  profileImageUrl?: string;
}

// Define hashtag info type
interface HashtagInfo {
  tag: string;
  postCount?: number;
}

const ExploreScreen = () => {
  const navigation = useNavigation<RootStackNavigationProp>();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<
    "trending" | "people" | "hashtags"
  >("trending");
  const [trendingHashtags, setTrendingHashtags] = useState<string[]>([]);
  const [searchResults, setSearchResults] = useState<ApiSearchResult[]>([]);

  const { loading: searchLoading, execute: search } = useSearchAll();
  const translateX = useRef(new Animated.Value(0)).current;
  const activeTabRef = useRef(activeTab);

  // Update ref when tab changes
  React.useEffect(() => {
    activeTabRef.current = activeTab;
  }, [activeTab]);

  useEffect(() => {
    // Load trending hashtags on mount
    loadTrendingHashtags();
  }, []);

  const loadTrendingHashtags = async () => {
    try {
      const hashtags = await searchHashtags(""); // Get trending hashtags
      // Convert HashtagInfo[] to string[]
      const hashtagStrings = hashtags
        .map((item: HashtagInfo) => item.tag)
        .slice(0, 10);
      setTrendingHashtags(hashtagStrings);
    } catch (error) {
      console.error("Failed to load trending hashtags:", error);
    }
  };

  const handleSearch = async (query: string) => {
    if (query.trim()) {
      const results = await search(query);
      setSearchResults(results || []);
    } else {
      setSearchResults([]);
    }
  };

  // Pan responder for swipe gestures
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        if (searchQuery.length > 0) return false; // Disable swipe when searching
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
          if (currentTab === "people") {
            setActiveTab("trending");
          } else if (currentTab === "hashtags") {
            setActiveTab("people");
          }
        } else if (gestureState.dx < -swipeThreshold) {
          // Swipe left - go to next tab
          if (currentTab === "trending") {
            setActiveTab("people");
          } else if (currentTab === "people") {
            setActiveTab("hashtags");
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

  const renderSearchResult = ({ item }: { item: ApiSearchResult }) => (
    <TouchableOpacity
      className="flex-row items-center p-4 border-b border-gray-800"
      onPress={() => {
        if (item.type === "user" && item.username) {
          navigation.navigate("UserProfile", { username: item.username });
        } else if (item.type === "hashtag" && item.title) {
          navigation.navigate("Hashtag", { tag: item.title.replace("#", "") });
        } else if (item.type === "community" && item.id) {
          navigation.navigate("CommunityDetail", {
            id: item.id.toString(),
          });
        }
      }}
    >
      {/* Avatar/Icon */}
      <View className="w-12 h-12 rounded-full bg-gray-700 items-center justify-center mr-3">
        {item.type === "user" && item.profileImageUrl ? (
          <Image
            source={{ uri: item.profileImageUrl }}
            className="w-12 h-12 rounded-full"
          />
        ) : (
          <MaterialIcons
            name={
              item.type === "user"
                ? "person"
                : item.type === "hashtag"
                ? "tag"
                : item.type === "community"
                ? "group"
                : "search"
            }
            size={24}
            color="#9CA3AF"
          />
        )}
      </View>

      {/* Content */}
      <View className="flex-1">
        <Text className="text-white font-semibold text-base">{item.title}</Text>
        {item.subtitle && (
          <Text className="text-gray-400 text-sm mt-1">{item.subtitle}</Text>
        )}
        <Text className="text-gray-500 text-xs mt-1 capitalize">
          {item.type}
        </Text>
      </View>

      <MaterialIcons name="chevron-right" size={20} color="#6B7280" />
    </TouchableOpacity>
  );

  const renderTrendingHashtag = (hashtag: string) => (
    <TouchableOpacity
      key={hashtag}
      className="bg-gray-800 rounded-full px-4 py-2 mr-2 mb-2"
      onPress={() => navigation.navigate("Hashtag", { tag: hashtag })}
    >
      <Text className="text-white text-sm">#{hashtag}</Text>
    </TouchableOpacity>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case "trending":
        return (
          <View className="p-4">
            <Text className="text-white text-lg font-semibold mb-4">
              Trending Now
            </Text>
            <View className="flex-row flex-wrap">
              {trendingHashtags.map(renderTrendingHashtag)}
            </View>
          </View>
        );
      case "people":
        return (
          <View className="p-4">
            <Text className="text-white text-lg font-semibold mb-4">
              People You May Know
            </Text>
            <Text className="text-gray-400 text-center py-8">
              Coming soon! We'll suggest people based on your interests.
            </Text>
          </View>
        );
      case "hashtags":
        return (
          <View className="p-4">
            <Text className="text-white text-lg font-semibold mb-4">
              Popular Hashtags
            </Text>
            <View className="flex-row flex-wrap">
              {trendingHashtags.map(renderTrendingHashtag)}
            </View>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-black">
      {/* Header */}
      <View className="px-4 py-3 border-b border-gray-800">
        <Text className="text-xl font-bold text-white mb-4">Explore</Text>

        {/* Search Bar */}
        <View className="flex-row items-center bg-gray-900 rounded-full px-4 py-3">
          <MaterialIcons name="search" size={20} color="#9CA3AF" />
          <TextInput
            value={searchQuery}
            onChangeText={(text) => {
              setSearchQuery(text);
              handleSearch(text);
            }}
            placeholder="Search users, hashtags, communities..."
            placeholderTextColor="#6B7280"
            className="flex-1 ml-3 text-white text-base"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => {
                setSearchQuery("");
                setSearchResults([]);
              }}
            >
              <MaterialIcons name="close" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Content */}
      <Animated.View
        className="flex-1"
        style={{ transform: [{ translateX }] }}
        {...panResponder.panHandlers}
      >
        {searchQuery.length > 0 ? (
          // Search Results
          <View className="flex-1">
            <Text className="text-gray-400 text-sm px-4 py-2">
              {searchLoading
                ? "Searching..."
                : `${searchResults.length} results`}
            </Text>
            <FlatList
              data={searchResults}
              renderItem={renderSearchResult}
              keyExtractor={(item, index) => `${item.type}-${item.id || index}`}
              showsVerticalScrollIndicator={false}
            />
          </View>
        ) : (
          // Explore Content
          <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
            {/* Tab Selector */}
            <View className="flex-row px-4 py-3 border-b border-gray-800">
              {["trending", "people", "hashtags"].map((tab) => (
                <TouchableOpacity
                  key={tab}
                  onPress={() => setActiveTab(tab as any)}
                  className="mr-6 pb-2"
                  style={{
                    borderBottomWidth: activeTab === tab ? 2 : 0,
                    borderBottomColor:
                      activeTab === tab ? "#E91E63" : "transparent",
                  }}
                >
                  <Text
                    className="text-base font-medium capitalize"
                    style={{
                      color: activeTab === tab ? "#ffffff" : "#9ca3af",
                    }}
                  >
                    {tab}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Tab Content */}
            {renderTabContent()}
          </ScrollView>
        )}
      </Animated.View>
    </SafeAreaView>
  );
};

export default ExploreScreen;
