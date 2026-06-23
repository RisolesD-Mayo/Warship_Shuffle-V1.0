import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  Alert,
  Image,
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function HomeScreen() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  // Periksa status login setiap kali halaman utama difokuskan kembali
  useFocusEffect(
    useCallback(() => {
      const checkLoginStatus = async () => {
        const userSession = await AsyncStorage.getItem("user_session");
        setIsLoggedIn(userSession !== null);
      };
      checkLoginStatus();
    }, [])
  );

  // Fungsi untuk memeriksa status login sebelum pindah ke halaman game
  const handleNavigation = async (targetRoute: "/beginner" | "/advanced") => {
    try {
      const userSession = await AsyncStorage.getItem("user_session");
      
      if (userSession !== null) {
        router.push(targetRoute);
      } else {
        router.push({
          pathname: "/login" as any, 
          params: { redirectTo: targetRoute }
        });
      }
    } catch (error) {
      console.error("Gagal memeriksa sesi login:", error);
      router.push("/login" as any);
    }
  };

  // Fungsi untuk menangani proses Log Out
  const handleLogOut = async () => {
    Alert.alert("Log Out", "Apakah Anda yakin ingin keluar dari akun saat ini?", [
      { text: "Batal", style: "cancel" },
      {
        text: "Keluar",
        style: "destructive",
        onPress: async () => {
          await AsyncStorage.removeItem("user_session");
          setIsLoggedIn(false);
          Alert.alert("Sukses", "Anda telah berhasil keluar.");
        },
      },
    ]);
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

        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push("/leaderboard")}
        >
          <Text style={styles.buttonText}>Leaderboard</Text>
        </TouchableOpacity>

        {/* Tombol Dinamis: Menampilkan Log Out jika sudah login, Log In jika belum */}
        {isLoggedIn ? (
          <TouchableOpacity
            style={[styles.button, styles.logoutButton]}
            onPress={handleLogOut}
          >
            <Text style={[styles.buttonText, styles.logoutButtonText]}>Log Out</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.button, styles.loginButton]}
            onPress={() => router.push("/login" as any)}
          >
            <Text style={[styles.buttonText, styles.loginButtonText]}>Log In</Text>
          </TouchableOpacity>
        )}

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
  // Style tambahan untuk tombol Log In agar terlihat kontras/menarik
  loginButton: {
    backgroundColor: "#28a745cc", // Hijau transparan
  },
  loginButtonText: {
    color: "#ffffff",
  },
  // Style tambahan untuk tombol Log Out agar bernuansa peringatan
  logoutButton: {
    backgroundColor: "#dc3545cc", // Merah transparan
  },
  logoutButtonText: {
    color: "#ffffff",
  },
});