import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";

const BACKEND_URL = "http://192.168.137.1:8080"; // Replace with your Windows IP

export default function CodeVerificationScreen() {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();
  const route = useRoute();

  // Get email from navigation params
  const email = route.params?.email || "your email";

  const verifyCode = async () => {
    if (!code.trim()) {
      Alert.alert("Error", "Please enter the verification code");
      return;
    }

    if (code.trim().length !== 6) {
      Alert.alert("Error", "Please enter a 6-character code");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${BACKEND_URL}/api/auth/verify?code=${code.trim()}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const result = await response.json();

      if (response.ok && result.success) {
        Alert.alert(
          "Success!",
          "Your account has been verified successfully!",
          [
            {
              text: "Login Now",
              onPress: () => navigation.navigate("Login"),
            },
          ]
        );
      } else {
        Alert.alert(
          "Verification Failed",
          result.message ||
            "Invalid or expired verification code. Please try again.",
          [{ text: "OK" }]
        );
      }
    } catch (error) {
      console.error("Verification error:", error);
      Alert.alert(
        "Error",
        "Could not verify your account. Please check your internet connection and try again.",
        [{ text: "OK" }]
      );
    } finally {
      setLoading(false);
    }
  };

  const resendCode = () => {
    Alert.alert(
      "Resend Code",
      "Please register again to get a new verification code.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Register Again",
          onPress: () => navigation.navigate("Register"),
        },
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <View className="flex-1 px-6 py-8">
          {/* Header */}
          <View className="mb-8">
            <Text className="text-2xl font-bold text-gray-900 mb-2">
              Verify Your Account
            </Text>
            <Text className="text-gray-600 leading-6">
              We've sent a 6-digit verification code to {email}. Enter the code
              below to verify your account.
            </Text>
          </View>

          {/* Code Input */}
          <View className="mb-6">
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Verification Code
            </Text>
            <TextInput
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-lg text-center font-mono tracking-widest"
              placeholder="000000"
              value={code}
              onChangeText={(text) =>
                setCode(text.toUpperCase().substring(0, 6))
              }
              keyboardType="default"
              autoCapitalize="characters"
              autoCorrect={false}
              autoComplete="off"
              textContentType="oneTimeCode"
              maxLength={6}
            />
          </View>

          {/* Verify Button */}
          <TouchableOpacity
            onPress={verifyCode}
            disabled={loading || code.length !== 6}
            className="w-full py-3 px-4 rounded-lg mb-4"
            style={{
              backgroundColor:
                loading || code.length !== 6 ? "#9CA3AF" : "#3B82F6",
            }}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white text-center font-semibold text-lg">
                Verify Account
              </Text>
            )}
          </TouchableOpacity>

          {/* Resend Code */}
          <View className="flex-row justify-center">
            <Text className="text-gray-600">Didn't receive the code? </Text>
            <TouchableOpacity onPress={resendCode}>
              <Text className="text-blue-600 font-medium">Resend Code</Text>
            </TouchableOpacity>
          </View>

          {/* Back to Login */}
          <TouchableOpacity
            onPress={() => navigation.navigate("Login")}
            className="mt-8"
          >
            <Text className="text-center text-gray-600">Back to Login</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
