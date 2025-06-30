// src/components/dating/PromptCard.tsx
import React from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

interface PromptData {
  question: string;
  answer: string;
}

interface PromptCardProps {
  prompt: PromptData;
  promptIndex: number;
  onPromptChange: (index: number, updatedPrompt: PromptData) => void;
  onSelectPrompt: (index: number) => void;
}

const PromptCard: React.FC<PromptCardProps> = ({
  prompt,
  promptIndex,
  onPromptChange,
  onSelectPrompt,
}) => {
  const handleAnswerChange = (text: string) => {
    onPromptChange(promptIndex, {
      ...prompt,
      answer: text,
    });
  };

  return (
    <View className="bg-gray-900 rounded-3xl p-6 mb-4 border border-gray-800">
      <View className="mb-4">
        {prompt?.question ? (
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-lg font-semibold text-white flex-1 pr-4">
              {prompt.question}
            </Text>
            <TouchableOpacity onPress={() => onSelectPrompt(promptIndex)}>
              <Text className="text-green-500 text-sm font-medium">Change</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            onPress={() => onSelectPrompt(promptIndex)}
            className="p-4 border-2 border-dashed border-gray-600 rounded-xl items-center"
          >
            <MaterialIcons name="add" size={24} color="#6b7280" />
            <Text className="text-gray-400 mt-2">Choose a prompt</Text>
          </TouchableOpacity>
        )}
      </View>

      {prompt?.question && (
        <>
          <TextInput
            value={prompt.answer || ""} // Safe fallback for undefined
            onChangeText={handleAnswerChange}
            placeholder="Your answer..."
            placeholderTextColor="#6b7280"
            className="p-4 border border-gray-600 rounded-xl text-white bg-gray-800"
            multiline
            numberOfLines={3}
            maxLength={150}
          />
          <View className="flex-row justify-end mt-2">
            <Text className="text-xs text-gray-400">
              {(prompt.answer || "").length}/150
            </Text>
          </View>
        </>
      )}
    </View>
  );
};

export default PromptCard;
