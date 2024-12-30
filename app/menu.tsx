import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useRouter } from 'expo-router';

export default function MenuScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/images/blacksymphonylogo.png')}
        style={styles.logo}
      />

      <View style={styles.menuContainer}>
        <TouchableOpacity onPress={() => {}} style={styles.menuItem}>
          <Text style={styles.menuText}>Story Mode</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push('/arcade')} style={styles.menuItem}>
          <Text style={styles.menuText}>Arcade Mode</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => {}} style={styles.menuItem}>
          <Text style={styles.menuText}>Settings</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => {}} style={styles.menuItem}>
          <Text style={styles.menuText}>Credits</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// —————————————————————————————————————————
// Styles
// —————————————————————————————————————————
const styles = StyleSheet.create({
  container: {
    flex: 1,
    // Removed backgroundColor: '#222' so the random background video or black background can show
    alignItems: 'center',
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
    backgroundColor: '#333', // If you also want these to be translucent or see-through, remove this
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
