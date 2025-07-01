// App.tsx - Full navigation with bottom tabs
import "./global.css";
import { injectStore } from "./src/api/apiClient";
import React, { useEffect, useState } from "react";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { StatusBar } from "expo-status-bar";
import { MaterialIcons } from "@expo/vector-icons";
import { LogBox, View, Text, ActivityIndicator, Button } from "react-native";
import { store, persistor } from "./src/redux/store";
import { getToken } from "./src/utils/tokenUtils";

// Hide known warnings
LogBox.ignoreLogs([
  "Require cycle:",
  "[expo-av]",
  "ImmutableStateInvariantMiddleware",
]);

// Initialize apiClient with store
injectStore(store);

import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "./src/redux/store";
import { initializeBadges } from "./src/redux/slices/badgeSlice";
import { restoreAuthState } from "./src/redux/slices/userSlice";

// Import screens
import LoginScreen from "./src/screens/LoginScreen";
import RegisterScreen from "./src/screens/RegisterScreen";
import LandingScreen from "./src/screens/LandingScreen";
import VerifyEmailScreen from "./src/screens/VerifyEmailScreen";
import VerifyScreen from "./src/screens/VerifyScreen";
import FeedScreen from "./src/screens/FeedScreen";
import SearchScreen from "./src/screens/SearchScreen";
import MapScreen from "./src/screens/MapScreen";
import MessageScreen from "./src/screens/MessageScreen";
import ProfileScreen from "./src/screens/ProfileScreen";
import UserProfileScreen from "./src/screens/UserProfileScreen";
import SettingsScreen from "./src/screens/SettingsScreen";
import FollowRequestsScreen from "./src/screens/FollowRequestsScreen";
import CommunitiesListScreen from "./src/screens/community/CommunitiesListScreen";
import CommunityDetailScreen from "./src/screens/community/CommunityDetailScreen";
import CreateCommunityScreen from "./src/screens/community/CreateCommunityScreen";
import PostDetailScreen from "./src/screens/PostDetailScreen";
import SavedPostsScreen from "./src/screens/SavedPostsScreen";
import PoliticiansScreen from "./src/screens/PoliticiansScreen";
import PoliticianDetailScreen from "./src/screens/PoliticianDetailScreen";
import HashtagScreen from "./src/screens/HashtagScreen";
import DebugScreen from "./src/screens/DebugScreen";
import OAuthConnectSuccessScreen from "./src/screens/OAuthConnectSuccessScreen";
import CodeVerificationScreen from "./src/screens/CodeVerificationScreen";
// Add these imports after your existing screen imports
import ExploreScreen from "./src/screens/ExploreScreen";
import MessagesScreen from "./src/screens/MessagesScreen";
import DatingScreen from "./src/screens/DatingScreen";

// Dating screens
import DatingSetupScreen from "./src/screens/dating/DatingSetupScreen";
import SwipeScreen from "./src/screens/dating/SwipeScreen";
import MatchDetailScreen from "./src/screens/dating/MatchDetailScreen";
import DatingDebugScreen from "./src/screens/dating/DatingDebugScreen";

// Photo Message screens
import PhotoCameraScreen from "./src/screens/messages/PhotoCameraScreen";
import PhotoViewerScreen from "./src/screens/messages/PhotoViewerScreen";
import PhotoConversationScreen from "./src/screens/messages/PhotoConversationScreen";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Create a fallback error boundary screen
const ErrorScreen = ({
  error,
  resetError,
}: {
  error: Error;
  resetError: () => void;
}) => (
  <View
    style={{
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: 20,
      backgroundColor: "#fff",
    }}
  >
    <Text
      style={{
        fontSize: 18,
        fontWeight: "bold",
        color: "red",
        marginBottom: 10,
      }}
    >
      Something went wrong!
    </Text>
    <Text style={{ marginBottom: 20, textAlign: "center" }}>
      {error?.message || "Unknown error occurred"}
    </Text>
    <Button title="Try Again" onPress={resetError} />
  </View>
);

// Bottom Tab Navigator for main screens
// Bottom Tab Navigator for main screens - UPDATE THIS IN YOUR App.tsx
function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof MaterialIcons.glyphMap;

          switch (route.name) {
            case "Feed":
              iconName = "home";
              break;
            case "Explore":
              iconName = "search";
              break;
            case "Messages":
              iconName = "photo-camera"; // Camera icon for photo messaging
              break;
            case "Dating":
              iconName = "favorite"; // Heart icon for dating/swiping
              break;
            case "Profile":
              iconName = "person";
              break;
            default:
              iconName = "help";
          }

          return <MaterialIcons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#E91E63", // Pink color for dating app theme
        tabBarInactiveTintColor: "gray",
        tabBarStyle: {
          backgroundColor: "#000", // Dark theme
          borderTopColor: "#333",
        },
        headerShown: false,
      })}
    >
      <Tab.Screen
        name="Feed"
        component={FeedScreen}
        options={{ tabBarLabel: "Home" }}
      />
      <Tab.Screen
        name="Explore"
        component={ExploreScreen}
        options={{ tabBarLabel: "Explore" }}
      />
      <Tab.Screen
        name="Messages"
        component={MessagesScreen}
        options={{ tabBarLabel: "Snap" }}
      />
      <Tab.Screen
        name="Dating"
        component={DatingScreen}
        options={{ tabBarLabel: "Dating" }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ tabBarLabel: "Profile" }}
      />
      {/* ⚠️ ADD THIS TEMPORARY DEBUG TAB */}
      <Tab.Screen
        name="Debug"
        component={DebugScreen}
        options={{
          tabBarLabel: "Debug",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="bug-report" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

// AuthPersistence component
function AuthPersistence({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch<AppDispatch>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Check if we have a token first
        const token = await getToken();

        if (!token) {
          // Don't attempt to restore auth state if no token exists
          await dispatch({
            type: "user/restoreAuthState/fulfilled",
            payload: {
              isAuthenticated: false,
              id: null,
              token: null,
              username: null,
              email: null,
              displayName: null,
              bio: null,
              profileImageUrl: null,
              role: null,
            },
          });
          setIsLoading(false);
          return;
        }

        // Only try to restore state if we already have a token
        await dispatch(restoreAuthState()).unwrap();

        // Initialize badges if authenticated
        if (store.getState().user.isAuthenticated) {
          dispatch(initializeBadges());
        }
      } catch (error) {
        console.error("Error initializing app:", error);

        // Don't set error state for auth failures - just set not authenticated
        if (error instanceof Error && error.toString().includes("401")) {
          await dispatch({
            type: "user/restoreAuthState/fulfilled",
            payload: {
              isAuthenticated: false,
              id: null,
              token: null,
              username: null,
              email: null,
              displayName: null,
              bio: null,
              profileImageUrl: null,
              role: null,
            },
          });
        } else {
          setError(
            error instanceof Error
              ? error.message
              : "Unknown initialization error"
          );
        }
      } finally {
        setIsLoading(false);
      }
    };

    initializeApp();
  }, [dispatch]);

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#ffffff",
        }}
      >
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={{ marginTop: 16, color: "#666666" }}>
          Loading app state...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#ffffff",
        }}
      >
        <Text
          style={{
            fontSize: 18,
            fontWeight: "bold",
            color: "red",
            marginBottom: 10,
          }}
        >
          Error
        </Text>
        <Text style={{ marginBottom: 20, textAlign: "center" }}>{error}</Text>
        <Button
          title="Try Again"
          onPress={() => {
            setError(null);
            setIsLoading(true);
            dispatch(restoreAuthState());
          }}
        />
      </View>
    );
  }

  return <>{children}</>;
}

function AppNavigator() {
  const isAuthenticated = useSelector(
    (state: RootState) => state.user.isAuthenticated
  );

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          // Auth screens
          <>
            <Stack.Screen
              name="Landing"
              component={LandingScreen}
              options={{ animationTypeForReplace: "pop" }}
            />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="VerifyEmail" component={VerifyEmailScreen} />
            <Stack.Screen
              name="CodeVerification"
              component={CodeVerificationScreen}
            />
            <Stack.Screen name="Verify" component={VerifyScreen} />
            <Stack.Screen name="Debug" component={DebugScreen} />
          </>
        ) : (
          // Authenticated screens
          <>
            {/* Main Tab Navigator */}

            <Stack.Screen name="MainTabs" component={MainTabNavigator} />

            {/* Stack screens that overlay the tabs */}
            <Stack.Screen name="UserProfile" component={UserProfileScreen} />
            <Stack.Screen name="Settings" component={SettingsScreen} />
            <Stack.Screen
              name="FollowRequests"
              component={FollowRequestsScreen}
            />
            <Stack.Screen
              name="CommunityDetail"
              component={CommunityDetailScreen}
            />
            <Stack.Screen
              name="CreateCommunity"
              component={CreateCommunityScreen}
            />
            <Stack.Screen name="PostDetail" component={PostDetailScreen} />
            <Stack.Screen name="SavedPosts" component={SavedPostsScreen} />
            <Stack.Screen
              name="PoliticianDetail"
              component={PoliticianDetailScreen}
            />
            <Stack.Screen name="Hashtag" component={HashtagScreen} />
            <Stack.Screen name="Debug" component={DebugScreen} />
            <Stack.Screen
              name="OAuthConnectSuccess"
              component={OAuthConnectSuccessScreen}
            />
            {/* Add these after your existing Stack.Screen components */}

            {/* Dating screens */}
            <Stack.Screen
              name="DatingSetup"
              component={DatingSetupScreen}
              options={{
                headerShown: true,
                title: "Complete Your Dating Profile",
                headerStyle: { backgroundColor: "#000" },
                headerTintColor: "#fff",
              }}
            />
            <Stack.Screen name="SwipeScreen" component={SwipeScreen} />
            <Stack.Screen name="MatchDetail" component={MatchDetailScreen} />
            <Stack.Screen
              name="DatingDebug"
              component={DatingDebugScreen}
              options={{
                headerShown: false, // We handle header in the component
              }}
            />

            {/* Photo Message screens */}
            <Stack.Screen
              name="PhotoCamera"
              component={PhotoCameraScreen}
              options={{
                headerShown: false,
                presentation: "fullScreenModal",
              }}
            />
            <Stack.Screen
              name="PhotoViewer"
              component={PhotoViewerScreen}
              options={{
                headerShown: false,
                presentation: "fullScreenModal",
              }}
            />
            <Stack.Screen
              name="PhotoConversation"
              component={PhotoConversationScreen}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// Main App component
export default function App() {
  const [hasError, setHasError] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);

  if (hasError && error) {
    return <ErrorScreen error={error} resetError={() => setHasError(false)} />;
  }

  try {
    return (
      <Provider store={store}>
        <PersistGate
          loading={
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "#fff",
              }}
            >
              <ActivityIndicator size="large" color="#3B82F6" />
              <Text style={{ marginTop: 16 }}>Loading persisted state...</Text>
            </View>
          }
          persistor={persistor}
        >
          <StatusBar style="auto" />
          <View style={{ flex: 1, backgroundColor: "white" }}>
            <AuthPersistence>
              <AppNavigator />
            </AuthPersistence>
          </View>
        </PersistGate>
      </Provider>
    );
  } catch (err) {
    console.error("Caught error in App render:", err);
    setError(err instanceof Error ? err : new Error("Unknown render error"));
    setHasError(true);

    // Fallback render if everything fails
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "pink",
        }}
      >
        <Text style={{ color: "red", fontSize: 18 }}>App loading error!</Text>
        <Text>{err instanceof Error ? err.message : "Unknown error"}</Text>
        <Text>Check console logs for details</Text>
      </View>
    );
  }
}
