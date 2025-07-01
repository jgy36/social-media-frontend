// src/screens/DebugScreen.tsx
import React from "react";
import { View, Text, Button, StyleSheet } from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

type DebugScreenProps = {
  navigation: NativeStackNavigationProp<any>;
};

const DebugScreen = ({ navigation }: DebugScreenProps) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Debug Screen</Text>

      <View style={styles.buttonContainer}>
        <Button
          title="Go to Login"
          onPress={() => navigation.navigate("Login")}
        />
      </View>

      <View style={styles.buttonContainer}>
        <Button
          title="Dating Debug & Mock Data"
          onPress={() => navigation.navigate("DatingDebug")}
          color="#E91E63"
        />
      </View>

      <View style={styles.buttonContainer}>
        <Button
          title="Dating Setup"
          onPress={() => navigation.navigate("DatingSetup")}
          color="#4CAF50"
        />
      </View>

      <View style={styles.buttonContainer}>
        <Button
          title="Dating Screen"
          onPress={() => navigation.navigate("Dating")}
          color="#2196F3"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
    padding: 20,
  },
  title: {
    fontSize: 20,
    marginBottom: 30,
    fontWeight: "bold",
  },
  buttonContainer: {
    marginBottom: 15,
    width: "80%",
  },
});

export default DebugScreen;
