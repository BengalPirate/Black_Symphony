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
  const barHeight = 10;
  
  // Calculate how 'full' the special bar is
  const specialRatio = currentSpecial / maxSpecial;
  const specialWidth = barWidth * Math.max(0, Math.min(specialRatio, 1));

  return (
    <View style={[styles.container, { width: barWidth, height: barHeight }]}>
      {/* Background of the bar */}
      <View style={[styles.background, { width: barWidth, height: barHeight }]} />
      {/* Foreground / filled portion */}
      <View
        style={[
          styles.foreground,
          { width: specialWidth, height: barHeight },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60, // Adjust as needed (below HealthBar & StaminaBar)
    left: 20,
    zIndex: 9999,
  },
  background: {
    backgroundColor: '#888', // Bar "empty" color
    position: 'absolute',
  },
  foreground: {
    backgroundColor: 'purple', // Bar "filled" color (change to your preference)
    position: 'absolute',
  },
});

export default SpecialAttackBar;
