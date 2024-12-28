import React, { useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  PanResponder,
  PanResponderGestureState,
  Text,
  TouchableOpacity,
} from 'react-native';
import { Direction } from '../constants/types';

type GameControllerProps = {
  onMove: (dx: number, dy: number, direction: Direction) => void;
  onShoot: (dx: number, dy: number) => void;
  onDash: () => void;
  onSpecial: () => void;
  onUseItem: () => void;
};

const JOYSTICK_SIZE = 100;
const KNOB_SIZE = 50;
const MAX_RADIUS = (JOYSTICK_SIZE - KNOB_SIZE) / 2;

/**
 * Convert angle (in degrees) to a Direction.
 * angle=0 => 'right', angle=+90 => 'down', angle=-90 => 'up', ±180 => 'left'
 */
const getDirectionFromAngle = (angleDeg: number): Direction => {
  let angle = angleDeg;
  if (angle > 180) angle -= 360;
  if (angle < -180) angle += 360;

  if (angle >= -22.5 && angle <= 22.5) return 'right';         // ~0°
  if (angle > 22.5 && angle <= 67.5) return 'southeast';       // +45°
  if (angle > 67.5 && angle <= 112.5) return 'down';           // +90°
  if (angle > 112.5 && angle <= 157.5) return 'southwest';     // +135°
  if (angle > 157.5 || angle <= -157.5) return 'left';         // ±180°
  if (angle > -157.5 && angle <= -112.5) return 'northwest';   // -135°
  if (angle > -112.5 && angle <= -67.5) return 'up';           // -90°
  if (angle > -67.5 && angle <= -22.5) return 'northeast';      // -45°
  return 'down';
};

const GameController: React.FC<GameControllerProps> = ({
  onMove,
  onShoot,
  onDash,
  onSpecial,
  onUseItem,
}) => {
  // State for movement joystick knob
  const [movementKnobX, setMovementKnobX] = useState(0);
  const [movementKnobY, setMovementKnobY] = useState(0);

  // State for shooting joystick knob
  const [shootKnobX, setShootKnobX] = useState(0);
  const [shootKnobY, setShootKnobY] = useState(0);

  // ——————————————————— Movement Joystick ———————————————————
  const movementPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        // Could reset or do something on press
      },
      onPanResponderMove: (_, gesture: PanResponderGestureState) => {
        // Flip the gesture.dy if you want physically dragging up => negative
        let dx = gesture.dx;
        let dy = gesture.dy;

        // Constrain knob movement
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > MAX_RADIUS) {
          const ratio = MAX_RADIUS / dist;
          dx *= ratio;
          dy *= ratio;
        }

        // Update joystick knob position visually
        setMovementKnobX(dx);
        setMovementKnobY(dy);

        // Normalize for your game logic
        const normDx = dx / MAX_RADIUS;
        const normDy = dy / MAX_RADIUS;

        // Convert to angle => direction
        const angle = Math.atan2(normDy, normDx) * (180 / Math.PI);
        const direction = getDirectionFromAngle(angle);

        // Callback to parent
        onMove(normDx, normDy, direction);
      },
      onPanResponderRelease: () => {
        // Return knob to center
        setMovementKnobX(0);
        setMovementKnobY(0);
        // Stop movement in parent
        onMove(0, 0, 'down');
      },
    })
  ).current;

  // ——————————————————— Shooting Joystick ———————————————————
  const shootPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        setShootKnobX(0);
        setShootKnobY(0);
      },
      onPanResponderMove: (_, gesture: PanResponderGestureState) => {
        let dx = gesture.dx;
        let dy = gesture.dy;

        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > MAX_RADIUS) {
          const ratio = MAX_RADIUS / dist;
          dx *= ratio;
          dy *= ratio;
        }

        setShootKnobX(dx);
        setShootKnobY(dy);

        // Normalized
        const normDx = dx / MAX_RADIUS;
        const normDy = dy / MAX_RADIUS;

        // Callback for shooting direction
        onShoot(normDx, normDy);
      },
      onPanResponderRelease: () => {
        setShootKnobX(0);
        setShootKnobY(0);
        onShoot(0, 0);
      },
    })
  ).current;

  return (
    <View style={styles.container}>

      {/* Movement Joystick at bottom-left */}
      <View
        style={styles.movementJoystickContainer}
        {...movementPanResponder.panHandlers}
      >
        <View
          style={[
            styles.knob,
            {
              transform: [
                { translateX: movementKnobX },
                { translateY: movementKnobY },
              ],
            },
          ]}
        />
      </View>

      {/* Shooting Joystick at bottom-right */}
      <View
        style={styles.shootingJoystickContainer}
        {...shootPanResponder.panHandlers}
      >
        <View
          style={[
            styles.knob,
            {
              transform: [
                { translateX: shootKnobX },
                { translateY: shootKnobY },
              ],
            },
          ]}
        />
      </View>

      {/* Example Action Buttons */}
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

export default GameController;

/* ---------------------------------------------------
   Styles
--------------------------------------------------- */
const styles = StyleSheet.create({
  container: {
    // This container is absolutely covering the screen
    // so joysticks appear on top of the game world
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
    // Additional UI buttons in a diamond or some layout
    position: 'absolute',
    bottom: 200,
    right: 100,
    width: 200,
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
  bottomButton: {
    position: 'absolute',
    bottom: 0,
    left: 70,
  },
});
