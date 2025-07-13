// Create src/components/dating/AdvancedFiltersModal.tsx

import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  SafeAreaView,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";

export interface DatingFilters {
  education?: string;
  lifestyle?: string;
  religion?: string;
  relationshipType?: string;
  drinking?: string;
  smoking?: string;
  hasChildren?: string;
  wantChildren?: string;
}

interface AdvancedFiltersModalProps {
  visible: boolean;
  onClose: () => void;
  currentFilters: DatingFilters;
  onFiltersChange: (filters: DatingFilters) => void;
  onShowPaywall: () => void;
}

const AdvancedFiltersModal: React.FC<AdvancedFiltersModalProps> = ({
  visible,
  onClose,
  currentFilters,
  onFiltersChange,
  onShowPaywall,
}) => {
  const { current: subscription } = useSelector(
    (state: RootState) => state.subscription
  );
  const [filters, setFilters] = useState<DatingFilters>(currentFilters);

  const hasAdvancedFilters = () => {
    return subscription?.tier === "PREMIUM" || subscription?.tier === "VIP";
  };

  const filterOptions = {
    lifestyle: [
      "Active",
      "Laid back",
      "Social butterfly",
      "Homebody",
      "Adventurous",
      "Career-focused",
    ],
    religion: [
      "Christian",
      "Muslim",
      "Jewish",
      "Hindu",
      "Buddhist",
      "Atheist",
      "Agnostic",
      "Spiritual",
      "Other",
    ],
    relationshipType: [
      "Long-term relationship",
      "Casual dating",
      "New friends",
      "Open to anything",
    ],
    drinking: ["Never", "Sometimes", "Frequently"],
    smoking: ["No", "Sometimes", "Yes"],
    hasChildren: ["No", "Yes"],
    wantChildren: ["Yes", "No", "Maybe"],
  };

  const handleFilterChange = (key: keyof DatingFilters, value: string) => {
    if (!hasAdvancedFilters()) {
      onShowPaywall();
      return;
    }

    const newValue = filters[key] === value ? undefined : value;
    const newFilters = { ...filters, [key]: newValue };
    setFilters(newFilters);
  };

  const handleApplyFilters = () => {
    onFiltersChange(filters);
    onClose();
  };

  const handleClearFilters = () => {
    const clearedFilters: DatingFilters = {};
    setFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  const getActiveFilterCount = () => {
    return Object.values(filters).filter(
      (value) => value !== undefined && value !== ""
    ).length;
  };

  const FilterSection: React.FC<{
    title: string;
    filterKey: keyof DatingFilters;
    options: string[];
  }> = ({ title, filterKey, options }) => (
    <View style={{ marginBottom: 24 }}>
      <Text
        style={{
          fontSize: 16,
          fontWeight: "600",
          color: "#111827",
          marginBottom: 12,
        }}
      >
        {title}
      </Text>

      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          gap: 8,
        }}
      >
        {options.map((option) => {
          const isSelected = filters[filterKey] === option;
          const isDisabled = !hasAdvancedFilters();

          return (
            <TouchableOpacity
              key={option}
              onPress={() => handleFilterChange(filterKey, option)}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 20,
                borderWidth: 1,
                borderColor: isSelected ? "#8B5CF6" : "#D1D5DB",
                backgroundColor: isSelected
                  ? "#8B5CF6"
                  : isDisabled
                  ? "#F9FAFB"
                  : "white",
                opacity: isDisabled ? 0.5 : 1,
              }}
              activeOpacity={0.7}
              disabled={isDisabled}
            >
              <Text
                style={{
                  color: isSelected ? "white" : "#374151",
                  fontSize: 14,
                  fontWeight: isSelected ? "600" : "400",
                }}
              >
                {option}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
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
            Advanced Filters
          </Text>
          <TouchableOpacity onPress={handleClearFilters}>
            <Text style={{ color: "#8B5CF6", fontSize: 16, fontWeight: "600" }}>
              Clear
            </Text>
          </TouchableOpacity>
        </View>

        {/* Premium Feature Notice */}
        {!hasAdvancedFilters() && (
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
              <MaterialIcons name="filter-list" size={20} color="#EC4899" />
              <Text
                style={{
                  marginLeft: 8,
                  fontSize: 16,
                  fontWeight: "bold",
                  color: "#BE185D",
                }}
              >
                Advanced Filters
              </Text>
            </View>
            <Text style={{ color: "#BE185D", fontSize: 14, lineHeight: 20 }}>
              Find exactly who you're looking for with detailed filters by
              lifestyle, religion, relationship goals, and more! Available with
              Premium and VIP.
            </Text>
          </View>
        )}

        {/* Filter Count */}
        {getActiveFilterCount() > 0 && (
          <View
            style={{
              backgroundColor: "#EDE9FE",
              marginHorizontal: 16,
              marginBottom: 16,
              padding: 12,
              borderRadius: 8,
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <MaterialIcons name="filter-list" size={20} color="#8B5CF6" />
            <Text
              style={{
                marginLeft: 8,
                color: "#6D28D9",
                fontWeight: "600",
              }}
            >
              {getActiveFilterCount()} filter
              {getActiveFilterCount() !== 1 ? "s" : ""} active
            </Text>
          </View>
        )}

        {/* Filter Options */}
        <ScrollView style={{ flex: 1, padding: 16 }}>
          <FilterSection
            title="Lifestyle"
            filterKey="lifestyle"
            options={filterOptions.lifestyle}
          />

          <FilterSection
            title="Religion"
            filterKey="religion"
            options={filterOptions.religion}
          />

          <FilterSection
            title="Looking For"
            filterKey="relationshipType"
            options={filterOptions.relationshipType}
          />

          <FilterSection
            title="Drinking"
            filterKey="drinking"
            options={filterOptions.drinking}
          />

          <FilterSection
            title="Smoking"
            filterKey="smoking"
            options={filterOptions.smoking}
          />

          <FilterSection
            title="Has Children"
            filterKey="hasChildren"
            options={filterOptions.hasChildren}
          />

          <FilterSection
            title="Wants Children"
            filterKey="wantChildren"
            options={filterOptions.wantChildren}
          />

          <View style={{ height: 100 }} />
        </ScrollView>

        {/* Apply Button */}
        <View
          style={{
            padding: 16,
            borderTopWidth: 1,
            borderTopColor: "#E5E7EB",
          }}
        >
          <TouchableOpacity
            onPress={handleApplyFilters}
            style={{
              backgroundColor: "#8B5CF6",
              borderRadius: 12,
              paddingVertical: 16,
              alignItems: "center",
            }}
            activeOpacity={0.8}
          >
            <Text
              style={{
                color: "white",
                fontSize: 16,
                fontWeight: "bold",
              }}
            >
              Apply Filters
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

export default AdvancedFiltersModal;
