import React from 'react';
import { View, StyleSheet } from 'react-native';

interface HealthBarProps {
  currentHealth: number;
  maxHealth: number;
}

const HealthBar: React.FC<HealthBarProps> = ({ currentHealth, maxHealth }) => {
  const barWidth = 200;
  const barHeight = 10;

  const healthRatio = currentHealth / maxHealth;
  const healthWidth = barWidth * Math.max(0, Math.min(healthRatio, 1));

  return (
    <View style={[styles.container, { width: barWidth, height: barHeight }]}>
      <View style={[styles.background, { width: barWidth, height: barHeight }]} />
      <View style={[styles.foreground, { width: healthWidth, height: barHeight }]} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 20,
    left: 20,
    zIndex: 9999,
  },
  background: {
    backgroundColor: '#888',
    position: 'absolute',
  },
  foreground: {
    backgroundColor: 'green',
    position: 'absolute',
  },
});

export default HealthBar;
