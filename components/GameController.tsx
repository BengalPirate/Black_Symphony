import React, { useRef, useState } from 'react';
import { View, StyleSheet, PanResponder, PanResponderGestureState } from 'react-native';

interface GameControllerProps {
  onMove: (dx: number, dy: number) => void;
  onShoot?: () => void;
  onMelee?: () => void;
  onDash?: () => void;
}

const JOYSTICK_SIZE = 100; 
const KNOB_SIZE = 50;     
const MAX_RADIUS = (JOYSTICK_SIZE - KNOB_SIZE) / 2;

export default function GameController({ onMove }: GameControllerProps) {
  const [knobX, setKnobX] = useState(0);
  const [knobY, setKnobY] = useState(0);

  // The center of the joystick is fixed at (0,0) for our calculations.
  // We'll translate our knob from the center. PanResponder gives dx, dy since gesture start.
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        // When the user first touches, we reset knob to center (0,0)
        setKnobX(0);
        setKnobY(0);
        onMove(0, 0);
      },
      onPanResponderMove: (e, gestureState: PanResponderGestureState) => {
        // gestureState.dx, gestureState.dy are displacement from initial touch
        let dx = gestureState.dx;
        let dy = gestureState.dy;

        // Clamp to MAX_RADIUS
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance > MAX_RADIUS) {
          const ratio = MAX_RADIUS / distance;
          dx *= ratio;
          dy *= ratio;
        }

        setKnobX(dx);
        setKnobY(dy);

        // Normalize to [-1, 1]
        const normalizedDX = dx / MAX_RADIUS;
        const normalizedDY = dy / MAX_RADIUS;
        onMove(normalizedDX, normalizedDY);
      },
      onPanResponderRelease: () => {
        // Return knob to center on release
        setKnobX(0);
        setKnobY(0);
        onMove(0, 0);
      },
      onPanResponderTerminate: () => {
        // Same as release if gesture is interrupted
        setKnobX(0);
        setKnobY(0);
        onMove(0, 0);
      },
    })
  ).current;

  return (
    <View style={styles.container} pointerEvents="box-none">
      <View style={styles.joystickContainer} {...panResponder.panHandlers}>
        <View
          style={[
            styles.knob,
            {
              transform: [
                { translateX: knobX },
                { translateY: knobY }
              ],
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 50,
    left: 50,
    zIndex: 999,
  },
  joystickContainer: {
    width: JOYSTICK_SIZE,
    height: JOYSTICK_SIZE,
    borderRadius: JOYSTICK_SIZE / 2,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  knob: {
    width: KNOB_SIZE,
    height: KNOB_SIZE,
    borderRadius: KNOB_SIZE / 2,
    backgroundColor: 'rgba(0,0,0,0.6)',
    position: 'absolute',
  },
});
