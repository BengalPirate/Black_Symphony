// SpecialAttackBar.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';

interface SpecialAttackBarProps {
  currentSpecial: number;
  maxSpecial: number;
}

const SpecialAttackBar: React.FC<SpecialAttackBarProps> = ({
  currentSpecial,
  maxSpecial,
}) => {
  const barWidth = 200;
  const barHeight = 12;
  const borderRadius = barHeight / 2; // To make the height fully rounded
  
  // Calculate how 'full' the special bar is
  const specialRatio = currentSpecial / maxSpecial;
  const specialWidth = barWidth * Math.max(0, Math.min(specialRatio, 1));

  return (
    <View style={[styles.container, { width: barWidth, height: barHeight }]}>
      {/* Background of the bar */}
      <View
        style={[
          styles.background,
          { width: barWidth, height: barHeight, borderRadius },
        ]}
      />
      {/* Foreground / filled portion */}
      <View
        style={[
          styles.foreground,
          {
            width: specialWidth,
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
    top: 348, // Adjust as needed (below HealthBar & StaminaBar)
    left: 232,
    zIndex: 9999,
  },
  background: {
    backgroundColor: '#888', // Bar "empty" color
    position: 'absolute',
  },
  foreground: {
    backgroundColor: 'yellow', // Bar "filled" color (change to your preference)
    position: 'absolute',
  },
});

export default SpecialAttackBar;
