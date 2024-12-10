import React, { useState } from 'react';
import { PanResponder, View, StyleSheet } from 'react-native';

interface JoystickProps {
  onMove: (dx: number, dy: number) => void;
}

const Joystick: React.FC<JoystickProps> = ({ onMove }) => {
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderMove: (_, gesture) => {
      const dx = Math.min(Math.max(gesture.dx, -50), 50);
      const dy = Math.min(Math.max(gesture.dy, -50), 50);
      setOffset({ x: dx, y: dy });
      onMove(dx / 50, dy / 50); // Scale the movement
    },
    onPanResponderRelease: () => setOffset({ x: 0, y: 0 }),
  });

  return (
    <View style={styles.joystickContainer}>
      <View
        {...panResponder.panHandlers}
        style={[
          styles.joystick,
          { transform: [{ translateX: offset.x }, { translateY: offset.y }] },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  joystickContainer: {
    width: 100,
    height: 100,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 50,
    left: 50,
  },
  joystick: {
    width: 50,
    height: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 25,
  },
});

export default Joystick;
