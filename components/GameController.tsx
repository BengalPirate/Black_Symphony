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
  onMelee: () => void;
};

const JOYSTICK_SIZE = 100;
const KNOB_SIZE = 50;
const MAX_RADIUS = (JOYSTICK_SIZE - KNOB_SIZE) / 2;

/**
 * Convert angle (in degrees) to a Direction.
 * angle=0 => 'right', +90 => 'down', -90 => 'up', ±180 => 'left'
 */
const getDirectionFromAngle = (angleDeg: number): Direction => {
  let angle = angleDeg;
  // Normalize angle to -180..180
  while (angle > 180) angle -= 360;
  while (angle < -180) angle += 360;

  if (angle > -22.5 && angle <= 22.5) return 'right';
  if (angle > 22.5 && angle <= 67.5) return 'southeast';
  if (angle > 67.5 && angle <= 112.5) return 'down';
  if (angle > 112.5 && angle <= 157.5) return 'southwest';
  if (angle > 157.5 || angle <= -157.5) return 'left';
  if (angle > -157.5 && angle <= -112.5) return 'northwest';
  if (angle > -112.5 && angle <= -67.5) return 'up';
  if (angle > -67.5 && angle <= -22.5) return 'northeast';
  return 'down';
};

const GameController: React.FC<GameControllerProps> = ({
  onMove,
  onShoot,
  onDash,
  onSpecial,
  onUseItem,
  onMelee
}) => {
  // Movement joystick knob
  const [movementKnobX, setMovementKnobX] = useState(0);
  const [movementKnobY, setMovementKnobY] = useState(0);

  // Shooting joystick knob
  const [shootKnobX, setShootKnobX] = useState(0);
  const [shootKnobY, setShootKnobY] = useState(0);

  /* ------------------ Movement Joystick ------------------ */
  const movementPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gesture: PanResponderGestureState) => {
        let dx = gesture.dx;
        let dy = gesture.dy;

        // Constrain knob within MAX_RADIUS
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > MAX_RADIUS) {
          const ratio = MAX_RADIUS / dist;
          dx *= ratio;
          dy *= ratio;
        }

        setMovementKnobX(dx);
        setMovementKnobY(dy);

        // Normalize => [-1..1]
        const normDx = dx / MAX_RADIUS;
        const normDy = dy / MAX_RADIUS;

        // Convert angle => direction
        const angle = Math.atan2(normDy, normDx) * (180 / Math.PI);
        const direction = getDirectionFromAngle(angle);

        onMove(normDx, normDy, direction);
      },
      onPanResponderRelease: () => {
        setMovementKnobX(0);
        setMovementKnobY(0);
        onMove(0, 0, 'down');
      },
    })
  ).current;

  /* ------------------ Shooting Joystick ------------------ */
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

        const normDx = dx / MAX_RADIUS;
        const normDy = dy / MAX_RADIUS;
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
      {/* Movement Joystick (bottom-left) */}
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

      {/* Shooting Joystick (bottom-right) */}
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

      {/**
       * Action Buttons
       * We place them near bottom-left, but you can adjust bottom/right 
       * to move them more to the right or left.
       * 
       * below:
       * bottom: 15 (close to bottom)
       * right: 60 (moved from 120 → 60 to push them further to the right)
       */}
      <View style={styles.actionButtonsContainer}>
        <TouchableOpacity style={[styles.button, styles.topButton]} onPress={onSpecial}>
          <Text style={styles.buttonText}>Special</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, styles.leftButton]} onPress={onDash}>
          <Text style={styles.buttonText}>Dash</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, styles.meleeButton]} onPress={onMelee}>
          <Text style={styles.buttonText}>Melee</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, styles.rightButton]} onPress={onUseItem}>
          <Text style={styles.buttonText}>Use</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default GameController;

/* ----------------------------------------------------------------
   Styles
---------------------------------------------------------------- */
const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    zIndex: 999,
    width: '100%',
    height: '100%',
  },

  // Movement Joystick (bottom-left)
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

  // Shooting Joystick (bottom-right)
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

  /**
   * Action Buttons container:
   *  - bottom: 15 => near the bottom edge
   *  - right: 60 => moved more to the right side 
   *                (the smaller this value, the farther to the right it goes)
   */
  actionButtonsContainer: {
    position: 'absolute',
    bottom: 15,
    right: 40, 
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

  // "Special" at top:0, left:70
  topButton: {
    position: 'absolute',
    top: 0,
    left: 75,
  },

  // "Dash" at top:70, left:0
  leftButton: {
    position: 'absolute',
    left: 20,
    top: 60,
  },

  // "Melee" - new: place it below dash, so top: ~130
  meleeButton: {
    position: 'absolute',
    left: 20,
    top: 130,
  },

  // "Use" horizontally aligned with "Special"
  rightButton: {
    position: 'absolute',
    top: 8,
    left: 150,
  },
});
