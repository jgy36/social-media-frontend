// src/screens/messages/SnapCameraTab.tsx - Camera with text overlay (simplified)
import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Image,
  Dimensions,
  Alert,
  PanResponder,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { CameraView, CameraType, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";

const { width, height } = Dimensions.get("window");

interface SnapCameraTabProps {
  onPhotoCapture: (photoUri: string) => void;
  onNavigateToContacts: () => void;
}

interface TextOverlay {
  id: string;
  text: string;
  x: number;
  y: number;
  color: string;
  fontSize: number;
}

const SnapCameraTab: React.FC<SnapCameraTabProps> = ({
  onPhotoCapture,
  onNavigateToContacts,
}) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>("back");
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [textOverlays, setTextOverlays] = useState<TextOverlay[]>([]);
  const [showTextInput, setShowTextInput] = useState(false);
  const [currentText, setCurrentText] = useState("");
  const [selectedColor, setSelectedColor] = useState("#FFFFFF");
  const [isLoading, setIsLoading] = useState(false);

  const cameraRef = useRef<CameraView>(null);

  const textColors = [
    "#FFFFFF",
    "#FF4757",
    "#FFFF00",
    "#2ED573",
    "#3742FA",
    "#FF6B9D",
    "#000000",
  ];

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        setIsLoading(true);
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
          base64: false,
        });

        if (photo) {
          setCapturedPhoto(photo.uri);
        }
      } catch (error) {
        console.error("Error taking picture:", error);
        Alert.alert("Error", "Failed to take picture");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const pickFromLibrary = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission needed", "Please grant photo access");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [9, 16],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setCapturedPhoto(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Error picking from library:", error);
    }
  };

  const addTextOverlay = () => {
    if (currentText.trim()) {
      const newOverlay: TextOverlay = {
        id: Date.now().toString(),
        text: currentText.trim(),
        x: width / 2 - 50, // Center horizontally
        y: height / 2 - 100, // Center vertically
        color: selectedColor,
        fontSize: 24,
      };

      setTextOverlays([...textOverlays, newOverlay]);
      setCurrentText("");
      setShowTextInput(false);
    }
  };

  const removeTextOverlay = (id: string) => {
    setTextOverlays(textOverlays.filter((overlay) => overlay.id !== id));
  };

  const handleSend = () => {
    if (capturedPhoto) {
      // Here you would combine the photo with text overlays
      // For now, we'll just pass the photo URI
      onPhotoCapture(capturedPhoto);
    }
  };

  const resetCamera = () => {
    setCapturedPhoto(null);
    setTextOverlays([]);
    setShowTextInput(false);
    setCurrentText("");
  };

  const toggleCameraFacing = () => {
    setFacing((current) => (current === "back" ? "front" : "back"));
  };

  // Simple draggable text component
  const DraggableText = ({ overlay }: { overlay: TextOverlay }) => {
    const panResponder = useRef(
      PanResponder.create({
        onMoveShouldSetPanResponder: () => true,
        onPanResponderMove: (evt, gestureState) => {
          // Update text position
          const updatedOverlays = textOverlays.map((item) =>
            item.id === overlay.id
              ? {
                  ...item,
                  x: overlay.x + gestureState.dx,
                  y: overlay.y + gestureState.dy,
                }
              : item
          );
          setTextOverlays(updatedOverlays);
        },
        onPanResponderRelease: () => {
          // Finalize position
        },
      })
    ).current;

    return (
      <View
        {...panResponder.panHandlers}
        style={{
          position: "absolute",
          left: overlay.x,
          top: overlay.y,
          zIndex: 10,
        }}
      >
        <TouchableOpacity
          onLongPress={() => removeTextOverlay(overlay.id)}
          delayLongPress={1000}
        >
          <Text
            style={{
              color: overlay.color,
              fontSize: overlay.fontSize,
              fontWeight: "bold",
              textShadowColor: "rgba(0, 0, 0, 0.75)",
              textShadowOffset: { width: 1, height: 1 },
              textShadowRadius: 2,
              padding: 8,
            }}
          >
            {overlay.text}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  if (!permission) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#000000",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text style={{ color: "white" }}>Requesting camera permission...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#000000",
          justifyContent: "center",
          alignItems: "center",
          paddingHorizontal: 32,
        }}
      >
        <MaterialIcons name="camera-alt" size={80} color="#6B7280" />
        <Text
          style={{
            color: "white",
            fontSize: 20,
            fontWeight: "600",
            marginTop: 24,
            marginBottom: 16,
            textAlign: "center",
          }}
        >
          Camera Access Needed
        </Text>
        <Text
          style={{
            color: "#8E8E93",
            textAlign: "center",
            marginBottom: 32,
            lineHeight: 20,
          }}
        >
          Please grant camera access to take photos for your snaps.
        </Text>
        <View style={{ flexDirection: "row", gap: 16 }}>
          <TouchableOpacity
            onPress={requestPermission}
            style={{
              backgroundColor: "#FF6B9D",
              borderRadius: 25,
              paddingHorizontal: 24,
              paddingVertical: 12,
            }}
          >
            <Text style={{ color: "white", fontWeight: "600" }}>
              Grant Permission
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={pickFromLibrary}
            style={{
              backgroundColor: "#2F3542",
              borderRadius: 25,
              paddingHorizontal: 24,
              paddingVertical: 12,
            }}
          >
            <Text style={{ color: "white", fontWeight: "600" }}>
              Choose Photo
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (capturedPhoto) {
    // Photo preview with text editing
    return (
      <View style={{ flex: 1, backgroundColor: "#000000" }}>
        {/* Photo Preview */}
        <View style={{ flex: 1, position: "relative" }}>
          <Image
            source={{ uri: capturedPhoto }}
            style={{ width: width, height: height, resizeMode: "cover" }}
          />

          {/* Text Overlays */}
          {textOverlays.map((overlay) => (
            <DraggableText key={overlay.id} overlay={overlay} />
          ))}

          {/* Text Input Modal */}
          {showTextInput && (
            <View
              style={{
                position: "absolute",
                top: 100,
                left: 20,
                right: 20,
                backgroundColor: "rgba(0,0,0,0.8)",
                borderRadius: 12,
                padding: 16,
                zIndex: 20,
              }}
            >
              <TextInput
                value={currentText}
                onChangeText={setCurrentText}
                placeholder="Add text..."
                placeholderTextColor="#8E8E93"
                style={{
                  color: "white",
                  fontSize: 18,
                  marginBottom: 12,
                  borderBottomWidth: 1,
                  borderBottomColor: "#333",
                  paddingBottom: 8,
                }}
                autoFocus
                multiline
              />

              {/* Color Picker */}
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  marginBottom: 12,
                }}
              >
                {textColors.map((color) => (
                  <TouchableOpacity
                    key={color}
                    onPress={() => setSelectedColor(color)}
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 16,
                      backgroundColor: color,
                      borderWidth: selectedColor === color ? 3 : 1,
                      borderColor: selectedColor === color ? "#FFFFFF" : "#666",
                    }}
                  />
                ))}
              </View>

              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <TouchableOpacity
                  onPress={() => setShowTextInput(false)}
                  style={{
                    backgroundColor: "#666",
                    borderRadius: 8,
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                  }}
                >
                  <Text style={{ color: "white" }}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={addTextOverlay}
                  style={{
                    backgroundColor: "#FF6B9D",
                    borderRadius: 8,
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                  }}
                >
                  <Text style={{ color: "white", fontWeight: "600" }}>
                    Add Text
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* Editing Tools - Right Side */}
        <View
          style={{
            position: "absolute",
            right: 16,
            top: 100,
            bottom: 150,
            justifyContent: "space-around",
            alignItems: "center",
          }}
        >
          {/* Add Text */}
          <TouchableOpacity
            onPress={() => setShowTextInput(true)}
            style={{
              width: 48,
              height: 48,
              borderRadius: 24,
              backgroundColor: "rgba(0,0,0,0.6)",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <MaterialIcons name="text-fields" size={24} color="white" />
          </TouchableOpacity>

          {/* Drawing Tool */}
          <TouchableOpacity
            style={{
              width: 48,
              height: 48,
              borderRadius: 24,
              backgroundColor: "rgba(0,0,0,0.6)",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <MaterialIcons name="edit" size={24} color="white" />
          </TouchableOpacity>

          {/* Stickers */}
          <TouchableOpacity
            style={{
              width: 48,
              height: 48,
              borderRadius: 24,
              backgroundColor: "rgba(0,0,0,0.6)",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <MaterialIcons name="emoji-emotions" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* Bottom Controls */}
        <View
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            paddingHorizontal: 20,
            paddingBottom: 40,
            paddingTop: 20,
            backgroundColor: "rgba(0,0,0,0.8)",
          }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            {/* Cancel */}
            <TouchableOpacity
              onPress={resetCamera}
              style={{
                width: 50,
                height: 50,
                borderRadius: 25,
                backgroundColor: "rgba(255,255,255,0.2)",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <MaterialIcons name="close" size={24} color="white" />
            </TouchableOpacity>

            {/* Send Button */}
            <TouchableOpacity
              onPress={handleSend}
              style={{
                backgroundColor: "#FF6B9D",
                borderRadius: 30,
                paddingHorizontal: 32,
                paddingVertical: 16,
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <MaterialIcons name="send" size={20} color="white" />
              <Text
                style={{
                  color: "white",
                  fontWeight: "600",
                  marginLeft: 8,
                  fontSize: 16,
                }}
              >
                Send To
              </Text>
            </TouchableOpacity>

            {/* Save */}
            <TouchableOpacity
              style={{
                width: 50,
                height: 50,
                borderRadius: 25,
                backgroundColor: "rgba(255,255,255,0.2)",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <MaterialIcons name="save-alt" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  // Camera View
  return (
    <View style={{ flex: 1, backgroundColor: "#000000" }}>
      <CameraView
        ref={cameraRef}
        style={{ flex: 1 }}
        facing={facing}
        ratio="16:9"
      >
        {/* Camera Controls */}
        <View
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            paddingHorizontal: 20,
            paddingBottom: 40,
            paddingTop: 20,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            {/* Photo Library */}
            <TouchableOpacity
              onPress={pickFromLibrary}
              style={{
                width: 50,
                height: 50,
                borderRadius: 25,
                backgroundColor: "rgba(0,0,0,0.6)",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <MaterialIcons name="photo-library" size={24} color="white" />
            </TouchableOpacity>

            {/* Capture Button */}
            <TouchableOpacity
              onPress={takePicture}
              disabled={isLoading}
              style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                backgroundColor: "white",
                justifyContent: "center",
                alignItems: "center",
                borderWidth: 4,
                borderColor: "rgba(255,255,255,0.3)",
              }}
            >
              {isLoading ? (
                <View
                  style={{
                    width: 60,
                    height: 60,
                    borderRadius: 30,
                    backgroundColor: "#ccc",
                  }}
                />
              ) : (
                <View
                  style={{
                    width: 60,
                    height: 60,
                    borderRadius: 30,
                    backgroundColor: "white",
                  }}
                />
              )}
            </TouchableOpacity>

            {/* Flip Camera */}
            <TouchableOpacity
              onPress={toggleCameraFacing}
              style={{
                width: 50,
                height: 50,
                borderRadius: 25,
                backgroundColor: "rgba(0,0,0,0.6)",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <MaterialIcons name="flip-camera-ios" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </CameraView>
    </View>
  );
};

export default SnapCameraTab;
