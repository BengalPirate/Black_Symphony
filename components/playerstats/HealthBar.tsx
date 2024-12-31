import React from 'react';
import { View, StyleSheet } from 'react-native';

interface HealthBarProps {
  currentHealth: number;
  maxHealth: number;
}

const HealthBar: React.FC<HealthBarProps> = ({ currentHealth, maxHealth }) => {
  const barWidth = 350;
  const barHeight = 12;
  const borderRadius = barHeight / 2; // To make the height fully rounded
  const healthRatio = currentHealth / maxHealth;
  const healthWidth = barWidth * Math.max(0, Math.min(healthRatio, 1));
  

  return (
    <View style={[styles.container, { width: barWidth, height: barHeight }]}>
      <View
        style={[
          styles.background,
          { width: barWidth, height: barHeight, borderRadius },
        ]}
      />
      <View
        style={[
          styles.foreground,
          {
            width: healthWidth,
            height: barHeight,
            borderTopRightRadius: borderRadius,
            borderBottomRightRadius: borderRadius,
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 30,
    left: 78,
    zIndex: 9999,
  },
  background: {
    backgroundColor: '#888',
    position: 'absolute',
  },
  foreground: {
    backgroundColor: 'red',
    position: 'absolute',
  },
});

export default HealthBar;
