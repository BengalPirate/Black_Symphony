import React from 'react';
import { View, StyleSheet, Text } from 'react-native';

interface SpecialAttackBarProps {
  currentSpecial: number;
  maxSpecial: number;
}

/**
 * Renders TWO bars (stacked vertically):
 *  - The main bar for [0..100%].
 *  - An optional "overflow" bar below it for [100..200%].
 *
 * If currentSpecial < maxSpecial, only the first bar is visible (partially filled).
 * If currentSpecial > maxSpecial (up to 2× maxSpecial), the second bar becomes visible.
 */
const SpecialAttackBar: React.FC<SpecialAttackBarProps> = ({
  currentSpecial,
  maxSpecial,
}) => {
  // Each bar is 200 wide × 12 tall, stacked with a small vertical gap
  const barWidth = 200;
  const barHeight = 12;
  const barGap = 3; // gap between the first and second bar
  const borderRadius = barHeight / 2;

  // Ratio can go from 0..2 if we allow up to 200%
  const ratio = currentSpecial / maxSpecial;
  const clampedRatio = Math.min(Math.max(ratio, 0), 2); // ensure 0..2

  // We'll split that ratio into two parts:
  // - mainRatio: [0..1] portion
  // - overflowRatio: [0..1] portion for anything above 1.0
  const mainRatio = Math.min(clampedRatio, 1);      // 0..1
  const overflowRatio = Math.max(clampedRatio - 1, 0); // 0..1

  // Convert to widths in px
  const mainWidth = barWidth * mainRatio;       // 0..barWidth
  const overflowWidth = barWidth * overflowRatio; // 0..barWidth

  // Show a single label that can go up to 200%
  const percentageLabel = `${(clampedRatio * 100).toFixed(1)}%`;

  // The total container height needs to fit two bars plus gap
  // only if overflowRatio>0. If there's no overflow, container is just barHeight
  const totalHeight = overflowRatio > 0
    ? barHeight * 2 + barGap
    : barHeight;

    return (
      <View style={[styles.container, { width: barWidth, height: totalHeight }]}>
        {/* ---------------- FIRST (Main) BAR up to 100% ---------------- */}
        <View style={{ width: barWidth, height: barHeight }}>
          {/* Gray background */}
          <View
            style={[
              styles.barBackground,
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
              styles.barForeground,
              {
                width: mainWidth,
                height: barHeight,
                borderTopRightRadius: mainRatio >= 1 ? borderRadius : 0,
                borderBottomRightRadius: mainRatio >= 1 ? borderRadius : 0,
              },
            ]}
          />
          {/* Label positioned inside the first bar */}
          <View style={styles.textContainer}>
            <Text style={[styles.label, { fontSize: barHeight * 0.7 }]}>
              {percentageLabel}
            </Text>
          </View>
        </View>
    
        {/* ------------- SECOND (Overflow) BAR for 100..200% ------------ */}
        {/* ------------- SECOND (Overflow) BAR for 100..200% ------------ */}
        {overflowRatio > 0 && (
          <View
            style={{
              marginTop: barGap - 15, // Fine-tune for pixel-perfect overlap
              width: barWidth,
              height: barHeight,
            }}
          >
            {/* Gray background for the second bar */}
            <View
              style={[
                styles.barBackground,
                {
                  width: barWidth,
                  height: barHeight,
                  borderRadius,
                },
              ]}
            />
            {/* Filled portion for overflow */}
            <View
              style={[
                styles.barOverflow,
                {
                  width: overflowWidth,
                  height: barHeight,
                  borderTopRightRadius: overflowRatio >= 1 ? borderRadius : 0,
                  borderBottomRightRadius: overflowRatio >= 1 ? borderRadius : 0,
                },
              ]}
            />
          </View>
        )}

      </View>
    );
    
};

export default SpecialAttackBar;

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 358,
    left: 212,
    zIndex: 9999,
  },
  barBackground: {
    backgroundColor: 'rgba(136, 136, 136, 0.3)',
    position: 'absolute',
  },
  barForeground: {
    backgroundColor: 'rgba(255, 255, 0, 0.2)', // main portion (yellow)
    position: 'absolute',
  },
  barOverflow: {
    backgroundColor: 'rgba(255, 223, 0, 0.3)', // slightly darker or different color
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

