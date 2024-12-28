import React, { useEffect, useState } from 'react';
import { Image, StyleSheet, View, Dimensions } from 'react-native';
import { spriteFrames } from '../assets/sprites/spriteFrames';
import { Direction } from '../constants/types';

interface PlayerProps {
  x: number;        // Not actually used for layout
  y: number;        // Not actually used for layout
  direction: Direction;
  isMoving: boolean;
  isDashing: boolean;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const PLAYER_SIZE = 64;

/**
 * This Player component forcibly draws the sprite in the center
 * of the screen, ignoring x,y for layout because
 * ArcadeScreen shifts the map behind the player.
 */
const Player: React.FC<PlayerProps> = ({
  x,
  y,
  direction,
  isMoving,
  isDashing,
}) => {
  // Get frames for current direction
  const currentFrames = spriteFrames[direction] || spriteFrames.down;

  // Animation index
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

  return (
    <View
      style={[
        styles.playerContainer,
        {
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

export default Player;

/* ------------------------------------------
   Styles
------------------------------------------ */
const styles = StyleSheet.create({
  playerContainer: {
    position: 'absolute',
    zIndex: 9999, // ensure above map
  },
  playerImage: {
    width: PLAYER_SIZE,
    height: PLAYER_SIZE,
  },
});
