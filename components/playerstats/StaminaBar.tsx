import React from 'react';
import { View, StyleSheet } from 'react-native';

interface StaminaBarProps {
  currentStamina: number;
  maxStamina: number;
}

const StaminaBar: React.FC<StaminaBarProps> = ({ currentStamina, maxStamina }) => {
  const barWidth = 200;
  const barHeight = 10;
  const staminaRatio = currentStamina / maxStamina;
  const staminaWidth = barWidth * Math.max(0, Math.min(staminaRatio, 1));

  return (
    <View style={[styles.container, { width: barWidth, height: barHeight }]}>
      <View style={[styles.background, { width: barWidth, height: barHeight }]} />
      <View style={[styles.foreground, { width: staminaWidth, height: barHeight }]} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 40, // below health bar
    left: 20,
    zIndex: 9999,
  },
  background: {
    backgroundColor: '#888',
    position: 'absolute',
  },
  foreground: {
    backgroundColor: 'blue',
    position: 'absolute',
  },
});

export default StaminaBar;
