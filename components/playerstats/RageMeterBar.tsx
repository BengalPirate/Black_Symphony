import React from 'react';
import { View, StyleSheet, Text } from 'react-native';

interface RageMeterBarProps {
  currentRage: number;
  maxRage: number;
}

const RageMeterBar: React.FC<RageMeterBarProps> = ({ currentRage, maxRage }) => {
  const barWidth = 200;
  const barHeight = 12;
  const borderRadius = barHeight / 2;

  // Ratio of how full the bar is
  const ratio = Math.max(0, Math.min(currentRage / maxRage, 1));
  // The filled region’s width
  const filledWidth = barWidth * ratio;

  const percentageLabel = `${(ratio * 100).toFixed(1)}% Rage`;

  return (
    <View style={[styles.container, { width: barWidth, height: barHeight }]}>
      {/* BACKGROUND (rounded left corners) */}
      <View
        style={[
          styles.background,
          {
            width: barWidth,
            height: barHeight,
            borderTopLeftRadius: borderRadius,
            borderBottomLeftRadius: borderRadius,
          },
        ]}
      />
      {/* FOREGROUND pinned to the right, also rounded on the left side */}
      <View
        style={[
          styles.foreground,
          {
            width: filledWidth,
            height: barHeight,
            borderTopLeftRadius: borderRadius,
            borderBottomLeftRadius: borderRadius,
            right: 0, // anchor to the right side
          },
        ]}
      />
      {/* Text label */}
      <View style={styles.textContainer}>
        <Text style={[styles.label, { fontSize: barHeight * 0.75 }]}>
          {percentageLabel}
        </Text>
      </View>
    </View>
  );
};

export default RageMeterBar;

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 358,
    left: 420,
    zIndex: 9999,
  },
  background: {
    backgroundColor: 'rgba(136,136,136,0.3)', // gray, translucent
    position: 'absolute',
  },
  foreground: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 140, 0, 0.5)',
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
