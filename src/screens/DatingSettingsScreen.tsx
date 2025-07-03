// src/screens/settings/DatingSettingsScreen.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import Slider from "@react-native-community/slider";
import {
  getDatingEligibility,
  confirmAge,
  updateDatingPreferences,
  getDatingPreferences,
} from "@/api/dating";

interface DatingPreferences {
  genderPreference: string;
  minAge: number;
  maxAge: number;
  maxDistance: number;
}

interface DatingEligibility {
  age: number | null;
  ageConfirmed: boolean;
  eligibleForDating: boolean;
  hasDatingProfile: boolean;
}

const DatingSettingsScreen = () => {
  const navigation = useNavigation();
  const user = useSelector((state: RootState) => state.user);

  const [preferences, setPreferences] = useState<DatingPreferences>({
    genderPreference: "EVERYONE",
    minAge: 18,
    maxAge: 35,
    maxDistance: 50,
  });

  const [eligibility, setEligibility] = useState<DatingEligibility>({
    age: null,
    ageConfirmed: false,
    eligibleForDating: false,
    hasDatingProfile: false,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [confirmingAge, setConfirmingAge] = useState(false);

  const genderPreferenceOptions = [
    { value: "MEN", label: "Men", icon: "♂️" },
    { value: "WOMEN", label: "Women", icon: "♀️" },
    { value: "EVERYONE", label: "Everyone", icon: "🌟" },
    { value: "NON_BINARY", label: "Non-binary", icon: "⚧️" },
  ];

  useEffect(() => {
    loadDatingSettings();
  }, []);

  const loadDatingSettings = async () => {
    try {
      setLoading(true);

      // Load eligibility
      const eligibilityData = await getDatingEligibility();
      setEligibility(eligibilityData);

      // Load preferences if eligible
      if (eligibilityData.eligibleForDating) {
        try {
          const preferencesData = await getDatingPreferences();
          if (preferencesData) {
            setPreferences(preferencesData);
          }
        } catch (error) {
          console.log("No existing preferences found, using defaults");
        }
      }
    } catch (error) {
      console.error("Error loading dating settings:", error);
      Alert.alert("Error", "Failed to load dating settings");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmAge = async () => {
    try {
      setConfirmingAge(true);
      const result = await confirmAge();

      if (result.success) {
        setEligibility((prev) => ({
          ...prev,
          ageConfirmed: true,
          eligibleForDating: result.eligibleForDating,
        }));

        Alert.alert(
          "Age Confirmed! 🎉",
          "You can now use all dating features. Set your preferences below."
        );
      }
    } catch (error) {
      console.error("Error confirming age:", error);
      Alert.alert("Error", "Failed to confirm age. Please try again.");
    } finally {
      setConfirmingAge(false);
    }
  };

  const handleSavePreferences = async () => {
    try {
      setSaving(true);
      await updateDatingPreferences(preferences);

      Alert.alert(
        "Preferences Saved! ✅",
        "Your dating preferences have been updated."
      );
    } catch (error) {
      console.error("Error saving preferences:", error);
      Alert.alert("Error", "Failed to save preferences. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-black items-center justify-center">
        <ActivityIndicator size="large" color="#FF6B9D" />
        <Text className="text-white mt-4">Loading dating settings...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-black">
      {/* Header */}
      <View className="bg-black/95 border-b border-gray-800 px-6 py-4">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="p-2 rounded-full"
          >
            <MaterialIcons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-xl font-semibold text-white">
            Dating Settings
          </Text>
          <View className="w-10" />
        </View>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ padding: 24 }}>
        {/* Age Status Card */}
        <View className="bg-gray-900 rounded-3xl p-6 mb-6 border border-gray-800">
          <View className="flex-row items-center mb-4">
            <MaterialIcons
              name={eligibility.ageConfirmed ? "verified" : "warning"}
              size={24}
              color={eligibility.ageConfirmed ? "#10B981" : "#F59E0B"}
            />
            <Text className="text-white text-lg font-semibold ml-3">
              Age Verification
            </Text>
          </View>

          {eligibility.age !== null && (
            <Text className="text-gray-300 mb-4">
              Your age: {eligibility.age} years old
            </Text>
          )}

          {!eligibility.ageConfirmed &&
            eligibility.age &&
            eligibility.age >= 18 && (
              <>
                <Text className="text-gray-300 mb-4">
                  You must confirm you're 18+ to use dating features.
                </Text>
                <TouchableOpacity
                  onPress={handleConfirmAge}
                  disabled={confirmingAge}
                  className="bg-pink-600 rounded-xl py-3 px-4 flex-row items-center justify-center"
                >
                  {confirmingAge ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <>
                      <MaterialIcons
                        name="check-circle"
                        size={20}
                        color="white"
                      />
                      <Text className="text-white font-semibold ml-2">
                        I confirm I'm {eligibility.age} years old
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              </>
            )}

          {eligibility.age && eligibility.age < 18 && (
            <View className="bg-yellow-600/20 border border-yellow-600/50 rounded-xl p-4">
              <Text className="text-yellow-200 font-medium">
                Age Restriction
              </Text>
              <Text className="text-yellow-200 text-sm mt-1">
                You must be 18 or older to use dating features. You can still
                enjoy other app features!
              </Text>
            </View>
          )}

          {eligibility.ageConfirmed && (
            <View className="bg-green-600/20 border border-green-600/50 rounded-xl p-4">
              <Text className="text-green-200 font-medium">
                ✅ Age Verified
              </Text>
              <Text className="text-green-200 text-sm mt-1">
                You're eligible for all dating features!
              </Text>
            </View>
          )}
        </View>

        {/* Dating Preferences - Only show if eligible */}
        {eligibility.eligibleForDating && (
          <>
            {/* Gender Preference Card */}
            <View className="bg-gray-900 rounded-3xl p-6 mb-6 border border-gray-800">
              <Text className="text-white text-lg font-semibold mb-4">
                Show me
              </Text>

              <View className="space-y-3">
                {genderPreferenceOptions.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    onPress={() =>
                      setPreferences((prev) => ({
                        ...prev,
                        genderPreference: option.value,
                      }))
                    }
                    className="flex-row items-center justify-between p-4 rounded-xl border"
                    style={{
                      backgroundColor:
                        preferences.genderPreference === option.value
                          ? "#FF6B9D"
                          : "transparent",
                      borderColor:
                        preferences.genderPreference === option.value
                          ? "#FF6B9D"
                          : "#6b7280",
                    }}
                  >
                    <View className="flex-row items-center">
                      <Text className="text-2xl mr-3">{option.icon}</Text>
                      <Text
                        className="text-lg font-medium"
                        style={{
                          color:
                            preferences.genderPreference === option.value
                              ? "white"
                              : "#d1d5db",
                        }}
                      >
                        {option.label}
                      </Text>
                    </View>

                    {preferences.genderPreference === option.value && (
                      <MaterialIcons
                        name="check-circle"
                        size={24}
                        color="white"
                      />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Age Range Card */}
            <View className="bg-gray-900 rounded-3xl p-6 mb-6 border border-gray-800">
              <Text className="text-white text-lg font-semibold mb-4">
                Age Range
              </Text>

              <View className="mb-6">
                <View className="flex-row justify-between items-center mb-4">
                  <Text className="text-gray-300 font-medium">Minimum Age</Text>
                  <View className="bg-pink-600 rounded-full px-3 py-1">
                    <Text className="text-white font-semibold">
                      {preferences.minAge}
                    </Text>
                  </View>
                </View>

                <Slider
                  className="w-full h-10"
                  minimumValue={18}
                  maximumValue={100}
                  value={preferences.minAge}
                  onValueChange={(value) =>
                    setPreferences((prev) => ({
                      ...prev,
                      minAge: Math.round(value),
                      // Ensure max age is at least min age
                      maxAge: Math.max(Math.round(value), prev.maxAge),
                    }))
                  }
                  minimumTrackTintColor="#FF6B9D"
                  maximumTrackTintColor="#6b7280"
                  thumbStyle={{
                    backgroundColor: "#FF6B9D",
                    width: 24,
                    height: 24,
                  }}
                  trackStyle={{ height: 4, borderRadius: 2 }}
                />
              </View>

              <View className="mb-4">
                <View className="flex-row justify-between items-center mb-4">
                  <Text className="text-gray-300 font-medium">Maximum Age</Text>
                  <View className="bg-pink-600 rounded-full px-3 py-1">
                    <Text className="text-white font-semibold">
                      {preferences.maxAge === 100 ? "100+" : preferences.maxAge}
                    </Text>
                  </View>
                </View>

                <Slider
                  className="w-full h-10"
                  minimumValue={preferences.minAge}
                  maximumValue={100}
                  value={preferences.maxAge}
                  onValueChange={(value) =>
                    setPreferences((prev) => ({
                      ...prev,
                      maxAge: Math.round(value),
                    }))
                  }
                  minimumTrackTintColor="#FF6B9D"
                  maximumTrackTintColor="#6b7280"
                  thumbStyle={{
                    backgroundColor: "#FF6B9D",
                    width: 24,
                    height: 24,
                  }}
                  trackStyle={{ height: 4, borderRadius: 2 }}
                />
              </View>

              <View className="bg-gray-800 rounded-xl p-3">
                <Text className="text-center text-gray-300">
                  Looking for ages {preferences.minAge} -{" "}
                  {preferences.maxAge === 100 ? "100+" : preferences.maxAge}
                </Text>
              </View>
            </View>

            {/* Distance Card */}
            <View className="bg-gray-900 rounded-3xl p-6 mb-6 border border-gray-800">
              <Text className="text-white text-lg font-semibold mb-4">
                Maximum Distance
              </Text>

              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-gray-300 font-medium">
                  Distance Range
                </Text>
                <View className="bg-pink-600 rounded-full px-3 py-1">
                  <Text className="text-white font-semibold">
                    {preferences.maxDistance} miles
                  </Text>
                </View>
              </View>

              <Slider
                className="w-full h-10 mb-4"
                minimumValue={1}
                maximumValue={100}
                value={preferences.maxDistance}
                onValueChange={(value) =>
                  setPreferences((prev) => ({
                    ...prev,
                    maxDistance: Math.round(value),
                  }))
                }
                minimumTrackTintColor="#FF6B9D"
                maximumTrackTintColor="#6b7280"
                thumbStyle={{
                  backgroundColor: "#FF6B9D",
                  width: 24,
                  height: 24,
                }}
                trackStyle={{ height: 4, borderRadius: 2 }}
              />

              <View className="bg-gray-800 rounded-xl p-3">
                <Text className="text-center text-gray-300">
                  Show people within {preferences.maxDistance} miles of you
                </Text>
              </View>
            </View>

            {/* Save Button */}
            <TouchableOpacity
              onPress={handleSavePreferences}
              disabled={saving}
              className="bg-pink-600 rounded-xl py-4 px-6 mb-6"
            >
              <View className="flex-row items-center justify-center">
                {saving ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <>
                    <MaterialIcons name="save" size={20} color="white" />
                    <Text className="text-white font-semibold text-lg ml-2">
                      Save Preferences
                    </Text>
                  </>
                )}
              </View>
            </TouchableOpacity>

            {/* Profile Creation Link */}
            {!eligibility.hasDatingProfile && (
              <TouchableOpacity
                onPress={() => navigation.navigate("DatingSetup")}
                className="bg-gray-800 border border-pink-600 rounded-xl py-4 px-6 mb-6"
              >
                <View className="flex-row items-center justify-center">
                  <MaterialIcons name="favorite" size={20} color="#FF6B9D" />
                  <Text className="text-pink-400 font-semibold text-lg ml-2">
                    Create Dating Profile
                  </Text>
                </View>
              </TouchableOpacity>
            )}
          </>
        )}

        {/* Dating Profile Status */}
        <View className="bg-gray-900 rounded-3xl p-6 mb-6 border border-gray-800">
          <Text className="text-white text-lg font-semibold mb-4">
            Profile Status
          </Text>

          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <MaterialIcons
                name={
                  eligibility.hasDatingProfile
                    ? "check-circle"
                    : "radio-button-unchecked"
                }
                size={24}
                color={eligibility.hasDatingProfile ? "#10B981" : "#6B7280"}
              />
              <Text className="text-gray-300 ml-3">Dating Profile</Text>
            </View>
            <Text className="text-gray-400">
              {eligibility.hasDatingProfile ? "Complete" : "Not created"}
            </Text>
          </View>

          <View className="flex-row items-center justify-between mt-3">
            <View className="flex-row items-center">
              <MaterialIcons
                name={
                  eligibility.ageConfirmed
                    ? "check-circle"
                    : "radio-button-unchecked"
                }
                size={24}
                color={eligibility.ageConfirmed ? "#10B981" : "#6B7280"}
              />
              <Text className="text-gray-300 ml-3">Age Verified</Text>
            </View>
            <Text className="text-gray-400">
              {eligibility.ageConfirmed ? "Verified" : "Pending"}
            </Text>
          </View>
        </View>

        {/* Information Card */}
        <View className="bg-blue-600/20 border border-blue-600/50 rounded-xl p-4">
          <View className="flex-row items-center mb-2">
            <MaterialIcons name="info" size={20} color="#60A5FA" />
            <Text className="text-blue-300 font-semibold ml-2">
              How It Works
            </Text>
          </View>
          <Text className="text-blue-200 text-sm leading-5">
            • Your preferences help us show you compatible matches{"\n"}• You'll
            only see people within your selected criteria{"\n"}• You can change
            these settings anytime{"\n"}• Age verification is required for
            safety
          </Text>
        </View>

        {/* Bottom spacing */}
        <View className="h-20" />
      </ScrollView>
    </SafeAreaView>
  );
};

export default DatingSettingsScreen;
