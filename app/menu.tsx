import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

export default function MenuScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Game Menu</Text>

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
    fontSize: 42,
    color: '#fff',
    marginBottom: 40,
  },
  menuItem: {
    padding: 20,
    marginVertical: 10,
    backgroundColor: '#333',
    width: '50%',
    borderRadius: 10,
    alignItems: 'center',
  },
  menuText: {
    color: '#fff',
    fontSize: 24,
  },
});
