import React, { useRef, useState } from 'react';
import { View, StyleSheet, PanResponder, PanResponderGestureState, Text, TouchableOpacity } from 'react-native';
import { Direction } from '../constants/types';

type GameControllerProps = {
  onMove: (dx: number, dy: number, direction: Direction) => void;
  onShoot: (dx: number, dy: number) => void; // Shooting joystick handler
  onDash: () => void;
  onSpecial: () => void;
  onUseItem: () => void;
};

const JOYSTICK_SIZE = 100;
const KNOB_SIZE = 50;
const MAX_RADIUS = (JOYSTICK_SIZE - KNOB_SIZE) / 2;

const GameController: React.FC<GameControllerProps> = ({
  onMove,
  onShoot,
  onDash,
  onSpecial,
  onUseItem,
}) => {
  const [movementKnobX, setMovementKnobX] = useState(0);
  const [movementKnobY, setMovementKnobY] = useState(0);
  const [shootKnobX, setShootKnobX] = useState(0);
  const [shootKnobY, setShootKnobY] = useState(0);

  // Utility to determine direction from angle
  const getDirectionFromAngle = (angle: number): Direction => {
    if (angle >= -22.5 && angle <= 22.5) return 'right';
    if (angle > 22.5 && angle <= 67.5) return 'northeast';
    if (angle > 67.5 && angle <= 112.5) return 'up';
    if (angle > 112.5 && angle <= 157.5) return 'northwest';
    if (angle > 157.5 || angle <= -157.5) return 'left';
    if (angle > -157.5 && angle <= -112.5) return 'southwest';
    if (angle > -112.5 && angle <= -67.5) return 'down';
    if (angle > -67.5 && angle <= -22.5) return 'southeast';
    return 'down';
  };

  // PanResponder for movement joystick
  const movementPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        setMovementKnobX(0);
        setMovementKnobY(0);
        onMove(0, 0, 'down');
      },
      onPanResponderMove: (e, gestureState: PanResponderGestureState) => {
        let dx = gestureState.dx;
        let dy = -gestureState.dy; // Flip Y-axis for screen space

        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance > MAX_RADIUS) {
          const ratio = MAX_RADIUS / distance;
          dx *= ratio;
          dy *= ratio;
        }

        setMovementKnobX(dx);
        setMovementKnobY(dy);

        const normalizedDX = dx / MAX_RADIUS;
        const normalizedDY = dy / MAX_RADIUS;

        const angle = Math.atan2(normalizedDY, normalizedDX) * (180 / Math.PI);
        const direction = getDirectionFromAngle(angle);

        onMove(normalizedDX, normalizedDY, direction);
      },
      onPanResponderRelease: () => {
        setMovementKnobX(0);
        setMovementKnobY(0);
        onMove(0, 0, 'down');
      },
    })
  ).current;

  // PanResponder for shooting joystick
  // Shooting Joystick
  const shootPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        setShootKnobX(0);
        setShootKnobY(0);
        onShoot(0, 0); // Stop shooting on release
      },
      onPanResponderMove: (e, gestureState: PanResponderGestureState) => {
        let dx = gestureState.dx;
        let dy = -gestureState.dy; // Flip Y-axis

        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance > MAX_RADIUS) {
          const ratio = MAX_RADIUS / distance;
          dx *= ratio;
          dy *= ratio;
        }

        setShootKnobX(dx);
        setShootKnobY(dy);

        const normalizedDX = dx / MAX_RADIUS;
        const normalizedDY = dy / MAX_RADIUS;

        onShoot(normalizedDX, normalizedDY); // Send normalized values
      },
      onPanResponderRelease: () => {
        setShootKnobX(0);
        setShootKnobY(0);
        onShoot(0, 0); // Stop shooting on release
      },
    })
  ).current;


  return (
    <View style={styles.container}>
      {/* Movement Joystick */}
      <View style={styles.movementJoystickContainer} {...movementPanResponder.panHandlers}>
        <View
          style={[
            styles.knob,
            {
              transform: [{ translateX: movementKnobX }, { translateY: movementKnobY }],
            },
          ]}
        />
      </View>

      {/* Shooting Joystick */}
      <View style={styles.shootingJoystickContainer} {...shootPanResponder.panHandlers}>
        <View
          style={[
            styles.knob,
            {
              transform: [{ translateX: shootKnobX }, { translateY: shootKnobY }],
            },
          ]}
        />
      </View>

      {/* Diamond Layout Buttons */}
      <View style={styles.actionButtonsContainer}>
        <TouchableOpacity style={[styles.button, styles.topButton]} onPress={onSpecial}>
          <Text style={styles.buttonText}>Special</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.leftButton]} onPress={onDash}>
          <Text style={styles.buttonText}>Dash</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.bottomButton]} onPress={onUseItem}>
          <Text style={styles.buttonText}>Use</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'absolute',
    zIndex: 999,
    width: '100%',
    height: '100%',
  },
  movementJoystickContainer: {
    position: 'absolute',
    bottom: 50,
    left: 50,
    width: JOYSTICK_SIZE,
    height: JOYSTICK_SIZE,
    borderRadius: JOYSTICK_SIZE / 2,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shootingJoystickContainer: {
    position: 'absolute',
    bottom: 50,
    right: 50,
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
  },
  actionButtonsContainer: {
    position: 'absolute',
    bottom: 200,
    right: 100,
    width: 200, // Ensure enough space for a diamond layout
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#000',
    fontSize: 12,
  },
  topButton: {
    position: 'absolute',
    top: 0,
    left: 70,
  },
  leftButton: {
    position: 'absolute',
    left: 0,
    top: 70,
  },
  rightButton: {
    position: 'absolute',
    right: 0,
    top: 70,
  },
  bottomButton: {
    position: 'absolute',
    bottom: 0,
    left: 70,
  },
});


export default GameController;
