import React from 'react';
import { View, StyleSheet, Text } from 'react-native';

interface StaminaBarProps {
  currentStamina: number;
  maxStamina: number;
}

const StaminaBar: React.FC<StaminaBarProps> = ({ currentStamina, maxStamina }) => {
  const barWidth = 350;
  const barHeight = 12;
  const borderRadius = barHeight / 2;
  const ratio = currentStamina / maxStamina;
  const clampedRatio = Math.max(0, Math.min(ratio, 1));
  const staminaWidth = barWidth * clampedRatio;

  const percentageLabel = `${(clampedRatio * 100).toFixed(1)}%`;

  return (
    <View style={[styles.container, { width: barWidth, height: barHeight }]}>
      {/* Background */}
      <View
        style={[
          styles.background,
          {
            width: barWidth,
            height: barHeight,
            borderRadius,
          },
        ]}
      />
      {/* Filled portion */}
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
      {/* Centered label */}
      <View style={styles.textContainer}>
        <Text style={[styles.label, { fontSize: barHeight * 0.75 }]}>
          {percentageLabel}
        </Text>
      </View>
    </View>
  );
};

export default StaminaBar;

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 72,
    left: 78,
    zIndex: 9999,
  },
  background: {
    // 50% translucent gray
    backgroundColor: 'rgba(136, 136, 136, 0.3)',
    position: 'absolute',
  },
  foreground: {
    // 50% translucent blue
    backgroundColor: 'rgba(0, 0, 255, 0.5)',
    position: 'absolute',
  },
  textContainer: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
