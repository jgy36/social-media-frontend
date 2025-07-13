// Create src/components/dating/LocationSelector.tsx

import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  TextInput,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";

interface LocationSelectorProps {
  visible: boolean;
  onClose: () => void;
  currentLocation: string;
  onLocationChange: (location: string) => void;
  onShowPaywall: () => void;
}

const LocationSelector: React.FC<LocationSelectorProps> = ({
  visible,
  onClose,
  currentLocation,
  onLocationChange,
  onShowPaywall,
}) => {
  const { current: subscription } = useSelector(
    (state: RootState) => state.subscription
  );
  const [searchText, setSearchText] = useState("");

  const hasPassportMode = () => {
    return subscription?.tier === "PREMIUM" || subscription?.tier === "VIP";
  };

  const popularCities = [
    { name: "New York, NY", country: "USA" },
    { name: "Los Angeles, CA", country: "USA" },
    { name: "Chicago, IL", country: "USA" },
    { name: "Miami, FL", country: "USA" },
    { name: "San Francisco, CA", country: "USA" },
    { name: "Austin, TX", country: "USA" },
    { name: "Seattle, WA", country: "USA" },
    { name: "Denver, CO", country: "USA" },
    { name: "London", country: "UK" },
    { name: "Paris", country: "France" },
    { name: "Tokyo", country: "Japan" },
    { name: "Sydney", country: "Australia" },
    { name: "Toronto", country: "Canada" },
    { name: "Berlin", country: "Germany" },
    { name: "Amsterdam", country: "Netherlands" },
  ];

  const filteredCities = popularCities.filter(
    (city) =>
      city.name.toLowerCase().includes(searchText.toLowerCase()) ||
      city.country.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleLocationSelect = (location: string) => {
    if (!hasPassportMode() && location !== currentLocation) {
      onShowPaywall();
      return;
    }

    onLocationChange(location);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={{ flex: 1, backgroundColor: "white" }}>
        {/* Header */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            padding: 16,
            borderBottomWidth: 1,
            borderBottomColor: "#E5E7EB",
          }}
        >
          <TouchableOpacity onPress={onClose}>
            <MaterialIcons name="close" size={24} color="#374151" />
          </TouchableOpacity>
          <Text style={{ fontSize: 18, fontWeight: "bold", color: "#111827" }}>
            Choose Location
          </Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Premium Feature Notice */}
        {!hasPassportMode() && (
          <View
            style={{
              backgroundColor: "#FDF2F8",
              borderColor: "#F9A8D4",
              borderWidth: 1,
              margin: 16,
              padding: 16,
              borderRadius: 12,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 8,
              }}
            >
              <MaterialIcons name="lock" size={20} color="#EC4899" />
              <Text
                style={{
                  marginLeft: 8,
                  fontSize: 16,
                  fontWeight: "bold",
                  color: "#BE185D",
                }}
              >
                Passport Mode
              </Text>
            </View>
            <Text style={{ color: "#BE185D", fontSize: 14, lineHeight: 20 }}>
              Change your location and meet people anywhere in the world!
              Available with Premium and VIP subscriptions.
            </Text>
          </View>
        )}

        {/* Current Location */}
        <View style={{ padding: 16 }}>
          <Text
            style={{
              fontSize: 16,
              fontWeight: "600",
              color: "#374151",
              marginBottom: 12,
            }}
          >
            Current Location
          </Text>
          <TouchableOpacity
            onPress={() => handleLocationSelect(currentLocation)}
            style={{
              flexDirection: "row",
              alignItems: "center",
              padding: 12,
              backgroundColor: "#F3F4F6",
              borderRadius: 8,
              marginBottom: 16,
            }}
          >
            <MaterialIcons name="location-on" size={20} color="#10B981" />
            <Text
              style={{
                marginLeft: 8,
                fontSize: 16,
                color: "#111827",
                fontWeight: "500",
              }}
            >
              {currentLocation || "Your Location"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Search */}
        <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: "#F9FAFB",
              borderRadius: 8,
              paddingHorizontal: 12,
              paddingVertical: 8,
            }}
          >
            <MaterialIcons name="search" size={20} color="#6B7280" />
            <TextInput
              value={searchText}
              onChangeText={setSearchText}
              placeholder="Search cities..."
              style={{
                flex: 1,
                marginLeft: 8,
                fontSize: 16,
                color: "#111827",
              }}
              placeholderTextColor="#9CA3AF"
            />
          </View>
        </View>

        {/* Popular Cities */}
        <ScrollView style={{ flex: 1 }}>
          <View style={{ padding: 16 }}>
            <Text
              style={{
                fontSize: 16,
                fontWeight: "600",
                color: "#374151",
                marginBottom: 16,
              }}
            >
              Popular Destinations
            </Text>

            {filteredCities.map((city, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => handleLocationSelect(city.name)}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingVertical: 12,
                  paddingHorizontal: 4,
                  borderBottomWidth: index < filteredCities.length - 1 ? 1 : 0,
                  borderBottomColor: "#F3F4F6",
                  opacity:
                    !hasPassportMode() && city.name !== currentLocation
                      ? 0.5
                      : 1,
                }}
                activeOpacity={0.7}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    flex: 1,
                  }}
                >
                  <MaterialIcons
                    name="location-city"
                    size={20}
                    color="#6B7280"
                  />
                  <View style={{ marginLeft: 12, flex: 1 }}>
                    <Text
                      style={{
                        fontSize: 16,
                        color: "#111827",
                        fontWeight: "500",
                      }}
                    >
                      {city.name}
                    </Text>
                    <Text
                      style={{
                        fontSize: 14,
                        color: "#6B7280",
                      }}
                    >
                      {city.country}
                    </Text>
                  </View>
                </View>

                {!hasPassportMode() && city.name !== currentLocation && (
                  <MaterialIcons name="lock" size={16} color="#EC4899" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

export default LocationSelector;
