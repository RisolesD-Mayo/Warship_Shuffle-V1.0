import AsyncStorage from "@react-native-async-storage/async-storage";
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
  
  // Fungsi untuk memeriksa status login sebelum pindah halaman
const handleNavigation = async (targetRoute: "/beginner" | "/advanced") => {
    try {
      const userSession = await AsyncStorage.getItem("user_session");
      
      if (userSession !== null) {
        router.push(targetRoute);
      } else {
        // Tambahkan 'as any' di bagian pathname untuk melewati pengecekan ketat Expo Router sementara waktu
        router.push({
          pathname: "/login" as any, 
          params: { redirectTo: targetRoute }
        });
      }
    } catch (error) {
      console.error("Gagal memeriksa sesi login:", error);
      router.push("/login" as any); // Tambahkan 'as any' di sini juga
    }
  };
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

        {/* Menggunakan fungsi handleNavigation untuk proteksi login */}
        <TouchableOpacity
          style={styles.button}
          onPress={() => handleNavigation("/beginner")}
        >
          <Text style={styles.buttonText}>Beginner</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => handleNavigation("/advanced")}
        >
          <Text style={styles.buttonText}>Advanced</Text>
        </TouchableOpacity>

        {/* Leaderboard tetap bisa diakses langsung tanpa login */}
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
    marginBottom: 32,
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