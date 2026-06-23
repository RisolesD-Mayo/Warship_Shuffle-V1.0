import { router } from "expo-router";
import { collection, getDocs, limit, orderBy, query } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { db } from "../src/config/firebase";

// Definisi tipe data untuk baris peringkat
interface LeaderboardUser {
  id: string;
  username: string;
  highScore: number;
  lastScore: number;
  updatedAt: string;
}

export default function LeaderboardScreen() {
  const [leaders, setLeaders] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Ambil data peringkat dari Firebase
  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const usersRef = collection(db, "users");
      
      // Query: Ambil data dari koleksi 'users', urutkan berdasarkan highScore paling besar (descending)
      // Batasi hanya menampilkan top 10 atau top 20 pemain agar hemat kuota database
      const q = query(usersRef, orderBy("highScore", "desc"), limit(10));
      
      const querySnapshot = await getDocs(q);
      const rankingData: LeaderboardUser[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        // Hanya masukkan user yang sudah memiliki skor > 0
        if (data.highScore > 0) {
          rankingData.push({
            id: doc.id,
            username: data.username || "Anonymous",
            highScore: data.highScore || 0,
            lastScore: data.lastScore || 0,
            updatedAt: data.updatedAt || "-",
          });
        }
      });

      setLeaders(rankingData);
    } catch (error) {
      console.error("Gagal memuat leaderboard:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  // Komponen render untuk baris setiap user
  const renderItem = ({ item, index }: { item: LeaderboardUser; index: number }) => {
    const rank = index + 1;
    
    // Gaya khusus untuk podium 3 besar
    const rankStyle = 
      rank === 1 ? styles.rankOne : 
      rank === 2 ? styles.rankTwo : 
      rank === 3 ? styles.rankThree : styles.rankNormal;

    return (
      <View style={styles.row}>
        <View style={[styles.rankBadge, rankStyle]}>
          <Text style={styles.rankText}>{rank}</Text>
        </View>
        <Text style={styles.usernameText} numberOfLines={1}>{item.username}</Text>
        <Text style={styles.scoreText}>{item.highScore.toLocaleString()}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🏆 Top 10 Papan Peringkat</Text>
      
      {/* Header Tabel */}
      <View style={styles.tableHeader}>
        <Text style={[styles.headerText, { width: 50, textAlign: "center" }]}>Pos</Text>
        <Text style={[styles.headerText, { flex: 1, textAlign: "left", paddingLeft: 10 }]}>Nama Pemain</Text>
        <Text style={[styles.headerText, { width: 100, textAlign: "right" }]}>Skor Tertinggi</Text>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#007BFF" />
          <Text style={{ marginTop: 10 }}>Mengunduh Peringkat...</Text>
        </View>
      ) : leaders.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>Belum ada rekor permainan tercatat.</Text>
        </View>
      ) : (
        <FlatList
          data={leaders}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          refreshing={loading}
          onRefresh={fetchLeaderboard} // Tarik layar ke bawah untuk refresh otomatis
        />
      )}

      {/* Tombol Kembali ke Menu Utama */}
      <TouchableOpacity style={styles.backButton} onPress={() => router.replace("/")}>
        <Text style={styles.backButtonText}>Kembali ke Menu</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fa", padding: 20, paddingTop: 40 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 24, fontWeight: "bold", textAlign: "center", marginBottom: 20, color: "#333" },
  
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#007BFF",
    paddingVertical: 10,
    paddingHorizontal: 5,
    borderRadius: 8,
    marginBottom: 10,
  },
  headerText: { color: "#fff", fontWeight: "bold", fontSize: 14 },
  
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginBottom: 8,
    elevation: 1, // Efek shadow tipis di Android
    shadowColor: "#000", // Efek shadow di iOS
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
  },
  
  rankBadge: { width: 30, height: 30, borderRadius: 15, justifyContent: "center", alignItems: "center" },
  rankText: { color: "#fff", fontWeight: "bold", fontSize: 14 },
  
  // Warna-warna badge peringkat
  rankOne: { backgroundColor: "#FFD700" },   // Emas
  rankTwo: { backgroundColor: "#C0C0C0" },   // Perak
  rankThree: { backgroundColor: "#CD7F32" }, // Perunggu
  rankNormal: { backgroundColor: "#6c757d" },// Abu-abu biasa
  
  usernameText: { flex: 1, fontSize: 16, fontWeight: "600", paddingLeft: 15, color: "#444" },
  scoreText: { fontSize: 16, fontWeight: "bold", color: "#28a745", width: 100, textAlign: "right" },
  emptyText: { fontSize: 16, color: "#777", textAlign: "center" },
  
  backButton: { backgroundColor: "#6c757d", padding: 15, borderRadius: 8, alignItems: "center", marginTop: 15 },
  backButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});