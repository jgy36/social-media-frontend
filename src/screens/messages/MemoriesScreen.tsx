// src/screens/messages/MemoriesScreen.tsx - Saved snaps gallery
import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Image,
  Dimensions,
  Alert,
  RefreshControl,
  SafeAreaView,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Sharing from "expo-sharing";

const { width } = Dimensions.get("window");
const itemSize = (width - 48) / 3; // 3 columns with padding

interface SavedMemory {
  id: string;
  uri: string;
  timestamp: number;
  thumbnail?: string;
}

const MemoriesScreen = () => {
  const navigation = useNavigation();
  const [memories, setMemories] = useState<SavedMemory[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadMemories = async () => {
    try {
      const savedMemories = await AsyncStorage.getItem("savedMemories");
      if (savedMemories) {
        const parsedMemories = JSON.parse(savedMemories);
        // Sort by most recent first
        parsedMemories.sort(
          (a: SavedMemory, b: SavedMemory) => b.timestamp - a.timestamp
        );
        setMemories(parsedMemories);
      }
    } catch (error) {
      console.error("Failed to load memories:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadMemories();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadMemories();
  }, []);

  const deleteMemory = async (memoryId: string) => {
    try {
      const updatedMemories = memories.filter(
        (memory) => memory.id !== memoryId
      );
      await AsyncStorage.setItem(
        "savedMemories",
        JSON.stringify(updatedMemories)
      );
      setMemories(updatedMemories);
    } catch (error) {
      console.error("Failed to delete memory:", error);
      Alert.alert("Error", "Failed to delete memory");
    }
  };

  const shareMemory = async (memory: SavedMemory) => {
    try {
      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync(memory.uri);
      } else {
        Alert.alert(
          "Sharing not available",
          "Sharing is not available on this device"
        );
      }
    } catch (error) {
      console.error("Failed to share memory:", error);
      Alert.alert("Error", "Failed to share memory");
    }
  };

  const handleMemoryPress = (memory: SavedMemory) => {
    Alert.alert(
      "Memory Options",
      "What would you like to do with this memory?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Share", onPress: () => shareMemory(memory) },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            Alert.alert(
              "Delete Memory",
              "Are you sure you want to delete this memory?",
              [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Delete",
                  style: "destructive",
                  onPress: () => deleteMemory(memory.id),
                },
              ]
            );
          },
        },
      ]
    );
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  const renderMemory = ({ item }: { item: SavedMemory }) => (
    <TouchableOpacity
      onPress={() => handleMemoryPress(item)}
      style={{
        width: itemSize,
        height: itemSize * 1.3,
        marginBottom: 16,
        borderRadius: 12,
        overflow: "hidden",
        backgroundColor: "#2F3542",
      }}
      activeOpacity={0.8}
    >
      <Image
        source={{ uri: item.uri }}
        style={{
          width: "100%",
          height: "85%",
          resizeMode: "cover",
        }}
      />
      <View
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: "rgba(0,0,0,0.7)",
          paddingVertical: 4,
          paddingHorizontal: 8,
        }}
      >
        <Text
          style={{
            color: "#FFFFFF",
            fontSize: 10,
            fontWeight: "500",
            textAlign: "center",
          }}
        >
          {formatDate(item.timestamp)}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderHeader = () => (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 16,
        backgroundColor: "#000000",
      }}
    >
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={{
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <MaterialIcons name="arrow-back" size={24} color="#FFFFFF" />
        <Text
          style={{
            color: "#FFFFFF",
            fontSize: 18,
            fontWeight: "600",
            marginLeft: 8,
          }}
        >
          Memories
        </Text>
      </TouchableOpacity>

      <Text
        style={{
          color: "#8E8E93",
          fontSize: 14,
        }}
      >
        {memories.length} saved
      </Text>
    </View>
  );

  const renderEmptyState = () => (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 32,
      }}
    >
      <View
        style={{
          width: 100,
          height: 100,
          borderRadius: 50,
          backgroundColor: "#2F3542",
          justifyContent: "center",
          alignItems: "center",
          marginBottom: 24,
        }}
      >
        <MaterialIcons name="photo-library" size={40} color="#8E8E93" />
      </View>

      <Text
        style={{
          color: "#FFFFFF",
          fontSize: 20,
          fontWeight: "600",
          textAlign: "center",
          marginBottom: 8,
        }}
      >
        No Memories Yet
      </Text>

      <Text
        style={{
          color: "#8E8E93",
          fontSize: 16,
          textAlign: "center",
          lineHeight: 22,
          marginBottom: 24,
        }}
      >
        Take some snaps and save them to build your memories collection!
      </Text>

      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={{
          backgroundColor: "#10B981",
          borderRadius: 25,
          paddingHorizontal: 24,
          paddingVertical: 12,
        }}
      >
        <Text
          style={{
            color: "#FFFFFF",
            fontSize: 16,
            fontWeight: "600",
          }}
        >
          Take a Snap
        </Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#000000" }}>
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <MaterialIcons name="photo-library" size={40} color="#8E8E93" />
          <Text style={{ color: "#8E8E93", marginTop: 12 }}>
            Loading memories...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#000000" }}>
      {renderHeader()}
      <FlatList
        data={memories}
        renderItem={renderMemory}
        keyExtractor={(item) => item.id}
        numColumns={3}
        columnWrapperStyle={{
          justifyContent: "space-between",
          paddingHorizontal: 16,
        }}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#10B981"
            colors={["#10B981"]}
          />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: 16,
          paddingBottom: 32,
          flexGrow: 1,
        }}
      />
    </SafeAreaView>
  );
};

export default MemoriesScreen;
