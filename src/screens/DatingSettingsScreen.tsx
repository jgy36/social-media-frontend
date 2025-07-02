// Create DatingSettingsScreen.tsx
const DatingSettingsScreen = () => {
  const [preferences, setPreferences] = useState({
    genderPreference: "EVERYONE",
    minAge: 18,
    maxAge: 35,
    maxDistance: 50,
  });

  const [eligibility, setEligibility] = useState({
    age: null,
    ageConfirmed: false,
    eligibleForDating: false,
  });

  const confirmAge = async () => {
    try {
      const response = await apiClient.post("/dating/settings/confirm-age");
      if (response.data.success) {
        setEligibility((prev) => ({
          ...prev,
          ageConfirmed: true,
          eligibleForDating: response.data.eligibleForDating,
        }));
      }
    } catch (error) {
      // Handle error
    }
  };

  const updatePreferences = async () => {
    try {
      await apiClient.put("/dating/settings/preferences", preferences);
      // Show success message
    } catch (error) {
      // Handle error
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#000000" }}>
      {/* Age Confirmation Section */}
      {!eligibility.ageConfirmed && eligibility.age >= 18 && (
        <View
          style={{
            padding: 16,
            backgroundColor: "#FF6B9D",
            margin: 16,
            borderRadius: 12,
          }}
        >
          <Text style={{ color: "white", fontSize: 16, fontWeight: "bold" }}>
            Confirm Your Age
          </Text>
          <Text style={{ color: "white", marginTop: 8 }}>
            You must confirm you're 18+ to use dating features
          </Text>
          <TouchableOpacity
            onPress={confirmAge}
            style={{
              backgroundColor: "white",
              padding: 12,
              borderRadius: 8,
              marginTop: 12,
            }}
          >
            <Text
              style={{
                color: "#FF6B9D",
                fontWeight: "bold",
                textAlign: "center",
              }}
            >
              I'm {eligibility.age} years old
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Dating Preferences */}
      {eligibility.eligibleForDating && (
        <View style={{ padding: 16 }}>
          <Text
            style={{
              color: "white",
              fontSize: 20,
              fontWeight: "bold",
              marginBottom: 20,
            }}
          >
            Dating Preferences
          </Text>

          {/* Gender Preference */}
          <View style={{ marginBottom: 24 }}>
            <Text style={{ color: "white", fontSize: 16, marginBottom: 12 }}>
              Show me
            </Text>
            {["MEN", "WOMEN", "EVERYONE"].map((option) => (
              <TouchableOpacity
                key={option}
                onPress={() =>
                  setPreferences((prev) => ({
                    ...prev,
                    genderPreference: option,
                  }))
                }
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingVertical: 12,
                  paddingHorizontal: 16,
                  backgroundColor:
                    preferences.genderPreference === option
                      ? "#FF6B9D"
                      : "#2F3542",
                  borderRadius: 8,
                  marginBottom: 8,
                }}
              >
                <Text style={{ color: "white", fontSize: 16 }}>
                  {option === "MEN"
                    ? "Men"
                    : option === "WOMEN"
                    ? "Women"
                    : "Everyone"}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Age Range */}
          <View style={{ marginBottom: 24 }}>
            <Text style={{ color: "white", fontSize: 16, marginBottom: 12 }}>
              Age Range: {preferences.minAge} - {preferences.maxAge}
            </Text>
            {/* Add range sliders here */}
          </View>

          {/* Distance */}
          <View style={{ marginBottom: 24 }}>
            <Text style={{ color: "white", fontSize: 16, marginBottom: 12 }}>
              Maximum Distance: {preferences.maxDistance} miles
            </Text>
            {/* Add distance slider here */}
          </View>

          <TouchableOpacity
            onPress={updatePreferences}
            style={{
              backgroundColor: "#FF6B9D",
              padding: 16,
              borderRadius: 12,
              alignItems: "center",
            }}
          >
            <Text style={{ color: "white", fontSize: 16, fontWeight: "bold" }}>
              Save Preferences
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
};
