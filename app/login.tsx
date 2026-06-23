import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useLocalSearchParams } from "expo-router";
import { doc, getDoc, setDoc } from "firebase/firestore";
import React, { useState } from "react";
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { db } from "../src/config/firebase";

export default function LoginScreen() {
  const { redirectTo } = useLocalSearchParams();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLoginSubmit = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert("Error", "Username dan password tidak boleh kosong!");
      return;
    }

    try {
      setLoading(true);
      const userKey = username.trim().toLowerCase();
      const userRef = doc(db, "users", userKey);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        // USER SUDAH ADA: Cocokkan password-nya
        const userData = userSnap.data();
        if (userData.password === password) {
          // Password cocok -> Simpan sesi local
          await AsyncStorage.setItem("user_session", JSON.stringify({ username, password }));
          Alert.alert("Sukses", `Selamat datang kembali, ${username}!`);
          
          // Alihkan ke halaman tujuan awal
          if (redirectTo) {
            router.replace(redirectTo as any);
          } else {
            router.replace("/");
          }
        } else {
          // Password salah
          Alert.alert("Gagal Login", "Password salah! Silakan coba lagi.");
        }
      } else {
        // USER BELUM ADA: Daftarkan otomatis sesuai request format data kamu
        const today = new Date().toISOString().split("T")[0];
        const newUserData = {
          username: username.trim(),
          password: password,
          highScore: 0,
          lastScore: 0,
          updatedAt: today
        };

        await setDoc(userRef, newUserData);
        await AsyncStorage.setItem("user_session", JSON.stringify({ username, password }));
        
        Alert.alert("Registrasi Berhasil", "Akun baru otomatis terdaftar!");
        
        if (redirectTo) {
          router.replace(redirectTo as any);
        } else {
          router.replace("/");
        }
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Terjadi kesalahan koneksi ke database.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login Pemain</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Masukkan Username"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Masukkan Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity 
        style={[styles.button, loading && styles.buttonDisabled]} 
        onPress={handleLoginSubmit}
        disabled={loading}
      >
        <Text style={styles.buttonText}>{loading ? "Memproses..." : "Masuk / Daftar"}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20, backgroundColor: "#fff" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20, textAlign: "center" },
  input: { borderWidth: 1, borderColor: "#ccc", padding: 12, borderRadius: 8, marginBottom: 15, fontSize: 16 },
  button: { backgroundColor: "#007BFF", padding: 15, borderRadius: 8, alignItems: "center" },
  buttonDisabled: { backgroundColor: "#aaa" },
  buttonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
});