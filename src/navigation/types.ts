// src/navigation/types.ts
export type RootStackParamList = {
  // Auth screens
  Landing: undefined;
  Login: undefined;
  Register: undefined;
  VerifyEmail: undefined;
  Verify: { token: string };

  // Main tab screens
  MainTabs: undefined;
  Feed: undefined;
  Explore: undefined;
  Messages: undefined;
  Dating: undefined;
  Profile: undefined;

  // Profile screens
  UserProfile: { username: string };
  Settings: undefined;
  FollowRequests: undefined;

  // Community screens
  Communities: undefined;
  CommunityDetail: { id: string };
  CreateCommunity: undefined;

  // Post screens
  PostDetail: { postId: number };
  SavedPosts: undefined;

  // Dating screens
  DatingProfile: undefined;
  DatingSetup: undefined;
  SwipeScreen: undefined;
  MatchDetail: { matchId: number };

  // Photo Message screens
  PhotoCamera: { recipientId?: number };
  PhotoViewer: { photoMessageId: number };
  PhotoConversation: { userId: number };

  // Hashtag screens
  Hashtag: { tag: string };

  // Message screens
  ConversationDetail: { id: number };
  NewMessage: undefined;
  DirectMessage: { userId: string };

  // Other screens
  Debug: undefined;
  OAuthConnectSuccess: { provider?: string };
};

// Updated TabParamList for the new 5-tab structure
export type TabParamList = {
  Feed: undefined; // Posts/Feed tab
  Explore: undefined; // Explore tab (discovery)
  Messages: undefined; // Snap/Message tab (photo messaging)
  Dating: undefined; // Swiping/Dating tab
  Profile: undefined; // Profile tab (social media and dating profile)
};

// Navigation prop types for type safety
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";

export type RootStackNavigationProp =
  NativeStackNavigationProp<RootStackParamList>;
export type TabNavigationProp = BottomTabNavigationProp<TabParamList>;

// Specific screen navigation types
export type MessagesScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "Messages"
>;
export type DatingScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "Dating"
>;
export type PhotoConversationNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "PhotoConversation"
>;

// Route prop types
import type { RouteProp } from "@react-navigation/native";

export type PhotoConversationRouteProp = RouteProp<
  RootStackParamList,
  "PhotoConversation"
>;
export type PhotoViewerRouteProp = RouteProp<RootStackParamList, "PhotoViewer">;
export type PhotoCameraRouteProp = RouteProp<RootStackParamList, "PhotoCamera">;
export type MatchDetailRouteProp = RouteProp<RootStackParamList, "MatchDetail">;
