import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

export default function MenuScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Game Menu</Text>

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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#222',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28, // Reduced title size
    color: '#fff',
    marginBottom: 20,
  },
  menuContainer: {
    width: '100%',
    alignItems: 'center',
  },
  menuItem: {
    padding: 10, // Reduced padding
    marginVertical: 8, // Reduced margin for spacing
    backgroundColor: '#333',
    width: '70%', // Adjusted width to fit
    maxWidth: 250, // Ensures consistent size across devices
    borderRadius: 8,
    alignItems: 'center',
  },
  menuText: {
    color: '#fff',
    fontSize: 20, // Slightly reduced font size
    textAlign: 'center',
  },
});
