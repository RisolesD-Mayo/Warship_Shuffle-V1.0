import AsyncStorage from '@react-native-async-storage/async-storage';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Button, Dimensions, FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { getCards } from '../src/api/cardApi';
import { db } from '../src/config/firebase';
import cardImages from '../src/constants/cardImages';
import { Card } from '../src/types/cardType';

const { width } = Dimensions.get('window');
const CARD_SIZE = (width - 40) / 4; 

export default function BeginnerScreen() {
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [score, setScore] = useState<number>(0);
  const [gameOver, setGameOver] = useState<boolean>(false);
  
  // STATE BARU: Untuk menyimpan ID kartu yang sudah pernah diklik di sesi ini
  const [clickedCards, setClickedCards] = useState<number[]>([]);

  useEffect(() => {
    loadAndShuffleCards();
  }, []);

  // Helper function untuk mengacak array, dipisah agar bisa dipanggil berkali-kali
  const shuffleArray = (array: Card[]) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const loadAndShuffleCards = async () => {
    try {
      setLoading(true);
      // Ambil data asli HANYA dari API di awal game
      const data = await getCards(); 
      
      setCards(shuffleArray(data)); // Acak posisi awal
      setScore(0); // Reset skor mulai dari 0
      setClickedCards([]); // Kosongkan ingatan kartu yang diklik
      setGameOver(false);
    } catch (error) {
      console.error("Gagal mengambil data kartu dari API:", error);
    } finally {
      setLoading(false);
    }
  };

  // LOGIKA UTAMA: Event onClick sesuai gambar
  const handleCardClick = (cardId: number) => {
    if (gameOver) return; // Kunci layar kalau game sudah over

    if (clickedCards.includes(cardId)) {
      // Kartu ini sudah pernah diklik sebelumnya -> GAME OVER
      handleGameOver();
    } else {
      // Kartu belum diklik -> Skor nambah, ingat ID-nya, lalu acak posisi
      setClickedCards(prev => [...prev, cardId]);
      setScore(prev => prev + 1);
      setCards(prevCards => shuffleArray(prevCards));
    }
  };

  const handleGameOver = async () => {
    setGameOver(true);
    const sessionString = await AsyncStorage.getItem('user_session');
    if (!sessionString) return;

    const loggedInUser = JSON.parse(sessionString);
    const userRef = doc(db, "users", loggedInUser.username.toLowerCase());
    const userSnap = await getDoc(userRef);

    const today = new Date().toISOString().split('T')[0];

    if (userSnap.exists()) {
      const userData = userSnap.data();
      const currentHighScore = userData.highScore || 0;

      if (score > currentHighScore) {
        await updateDoc(userRef, {
          highScore: score,
          lastScore: score,
          updatedAt: today
        });
        alert(`Selamat! Rekor Baru: ${score}`);
      } else {
        await updateDoc(userRef, {
          lastScore: score,
          updatedAt: today
        });
        alert(`Game Over! Kartu sudah pernah diklik. Skor Anda: ${score}`);
      }
    } else {
      await setDoc(userRef, {
        username: loggedInUser.username,
        password: loggedInUser.password,
        highScore: score,
        lastScore: score,
        updatedAt: today
      });
      alert(`Game Over! Skor pertama Anda: ${score}`);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={{ marginTop: 10 }}>Menyiapkan Kartu...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.scoreText}>Skor Saat Ini: {score}</Text>
      
      <FlatList
        data={cards}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        numColumns={4}
        renderItem={({ item }) => (
          // View diganti jadi TouchableOpacity agar bisa diklik
          <TouchableOpacity 
            style={styles.cardContainer}
            activeOpacity={0.7}
            onPress={() => handleCardClick(item.id)}
          >
            <Image 
              source={cardImages[item.local_image] || require('../assets/cards/1.png')} 
              style={styles.cardImage} 
            />
            <Text style={styles.cardName} numberOfLines={1}>{item.nama}</Text>
          </TouchableOpacity>
        )}
      />

      <View style={styles.footer}>
        {gameOver && (
          <Button title="Main Lagi (Reset API & Acak Ulang)" color="green" onPress={loadAndShuffleCards} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', paddingHorizontal: 10, paddingTop: 20 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scoreText: { fontSize: 18, fontWeight: 'bold', textAlign: 'center', marginBottom: 15 },
  cardContainer: {
    width: CARD_SIZE,
    height: CARD_SIZE + 25,
    padding: 4,
    alignItems: 'center',
  },
  cardImage: {
    width: '100%',
    height: '80%',
    borderRadius: 8,
    resizeMode: 'cover',
  },
  cardName: { fontSize: 10, textAlign: 'center', marginTop: 2, fontWeight: '500' },
  footer: { marginVertical: 20 }
});