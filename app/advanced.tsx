import AsyncStorage from '@react-native-async-storage/async-storage';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Button, Dimensions, FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { db } from '../src/config/firebase';
import cardImages from '../src/constants/cardImages';
import { Card } from '../src/types/cardType';

const { width } = Dimensions.get('window');
const CARD_SIZE = (width - 40) / 4; 

export default function AdvancedScreen() {
  const [cards2, setCards2] = useState<Card[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [score, setScore] = useState<number>(0);
  const [gameOver, setGameOver] = useState<boolean>(false);
  
  const [clickedCards, setClickedCards] = useState<number[]>([]);

  useEffect(() => {
    loadAndShuffleCards();
  }, []);

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
      
      // MEMBUAT DATA KARTU SECARA LOKAL (Tanpa API)
      // Kita buat 35 kartu secara otomatis dari 36.png sampai 70.png
const localData: Card[] = [];
      for (let i = 36; i <= 70; i++) {
        localData.push({
          id: i,
          nama: `Kartu ${i}`, 
          local_image: `${i}.png`,
          fraksi: 'Advanced' // <--- Tambahkan baris ini agar TypeScript tidak marah
        });
      }
      
      setCards2(shuffleArray(localData)); 
      setScore(0); 
      setClickedCards([]); 
      setGameOver(false);
    } catch (error) {
      console.error("Gagal menyiapkan kartu:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCardClick = (cardId: number) => {
    if (gameOver) return; 

    if (clickedCards.includes(cardId)) {
      handleGameOver();
    } else {
      setClickedCards(prev => [...prev, cardId]);
      setScore(prev => prev + 1);
      setCards2(prevCards => shuffleArray(prevCards));
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
        <Text style={{ marginTop: 10 }}>Menyiapkan Kartu Level Advanced...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.scoreText}>Skor Saat Ini: {score}</Text>
      
      <FlatList
        data={cards2} 
        keyExtractor={(item, index) => `${item.id}-${index}`}
        numColumns={4}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.cardContainer}
            activeOpacity={0.7}
            onPress={() => handleCardClick(item.id)}
          >
            <Image 
              source={cardImages[item.local_image] || require('../assets/cards2/36.png')} 
              style={styles.cardImage} 
            />
          </TouchableOpacity>
        )}
      />

      <View style={styles.footer}>
        {gameOver && (
          <Button title="Main Lagi (Reset & Acak Ulang)" color="green" onPress={loadAndShuffleCards} />
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
    height: CARD_SIZE, 
    padding: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardImage: {
    width: '100%',
    height: '100%', 
    borderRadius: 8,
    resizeMode: 'cover',
  },
  footer: { marginVertical: 20 }
});