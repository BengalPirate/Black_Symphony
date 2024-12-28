import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  PanResponder,
  PanResponderGestureState,
} from 'react-native';

interface JoystickProps {
  /**
   * onMove(dx, dy) => dx, dy ∈ [-1..1]
   *  If user drags up, dy < 0 => "up" in game logic
   */
  onMove: (dx: number, dy: number) => void;
}

const Joystick: React.FC<JoystickProps> = ({ onMove }) => {
  // Track the knob’s raw position: (dx, dy)
  const [knobPos, setKnobPos] = useState({ x: 0, y: 0 });

  // The maximum radius the knob can travel from the center
  const MAX_RADIUS = 50;

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,

    onPanResponderMove: (_, gesture: PanResponderGestureState) => {
      // Raw gesture deltas
      let { dx, dy } = gesture;

      // Constrain within a circle of radius 50
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > MAX_RADIUS) {
        const ratio = MAX_RADIUS / dist;
        dx *= ratio;
        dy *= ratio;
      }

      // Store the knob position (dy < 0 if user drags up)
      setKnobPos({ x: dx, y: dy });

      // Normalize to range [-1..1]
      const normX = dx / MAX_RADIUS;
      const normY = dy / MAX_RADIUS; // negative if user drags up

      // Pass to parent so your game sees negative y for "up"
      onMove(normX, normY);
    },

    onPanResponderRelease: () => {
      // Reset to center
      setKnobPos({ x: 0, y: 0 });
      onMove(0, 0);
    },
  });

  return (
    <View style={styles.container}>
      <View
        {...panResponder.panHandlers}
        style={[
          styles.knob,
          {
            // Flip the y-axis visually so negative y moves knob up on screen
            transform: [
              { translateX: knobPos.x },
              { translateY: -knobPos.y },
            ],
          },
        ]}
      />
    </View>
  );
};

export default Joystick;

/* ------------------------------------------------
   Styles
------------------------------------------------ */
const styles = StyleSheet.create({
  container: {
    width: 100,
    height: 100,
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  knob: {
    width: 50,
    height: 50,
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: 25,
  },
});
