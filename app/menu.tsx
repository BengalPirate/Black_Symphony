// MenuScreen.tsx
import React, { useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { BgVideoContext } from './_layout';

export default function MenuScreen() {
  const router = useRouter();
  const { fadeOutMusicAndStop } = useContext(BgVideoContext);

  const handleMenuPress = (destination: string) => {
    fadeOutMusicAndStop();       // fade in background
    router.push(destination as any);   // navigate right away
  };  

  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/images/blacksymphonylogo.png')}
        style={styles.logo}
      />

      <View style={styles.menuContainer}>
        <TouchableOpacity onPress={() => handleMenuPress('/story')} style={styles.menuItem}>
          <Text style={styles.menuText}>Story Mode</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => handleMenuPress('/arcade/select')} style={styles.menuItem}>
          <Text style={styles.menuText}>Arcade Mode</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => handleMenuPress('/settings')} style={styles.menuItem}>
          <Text style={styles.menuText}>Settings</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => handleMenuPress('/credits')} style={styles.menuItem}>
          <Text style={styles.menuText}>Credits</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// —————————————————————————————————————————————————
// Styles
// —————————————————————————————————————————————————
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: 'transparent', // or 'transparent' if you prefer
  },
  logo: {
    marginTop: 0,
    width: 500,
    height: 120,
    resizeMode: 'contain',
  },
  menuContainer: {
    marginTop: 0,
    width: '100%',
    alignItems: 'center',
  },
  menuItem: {
    padding: 10,
    marginVertical: 8,
    backgroundColor: '#333',
    width: '70%',
    maxWidth: 250,
    borderRadius: 8,
    alignItems: 'center',
  },
  menuText: {
    color: '#fff',
    fontSize: 20,
    textAlign: 'center',
  },
});
