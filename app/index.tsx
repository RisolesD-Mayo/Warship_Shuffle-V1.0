import { router } from "expo-router";
import {
  Image,
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function HomeScreen() {
  return (
    <ImageBackground
      source={require("../assets/background2.png")}
      style={styles.background}
    >
      <View style={styles.container}>

        <Image
          source={require("../assets/logo.png")}
          style={styles.logo}
        />

        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push("/beginner")}
        >
          <Text style={styles.buttonText}>Beginner</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push("/advanced")}
        >
          <Text style={styles.buttonText}>Advanced</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push("/leaderboard")}
        >
          <Text style={styles.buttonText}>Leaderboard</Text>
        </TouchableOpacity>

      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },

  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

logo: {
  width: 240,
  height: 140,
  marginBottom:32,
},

  button: {
    width: 220,
    backgroundColor: "#ffffffcc",
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
    alignItems: "center",
  },

  buttonText: {
    fontSize: 20,
    fontWeight: "bold",
  },
});