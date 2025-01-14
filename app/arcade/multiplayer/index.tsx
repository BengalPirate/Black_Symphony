// app/arcade/multiplayer/index.tsx
import React from 'react';
import { View, Button, StyleSheet, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import Constants from 'expo-constants';

const API_BASE_URL = Constants.expoConfig?.extra?.API_BASE_URL;
console.log('API_BASE_URL is:', API_BASE_URL);

export default function MultiplayerMenuScreen() {
  const router = useRouter();
  const [joinCode, setJoinCode] = React.useState('');

  // Host
  async function handleHost() {
    try {
      const resp = await fetch(`${API_BASE_URL}/createRoom`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hostId: 'myPlayerDeviceId', // or something unique
          hostMage: 'fire',
        }),
      });
      const data = await resp.json();
      console.log('Created room data:', data);

      if (data.error) {
        console.log('Server returned error:', data.error);
        return;
      }
      // data now has full room object, e.g. { roomId, playerList, inProgress: false }
      if (data.roomId) {
        // Move to Lobby, passing entire room data as a JSON param:
        router.push({
          pathname: '/arcade/multiplayer/LobbyScreen',
          params: {
            roomJson: JSON.stringify(data), // we can parse later
          },
        });
      } else {
        console.log('No roomId in response?', data);
      }
    } catch (error) {
      console.error('Error creating room:', error);
    }
  }

  // Join
  async function handleJoin() {
    try {
      const resp = await fetch(`${API_BASE_URL}/joinRoom`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId: joinCode,
          playerId: 'myPlayerDeviceId',
        }),
      });
      const data = await resp.json();
      console.log('Joined room data:', data);

      if (data.error) {
        console.log('Server returned error:', data.error);
        return;
      }

      // data = entire updated room
      if (data.roomId) {
        // Pass entire room data as well:
        router.push({
          pathname: '/arcade/multiplayer/LobbyScreen',
          params: {
            roomJson: JSON.stringify(data),
          },
        });
      } else {
        console.log('No roomId in join response?', data);
      }
    } catch (error) {
      console.error('Error joining room:', error);
    }
  }

  return (
    <View style={styles.container}>
      <Button title="Host Room" onPress={handleHost} />

      <View style={styles.joinContainer}>
        <TextInput
          style={styles.input}
          placeholder="Enter room code"
          value={joinCode}
          onChangeText={setJoinCode}
        />
        <Button title="Join Room" onPress={handleJoin} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#111',
  },
  joinContainer: {
    flexDirection: 'row', marginTop: 20, alignItems: 'center',
  },
  input: {
    borderWidth: 1, borderColor: '#ccc', marginRight: 10, padding: 8, width: 120,
    color: '#fff', backgroundColor: '#222',
  },
});
