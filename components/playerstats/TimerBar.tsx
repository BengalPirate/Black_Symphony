import React from 'react';
import { View, StyleSheet, Text } from 'react-native';

interface TimerBarProps {
  currentTime: number;
  maxTime: number;
}

const TimerBar: React.FC<TimerBarProps> = ({ currentTime, maxTime }) => {
  const barWidth = 200;
  const barHeight = 12;
  const borderRadius = barHeight / 2;

  // 0..1 ratio
  const ratio = Math.max(0, Math.min(currentTime / maxTime, 1));
  const filledWidth = barWidth * ratio;

  // Example label: seconds left
  const secondsLeft = Math.max(0, maxTime - currentTime);
  const labelStr = `${secondsLeft.toFixed(1)}s`;

  return (
    <View style={[styles.container, { width: barWidth, height: barHeight }]}>
      {/* BACKGROUND (round left) */}
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
      {/* FOREGROUND pinned to right, round left */}
      <View
        style={[
          styles.foreground,
          {
            width: filledWidth,
            height: barHeight,
            borderTopLeftRadius: borderRadius,
            borderBottomLeftRadius: borderRadius,
            right: 0,
          },
        ]}
      />
      <View style={styles.textContainer}>
        <Text style={[styles.label, { fontSize: barHeight * 0.75 }]}>
          {labelStr}
        </Text>
      </View>
    </View>
  );
};

export default TimerBar;

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 312,
    left: 420,
    zIndex: 9999,
  },
  background: {
    position: 'absolute',
    backgroundColor: 'rgba(136,136,136,0.3)',
  },
  foreground: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 0, 255, 0.5)', 
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
