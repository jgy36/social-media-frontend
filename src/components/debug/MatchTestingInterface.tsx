// src/components/debug/MatchTestingInterface.tsx - Add this to your debug screen
import React, { useState } from "react";
import { View, Text, TouchableOpacity, Alert, ScrollView } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { apiClient } from "@/api/apiClient";

const MatchTestingInterface = () => {
  const [loading, setLoading] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<any>(null);

  const callDebugEndpoint = async (
    endpoint: string,
    method: "GET" | "POST" = "POST"
  ) => {
    try {
      setLoading(endpoint);
      const response = await apiClient.request({
        method,
        url: `/debug/${endpoint}`,
      });

      setDebugInfo(response.data);

      if (response.data.success) {
        Alert.alert(
          "Success! ✅",
          response.data.message || "Operation completed"
        );
      } else {
        Alert.alert("Error ❌", response.data.error || "Operation failed");
      }
    } catch (error: any) {
      console.error(`Debug ${endpoint} error:`, error);
      Alert.alert(
        "Error ❌",
        error.response?.data?.error || error.message || "Network error"
      );
    } finally {
      setLoading(null);
    }
  };

  const DebugButton = ({
    title,
    endpoint,
    method = "POST",
    color = "#3B82F6",
    icon,
  }: {
    title: string;
    endpoint: string;
    method?: "GET" | "POST";
    color?: string;
    icon: keyof typeof MaterialIcons.glyphMap;
  }) => (
    <TouchableOpacity
      onPress={() => callDebugEndpoint(endpoint, method)}
      disabled={loading !== null}
      style={{
        backgroundColor: loading === endpoint ? "#6B7280" : color,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        flexDirection: "row",
        alignItems: "center",
        opacity: loading !== null && loading !== endpoint ? 0.5 : 1,
      }}
    >
      <MaterialIcons name={icon} size={20} color="white" />
      <Text
        style={{ color: "white", fontWeight: "600", marginLeft: 8, flex: 1 }}
      >
        {loading === endpoint ? "Loading..." : title}
      </Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={{ flex: 1, padding: 16 }}>
      <Text
        style={{
          fontSize: 20,
          fontWeight: "bold",
          color: "white",
          marginBottom: 20,
          textAlign: "center",
        }}
      >
        🎯 Match Testing Tools
      </Text>

      {/* Step-by-step instructions */}
      <View
        style={{
          backgroundColor: "#1F2937",
          padding: 16,
          borderRadius: 12,
          marginBottom: 20,
        }}
      >
        <Text style={{ color: "#E5E7EB", fontWeight: "600", marginBottom: 8 }}>
          📋 Testing Steps:
        </Text>
        <Text style={{ color: "#9CA3AF", fontSize: 14, lineHeight: 20 }}>
          1. Check who likes you{"\n"}
          2. If no one likes you, create test matches{"\n"}
          3. Go to Dating tab and swipe right{"\n"}
          4. Check your matches after swiping
        </Text>
      </View>

      {/* Debug Actions */}
      <DebugButton
        title="1. Check Who Likes Me"
        endpoint="who-likes-me"
        method="GET"
        color="#10B981"
        icon="favorite"
      />

      <DebugButton
        title="2. Create Test Matches (3 users will like you)"
        endpoint="create-test-matches"
        color="#8B5CF6"
        icon="psychology"
      />

      <DebugButton
        title="3. Check My Swipe History"
        endpoint="my-swipes"
        method="GET"
        color="#F59E0B"
        icon="history"
      />

      <DebugButton
        title="4. Check My Current Matches"
        endpoint="my-matches"
        method="GET"
        color="#EF4444"
        icon="people"
      />

      <DebugButton
        title="🚀 Force Create 3 Instant Matches"
        endpoint="force-create-matches"
        color="#EC4899"
        icon="flash-on"
      />

      <DebugButton
        title="🔄 Reset Everything & Start Fresh"
        endpoint="reset-everything"
        color="#6B7280"
        icon="refresh"
      />

      {/* Debug Info Display */}
      {debugInfo && (
        <View
          style={{
            backgroundColor: "#1F2937",
            padding: 16,
            borderRadius: 12,
            marginTop: 20,
          }}
        >
          <Text
            style={{ color: "#E5E7EB", fontWeight: "600", marginBottom: 8 }}
          >
            🔍 Debug Response:
          </Text>
          <ScrollView horizontal>
            <Text
              style={{
                color: "#9CA3AF",
                fontSize: 12,
                fontFamily: "monospace",
              }}
            >
              {JSON.stringify(debugInfo, null, 2)}
            </Text>
          </ScrollView>
        </View>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
};

export default MatchTestingInterface;
