// src/components/feed/PostForm.tsx - Updated for Modal Use
import { MaterialIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Image,
} from "react-native";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { useCreatePost } from "@/hooks/useApi";
import * as ImagePicker from "expo-image-picker";

interface PostFormProps {
  onPostCreated: () => void;
}

const PostForm = ({ onPostCreated }: PostFormProps) => {
  const [content, setContent] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);
  const [mediaFiles, setMediaFiles] = useState<any[]>([]);
  const [mediaPreviews, setMediaPreviews] = useState<string[]>([]);

  const user = useSelector((state: RootState) => state.user);
  const { loading, error, execute: createPost } = useCreatePost();

  const pickImage = async () => {
    try {
      // Request permission
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Please grant permission to access photos"
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        quality: 0.8,
        allowsMultipleSelection: true,
      });

      console.log("📸 Image picker result:", result);

      if (!result.canceled && result.assets) {
        const newFiles = result.assets.slice(0, 4 - mediaFiles.length);
        console.log("📸 Adding new files:", newFiles.length);

        setMediaFiles([...mediaFiles, ...newFiles]);
        setMediaPreviews([
          ...mediaPreviews,
          ...newFiles.map((asset) => asset.uri),
        ]);
      }
    } catch (error) {
      console.error("❌ Error picking image:", error);
      Alert.alert("Error", "Failed to pick image");
    }
  };

  const removeMedia = (index: number) => {
    const newFiles = [...mediaFiles];
    const newPreviews = [...mediaPreviews];

    newFiles.splice(index, 1);
    newPreviews.splice(index, 1);

    setMediaFiles(newFiles);
    setMediaPreviews(newPreviews);
  };

  const handleSubmit = async () => {
    console.log("🚀 PostForm - Submit started");
    console.log("📝 Content:", content);
    console.log("🎬 Media files:", mediaFiles.length);
    console.log("🔐 User token exists:", !!user.token);

    // Validation
    if (!content.trim() && mediaFiles.length === 0) {
      setLocalError("Please add some content or select media.");
      return;
    }

    if (!user.token) {
      setLocalError("You must be logged in to post.");
      return;
    }

    setLocalError(null);

    try {
      const postData = {
        content: content.trim(),
        media: mediaFiles.length > 0 ? mediaFiles : undefined,
        mediaTypes:
          mediaFiles.length > 0
            ? mediaFiles.map((file) =>
                file.type?.startsWith("video") ? "video" : "image"
              )
            : undefined,
        altTexts: mediaFiles.length > 0 ? mediaFiles.map(() => "") : undefined,
      };

      console.log("📤 PostForm - Sending post data:", {
        content: postData.content,
        hasMedia: !!postData.media,
        mediaCount: postData.media?.length || 0,
      });

      const result = await createPost(postData);

      if (result) {
        console.log("✅ PostForm - Post created successfully:", result.id);

        // Reset form
        setContent("");
        setMediaFiles([]);
        setMediaPreviews([]);

        // Notify parent component
        onPostCreated();
      } else {
        throw new Error("Failed to create post - no result returned");
      }
    } catch (err) {
      console.error("❌ PostForm - Error creating post:", err);
      setLocalError(
        err instanceof Error
          ? err.message
          : "Failed to create post. Please try again."
      );
    }
  };

  const errorMessage = localError || (error ? error.message : null);

  return (
    <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
      <View className="bg-white dark:bg-gray-900 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-4">
        {/* Debug info in development */}
        {__DEV__ && (
          <View className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-2 mb-2">
            <Text className="text-blue-800 dark:text-blue-200 text-xs">
              Debug: User={user.username}, Token={user.token ? "Yes" : "No"},
              Media={mediaFiles.length}
            </Text>
          </View>
        )}

        {errorMessage && (
          <View className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 mb-4">
            <Text className="text-red-800 dark:text-red-200 text-sm">
              {errorMessage}
            </Text>
          </View>
        )}

        <TextInput
          placeholder="What's on your mind?"
          placeholderTextColor="#9CA3AF"
          value={content}
          onChangeText={setContent}
          multiline
          className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 min-h-[120px] text-gray-900 dark:text-white text-base"
          textAlignVertical="top"
          editable={!loading}
          style={{ fontFamily: "System" }}
        />

        {/* Media previews */}
        {mediaPreviews.length > 0 && (
          <ScrollView
            horizontal
            className="mt-4"
            showsHorizontalScrollIndicator={false}
          >
            <View className="flex-row gap-2">
              {mediaPreviews.map((preview, index) => (
                <View
                  key={index}
                  className="relative rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800"
                >
                  <Image
                    source={{ uri: preview }}
                    className="w-24 h-24"
                    style={{ width: 96, height: 96 }}
                    resizeMode="cover"
                  />
                  <TouchableOpacity
                    className="absolute top-1 right-1 bg-red-500 rounded-full p-1"
                    onPress={() => removeMedia(index)}
                  >
                    <MaterialIcons name="close" size={16} color="white" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </ScrollView>
        )}

        <View className="flex-row justify-between items-center mt-4">
          <View className="flex-row gap-2">
            <TouchableOpacity
              className="bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 flex-row items-center"
              onPress={pickImage}
              disabled={loading || mediaFiles.length >= 4}
            >
              <MaterialIcons name="image" size={20} color="#3B82F6" />
              <Text className="text-blue-500 text-sm ml-2">
                Photo {mediaFiles.length > 0 && `(${mediaFiles.length}/4)`}
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            className="px-6 py-3 rounded-lg"
            style={{
              backgroundColor:
                loading || (!content.trim() && mediaFiles.length === 0)
                  ? "#D1D5DB"
                  : "#3B82F6",
            }}
            onPress={handleSubmit}
            disabled={loading || (!content.trim() && mediaFiles.length === 0)}
          >
            {loading ? (
              <View className="flex-row items-center">
                <ActivityIndicator size="small" color="white" />
                <Text className="text-white text-base ml-2">Posting...</Text>
              </View>
            ) : (
              <Text className="text-white text-base font-medium">Post</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

export default PostForm;
