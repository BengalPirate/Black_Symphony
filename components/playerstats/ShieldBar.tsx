// ShieldBar.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';

interface ShieldBarProps {
  currentShield: number; // The player's current shield amount
  maxShield: number;     // The player's maximum shield capacity
}

const ShieldBar: React.FC<ShieldBarProps> = ({ currentShield, maxShield }) => {
  const barWidth = 200;
  const barHeight = 8;

  // Compute how full the shield bar is as a ratio of max
  const shieldRatio = currentShield / maxShield;
  // Prevent ratio from going below 0 or above 1
  const shieldWidth = barWidth * Math.max(0, Math.min(shieldRatio, 1));

  return (
    <View style={[styles.container, { width: barWidth, height: barHeight }]}>
      {/* The empty (background) portion of the bar */}
      <View style={[styles.background, { width: barWidth, height: barHeight }]} />
      {/* The filled portion based on currentShield */}
      <View style={[styles.foreground, { width: shieldWidth, height: barHeight }]} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    // Example layout: place below the Special Attack bar
    top: 290, 
    left: 230,
    zIndex: 9999,
  },
  background: {
    // “Empty” portion color
    backgroundColor: '#555',
    position: 'absolute',
  },
  foreground: {
    // “Filled” portion color (customize as you like)
    backgroundColor: 'green', 
    position: 'absolute',
  },
});

export default ShieldBar;
