import React from 'react';
import { View, StyleSheet } from 'react-native';

interface StaminaBarProps {
  currentStamina: number;
  maxStamina: number;
}

const StaminaBar: React.FC<StaminaBarProps> = ({ currentStamina, maxStamina }) => {
  const barWidth = 350;
  const barHeight = 12;
  const borderRadius = barHeight / 2; // To make the height fully rounded
  const staminaRatio = currentStamina / maxStamina;
  const staminaWidth = barWidth * Math.max(0, Math.min(staminaRatio, 1));
  

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
            width: staminaWidth,
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
    top: 72, // below health bar
    left: 78,
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
