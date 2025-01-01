import React from 'react';
import { View, StyleSheet, Text } from 'react-native';

interface BossHealthBarProps {
  currentBossHealth: number;
  maxBossHealth: number;
}

const BossHealthBar: React.FC<BossHealthBarProps> = ({
  currentBossHealth,
  maxBossHealth,
}) => {
  const barWidth = 300;
  const barHeight = 16;
  const barGap = -16; // Overlap similar to SpecialAttackBar
  const borderRadius = barHeight / 2;

  // Divide health into three stages
  const stageHealth = maxBossHealth / 3; // Each stage represents 1/3 of the total health
  const firstStageHealth = Math.min(currentBossHealth, stageHealth);
  const secondStageHealth = Math.max(0, Math.min(currentBossHealth - stageHealth, stageHealth));
  const thirdStageHealth = Math.max(0, currentBossHealth - 2 * stageHealth);

  // Calculate bar widths
  const firstBarWidth = (firstStageHealth / stageHealth) * barWidth;
  const secondBarWidth = (secondStageHealth / stageHealth) * barWidth;
  const thirdBarWidth = (thirdStageHealth / stageHealth) * barWidth;

  const labelStr = `${currentBossHealth} / ${maxBossHealth}`;

  return (
    <View style={[styles.container, { width: barWidth, height: barHeight * 3 }]}>
      {/* Background for the entire health bar system */}
      <View
        style={[
          styles.barBackground,
          { width: barWidth, height: barHeight * 3 + barGap * 2 },
        ]}
      />

      {/* First Bar */}
      <View style={[styles.barContainer, { marginTop: 0 }]}>
        <View
          style={[
            styles.firstBar,
            {
              width: firstBarWidth,
              height: barHeight,
              borderTopLeftRadius: borderRadius,
              borderBottomLeftRadius: borderRadius,
              alignSelf: 'flex-end', // Align the bar to the right
            },
          ]}
        />
      </View>

      {/* Second Bar */}
      <View style={[styles.barContainer, { marginTop: barGap }]}>
        <View
          style={[
            styles.secondBar,
            {
              width: secondBarWidth,
              height: barHeight,
              borderTopLeftRadius: borderRadius,
              borderBottomLeftRadius: borderRadius,
              alignSelf: 'flex-end', // Align the bar to the right
            },
          ]}
        />
      </View>

      {/* Third Bar */}
      <View style={[styles.barContainer, { marginTop: barGap }]}>
        <View
          style={[
            styles.thirdBar,
            {
              width: thirdBarWidth,
              height: barHeight,
              borderTopLeftRadius: borderRadius,
              borderBottomLeftRadius: borderRadius,
              alignSelf: 'flex-end', // Align the bar to the right
            },
          ]}
        />
      </View>

      {/* Label */}
      <View style={styles.labelContainer}>
        <Text style={[styles.label, { fontSize: barHeight * 0.6 }]}>{labelStr}</Text>
      </View>
    </View>
  );
};

export default BossHealthBar;

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 30, // Adjust as needed
    left: 444, // Adjust as needed
    zIndex: 9999,
  },
  barContainer: {
    position: 'relative',
    width: '100%',
    height: 16,
  },
  barBackground: {
    position: 'absolute',
    backgroundColor: 'rgba(136, 136, 136, 0.3)', // Single background for all bars
    borderRadius: 8,
  },
  firstBar: {
    position: 'absolute',
    backgroundColor: 'rgba(128, 128, 128, 1)', 
  },
  secondBar: {
    position: 'absolute',
    backgroundColor: 'rgba(0, 0, 0, 1)', 
  },
  thirdBar: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 105, 180, 1)', 
  },
  labelContainer: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1, // Ensure the label stays above the bars
  },
  label: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
