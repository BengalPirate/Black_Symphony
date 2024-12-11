import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { useRouter } from 'expo-router';

export default function StartScreen() {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(1)).current; // Initial opacity value

  useEffect(() => {
    const flickerAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 0.3, // Minimum opacity
          duration: 1000, // 1 second to fade out
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1, // Full opacity
          duration: 1000, // 1 second to fade in
          useNativeDriver: true,
        }),
      ])
    );

    flickerAnimation.start();

    // Cleanup animation on unmount
    return () => flickerAnimation.stop();
  }, [fadeAnim]);

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => router.push('/menu')} style={styles.touchArea}>
        <Animated.Text style={[styles.text, { opacity: fadeAnim }]}>
          Press Start
        </Animated.Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  touchArea: {
    padding: 20,
  },
  text: {
    color: '#fff',
    fontSize: 32,
  },
});
