// src/screens/messages/SnapCameraTab.tsx - Enhanced with drawing, better text, save, and memories
import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Image,
  Dimensions,
  Alert,
  PanResponder,
  Modal,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { CameraView, CameraType, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import * as MediaLibrary from "expo-media-library";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Svg, { Path } from "react-native-svg";

const { width, height } = Dimensions.get("window");

interface PreSelectedRecipient {
  userId: number;
  name: string;
}

interface SnapCameraTabProps {
  onPhotoCapture: (photoUri: string) => void;
  onNavigateToContacts: () => void;
  onNavigateToMemories: () => void;
  preSelectedRecipient?: PreSelectedRecipient | null;
  onDeselectRecipient?: () => void;
  capturedPhoto?: string | null;
  onResetPhoto?: () => void;
}

interface TextOverlay {
  id: string;
  text: string;
  x: number;
  y: number;
  color: string;
  fontSize: number;
}

interface DrawingPath {
  id: string;
  path: string;
  color: string;
  strokeWidth: number;
}

interface EmojiOverlay {
  id: string;
  emoji: string;
  x: number;
  y: number;
  size: number;
}

const SnapCameraTab: React.FC<SnapCameraTabProps> = ({
  onPhotoCapture,
  onNavigateToContacts,
  onNavigateToMemories,
  preSelectedRecipient,
  onDeselectRecipient,
  capturedPhoto: externalCapturedPhoto,
  onResetPhoto,
}) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>("back");
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [textOverlays, setTextOverlays] = useState<TextOverlay[]>([]);
  const [drawingPaths, setDrawingPaths] = useState<DrawingPath[]>([]);
  const [emojiOverlays, setEmojiOverlays] = useState<EmojiOverlay[]>([]);
  const [showTextInput, setShowTextInput] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [currentText, setCurrentText] = useState("");
  const [selectedColor, setSelectedColor] = useState("#FFFFFF");
  const [isLoading, setIsLoading] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawingMode, setDrawingMode] = useState(false);
  const [currentPath, setCurrentPath] = useState("");

  const cameraRef = useRef<CameraView>(null);

  useEffect(() => {
    if (externalCapturedPhoto) {
      setCapturedPhoto(externalCapturedPhoto);
    }
  }, [externalCapturedPhoto]);

  const textColors = [
    "#FFFFFF",
    "#FF4757",
    "#FFFF00",
    "#2ED573",
    "#3742FA",
    "#10B981",
    "#000000",
    "#FFA502",
  ];

  const emojis = [
    "😍",
    "🔥",
    "💯",
    "❤️",
    "😂",
    "😎",
    "🥰",
    "😘",
    "👑",
    "💎",
    "🌟",
    "⚡",
    "🎉",
    "🦋",
    "🌈",
    "✨",
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

  const saveToMemories = async () => {
    if (!capturedPhoto) return;

    try {
      // Request media library permissions
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission needed",
          "Please grant media library access to save memories"
        );
        return;
      }

      // Create memory object
      const memory = {
        id: Date.now().toString(),
        uri: capturedPhoto,
        timestamp: Date.now(),
        textOverlays,
        drawingPaths,
        emojiOverlays,
      };

      // Get existing memories
      const existingMemories = await AsyncStorage.getItem("savedMemories");
      const memories = existingMemories ? JSON.parse(existingMemories) : [];

      // Add new memory
      memories.push(memory);

      // Save back to AsyncStorage
      await AsyncStorage.setItem("savedMemories", JSON.stringify(memories));

      // Also save to device gallery
      await MediaLibrary.saveToLibraryAsync(capturedPhoto);

      Alert.alert(
        "Saved!",
        "Your memory has been saved to your collection and device gallery"
      );
    } catch (error) {
      console.error("Failed to save memory:", error);
      Alert.alert("Error", "Failed to save memory");
    }
  };

  const addTextOverlay = () => {
    if (currentText.trim()) {
      const newOverlay: TextOverlay = {
        id: Date.now().toString(),
        text: currentText.trim(),
        x: width / 2 - 50,
        y: height / 2 - 100,
        color: selectedColor,
        fontSize: 28,
      };

      setTextOverlays([...textOverlays, newOverlay]);
      setCurrentText("");
      setShowTextInput(false);
    }
  };

  const addEmojiOverlay = (emoji: string) => {
    const newEmoji: EmojiOverlay = {
      id: Date.now().toString(),
      emoji,
      x: width / 2 - 25,
      y: height / 2 - 25,
      size: 50,
    };

    setEmojiOverlays([...emojiOverlays, newEmoji]);
    setShowEmojiPicker(false);
  };

  const removeTextOverlay = (id: string) => {
    setTextOverlays(textOverlays.filter((overlay) => overlay.id !== id));
  };

  const removeEmojiOverlay = (id: string) => {
    setEmojiOverlays(emojiOverlays.filter((overlay) => overlay.id !== id));
  };

  const handleSend = () => {
    if (capturedPhoto) {
      onPhotoCapture(capturedPhoto);
    }
  };

  const resetCamera = () => {
    setCapturedPhoto(null);
    setTextOverlays([]);
    setDrawingPaths([]);
    setEmojiOverlays([]);
    setShowTextInput(false);
    setDrawingMode(false);
    setCurrentText("");
    if (onResetPhoto) {
      onResetPhoto();
    }
  };

  const toggleCameraFacing = () => {
    setFacing((current) => (current === "back" ? "front" : "back"));
  };

  const handleDeselectRecipient = () => {
    if (onDeselectRecipient) {
      onDeselectRecipient();
    }
  };

  // Enhanced Draggable Text Component
  const DraggableText = ({ overlay }: { overlay: TextOverlay }) => {
    const [position, setPosition] = useState({ x: overlay.x, y: overlay.y });

    const panResponder = useRef(
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: () => {
          // Add visual feedback
        },
        onPanResponderMove: (evt, gestureState) => {
          setPosition({
            x: overlay.x + gestureState.dx,
            y: overlay.y + gestureState.dy,
          });
        },
        onPanResponderRelease: (evt, gestureState) => {
          const newX = overlay.x + gestureState.dx;
          const newY = overlay.y + gestureState.dy;

          // Update the overlay position
          const updatedOverlays = textOverlays.map((item) =>
            item.id === overlay.id ? { ...item, x: newX, y: newY } : item
          );
          setTextOverlays(updatedOverlays);
          setPosition({ x: newX, y: newY });
        },
      })
    ).current;

    return (
      <View
        {...panResponder.panHandlers}
        style={{
          position: "absolute",
          left: position.x,
          top: position.y,
          zIndex: 10,
          backgroundColor: "rgba(0,0,0,0.1)",
          borderRadius: 8,
          padding: 4,
        }}
      >
        <TouchableOpacity
          onLongPress={() => removeTextOverlay(overlay.id)}
          delayLongPress={800}
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

  // Draggable Emoji Component
  const DraggableEmoji = ({ overlay }: { overlay: EmojiOverlay }) => {
    const [position, setPosition] = useState({ x: overlay.x, y: overlay.y });

    const panResponder = useRef(
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderMove: (evt, gestureState) => {
          setPosition({
            x: overlay.x + gestureState.dx,
            y: overlay.y + gestureState.dy,
          });
        },
        onPanResponderRelease: (evt, gestureState) => {
          const newX = overlay.x + gestureState.dx;
          const newY = overlay.y + gestureState.dy;

          const updatedOverlays = emojiOverlays.map((item) =>
            item.id === overlay.id ? { ...item, x: newX, y: newY } : item
          );
          setEmojiOverlays(updatedOverlays);
          setPosition({ x: newX, y: newY });
        },
      })
    ).current;

    return (
      <View
        {...panResponder.panHandlers}
        style={{
          position: "absolute",
          left: position.x,
          top: position.y,
          zIndex: 10,
        }}
      >
        <TouchableOpacity
          onLongPress={() => removeEmojiOverlay(overlay.id)}
          delayLongPress={800}
        >
          <Text
            style={{
              fontSize: overlay.size,
            }}
          >
            {overlay.emoji}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  // Drawing functionality
  const drawingPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => drawingMode,
      onMoveShouldSetPanResponder: () => drawingMode,
      onPanResponderGrant: (evt) => {
        if (!drawingMode) return;
        const { locationX, locationY } = evt.nativeEvent;
        setCurrentPath(`M${locationX},${locationY}`);
        setIsDrawing(true);
      },
      onPanResponderMove: (evt) => {
        if (!drawingMode || !isDrawing) return;
        const { locationX, locationY } = evt.nativeEvent;
        setCurrentPath((prev) => `${prev}L${locationX},${locationY}`);
      },
      onPanResponderRelease: () => {
        if (!drawingMode || !isDrawing) return;

        const newPath: DrawingPath = {
          id: Date.now().toString(),
          path: currentPath,
          color: selectedColor,
          strokeWidth: 4,
        };

        setDrawingPaths([...drawingPaths, newPath]);
        setCurrentPath("");
        setIsDrawing(false);
      },
    })
  ).current;

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
              backgroundColor: "#10B981",
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
    return (
      <View style={{ flex: 1, backgroundColor: "#000000" }}>
        <View
          style={{ flex: 1, position: "relative" }}
          {...drawingPanResponder.panHandlers}
        >
          <Image
            source={{ uri: capturedPhoto }}
            style={{
              width: width,
              height: height,
              resizeMode: "contain",
              backgroundColor: "#000000",
            }}
          />

          {/* Drawing Layer */}
          <Svg
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: width,
              height: height,
            }}
            width={width}
            height={height}
          >
            {drawingPaths.map((pathData) => (
              <Path
                key={pathData.id}
                d={pathData.path}
                stroke={pathData.color}
                strokeWidth={pathData.strokeWidth}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ))}
            {isDrawing && currentPath && (
              <Path
                d={currentPath}
                stroke={selectedColor}
                strokeWidth={4}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}
          </Svg>

          {/* Text Overlays */}
          {textOverlays.map((overlay) => (
            <DraggableText key={overlay.id} overlay={overlay} />
          ))}

          {/* Emoji Overlays */}
          {emojiOverlays.map((overlay) => (
            <DraggableEmoji key={overlay.id} overlay={overlay} />
          ))}

          {/* Enhanced Text Input Modal */}
          <Modal visible={showTextInput} transparent animationType="slide">
            <View
              style={{
                flex: 1,
                backgroundColor: "rgba(0,0,0,0.8)",
                justifyContent: "center",
                paddingHorizontal: 20,
              }}
            >
              <View
                style={{
                  backgroundColor: "#1A1A1A",
                  borderRadius: 16,
                  padding: 20,
                }}
              >
                <Text
                  style={{
                    color: "white",
                    fontSize: 18,
                    fontWeight: "600",
                    marginBottom: 16,
                    textAlign: "center",
                  }}
                >
                  Add Text
                </Text>

                <TextInput
                  value={currentText}
                  onChangeText={setCurrentText}
                  placeholder="Type your message..."
                  placeholderTextColor="#8E8E93"
                  style={{
                    color: "white",
                    fontSize: 18,
                    marginBottom: 20,
                    borderBottomWidth: 2,
                    borderBottomColor: "#10B981",
                    paddingBottom: 10,
                    textAlign: "center",
                  }}
                  autoFocus
                  multiline
                />

                <Text
                  style={{
                    color: "white",
                    fontSize: 14,
                    marginBottom: 12,
                    textAlign: "center",
                  }}
                >
                  Choose Color
                </Text>

                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    marginBottom: 20,
                  }}
                >
                  {textColors.map((color) => (
                    <TouchableOpacity
                      key={color}
                      onPress={() => setSelectedColor(color)}
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 18,
                        backgroundColor: color,
                        borderWidth: selectedColor === color ? 3 : 2,
                        borderColor:
                          selectedColor === color ? "#10B981" : "#666",
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
                      borderRadius: 12,
                      paddingHorizontal: 24,
                      paddingVertical: 12,
                      flex: 1,
                      marginRight: 8,
                    }}
                  >
                    <Text
                      style={{
                        color: "white",
                        textAlign: "center",
                        fontWeight: "600",
                      }}
                    >
                      Cancel
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={addTextOverlay}
                    style={{
                      backgroundColor: "#10B981",
                      borderRadius: 12,
                      paddingHorizontal: 24,
                      paddingVertical: 12,
                      flex: 1,
                      marginLeft: 8,
                    }}
                  >
                    <Text
                      style={{
                        color: "white",
                        fontWeight: "600",
                        textAlign: "center",
                      }}
                    >
                      Add Text
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>

          {/* Emoji Picker Modal */}
          <Modal visible={showEmojiPicker} transparent animationType="slide">
            <View
              style={{
                flex: 1,
                backgroundColor: "rgba(0,0,0,0.8)",
                justifyContent: "flex-end",
              }}
            >
              <View
                style={{
                  backgroundColor: "#1A1A1A",
                  borderTopLeftRadius: 20,
                  borderTopRightRadius: 20,
                  paddingTop: 20,
                  paddingBottom: 40,
                }}
              >
                <Text
                  style={{
                    color: "white",
                    fontSize: 18,
                    fontWeight: "600",
                    marginBottom: 20,
                    textAlign: "center",
                  }}
                >
                  Add Emoji
                </Text>

                <View
                  style={{
                    flexDirection: "row",
                    flexWrap: "wrap",
                    justifyContent: "center",
                    paddingHorizontal: 20,
                  }}
                >
                  {emojis.map((emoji, index) => (
                    <TouchableOpacity
                      key={index}
                      onPress={() => addEmojiOverlay(emoji)}
                      style={{ padding: 15, margin: 5 }}
                    >
                      <Text style={{ fontSize: 30 }}>{emoji}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <TouchableOpacity
                  onPress={() => setShowEmojiPicker(false)}
                  style={{
                    backgroundColor: "#666",
                    borderRadius: 12,
                    paddingVertical: 12,
                    marginHorizontal: 20,
                    marginTop: 20,
                  }}
                >
                  <Text
                    style={{
                      color: "white",
                      textAlign: "center",
                      fontWeight: "600",
                    }}
                  >
                    Cancel
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        </View>

        {/* Enhanced Side Tools */}
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
          <TouchableOpacity
            onPress={() => setShowTextInput(true)}
            style={{
              width: 48,
              height: 48,
              borderRadius: 24,
              backgroundColor: "rgba(0,0,0,0.7)",
              justifyContent: "center",
              alignItems: "center",
              borderWidth: 2,
              borderColor: "rgba(255,255,255,0.3)",
            }}
          >
            <MaterialIcons name="text-fields" size={24} color="white" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setDrawingMode(!drawingMode)}
            style={{
              width: 48,
              height: 48,
              borderRadius: 24,
              backgroundColor: drawingMode ? "#10B981" : "rgba(0,0,0,0.7)",
              justifyContent: "center",
              alignItems: "center",
              borderWidth: 2,
              borderColor: drawingMode ? "#10B981" : "rgba(255,255,255,0.3)",
            }}
          >
            <MaterialIcons name="edit" size={24} color="white" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setShowEmojiPicker(true)}
            style={{
              width: 48,
              height: 48,
              borderRadius: 24,
              backgroundColor: "rgba(0,0,0,0.7)",
              justifyContent: "center",
              alignItems: "center",
              borderWidth: 2,
              borderColor: "rgba(255,255,255,0.3)",
            }}
          >
            <MaterialIcons name="emoji-emotions" size={24} color="white" />
          </TouchableOpacity>

          {drawingMode && (
            <TouchableOpacity
              onPress={() => setDrawingPaths([])}
              style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                backgroundColor: "rgba(255,0,0,0.7)",
                justifyContent: "center",
                alignItems: "center",
                borderWidth: 2,
                borderColor: "rgba(255,255,255,0.3)",
              }}
            >
              <MaterialIcons name="clear" size={24} color="white" />
            </TouchableOpacity>
          )}
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

            <TouchableOpacity
              onPress={handleSend}
              style={{
                backgroundColor: "#10B981",
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
                {preSelectedRecipient
                  ? `Send to ${preSelectedRecipient.name}`
                  : "Send To"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={saveToMemories}
              style={{
                width: 50,
                height: 50,
                borderRadius: 25,
                backgroundColor: "rgba(16,185,129,0.3)",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <MaterialIcons name="save-alt" size={24} color="#10B981" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#000000" }}>
      <CameraView
        ref={cameraRef}
        style={{ flex: 1 }}
        facing={facing}
        ratio="16:9"
      >
        {preSelectedRecipient && (
          <View
            style={{
              position: "absolute",
              top: 40,
              left: 20,
              right: 20,
              backgroundColor: "rgba(0, 0, 0, 0.8)",
              borderRadius: 20,
              paddingHorizontal: 16,
              paddingVertical: 8,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              zIndex: 10,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <MaterialIcons name="person" size={16} color="white" />
              <Text
                style={{
                  color: "white",
                  fontWeight: "600",
                  marginLeft: 4,
                  fontSize: 14,
                }}
              >
                Snap for {preSelectedRecipient.name}
              </Text>
            </View>

            <TouchableOpacity
              onPress={handleDeselectRecipient}
              style={{
                width: 24,
                height: 24,
                borderRadius: 12,
                backgroundColor: "rgba(255, 255, 255, 0.2)",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <MaterialIcons name="close" size={16} color="white" />
            </TouchableOpacity>
          </View>
        )}

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

          {/* Memories Button */}
          <View style={{ position: "absolute", top: -60, right: 20 }}>
            <TouchableOpacity
              onPress={onNavigateToMemories}
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: "rgba(16,185,129,0.8)",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <MaterialIcons name="photo-library" size={20} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </CameraView>
    </View>
  );
};

export default SnapCameraTab;
