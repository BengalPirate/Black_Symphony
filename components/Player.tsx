/*import React, { useEffect, useState } from 'react';
import { Image, StyleSheet, View, ImageSourcePropType, ViewStyle } from 'react-native';
import { spriteFrames } from '../assets/sprites/spriteFrames';

interface PlayerProps {
  x: number;
  y: number;
  direction: string; // "up", "down", "left", "right", etc.
  isMoving: boolean; // Detect movement
  isDashing: boolean;
  style?: ViewStyle;
}

const PLAYER_SIZE = 64; // Adjust size for your sprites

const Player: React.FC<PlayerProps> = ({ x, y, direction, isMoving, isDashing, style }) => {
  const directionsMap: Record<string, ImageSourcePropType[]> = spriteFrames;

  const [frameIndex, setFrameIndex] = useState(0);
  const currentFrames = directionsMap[direction] || directionsMap['down']; // Default to "down" direction

  useEffect(() => {
    if (isMoving) {
      // Only animate when moving
      const interval = setInterval(() => {
        setFrameIndex((prev) => (prev + 1) % currentFrames.length);
      }, 150); // Adjust animation speed in ms

      return () => clearInterval(interval); // Clean up interval on unmount
    } else {
      setFrameIndex(0); // Default to the first frame when not moving
    }
  }, [isMoving, direction, currentFrames]);

  const currentFrame = currentFrames[frameIndex];

  return (
    <View
      style={[
        styles.playerContainer,
        {
          left: x - PLAYER_SIZE / 2,
          top: y - PLAYER_SIZE / 2,
        },
        style, // Apply additional styles like zIndex
      ]}
    >
      <Image source={require('../assets/sprites/frames/down1.png')} style={styles.playerImage} />
      {isDashing && (
        // Optionally draw a glow or afterimage to indicate dashing
        <View style={styles.dashEffect} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  playerContainer: {
    position: 'absolute',
  },
  playerImage: {
    width: PLAYER_SIZE,
    height: PLAYER_SIZE,
  },
  dashEffect: {
    position: 'absolute',
    width: PLAYER_SIZE,
    height: PLAYER_SIZE,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: PLAYER_SIZE / 2,
  },
});

export { PLAYER_SIZE };
export default Player;
*/
import React, { useEffect, useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { spriteFrames } from '../assets/sprites/spriteFrames';
import { Direction } from '../constants/types'

interface PlayerProps {
  x: number;
  y: number;
  direction: Direction; // Use the defined Direction type
  isMoving: boolean;
  isDashing: boolean;
}

const PLAYER_SIZE = 64;

const Player: React.FC<PlayerProps> = ({ x, y, direction, isMoving, isDashing }) => {
  const currentFrames = spriteFrames[direction] || spriteFrames['down'];

  const [frameIndex, setFrameIndex] = useState(0);

  useEffect(() => {
    if (isMoving) {
      const interval = setInterval(() => {
        setFrameIndex((prev) => (prev + 1) % currentFrames.length);
      }, 150);

      return () => clearInterval(interval);
    } else {
      setFrameIndex(0);
    }
  }, [isMoving, currentFrames]);

  console.log('Player Props:', { x, y, direction, isMoving, isDashing });
  console.log('Current Frame:', currentFrames[frameIndex]);

  return (
    <View
      style={[
        styles.playerContainer,
        {
          left: x - PLAYER_SIZE / 2,
          top: y - PLAYER_SIZE / 2,
        },
      ]}
    >
      <Image source={currentFrames[frameIndex]} style={styles.playerImage} />
    </View>
  );
};

const styles = StyleSheet.create({
  playerContainer: {
    position: 'absolute',
  },
  playerImage: {
    width: PLAYER_SIZE,
    height: PLAYER_SIZE,
  },
});

export default Player;
