// app/arcade/multiplayer/LobbyScreen.tsx
import React, { useState } from 'react';
import { View, Text, Button, TouchableOpacity, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Constants from 'expo-constants';

const API_BASE_URL = Constants.expoConfig?.extra?.API_BASE_URL;
const mageKeys = ['fire','earth','ice','light','wind','time','lightning','dark'];

export default function LobbyScreen() {
  const router = useRouter();
  const { roomJson } = useLocalSearchParams(); 

  // Convert roomJson to a single string (it might be string[])
  const paramString = Array.isArray(roomJson) ? roomJson[0] : roomJson;

  // We'll store the room data in state
  const [roomData, setRoomData] = useState<any>(
    paramString ? JSON.parse(paramString) : null
  );

  // If we never got data, show a fallback
  if (!roomData) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>
          No room data provided. (You might want to fetch from server if needed.)
        </Text>
      </View>
    );
  }

  async function handleSelectMage(mage: string) {
    try {
      const resp = await fetch(`${API_BASE_URL}/selectSprite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId: roomData.roomId,
          playerId: 'myPlayerDeviceId',
          mageType: mage,
        }),
      });
      const updatedRoom = await resp.json();
      console.log('Updated room after selectSprite:', updatedRoom);
      setRoomData(updatedRoom);
    } catch (error) {
      console.error('Error selecting mage:', error);
    }
  }

  async function handleStartGame() {
    try {
      const resp = await fetch(`${API_BASE_URL}/startGame`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId: roomData.roomId }),
      });
      const data = await resp.json();
      console.log('StartGame response:', data);

      // If success => inProgress = true
      router.push(`/arcade?roomId=${roomData.roomId}`);
    } catch (error) {
      console.error('Error starting game:', error);
    }
  }

  // If the server returned an error
  if (roomData.error) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Error: {roomData.error}</Text>
      </View>
    );
  }

  // If there's no "playerList"
  if (!roomData.playerList) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>No players found in this room.</Text>
      </View>
    );
  }

  // If the room is in progress
  if (roomData.inProgress) {
    router.replace(`/arcade?roomId=${roomData.roomId}`);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Room ID: {roomData.roomId}</Text>
      <Text style={[styles.text, { marginTop: 10 }]}>Players:</Text>
      {roomData.playerList.map((p: any) => (
        <Text key={p.playerId} style={styles.text}>
          {p.playerId} - {p.mageType || 'No mage chosen'}
          {p.isHost ? ' (Host)' : ''}
        </Text>
      ))}

      <Text style={[styles.text, { marginTop: 20 }]}>Select a Mage:</Text>
      <View style={styles.mageGrid}>
        {mageKeys.map((mage) => (
          <TouchableOpacity
            key={mage}
            style={styles.mageButton}
            onPress={() => handleSelectMage(mage)}
          >
            <Text style={styles.text}>{mage.toUpperCase()}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={{ marginTop: 30 }}>
        <Button title="Start Game" onPress={handleStartGame} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#111', padding: 20 },
  text: { color: '#fff', fontSize: 16 },
  mageGrid: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 10 },
  mageButton: {
    backgroundColor: '#333', padding: 10, margin: 5, borderRadius: 5,
  },
});
