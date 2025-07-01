// src/screens/messages/SnapContactsTab.tsx - Friends list for sending snaps
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import {
  getEnhancedPhotoMessageConversations,
  sendPhotoMessage,
} from "@/api/photoMessages";
import { getUserMatches } from "@/api/dating";

interface Contact {
  userId: number;
  username: string;
  displayName: string;
  profileImageUrl?: string;
  isMatch?: boolean;
  isSelected: boolean;
  snapScore?: number;
}

interface SnapContactsTabProps {
  capturedPhoto: string | null;
  onPhotoSent: () => void;
  onGoBack: () => void;
}

const SnapContactsTab: React.FC<SnapContactsTabProps> = ({
  capturedPhoto,
  onPhotoSent,
  onGoBack,
}) => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [selectedCount, setSelectedCount] = useState(0);

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    try {
      setLoading(true);

      // Get conversations and matches
      const [conversations, matches] = await Promise.all([
        getEnhancedPhotoMessageConversations(),
        getUserMatches(),
      ]);

      // Combine and deduplicate contacts
      const contactMap = new Map<number, Contact>();

      // Add from conversations
      conversations.forEach((conv) => {
        contactMap.set(conv.userId, {
          userId: conv.userId,
          username: conv.username,
          displayName: conv.displayName,
          profileImageUrl: conv.profileImageUrl,
          isMatch: conv.isMatch,
          isSelected: false,
          snapScore: Math.floor(Math.random() * 100), // Mock snap score
        });
      });

      // Add from dating matches
      matches.forEach((match) => {
        const otherUser =
          match.user1.id !== match.user2.id
            ? match.user1.id === match.id
              ? match.user2
              : match.user1
            : match.user2;

        if (!contactMap.has(otherUser.id)) {
          contactMap.set(otherUser.id, {
            userId: otherUser.id,
            username: otherUser.username,
            displayName: otherUser.displayName,
            profileImageUrl: otherUser.profileImageUrl,
            isMatch: true,
            isSelected: false,
            snapScore: Math.floor(Math.random() * 100),
          });
        }
      });

      // Convert to array and sort by display name
      const contactList = Array.from(contactMap.values()).sort((a, b) =>
        (a.displayName || a.username).localeCompare(b.displayName || b.username)
      );

      setContacts(contactList);
    } catch (error) {
      console.error("Failed to load contacts:", error);
      Alert.alert("Error", "Failed to load contacts");
    } finally {
      setLoading(false);
    }
  };

  const toggleContactSelection = (userId: number) => {
    setContacts((prev) => {
      const updated = prev.map((contact) =>
        contact.userId === userId
          ? { ...contact, isSelected: !contact.isSelected }
          : contact
      );

      const newSelectedCount = updated.filter((c) => c.isSelected).length;
      setSelectedCount(newSelectedCount);

      return updated;
    });
  };

  const handleSendSnap = async () => {
    if (!capturedPhoto) {
      Alert.alert("Error", "No photo to send");
      return;
    }

    const selectedContacts = contacts.filter((c) => c.isSelected);
    if (selectedContacts.length === 0) {
      Alert.alert(
        "Select Recipients",
        "Please select at least one person to send your snap to"
      );
      return;
    }

    try {
      setSending(true);

      // Send photo to each selected contact
      const sendPromises = selectedContacts.map((contact) =>
        sendPhotoMessage(contact.userId, capturedPhoto, 24)
      );

      await Promise.all(sendPromises);

      Alert.alert(
        "Snap Sent! 🎉",
        `Your snap was sent to ${selectedContacts.length} friend${
          selectedContacts.length > 1 ? "s" : ""
        }!`,
        [{ text: "OK", onPress: onPhotoSent }]
      );
    } catch (error) {
      console.error("Failed to send snap:", error);
      Alert.alert("Error", "Failed to send snap. Please try again.");
    } finally {
      setSending(false);
    }
  };

  const renderContact = ({ item }: { item: Contact }) => (
    <TouchableOpacity
      onPress={() => toggleContactSelection(item.userId)}
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: item.isSelected
          ? "rgba(255, 107, 157, 0.1)"
          : "transparent",
      }}
      activeOpacity={0.7}
    >
      {/* Selection Indicator */}
      <View
        style={{
          width: 24,
          height: 24,
          borderRadius: 12,
          borderWidth: 2,
          borderColor: item.isSelected ? "#FF6B9D" : "#8E8E93",
          backgroundColor: item.isSelected ? "#FF6B9D" : "transparent",
          justifyContent: "center",
          alignItems: "center",
          marginRight: 12,
        }}
      >
        {item.isSelected && (
          <MaterialIcons name="check" size={16} color="white" />
        )}
      </View>

      {/* Profile Image */}
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
            borderWidth: 2,
            borderColor: item.isSelected ? "#FF6B9D" : "#2F3542",
          }}
        />

        {/* Match Badge */}
        {item.isMatch && (
          <View
            style={{
              position: "absolute",
              bottom: -2,
              right: -2,
              backgroundColor: "#FF6B9D",
              borderRadius: 8,
              width: 16,
              height: 16,
              justifyContent: "center",
              alignItems: "center",
              borderWidth: 2,
              borderColor: "#000000",
            }}
          >
            <MaterialIcons name="favorite" size={10} color="white" />
          </View>
        )}
      </View>

      {/* Contact Info */}
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

        <View style={{ flexDirection: "row", alignItems: "center" }}>
          {item.isMatch && (
            <>
              <MaterialIcons name="favorite" size={12} color="#FF6B9D" />
              <Text
                style={{
                  color: "#FF6B9D",
                  fontSize: 12,
                  marginLeft: 2,
                  marginRight: 8,
                }}
              >
                Match
              </Text>
            </>
          )}

          <Text style={{ color: "#8E8E93", fontSize: 12 }}>
            {item.snapScore} 🔥
          </Text>
        </View>
      </View>

      {/* Quick Send Icon */}
      <TouchableOpacity
        onPress={() => {
          // Quick send to just this person
          setContacts((prev) =>
            prev.map((c) => ({
              ...c,
              isSelected: c.userId === item.userId,
            }))
          );
          setSelectedCount(1);
          setTimeout(() => handleSendSnap(), 100);
        }}
        style={{
          width: 32,
          height: 32,
          borderRadius: 16,
          backgroundColor: "#2F3542",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <MaterialIcons name="send" size={16} color="#8E8E93" />
      </TouchableOpacity>
    </TouchableOpacity>
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
        <MaterialIcons name="people" size={40} color="#8E8E93" />
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
        No Friends Yet
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
        Start swiping to find matches or follow people to send them snaps!
      </Text>

      <TouchableOpacity
        onPress={onGoBack}
        style={{
          backgroundColor: "#2F3542",
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
          Go Back
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderHeader = () => (
    <View
      style={{
        paddingHorizontal: 16,
        paddingVertical: 16,
        backgroundColor: "#000000",
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
        <Text
          style={{
            color: "#FFFFFF",
            fontSize: 24,
            fontWeight: "bold",
          }}
        >
          Send To
        </Text>

        <TouchableOpacity onPress={onGoBack}>
          <MaterialIcons name="close" size={24} color="#8E8E93" />
        </TouchableOpacity>
      </View>

      {/* Selected Count */}
      {selectedCount > 0 && (
        <View
          style={{
            backgroundColor: "#FF6B9D",
            borderRadius: 20,
            paddingHorizontal: 12,
            paddingVertical: 6,
            alignSelf: "flex-start",
          }}
        >
          <Text
            style={{
              color: "#FFFFFF",
              fontSize: 14,
              fontWeight: "600",
            }}
          >
            {selectedCount} selected
          </Text>
        </View>
      )}
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
        <ActivityIndicator size="large" color="#FF6B9D" />
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
        showsVerticalScrollIndicator={false}
        style={{ backgroundColor: "#000000" }}
      />

      {/* Send Button */}
      {selectedCount > 0 && (
        <View
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            paddingHorizontal: 16,
            paddingVertical: 20,
            backgroundColor: "rgba(0,0,0,0.9)",
          }}
        >
          <TouchableOpacity
            onPress={handleSendSnap}
            disabled={sending}
            style={{
              backgroundColor: "#FF6B9D",
              borderRadius: 25,
              paddingVertical: 16,
              paddingHorizontal: 24,
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
              opacity: sending ? 0.6 : 1,
            }}
          >
            {sending ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <>
                <MaterialIcons name="send" size={20} color="white" />
                <Text
                  style={{
                    color: "#FFFFFF",
                    fontSize: 18,
                    fontWeight: "600",
                    marginLeft: 8,
                  }}
                >
                  Send Snap to {selectedCount} friend
                  {selectedCount > 1 ? "s" : ""}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default SnapContactsTab;
