// app/ModeSelectionScreen.tsx
import React from 'react';
import { View, StyleSheet, Button } from 'react-native';
import { useRouter } from 'expo-router';

export default function ModeSelectionScreen() {
  const router = useRouter();

  function handleSingleplayer() {
    // Go to your singleplayer character select
    router.push('/arcade/select');
  }

  function handleMultiplayer() {
    // Go to your new multiplayer menu
    router.push('/arcade/multiplayer');
  }

  return (
    <View style={styles.container}>
      <Button title="Singleplayer" onPress={handleSingleplayer} />
      <Button title="Multiplayer" onPress={handleMultiplayer} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#111',
  },
});
