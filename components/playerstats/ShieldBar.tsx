import React from 'react';
import { View, StyleSheet, Text } from 'react-native';

interface ShieldBarProps {
  currentShield: number;
  maxShield: number;
}

const ShieldBar: React.FC<ShieldBarProps> = ({ currentShield, maxShield }) => {
  const barWidth = 200;
  const barHeight = 12;
  const borderRadius = barHeight / 2;

  const ratio = currentShield / maxShield;
  const clampedRatio = Math.max(0, Math.min(ratio, 1));
  const shieldWidth = barWidth * clampedRatio;
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
            width: shieldWidth,
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

export default ShieldBar;

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 312, 
    left: 212,
    zIndex: 9999,
  },
  background: {
    // 50% translucent gray
    backgroundColor: 'rgba(136, 136, 136, 0.3)',
    position: 'absolute',
  },
  foreground: {
    // 50% translucent green
    backgroundColor: 'rgba(0, 128, 0, 0.5)',
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
