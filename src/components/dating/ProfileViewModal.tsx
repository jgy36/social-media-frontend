// src/components/dating/ProfileViewModal.tsx - Updated with MatchCelebrationModal
import React, { useState } from "react"; // ADD useState
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Modal,
  ScrollView,
  SafeAreaView,
  Dimensions,
  Alert,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { swipeUser, likeUserBack } from "@/api/dating";
import MatchCelebrationModal from "./MatchCelebrationModal"; // ADD THIS IMPORT

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

interface ProfileViewModalProps {
  visible: boolean;
  profile: any;
  onClose: () => void;
  onAction?: (
    action: "like" | "pass",
    matched?: boolean,
    matchData?: any
  ) => void;
}

const ProfileViewModal: React.FC<ProfileViewModalProps> = ({
  visible,
  profile,
  onClose,
  onAction,
}) => {
  // ADD THESE STATE VARIABLES
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [matchData, setMatchData] = useState<any>(null);

  const user = useSelector((state: RootState) => state.user); // ADD THIS

  if (!profile) return null;

  // ... keep your existing parseJsonField function ...

  const handleAction = async (action: "like" | "pass") => {
    try {
      console.log(`🎯 ${action.toUpperCase()} on ${profile.user?.username}`);

      let response;

      if (action === "like") {
        // Use the likeBack endpoint for users from the likes tab
        response = await likeUserBack(profile.user?.id);
      } else {
        // Use regular swipe for pass
        response = await swipeUser(profile.user?.id, "PASS");
      }

      if (action === "like" && response.matched) {
        console.log("🎉 IT'S A MATCH!", response.match);

        // UPDATED: Show MatchCelebrationModal instead of Alert
        setMatchData(response.match);
        setShowMatchModal(true);

        // Call the onAction with match data
        onAction?.(action, true, response.match);
      } else {
        const message = action === "like" ? "Like sent! 💖" : "Profile passed";
        Alert.alert("Done!", message, [{ text: "OK", onPress: onClose }]);
        onAction?.(action, false);
      }
    } catch (error) {
      console.error("❌ Failed to perform action:", error);
      Alert.alert("Error", "Failed to perform action. Please try again.");
    }
  };

  // ... keep all your existing render functions (parseJsonField, renderProfileContent) ...

  return (
    <>
      <Modal
        visible={visible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={onClose}
      >
        {/* ... keep all your existing modal content ... */}
      </Modal>

      {/* ADD THE MATCH CELEBRATION MODAL */}
      <MatchCelebrationModal
        visible={showMatchModal}
        match={matchData}
        currentUserId={user.id || 0}
        onClose={() => {
          setShowMatchModal(false);
          setMatchData(null);
          onClose(); // Close the profile modal too
        }}
      />
    </>
  );
};

export default ProfileViewModal;
