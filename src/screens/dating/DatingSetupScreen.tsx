// src/screens/dating/DatingSetupScreen.tsx - Updated with gender selection
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Modal,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { MaterialIcons, Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import {
  getCurrentDatingProfile,
  createOrUpdateDatingProfile,
  uploadDatingPhoto,
} from "@/api/dating";
import * as ImagePicker from "expo-image-picker";
import PromptCard from "@/components/dating/PromptCard";

interface DatingProfileData {
  bio: string;
  location: string;
  height: string;
  job: string;
  religion: string;
  relationshipType: string;
  lifestyle: string;
  photos: string[];
  prompts: Array<{
    question: string;
    answer: string;
  }>;
  hasChildren: string;
  wantChildren: string;
  drinking: string;
  smoking: string;
  drugs: string;
  lookingFor: string;
  interests: string[];
  virtues: Array<{ category: string; value: string }>;
  // NEW: Add gender selection
  gender: string;
}

const DatingSetupScreen = () => {
  const navigation = useNavigation();
  const user = useSelector((state: RootState) => state.user);

  const [profile, setProfile] = useState<DatingProfileData>({
    bio: "",
    location: "",
    height: "",
    job: "",
    religion: "",
    relationshipType: "",
    lifestyle: "",
    photos: ["", "", "", "", "", ""],
    prompts: [
      { question: "", answer: "" },
      { question: "", answer: "" },
      { question: "", answer: "" },
    ],
    hasChildren: "",
    wantChildren: "",
    drinking: "",
    smoking: "",
    drugs: "",
    lookingFor: "",
    interests: [],
    virtues: [],
    // NEW: Initialize gender
    gender: "",
  });

  const [showPromptSelector, setShowPromptSelector] = useState<number | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState<number | null>(null);

  // Gender options
  const genderOptions = [
    { value: "MAN", label: "Man" },
    { value: "WOMAN", label: "Woman" },
    { value: "NON_BINARY", label: "Non-binary" },
    { value: "OTHER", label: "Other" },
  ];

  const availablePrompts = [
    "I want someone who...",
    "My simple pleasures...",
    "We'll get along if...",
    "The way to win me over is...",
    "I'm looking for...",
    "I go crazy for...",
    "The one thing I'd love to know about you is...",
    "Two truths and a lie...",
    "My most irrational fear...",
    "The key to my heart is...",
    "I'm convinced that...",
    "My greatest strength...",
    "My ideal Sunday...",
    "I'm passionate about...",
    "The best way to ask me out is to...",
    "I'll fall for you if...",
    "My love language is...",
    "I'm secretly great at...",
    "Together we could...",
    "Change my mind about...",
    "Don't hate me if I...",
  ];

  const heightOptions = [
    "4'0\"",
    "4'1\"",
    "4'2\"",
    "4'3\"",
    "4'4\"",
    "4'5\"",
    "4'6\"",
    "4'7\"",
    "4'8\"",
    "4'9\"",
    "4'10\"",
    "4'11\"",
    "5'0\"",
    "5'1\"",
    "5'2\"",
    "5'3\"",
    "5'4\"",
    "5'5\"",
    "5'6\"",
    "5'7\"",
    "5'8\"",
    "5'9\"",
    "5'10\"",
    "5'11\"",
    "6'0\"",
    "6'1\"",
    "6'2\"",
    "6'3\"",
    "6'4\"",
    "6'5\"",
    "6'6\"",
    "6'7\"",
    "6'8\"",
    "6'9\"",
    "6'10\"",
    "6'11\"",
    "7'0\"",
    "7'1\"",
    "7'2\"",
    "7'3\"",
    "7'4\"",
    "7'5\"",
  ];

  const religionOptions = [
    "Christian",
    "Catholic",
    "Jewish",
    "Muslim",
    "Hindu",
    "Buddhist",
    "Spiritual",
    "Agnostic",
    "Atheist",
    "Other",
  ];

  const relationshipOptions = [
    "Long-term relationship",
    "Short-term relationship",
    "Casual dating",
    "New friends",
    "Something casual",
  ];

  const lifestyleOptions = [
    "Monogamy",
    "Non-monogamy",
    "Figuring out my dating goals",
  ];

  useEffect(() => {
    loadExistingProfile();
    requestPermissions();
  }, []);

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Required",
        "We need access to your photo library to upload photos."
      );
    }
  };

  const loadExistingProfile = async () => {
    try {
      console.log("🔄 Loading existing dating profile...");
      const existingProfile = await getCurrentDatingProfile();
      console.log(
        "📋 Raw profile data:",
        JSON.stringify(existingProfile, null, 2)
      );

      if (existingProfile) {
        console.log("✅ Profile exists, processing data...");

        const photos = existingProfile.photos || [];
        const photosArray = Array(6)
          .fill("")
          .map((_, index) => photos[index] || "");

        const promptsArray = existingProfile.prompts || [];
        const normalizedPrompts = Array(3)
          .fill(null)
          .map(
            (_, index) => promptsArray[index] || { question: "", answer: "" }
          );

        setProfile({
          bio: existingProfile.bio || "",
          location: existingProfile.location || "",
          height: existingProfile.height || "",
          job: existingProfile.job || "",
          religion: existingProfile.religion || "",
          relationshipType: existingProfile.relationshipType || "",
          lifestyle: existingProfile.lifestyle || "",
          photos: photosArray,
          prompts: normalizedPrompts,
          hasChildren: existingProfile.hasChildren || "",
          wantChildren: existingProfile.wantChildren || "",
          drinking: existingProfile.drinking || "",
          smoking: existingProfile.smoking || "",
          drugs: existingProfile.drugs || "",
          lookingFor: existingProfile.lookingFor || "",
          interests: existingProfile.interests || [],
          virtues: existingProfile.virtues || [],
          // NEW: Load gender
          gender: existingProfile.gender || "",
        });
      }
    } catch (error) {
      console.error("❌ Error loading profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoSelect = async (index: number) => {
    if (uploadingPhoto !== null) {
      Alert.alert("Please wait", "Another photo is currently uploading.");
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [2, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets?.[0]) {
        setUploadingPhoto(index);

        try {
          const photoUrl = await uploadDatingPhoto(result.assets[0]);
          const newPhotos = [...profile.photos];
          newPhotos[index] = photoUrl;
          setProfile({ ...profile, photos: newPhotos });
        } catch (error) {
          console.error("Upload error:", error);
          Alert.alert(
            "Upload Failed",
            "Failed to upload photo. Please try again."
          );
        } finally {
          setUploadingPhoto(null);
        }
      }
    } catch (error) {
      console.error("Image picker error:", error);
      Alert.alert("Error", "Failed to select photo. Please try again.");
      setUploadingPhoto(null);
    }
  };

  const handleRemovePhoto = (index: number) => {
    const newPhotos = [...profile.photos];
    newPhotos[index] = "";
    setProfile({ ...profile, photos: newPhotos });
  };

  const handlePromptChange = (
    index: number,
    updatedPrompt: { question: string; answer: string }
  ) => {
    const newPrompts = [...profile.prompts];
    newPrompts[index] = updatedPrompt;
    setProfile({ ...profile, prompts: newPrompts });
  };

  const handlePromptSelect = (index: number) => {
    setShowPromptSelector(index);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Validation
      if (!profile.bio.trim()) {
        Alert.alert(
          "Missing Information",
          "Please add a bio to tell others about yourself."
        );
        return;
      }

      if (!profile.photos[0]) {
        Alert.alert(
          "Missing Photo",
          "Please add at least one photo to continue."
        );
        return;
      }

      if (!profile.location.trim()) {
        Alert.alert("Missing Location", "Please add your location.");
        return;
      }

      // NEW: Validate gender selection
      if (!profile.gender) {
        Alert.alert("Missing Information", "Please select your gender.");
        return;
      }

      const filteredPhotos = profile.photos.filter(
        (photo) => photo.trim() !== ""
      );

      const profileData = {
        ...profile,
        photos: filteredPhotos,
        prompts: profile.prompts.filter((p) => p.question && p.answer),
      };

      await createOrUpdateDatingProfile(profileData);

      Alert.alert(
        "Success!",
        "Your dating profile has been saved successfully.",
        [{ text: "OK", onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      console.error("Failed to save dating profile:", error);
      Alert.alert(
        "Save Failed",
        "Failed to save your profile. Please check your connection and try again."
      );
    } finally {
      setSaving(false);
    }
  };

  const SelectionButton = ({
    options,
    selectedValue,
    onSelect,
    placeholder,
  }: {
    options: string[];
    selectedValue: string;
    onSelect: (value: string) => void;
    placeholder: string;
  }) => (
    <View className="flex-row flex-wrap gap-2">
      {options.map((option) => (
        <TouchableOpacity
          key={option}
          onPress={() => onSelect(option)}
          className="px-4 py-2 rounded-full border"
          style={{
            backgroundColor:
              selectedValue === option ? "#e5e7eb" : "transparent",
            borderColor: selectedValue === option ? "#e5e7eb" : "#6b7280",
          }}
        >
          <Text
            className="text-sm"
            style={{
              color: selectedValue === option ? "#111827" : "#d1d5db",
            }}
          >
            {option}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  // NEW: Gender Selection Component
  const GenderSelection = () => (
    <View className="mb-4">
      <Text className="text-sm font-medium text-gray-300 mb-2">I am a *</Text>
      <View className="flex-row flex-wrap gap-2">
        {genderOptions.map((option) => (
          <TouchableOpacity
            key={option.value}
            onPress={() => setProfile({ ...profile, gender: option.value })}
            className="px-4 py-3 rounded-xl border flex-1 min-w-[45%]"
            style={{
              backgroundColor:
                profile.gender === option.value ? "#FF6B9D" : "transparent",
              borderColor:
                profile.gender === option.value ? "#FF6B9D" : "#6b7280",
            }}
          >
            <Text
              className="text-sm text-center font-medium"
              style={{
                color: profile.gender === option.value ? "#FFFFFF" : "#d1d5db",
              }}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <Text className="text-xs text-gray-500 mt-1">
        This helps us show you to the right people
      </Text>
    </View>
  );

  const PhotoUploadSlot = ({
    photo,
    onPhotoSelect,
    onRemovePhoto,
    index,
    large = false,
    isUploading = false,
  }: {
    photo: string;
    onPhotoSelect: () => void;
    onRemovePhoto: () => void;
    index: number;
    large?: boolean;
    isUploading?: boolean;
  }) => (
    <View
      className={`${
        large ? "h-[450px]" : "w-full h-full"
      } bg-gray-800 rounded-3xl border-2 border-dashed border-gray-600 items-center justify-center relative overflow-hidden`}
    >
      {isUploading ? (
        <View className="items-center">
          <ActivityIndicator size="large" color="#e5e7eb" />
          <Text className="text-gray-400 font-medium mt-2">Uploading...</Text>
        </View>
      ) : photo ? (
        <TouchableOpacity
          onPress={onPhotoSelect}
          className="w-full h-full relative"
          activeOpacity={0.8}
        >
          <Image
            source={{ uri: photo }}
            className="w-full h-full rounded-3xl"
            resizeMode="cover"
          />
          <View className="absolute top-3 right-3 bg-black/70 rounded-full p-2">
            <Feather name="edit-3" size={16} color="white" />
          </View>
          <TouchableOpacity
            onPress={onRemovePhoto}
            className="absolute top-3 left-3 bg-red-600 rounded-full p-1"
          >
            <MaterialIcons name="close" size={16} color="white" />
          </TouchableOpacity>
          {index === 0 && (
            <View className="absolute bottom-3 left-3 bg-green-500 rounded-full px-3 py-1">
              <Text className="text-white text-xs font-semibold">Main</Text>
            </View>
          )}
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          onPress={onPhotoSelect}
          className="items-center p-4"
          activeOpacity={0.7}
        >
          <MaterialIcons name="camera-alt" size={32} color="#6b7280" />
          <Text className="text-gray-400 font-medium mt-2 text-center">
            {large ? "Add main photo" : "Add photo"}
          </Text>
          {index === 0 && (
            <Text className="text-pink-500 text-xs mt-1 text-center">
              Required
            </Text>
          )}
        </TouchableOpacity>
      )}
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-black items-center justify-center">
        <ActivityIndicator size="large" color="#e5e7eb" />
        <Text className="text-white mt-4">Loading profile...</Text>
      </SafeAreaView>
    );
  }

  // Calculate progress - now includes gender
  const getProgress = () => {
    let progress = 0;
    if (profile.photos.filter((p) => p).length > 0) progress += 16;
    if (profile.bio) progress += 16;
    if (profile.location) progress += 16;
    if (profile.gender) progress += 16; // NEW: Add gender to progress
    if (profile.height) progress += 16;
    if (user?.age) progress += 16; // NEW: Age from birthday
    return Math.min(progress, 100);
  };

  return (
    <SafeAreaView className="flex-1 bg-black">
      {/* Header */}
      <View className="bg-black/95 border-b border-gray-800 px-6 py-4">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="p-2 rounded-full"
          >
            <MaterialIcons name="close" size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-xl font-semibold text-white">
            Edit Dating Profile
          </Text>
          <TouchableOpacity
            onPress={handleSave}
            disabled={saving || uploadingPhoto !== null}
            className="rounded-full px-6 py-2"
            style={{
              backgroundColor:
                saving || uploadingPhoto !== null ? "#374151" : "#e5e7eb",
            }}
          >
            {saving ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text className="text-black font-medium">Save</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ padding: 24 }}>
        {/* Progress indicator */}
        <View className="mb-6">
          <Text className="text-gray-400 text-sm mb-2">
            Complete your profile
          </Text>
          <View className="w-full bg-gray-700 rounded-full h-2">
            <View
              className="bg-green-500 h-2 rounded-full"
              style={{ width: `${getProgress()}%` }}
            />
          </View>
        </View>

        {/* Age Verification Notice */}
        {user?.age && user.age < 18 && (
          <View className="bg-yellow-600 rounded-xl p-4 mb-6">
            <Text className="text-white font-semibold mb-2">
              Age Restriction
            </Text>
            <Text className="text-white">
              You must be 18 or older to create a dating profile. You can still
              use other app features.
            </Text>
          </View>
        )}

        {/* Show dating profile form only if 18+ */}
        {(!user?.age || user.age >= 18) && (
          <>
            {/* Main Photo */}
            <PhotoUploadSlot
              photo={profile.photos[0]}
              onPhotoSelect={() => handlePhotoSelect(0)}
              onRemovePhoto={() => handleRemovePhoto(0)}
              index={0}
              large={true}
              isUploading={uploadingPhoto === 0}
            />

            {/* Basic Info Card */}
            <View className="bg-gray-900 rounded-3xl p-6 mb-6 border border-gray-800">
              <Text className="text-white text-lg font-semibold mb-4">
                About You
              </Text>

              {/* NEW: Gender Selection - MOVED TO TOP */}
              <GenderSelection />

              <View className="mb-4">
                <Text className="text-sm font-medium text-gray-300 mb-2">
                  Bio *
                </Text>
                <TextInput
                  value={profile.bio}
                  onChangeText={(text) => setProfile({ ...profile, bio: text })}
                  placeholder="Write a short bio about yourself..."
                  placeholderTextColor="#6b7280"
                  className="p-4 border border-gray-600 rounded-xl text-white bg-gray-800"
                  multiline
                  numberOfLines={3}
                  maxLength={500}
                />
                <View className="flex-row justify-between mt-1">
                  <Text className="text-xs text-gray-500">
                    Tell others what makes you unique
                  </Text>
                  <Text className="text-xs text-gray-400">
                    {profile.bio.length}/500
                  </Text>
                </View>
              </View>

              {/* Show age from birthday if available */}
              {user?.age && (
                <View className="mb-4">
                  <Text className="text-sm font-medium text-gray-300 mb-2">
                    Age
                  </Text>
                  <View className="p-3 border border-gray-600 rounded-xl bg-gray-700">
                    <Text className="text-white">{user.age} years old</Text>
                    <Text className="text-xs text-gray-400 mt-1">
                      Based on your birthday
                    </Text>
                  </View>
                </View>
              )}

              <View className="mb-4">
                <Text className="text-sm font-medium text-gray-300 mb-2">
                  Height
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View className="flex-row gap-2">
                    {heightOptions.map((height) => (
                      <TouchableOpacity
                        key={height}
                        onPress={() => setProfile({ ...profile, height })}
                        className="px-3 py-2 rounded-full border"
                        style={{
                          backgroundColor:
                            profile.height === height
                              ? "#e5e7eb"
                              : "transparent",
                          borderColor:
                            profile.height === height ? "#e5e7eb" : "#6b7280",
                        }}
                      >
                        <Text
                          className="text-sm"
                          style={{
                            color:
                              profile.height === height ? "#111827" : "#d1d5db",
                          }}
                        >
                          {height}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              </View>
            </View>

            {/* Lifestyle Info Card */}
            <View className="bg-gray-900 rounded-3xl p-6 mb-6 border border-gray-800">
              <Text className="text-white text-lg font-semibold mb-4">
                Lifestyle
              </Text>

              <View className="mb-4">
                <Text className="text-sm font-medium text-gray-300 mb-2">
                  Job
                </Text>
                <TextInput
                  value={profile.job}
                  onChangeText={(text) => setProfile({ ...profile, job: text })}
                  placeholder="What do you do for work?"
                  placeholderTextColor="#6b7280"
                  className="p-4 border border-gray-600 rounded-xl text-white bg-gray-800"
                  maxLength={100}
                />
              </View>

              <View className="mb-4">
                <Text className="text-sm font-medium text-gray-300 mb-2">
                  Location *
                </Text>
                <TextInput
                  value={profile.location}
                  onChangeText={(text) =>
                    setProfile({ ...profile, location: text })
                  }
                  placeholder="Where are you located?"
                  placeholderTextColor="#6b7280"
                  className="p-4 border border-gray-600 rounded-xl text-white bg-gray-800"
                />
              </View>

              <View className="mb-4">
                <Text className="text-sm font-medium text-gray-300 mb-2">
                  Religion
                </Text>
                <SelectionButton
                  options={religionOptions}
                  selectedValue={profile.religion}
                  onSelect={(value) =>
                    setProfile({ ...profile, religion: value })
                  }
                  placeholder="Select religion"
                />
              </View>

              <View className="mb-4">
                <Text className="text-sm font-medium text-gray-300 mb-2">
                  Relationship Type
                </Text>
                <SelectionButton
                  options={relationshipOptions}
                  selectedValue={profile.relationshipType}
                  onSelect={(value) =>
                    setProfile({ ...profile, relationshipType: value })
                  }
                  placeholder="Select relationship type"
                />
              </View>

              <View className="mb-4">
                <Text className="text-sm font-medium text-gray-300 mb-2">
                  Dating Style
                </Text>
                <SelectionButton
                  options={lifestyleOptions}
                  selectedValue={profile.lifestyle}
                  onSelect={(value) =>
                    setProfile({ ...profile, lifestyle: value })
                  }
                  placeholder="Select dating style"
                />
              </View>
            </View>

            {/* Vitals & Vices Card */}
            <View className="bg-gray-900 rounded-3xl p-6 mb-6 border border-gray-800">
              <Text className="text-white text-lg font-semibold mb-4">
                Vitals & Vices
              </Text>

              <View className="mb-4">
                <Text className="text-sm font-medium text-gray-300 mb-2">
                  Do you have children?
                </Text>
                <SelectionButton
                  options={["Have children", "Don't have children"]}
                  selectedValue={profile.hasChildren}
                  onSelect={(value) =>
                    setProfile({ ...profile, hasChildren: value })
                  }
                  placeholder="Select option"
                />
              </View>

              <View className="mb-4">
                <Text className="text-sm font-medium text-gray-300 mb-2">
                  Do you want children?
                </Text>
                <SelectionButton
                  options={[
                    "Want children",
                    "Don't want children",
                    "Open to children",
                  ]}
                  selectedValue={profile.wantChildren}
                  onSelect={(value) =>
                    setProfile({ ...profile, wantChildren: value })
                  }
                  placeholder="Select option"
                />
              </View>

              <View className="mb-4">
                <Text className="text-sm font-medium text-gray-300 mb-2">
                  Drinking
                </Text>
                <SelectionButton
                  options={["Never", "Sometimes", "Frequently"]}
                  selectedValue={profile.drinking}
                  onSelect={(value) =>
                    setProfile({ ...profile, drinking: value })
                  }
                  placeholder="Select option"
                />
              </View>

              <View className="mb-4">
                <Text className="text-sm font-medium text-gray-300 mb-2">
                  Smoking
                </Text>
                <SelectionButton
                  options={["No", "Sometimes", "Yes"]}
                  selectedValue={profile.smoking}
                  onSelect={(value) =>
                    setProfile({ ...profile, smoking: value })
                  }
                  placeholder="Select option"
                />
              </View>

              <View className="mb-4">
                <Text className="text-sm font-medium text-gray-300 mb-2">
                  Drugs
                </Text>
                <SelectionButton
                  options={["No", "Sometimes", "Yes"]}
                  selectedValue={profile.drugs}
                  onSelect={(value) => setProfile({ ...profile, drugs: value })}
                  placeholder="Select option"
                />
              </View>
            </View>

            {/* Virtues Card */}
            <View className="bg-gray-900 rounded-3xl p-6 mb-6 border border-gray-800">
              <Text className="text-white text-lg font-semibold mb-4">
                Virtues
              </Text>

              <View className="mb-4">
                <Text className="text-sm font-medium text-gray-300 mb-2">
                  Looking for
                </Text>
                <TextInput
                  value={profile.lookingFor}
                  onChangeText={(text) =>
                    setProfile({ ...profile, lookingFor: text })
                  }
                  placeholder="What are you looking for in a partner?"
                  placeholderTextColor="#6b7280"
                  className="p-4 border border-gray-600 rounded-xl text-white bg-gray-800"
                  multiline
                  numberOfLines={2}
                  maxLength={200}
                />
              </View>
            </View>

            {/* Additional Photos */}
            <View className="mb-6">
              <Text className="text-white text-lg font-semibold mb-4">
                More Photos
              </Text>
              <Text className="text-gray-400 text-sm mb-4">
                Add up to 5 more photos to show different sides of your
                personality
              </Text>

              <View className="flex-row flex-wrap justify-between">
                {[1, 2, 3, 4, 5].map((index) => (
                  <View key={index} className="w-[48%] mb-4 aspect-[3/4]">
                    <PhotoUploadSlot
                      photo={profile.photos[index]}
                      onPhotoSelect={() => handlePhotoSelect(index)}
                      onRemovePhoto={() => handleRemovePhoto(index)}
                      index={index}
                      isUploading={uploadingPhoto === index}
                    />
                  </View>
                ))}
              </View>
            </View>

            {/* Prompts Section */}
            <View className="mb-6">
              <Text className="text-white text-lg font-semibold mb-4">
                Prompts
              </Text>
              <Text className="text-gray-400 text-sm mb-4">
                Answer prompts to show your personality
              </Text>

              {[0, 1, 2].map((index) => (
                <PromptCard
                  key={index}
                  prompt={
                    profile.prompts[index] || { question: "", answer: "" }
                  }
                  promptIndex={index}
                  onPromptChange={handlePromptChange}
                  onSelectPrompt={handlePromptSelect}
                />
              ))}
            </View>

            {/* Note about preferences moved to settings */}
            <View className="bg-blue-600/20 border border-blue-600/50 rounded-xl p-4 mb-6">
              <View className="flex-row items-center mb-2">
                <MaterialIcons name="settings" size={20} color="#60A5FA" />
                <Text className="text-blue-300 font-semibold ml-2">
                  Dating Preferences
                </Text>
              </View>
              <Text className="text-blue-200 text-sm">
                Set your age range, gender preferences, and distance preferences
                in Dating Settings.
              </Text>
              <TouchableOpacity
                onPress={() => navigation.navigate("DatingSettings")}
                className="mt-3 bg-blue-600 rounded-lg py-2 px-4 self-start"
              >
                <Text className="text-white font-medium">Go to Settings</Text>
              </TouchableOpacity>
            </View>

            {/* Bottom spacing */}
            <View className="h-20" />
          </>
        )}
      </ScrollView>

      {/* Prompt Selector Modal */}
      <Modal
        visible={showPromptSelector !== null}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView className="flex-1 bg-black">
          <View className="flex-row justify-between items-center p-4 border-b border-gray-800">
            <Text className="text-lg font-semibold text-white">
              Choose a prompt
            </Text>
            <TouchableOpacity
              onPress={() => setShowPromptSelector(null)}
              className="p-2 rounded-full"
            >
              <MaterialIcons name="close" size={24} color="white" />
            </TouchableOpacity>
          </View>

          <ScrollView className="flex-1 p-4">
            {availablePrompts
              .filter(
                (prompt) => !profile.prompts?.some((p) => p.question === prompt)
              )
              .map((prompt, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => {
                    if (showPromptSelector !== null) {
                      const newPrompts = [...profile.prompts];
                      newPrompts[showPromptSelector] = {
                        question: prompt,
                        answer: "",
                      };
                      setProfile({ ...profile, prompts: newPrompts });
                      setShowPromptSelector(null);
                    }
                  }}
                  className="p-4 rounded-xl mb-2 bg-gray-900 border border-gray-800"
                >
                  <Text className="text-white text-base">{prompt}</Text>
                </TouchableOpacity>
              ))}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

export default DatingSetupScreen;
