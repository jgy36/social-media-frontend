// src/components/profile/ProfileSettings.tsx
import React from "react";
import { View } from "react-native";
import ProfileSettingsForm from "./ProfileSettingsForm";

interface ProfileSettingsProps {
  onSuccess?: () => void;
}

const ProfileSettings: React.FC<ProfileSettingsProps> = ({ onSuccess }) => {
  return (
    <View>
      <ProfileSettingsForm onSuccess={onSuccess} />
    </View>
  );
};

export default ProfileSettings;
