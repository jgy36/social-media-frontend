// src/screens/messages/SnapContactsTab.tsx - Fixed to actually send photos
import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Image,
  RefreshControl,
  Alert,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import {
  getEnhancedPhotoMessageConversations,
  EnhancedPhotoConversation,
  sendPhotoMessage, // Import the actual API function
} from "@/api/photoMessages";

interface PreSelectedRecipient {
  userId: number;
  name: string;
}

interface SnapContactsTabProps {
  capturedPhoto: string | null;
  onPhotoSent: () => void;
  onGoBack: () => void;
  preSelectedRecipient?: PreSelectedRecipient | null;
}

const SnapContactsTab: React.FC<SnapContactsTabProps> = ({
  capturedPhoto,
  onPhotoSent,
  onGoBack,
  preSelectedRecipient,
}) => {
  const currentUser = useSelector((state: RootState) => state.user);
  const [contacts, setContacts] = useState<EnhancedPhotoConversation[]>([]);
  const [selectedContacts, setSelectedContacts] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sending, setSending] = useState(false);

  const loadContacts = async () => {
    try {
      console.log("📱 Loading contacts for snap...");
      const data = await getEnhancedPhotoMessageConversations();
      setContacts(data);

      if (preSelectedRecipient) {
        setSelectedContacts([preSelectedRecipient.userId]);
      }
    } catch (error) {
      console.error("❌ Failed to load contacts:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadContacts();
  }, [preSelectedRecipient]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadContacts();
  }, []);

  const toggleContactSelection = (userId: number) => {
    if (preSelectedRecipient && preSelectedRecipient.userId === userId) {
      return;
    }

    setSelectedContacts((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  // FIXED: Actually send the photo message to each selected contact
  const handleSendSnap = async () => {
    if (selectedContacts.length === 0) {
      Alert.alert(
        "No Recipients",
        "Please select at least one person to send your snap to."
      );
      return;
    }

    if (!capturedPhoto) {
      Alert.alert("No Photo", "No photo to send.");
      return;
    }

    try {
      setSending(true);
      console.log("📸 Actually sending snap to:", selectedContacts);

      // Send the photo to each selected contact
      const sendPromises = selectedContacts.map(async (recipientId) => {
        console.log(`📤 Sending photo to user ${recipientId}...`);
        const response = await sendPhotoMessage(recipientId, capturedPhoto);
        console.log(`✅ Photo sent to user ${recipientId}:`, response);
        return response;
      });

      // Wait for all sends to complete
      const results = await Promise.all(sendPromises);

      // Check if all sends were successful
      const failedSends = results.filter((result) => !result.success);

      if (failedSends.length > 0) {
        console.error("❌ Some sends failed:", failedSends);
        Alert.alert(
          "Partial Send Failure",
          `Failed to send to ${failedSends.length} recipient(s). Please try again.`
        );
        return;
      }

      console.log("✅ All snaps sent successfully!");

      // Show success message
      Alert.alert(
        "Snap Sent! 📸",
        `Your snap was sent to ${selectedContacts.length} friend${
          selectedContacts.length > 1 ? "s" : ""
        }!`,
        [{ text: "OK", onPress: onPhotoSent }]
      );
    } catch (error) {
      console.error("❌ Failed to send snap:", error);
      Alert.alert("Send Failed", "Failed to send your snap. Please try again.");
    } finally {
      setSending(false);
    }
  };

  const renderContact = ({ item }: { item: EnhancedPhotoConversation }) => {
    const isSelected = selectedContacts.includes(item.userId);
    const isPreSelected = preSelectedRecipient?.userId === item.userId;

    return (
      <TouchableOpacity
        onPress={() => toggleContactSelection(item.userId)}
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 16,
          paddingVertical: 12,
          backgroundColor: "#000000",
          opacity: isPreSelected ? 1 : isSelected ? 0.8 : 1,
        }}
        activeOpacity={0.8}
      >
        <View style={{ position: "relative" }}>
          <Image
            source={{
              uri:
                item.profileImageUrl ||
                `https://api.dicebear.com/7.x/avataaars/svg?seed=${item.username}`,
            }}
            style={{
              width: 50,
              height: 50,
              borderRadius: 25,
              borderWidth: isSelected ? 3 : 2,
              borderColor: isSelected ? "#10B981" : "#2F3542",
            }}
          />

          {isSelected && (
            <View
              style={{
                position: "absolute",
                bottom: -2,
                right: -2,
                backgroundColor: "#10B981",
                borderRadius: 10,
                width: 20,
                height: 20,
                justifyContent: "center",
                alignItems: "center",
                borderWidth: 2,
                borderColor: "#000000",
              }}
            >
              <MaterialIcons name="check" size={12} color="white" />
            </View>
          )}
        </View>

        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text
            style={{
              color: "#FFFFFF",
              fontSize: 16,
              fontWeight: "600",
              marginBottom: 2,
            }}
          >
            {item.displayName || item.username}
          </Text>

          {isPreSelected && (
            <Text
              style={{
                color: "#10B981",
                fontSize: 12,
                fontWeight: "500",
              }}
            >
              Pre-selected
            </Text>
          )}

          {item.isMatch && !isPreSelected && (
            <Text
              style={{
                color: "#8E8E93",
                fontSize: 12,
              }}
            >
              Match
            </Text>
          )}
        </View>

        {isSelected && (
          <MaterialIcons
            name="radio-button-checked"
            size={24}
            color="#10B981"
          />
        )}
        {!isSelected && (
          <MaterialIcons
            name="radio-button-unchecked"
            size={24}
            color="#8E8E93"
          />
        )}
      </TouchableOpacity>
    );
  };

  const renderHeader = () => (
    <View
      style={{
        paddingHorizontal: 16,
        paddingVertical: 16,
        backgroundColor: "#000000",
        borderBottomWidth: 1,
        borderBottomColor: "#2F3542",
      }}
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <TouchableOpacity
          onPress={onGoBack}
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingVertical: 8,
            paddingRight: 16,
          }}
        >
          <MaterialIcons name="arrow-back" size={24} color="#FFFFFF" />
          <Text
            style={{
              color: "#FFFFFF",
              fontSize: 16,
              fontWeight: "600",
              marginLeft: 8,
            }}
          >
            Edit
          </Text>
        </TouchableOpacity>

        <Text
          style={{
            color: "#FFFFFF",
            fontSize: 20,
            fontWeight: "bold",
            flex: 1,
            textAlign: "center",
          }}
        >
          Send To
        </Text>

        <View style={{ width: 80 }} />
      </View>

      {capturedPhoto && (
        <View
          style={{
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <Image
            source={{ uri: capturedPhoto }}
            style={{
              width: 60,
              height: 80,
              borderRadius: 8,
              resizeMode: "cover",
            }}
          />
        </View>
      )}

      <Text
        style={{
          color: "#8E8E93",
          fontSize: 14,
          textAlign: "center",
          marginBottom: 8,
        }}
      >
        Select friends to send your snap
      </Text>

      <Text
        style={{
          color: "#10B981",
          fontSize: 14,
          textAlign: "center",
          fontWeight: "600",
        }}
      >
        {selectedContacts.length} selected
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
      <MaterialIcons name="people" size={80} color="#6B7280" />
      <Text
        style={{
          color: "#FFFFFF",
          fontSize: 20,
          fontWeight: "600",
          textAlign: "center",
          marginTop: 24,
          marginBottom: 8,
        }}
      >
        No Contacts Available
      </Text>
      <Text
        style={{
          color: "#8E8E93",
          fontSize: 16,
          textAlign: "center",
          lineHeight: 22,
        }}
      >
        Start matching with people to send snaps!
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#000000",
        }}
      >
        <MaterialIcons name="people" size={40} color="#8E8E93" />
        <Text style={{ color: "#8E8E93", marginTop: 12 }}>
          Loading contacts...
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#000000" }}>
      <FlatList
        data={contacts}
        renderItem={renderContact}
        keyExtractor={(item) => item.userId.toString()}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={loading ? null : renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#10B981"
            colors={["#10B981"]}
          />
        }
        showsVerticalScrollIndicator={false}
        style={{ backgroundColor: "#000000" }}
      />

      {selectedContacts.length > 0 && (
        <View
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            paddingHorizontal: 20,
            paddingVertical: 20,
            backgroundColor: "rgba(0,0,0,0.9)",
            borderTopWidth: 1,
            borderTopColor: "#2F3542",
          }}
        >
          <TouchableOpacity
            onPress={handleSendSnap}
            disabled={sending}
            style={{
              backgroundColor: sending ? "#666" : "#10B981",
              borderRadius: 30,
              paddingVertical: 16,
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            {sending ? (
              <MaterialIcons name="hourglass-empty" size={20} color="white" />
            ) : (
              <MaterialIcons name="send" size={20} color="white" />
            )}
            <Text
              style={{
                color: "white",
                fontWeight: "600",
                marginLeft: 8,
                fontSize: 16,
              }}
            >
              {sending
                ? "Sending..."
                : `Send to ${selectedContacts.length} friend${
                    selectedContacts.length > 1 ? "s" : ""
                  }`}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default SnapContactsTab;
