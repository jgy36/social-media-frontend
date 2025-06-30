// src/components/CustomSlider.tsx
import React, { useState } from "react";
import { View, Text, PanResponder } from "react-native";

interface CustomSliderProps {
  min: number;
  max: number;
  step?: number;
  value: number;
  onValueChange: (value: number) => void;
  width?: number;
  height?: number;
  trackColor?: string;
  activeTrackColor?: string;
  thumbColor?: string;
}

const CustomSlider: React.FC<CustomSliderProps> = ({
  min,
  max,
  step = 1,
  value,
  onValueChange,
  width = 280,
  height = 40,
  trackColor = "#4b5563",
  activeTrackColor = "#ec4899",
  thumbColor = "#ec4899",
}) => {
  const sliderWidth = width - 20; // Account for thumb

  // Calculate thumb position from value
  const getThumbPosition = () => {
    const percentage = (value - min) / (max - min);
    return percentage * sliderWidth;
  };

  // Calculate value from touch position
  const getValueFromPosition = (x: number) => {
    const percentage = Math.max(0, Math.min(1, x / sliderWidth));
    const rawValue = min + percentage * (max - min);
    const steppedValue = Math.round(rawValue / step) * step;
    return Math.max(min, Math.min(max, steppedValue));
  };

  const handleTouch = (x: number) => {
    const newValue = getValueFromPosition(x - 10); // -10 for padding
    onValueChange(newValue);
  };

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,

    onPanResponderGrant: (event) => {
      handleTouch(event.nativeEvent.locationX);
    },

    onPanResponderMove: (event) => {
      handleTouch(event.nativeEvent.locationX);
    },
  });

  const thumbPosition = getThumbPosition();
  const activeWidth = thumbPosition + 10;

  return (
    <View style={{ width, height, justifyContent: "center" }}>
      <View
        style={{ height: 40, justifyContent: "center", paddingHorizontal: 10 }}
        {...panResponder.panHandlers}
      >
        {/* Track Background */}
        <View
          style={{
            height: 4,
            backgroundColor: trackColor,
            borderRadius: 2,
          }}
        />

        {/* Active Track */}
        <View
          style={{
            position: "absolute",
            height: 4,
            backgroundColor: activeTrackColor,
            borderRadius: 2,
            left: 10,
            width: activeWidth,
          }}
        />

        {/* Thumb */}
        <View
          style={{
            position: "absolute",
            width: 20,
            height: 20,
            borderRadius: 10,
            backgroundColor: thumbColor,
            left: 10,
            top: 10,
            transform: [{ translateX: thumbPosition }],
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.2,
            shadowRadius: 2,
            elevation: 3,
          }}
        />
      </View>
    </View>
  );
};

export default CustomSlider;
