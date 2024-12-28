import React, { useEffect, useState } from 'react';
import { Image, StyleSheet, View, Dimensions } from 'react-native';
import { spriteFrames } from '../assets/sprites/spriteFrames';
import { Direction } from '../constants/types';

interface PlayerProps {
  x: number;        // Not used for absolute positioning now
  y: number;        // Not used for absolute positioning now
  direction: Direction;
  isMoving: boolean;
  isDashing: boolean;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const PLAYER_SIZE = 64;

/**
 * This Player component draws the sprite in the center
 * of the screen, ignoring the passed-in x,y for layout
 * (since we shift the map instead).
 */
const Player: React.FC<PlayerProps> = ({
  x,
  y,
  direction,
  isMoving,
  isDashing,
}) => {
  // Frames for the current direction (or default to "down")
  const currentFrames = spriteFrames[direction] || spriteFrames.down;

  const [frameIndex, setFrameIndex] = useState(0);

  useEffect(() => {
    if (isMoving) {
      const interval = setInterval(() => {
        setFrameIndex((prev) => (prev + 1) % currentFrames.length);
      }, 150);
      return () => clearInterval(interval);
    } else {
      // If not moving, use the first frame
      setFrameIndex(0);
    }
  }, [isMoving, currentFrames]);

  return (
    <View
      style={[
        styles.playerContainer,
        {
          // Place the player at the exact center of the screen
          left: SCREEN_WIDTH / 2 - PLAYER_SIZE / 2,
          top: SCREEN_HEIGHT / 2 - PLAYER_SIZE / 2,
        },
      ]}
    >
      <Image
        source={currentFrames[frameIndex]}
        style={styles.playerImage}
        resizeMode="contain"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  playerContainer: {
    position: 'absolute',
    zIndex: 9999,
  },
  playerImage: {
    width: PLAYER_SIZE,
    height: PLAYER_SIZE,
  },
});

export default Player;
