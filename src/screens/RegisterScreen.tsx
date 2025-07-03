// src/screens/auth/RegisterScreen.tsx - Complete with birthday
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  Platform,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { register } from "@/api/auth";

interface RegistrationData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  displayName: string;
  dateOfBirth: Date;
}

const RegisterScreen = () => {
  const navigation = useNavigation();

  const [formData, setFormData] = useState<RegistrationData>({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    displayName: "",
    dateOfBirth: new Date(2000, 0, 1), // Default to Jan 1, 2000
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Calculate age from birthday
  const calculateAge = (birthDate: Date): number => {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Username validation
    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
    } else if (formData.username.length < 3) {
      newErrors.username = "Username must be at least 3 characters";
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username =
        "Username can only contain letters, numbers, and underscores";
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    // Confirm password validation
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    // Display name validation
    if (!formData.displayName.trim()) {
      newErrors.displayName = "Display name is required";
    }

    // Age validation
    const age = calculateAge(formData.dateOfBirth);
    if (age < 13) {
      newErrors.dateOfBirth =
        "You must be at least 13 years old to create an account";
    } else if (age > 120) {
      newErrors.dateOfBirth = "Please enter a valid birth date";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      const registrationPayload = {
        username: formData.username.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        displayName: formData.displayName.trim(),
        dateOfBirth: formData.dateOfBirth.toISOString().split("T")[0], // YYYY-MM-DD format
      };

      const result = await register(registrationPayload);

      if (result.success) {
        Alert.alert(
          "Registration Successful! 🎉",
          "Please check your email to verify your account before signing in.",
          [
            {
              text: "OK",
              onPress: () => navigation.navigate("Login" as never),
            },
          ]
        );
      } else {
        Alert.alert("Registration Failed", result.error || "Please try again");
      }
    } catch (error: any) {
      console.error("Registration error:", error);
      Alert.alert(
        "Registration Failed",
        error.message || "An unexpected error occurred. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === "ios");

    if (selectedDate) {
      setFormData((prev) => ({ ...prev, dateOfBirth: selectedDate }));
      // Clear any existing date error
      if (errors.dateOfBirth) {
        setErrors((prev) => ({ ...prev, dateOfBirth: "" }));
      }
    }
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getAgeDisplay = (): string => {
    const age = calculateAge(formData.dateOfBirth);
    if (age < 13) {
      return `Age: ${age} (Too young)`;
    } else if (age < 18) {
      return `Age: ${age} (Social features only)`;
    } else {
      return `Age: ${age} (All features available)`;
    }
  };

  const getAgeColor = (): string => {
    const age = calculateAge(formData.dateOfBirth);
    if (age < 13) return "#EF4444"; // Red
    if (age < 18) return "#F59E0B"; // Amber
    return "#10B981"; // Green
  };

  return (
    <SafeAreaView className="flex-1 bg-black">
      <ScrollView className="flex-1" contentContainerStyle={{ padding: 24 }}>
        {/* Header */}
        <View className="items-center mb-8">
          <Text className="text-3xl font-bold text-white mb-2">
            Create Account
          </Text>
          <Text className="text-gray-400 text-center">
            Join the political dating community
          </Text>
        </View>

        {/* Form */}
        <View className="space-y-6">
          {/* Username */}
          <View>
            <Text className="text-white font-medium mb-2">Username *</Text>
            <TextInput
              value={formData.username}
              onChangeText={(text) => {
                setFormData((prev) => ({ ...prev, username: text }));
                if (errors.username) {
                  setErrors((prev) => ({ ...prev, username: "" }));
                }
              }}
              placeholder="Choose a unique username"
              placeholderTextColor="#6B7280"
              className="bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white"
              autoCapitalize="none"
              autoCorrect={false}
            />
            {errors.username && (
              <Text className="text-red-400 text-sm mt-1">
                {errors.username}
              </Text>
            )}
          </View>

          {/* Display Name */}
          <View>
            <Text className="text-white font-medium mb-2">Display Name *</Text>
            <TextInput
              value={formData.displayName}
              onChangeText={(text) => {
                setFormData((prev) => ({ ...prev, displayName: text }));
                if (errors.displayName) {
                  setErrors((prev) => ({ ...prev, displayName: "" }));
                }
              }}
              placeholder="Your full name or preferred name"
              placeholderTextColor="#6B7280"
              className="bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white"
            />
            {errors.displayName && (
              <Text className="text-red-400 text-sm mt-1">
                {errors.displayName}
              </Text>
            )}
          </View>

          {/* Email */}
          <View>
            <Text className="text-white font-medium mb-2">Email *</Text>
            <TextInput
              value={formData.email}
              onChangeText={(text) => {
                setFormData((prev) => ({ ...prev, email: text }));
                if (errors.email) {
                  setErrors((prev) => ({ ...prev, email: "" }));
                }
              }}
              placeholder="your.email@example.com"
              placeholderTextColor="#6B7280"
              className="bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
            {errors.email && (
              <Text className="text-red-400 text-sm mt-1">{errors.email}</Text>
            )}
          </View>

          {/* Birthday */}
          <View>
            <Text className="text-white font-medium mb-2">Birthday *</Text>
            <TouchableOpacity
              onPress={() => setShowDatePicker(true)}
              className="bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 flex-row items-center justify-between"
            >
              <Text className="text-white">
                {formatDate(formData.dateOfBirth)}
              </Text>
              <MaterialIcons name="calendar-today" size={20} color="#6B7280" />
            </TouchableOpacity>

            {/* Age Display */}
            <View className="mt-2 flex-row items-center">
              <MaterialIcons name="info" size={16} color={getAgeColor()} />
              <Text className="text-sm ml-1" style={{ color: getAgeColor() }}>
                {getAgeDisplay()}
              </Text>
            </View>

            {errors.dateOfBirth && (
              <Text className="text-red-400 text-sm mt-1">
                {errors.dateOfBirth}
              </Text>
            )}

            {/* Date Picker */}
            {showDatePicker && (
              <DateTimePicker
                value={formData.dateOfBirth}
                mode="date"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={onDateChange}
                maximumDate={new Date()} // Can't select future dates
                minimumDate={new Date(1900, 0, 1)} // Reasonable minimum
              />
            )}
          </View>

          {/* Password */}
          <View>
            <Text className="text-white font-medium mb-2">Password *</Text>
            <TextInput
              value={formData.password}
              onChangeText={(text) => {
                setFormData((prev) => ({ ...prev, password: text }));
                if (errors.password) {
                  setErrors((prev) => ({ ...prev, password: "" }));
                }
              }}
              placeholder="Create a strong password"
              placeholderTextColor="#6B7280"
              className="bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white"
              secureTextEntry
            />
            {errors.password && (
              <Text className="text-red-400 text-sm mt-1">
                {errors.password}
              </Text>
            )}
          </View>

          {/* Confirm Password */}
          <View>
            <Text className="text-white font-medium mb-2">
              Confirm Password *
            </Text>
            <TextInput
              value={formData.confirmPassword}
              onChangeText={(text) => {
                setFormData((prev) => ({ ...prev, confirmPassword: text }));
                if (errors.confirmPassword) {
                  setErrors((prev) => ({ ...prev, confirmPassword: "" }));
                }
              }}
              placeholder="Confirm your password"
              placeholderTextColor="#6B7280"
              className="bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white"
              secureTextEntry
            />
            {errors.confirmPassword && (
              <Text className="text-red-400 text-sm mt-1">
                {errors.confirmPassword}
              </Text>
            )}
          </View>
        </View>

        {/* Age Requirements Info */}
        <View className="bg-blue-600/20 border border-blue-600/50 rounded-xl p-4 mt-6">
          <View className="flex-row items-center mb-2">
            <MaterialIcons name="info" size={20} color="#60A5FA" />
            <Text className="text-blue-300 font-semibold ml-2">
              Age Requirements
            </Text>
          </View>
          <Text className="text-blue-200 text-sm leading-5">
            • 13+: Social media features (posts, following, discussions){"\n"}•
            18+: Dating features (matching, photo messages){"\n"}• Your age is
            calculated from your birthday and cannot be changed
          </Text>
        </View>

        {/* Register Button */}
        <TouchableOpacity
          onPress={handleRegister}
          disabled={loading}
          className="bg-pink-600 rounded-xl py-4 mt-8"
        >
          <View className="flex-row items-center justify-center">
            {loading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <>
                <MaterialIcons name="person-add" size={20} color="white" />
                <Text className="text-white font-semibold text-lg ml-2">
                  Create Account
                </Text>
              </>
            )}
          </View>
        </TouchableOpacity>

        {/* Login Link */}
        <View className="flex-row justify-center items-center mt-6">
          <Text className="text-gray-400">Already have an account? </Text>
          <TouchableOpacity
            onPress={() => navigation.navigate("Login" as never)}
          >
            <Text className="text-pink-400 font-semibold">Sign In</Text>
          </TouchableOpacity>
        </View>

        {/* Bottom spacing */}
        <View className="h-10" />
      </ScrollView>
    </SafeAreaView>
  );
};

export default RegisterScreen;
