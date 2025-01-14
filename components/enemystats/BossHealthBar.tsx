import React, { useEffect } from 'react';
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
  const barGap = -16;
  const borderRadius = barHeight / 2;

  // Divide total health into stages
  const stageHealth = maxBossHealth / 3;

  // Calculate health for each stage (top to bottom)
  const thirdStageHealth = Math.min(Math.max(0, currentBossHealth - (2 * stageHealth)), stageHealth);
  const secondStageHealth = Math.min(Math.max(0, currentBossHealth - stageHealth), stageHealth);
  const firstStageHealth = Math.min(currentBossHealth, stageHealth);

  // Calculate bar widths
  const thirdBarWidth = (thirdStageHealth / stageHealth) * barWidth;
  const secondBarWidth = (secondStageHealth / stageHealth) * barWidth;
  const firstBarWidth = (firstStageHealth / stageHealth) * barWidth;

  // Debug logging
  useEffect(() => {
    if (__DEV__) {
      console.warn('Boss Health Bar State:', {
        currentHealth: currentBossHealth,
        maxHealth: maxBossHealth,
        stageHealth,
        stages: {
          first: firstStageHealth,
          second: secondStageHealth,
          third: thirdStageHealth
        },
        widths: {
          first: firstBarWidth,
          second: secondBarWidth,
          third: thirdBarWidth
        }
      });
    }
  }, [currentBossHealth, maxBossHealth, firstBarWidth, secondBarWidth, thirdBarWidth]);

  const labelStr = `${Math.ceil(currentBossHealth)} / ${maxBossHealth}`;

  return (
    <View style={[styles.container, { width: barWidth, height: barHeight * 3 }]}>
      {/* Background */}
      <View
        style={[
          styles.barBackground,
          { width: barWidth, height: barHeight * 3 + barGap * 2 },
        ]}
      />

      {/* Stage 1 Bar (Red) */}
      <View style={[styles.barContainer, { marginTop: 0 }]}>
        <View
          style={[
            styles.firstBar,
            {
              width: firstBarWidth,
              height: barHeight,
              borderRadius: borderRadius,
            },
          ]}
        />
      </View>

      {/* Stage 2 Bar (Yellow) */}
      <View style={[styles.barContainer, { marginTop: barGap }]}>
        <View
          style={[
            styles.secondBar,
            {
              width: secondBarWidth,
              height: barHeight,
              borderRadius: borderRadius,
            },
          ]}
        />
      </View>

      {/* Stage 3 Bar (Green) */}
      <View style={[styles.barContainer, { marginTop: barGap }]}>
        <View
          style={[
            styles.thirdBar,
            {
              width: thirdBarWidth,
              height: barHeight,
              borderRadius: borderRadius,
            },
          ]}
        />
      </View>

      {/* Health Label */}
      <View style={styles.labelContainer}>
        <Text style={[styles.label, { fontSize: barHeight * 0.8 }]}>{labelStr}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 30,
    left: 444,
    zIndex: 9999,
  },
  barContainer: {
    position: 'relative',
    width: '100%',
    height: 16,
    overflow: 'hidden',
  },
  barBackground: {
    position: 'absolute',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 8,
  },
  firstBar: {
    position: 'absolute',
    backgroundColor: '#ff4444',
    left: 0,
  },
  secondBar: {
    position: 'absolute',
    backgroundColor: '#ffff00',
    left: 0,
  },
  thirdBar: {
    position: 'absolute',
    backgroundColor: '#44ff44',
    left: 0,
  },
  labelContainer: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  label: {
    color: '#fff',
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
});

export default BossHealthBar;