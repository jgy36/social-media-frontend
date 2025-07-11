// src/components/profile/BadgeSelector.tsx
import { MaterialIcons } from "@expo/vector-icons";
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Modal,
  TouchableWithoutFeedback,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import { saveBadges, clearError } from "@/redux/slices/badgeSlice";
import {
  availableBadges,
  getCategories,
  getBadgesByCategory,
} from "@/types/badges";

const { height: screenHeight } = Dimensions.get("window");

interface BadgeSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  selectedBadges: string[];
}

const BadgeSelector: React.FC<BadgeSelectorProps> = ({
  isOpen,
  onClose,
  selectedBadges: initialSelectedBadges,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { loading, error } = useSelector((state: RootState) => state.badges);
  const categories = getCategories();
  const [selectedBadges, setSelectedBadges] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>(categories[0]);
  const [localError, setLocalError] = useState<string | null>(null);

  // Initialize selected badges when the modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedBadges(initialSelectedBadges || []);
      setLocalError(null);
      dispatch(clearError());
    }
  }, [isOpen, initialSelectedBadges, dispatch]);

  // Handle Redux error
  useEffect(() => {
    if (error) {
      setLocalError(error);
    }
  }, [error]);

  // Toggle badge selection
  const toggleBadge = (badgeId: string) => {
    setSelectedBadges((prev) => {
      // If already selected, remove it
      if (prev.includes(badgeId)) {
        setLocalError(null); // Clear error when removing
        return prev.filter((id) => id !== badgeId);
      }

      // If we're at the max limit, show error and don't add
      if (prev.length >= 10) {
        setLocalError("You can select a maximum of 10 badges.");
        return prev;
      }

      // Clear error if there was one
      setLocalError(null);

      // Add the new badge
      return [...prev, badgeId];
    });
  };

  // Save selected badges
  const handleSave = async () => {
    try {
      setLocalError(null);
      await dispatch(saveBadges(selectedBadges)).unwrap();
      onClose();
    } catch (error) {
      console.error("Error saving badges:", error);
      setLocalError("Failed to save badges. Please try again.");
    }
  };

  const displayError = localError || error;

  return (
    <Modal
      visible={isOpen}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0, 0, 0, 0.7)",
          justifyContent: "flex-end",
        }}
      >
        <View
          style={{
            backgroundColor: "#1a1a1a", // Dark background
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            height: screenHeight * 0.85,
            padding: 24,
            paddingBottom: 40,
          }}
        >
          {/* Header */}
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-xl font-bold text-white flex-1 pr-4">
              Select Your Political Position Badges
            </Text>
            <Pressable onPress={onClose} className="p-2">
              <MaterialIcons name="close" size={24} color="#9CA3AF" />
            </Pressable>
          </View>

          <Text className="text-sm text-gray-400 mb-4">
            Choose up to 10 badges that represent your political positions and
            values.
          </Text>

          {/* Error Message */}
          {displayError && (
            <View className="bg-red-900/20 border border-red-800 rounded-lg p-3 mb-4">
              <Text className="text-red-300">{displayError}</Text>
            </View>
          )}

          {/* Badge Counter and Clear All */}
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-sm text-gray-400">
              <Text className="font-medium text-white">
                {selectedBadges.length}
              </Text>{" "}
              of <Text className="font-medium text-white">10</Text> badges
              selected
            </Text>
            <Pressable
              onPress={() => {
                setSelectedBadges([]);
                setLocalError(null);
              }}
              disabled={selectedBadges.length === 0 || loading}
              className={`px-3 py-2 rounded-lg ${
                selectedBadges.length === 0 || loading
                  ? "opacity-50"
                  : "bg-gray-800"
              }`}
            >
              <Text className="text-sm text-gray-400">Clear All</Text>
            </Pressable>
          </View>

          {/* Selected Badges Preview */}
          {selectedBadges.length > 0 && (
            <View className="mb-4">
              <Text className="text-sm font-medium mb-2 text-white">
                Selected Badges:
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={{ maxHeight: 40 }}
              >
                <View className="flex-row gap-2 pb-2">
                  {selectedBadges.map((badgeId) => {
                    const badge = availableBadges.find((b) => b.id === badgeId);
                    if (!badge) return null;

                    return (
                      <Pressable
                        key={badgeId}
                        onPress={() => toggleBadge(badgeId)}
                        className="bg-blue-600 rounded-full px-3 py-1 flex-row items-center gap-1"
                      >
                        <Text className="text-white text-xs font-medium">
                          {badge.name}
                        </Text>
                        <View className="bg-white/20 rounded-full w-4 h-4 items-center justify-center">
                          <Text className="text-white text-xs">×</Text>
                        </View>
                      </Pressable>
                    );
                  })}
                </View>
              </ScrollView>
            </View>
          )}

          {/* Categories */}
          <View className="mb-4">
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ maxHeight: 50 }}
            >
              <View className="flex-row gap-2 pb-2">
                {categories.map((category) => (
                  <Pressable
                    key={category}
                    onPress={() => setActiveCategory(category)}
                    className={`px-4 py-2 rounded-lg ${
                      activeCategory === category
                        ? "bg-blue-600"
                        : "bg-gray-800"
                    }`}
                  >
                    <Text
                      className={`text-sm font-medium ${
                        activeCategory === category
                          ? "text-white"
                          : "text-gray-400"
                      }`}
                    >
                      {category}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </ScrollView>
          </View>

          {/* Badge Grid - This is the main content area */}
          <View className="flex-1 mb-4">
            <Text className="text-sm font-medium mb-3 text-white">
              {activeCategory}:
            </Text>
            <ScrollView
              showsVerticalScrollIndicator={true}
              style={{ flex: 1 }}
              contentContainerStyle={{ paddingBottom: 20 }}
            >
              <View className="flex-row flex-wrap gap-2">
                {getBadgesByCategory(activeCategory).map((badge) => {
                  const isSelected = selectedBadges.includes(badge.id);

                  return (
                    <Pressable
                      key={badge.id}
                      onPress={() => toggleBadge(badge.id)}
                      className={`px-4 py-3 rounded-lg border-2 mb-2 ${
                        isSelected
                          ? "bg-blue-600 border-blue-500"
                          : "bg-gray-800 border-gray-700"
                      }`}
                      style={{
                        minWidth: "45%",
                        maxWidth: "48%",
                        flex: 1,
                      }}
                    >
                      <View className="flex-row items-center justify-between">
                        <Text
                          className={`text-sm font-medium flex-1 ${
                            isSelected ? "text-white" : "text-gray-300"
                          }`}
                          numberOfLines={2}
                        >
                          {badge.name}
                        </Text>
                        {isSelected && (
                          <MaterialIcons
                            name="check"
                            size={18}
                            color="white"
                            style={{ marginLeft: 8 }}
                          />
                        )}
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            </ScrollView>
          </View>

          {/* Footer Buttons */}
          <View className="flex-row gap-3 pt-4 border-t border-gray-700">
            <Pressable
              onPress={onClose}
              disabled={loading}
              className="flex-1 py-4 border border-gray-600 rounded-xl"
            >
              <Text className="text-center text-gray-300 font-semibold text-base">
                Cancel
              </Text>
            </Pressable>
            <Pressable
              onPress={handleSave}
              disabled={loading}
              className="flex-1 py-4 bg-blue-600 rounded-xl flex-row items-center justify-center gap-2"
            >
              {loading && <ActivityIndicator size="small" color="white" />}
              <Text className="text-white font-semibold text-base">
                Save Badges
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default BadgeSelector;
