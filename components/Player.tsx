/*
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
 *
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
------------------------------------------ *
const styles = StyleSheet.create({
  playerContainer: {
    position: 'absolute',
    zIndex: 9999, // ensure above map
  },
  playerImage: {
    width: PLAYER_SIZE,
    height: PLAYER_SIZE,
  },
});*/
import React, { useEffect, useState } from 'react';
import {
  View,
  Dimensions,
  StyleSheet,
  ScaledSize,
  Platform,
  Image,
} from 'react-native';
import { Direction } from '../constants/types';
import { spriteFrames } from '../assets/sprites/spriteFrames'; // or wherever your frames live

interface PlayerProps {
  x: number;
  y: number;
  direction: Direction;
  isMoving: boolean;
  isDashing: boolean;
  // Optional: to log parent "world coords" in debug
  worldX?: number;
  worldY?: number;
}

interface DimensionsChangePayload {
  window: ScaledSize;
  screen: ScaledSize;
}

export default function Player({
  x,
  y,
  direction,
  isMoving,
  isDashing,
  worldX,
  worldY,
}: PlayerProps) {
  // Keep track of device dimension, in case it changes
  const [devWidth, setDevWidth] = useState(Dimensions.get('window').width);
  const [devHeight, setDevHeight] = useState(Dimensions.get('window').height);

  // We store the current frames for the direction
  const frames = spriteFrames[direction] || spriteFrames.down;

  // Simple animation index
  const [frameIndex, setFrameIndex] = useState(0);

  // Listen for dimension changes (modern approach)
  useEffect(() => {
    const onChange = ({ window, screen }: DimensionsChangePayload) => {
      console.log(
        `[Player] Dimensions changed => window=${window.width}x${window.height}, screen=${screen.width}x${screen.height}, platform=${Platform.OS}`
      );
      setDevWidth(window.width);
      setDevHeight(window.height);
    };
    const subscription = Dimensions.addEventListener('change', onChange);
    return () => subscription.remove();
  }, []);

  // Log props each time something changes
  useEffect(() => {
    console.log(
      `[Player Debug] props=(x=${x}, y=${y}), dir=${direction}, isMoving=${isMoving}, isDashing=${isDashing}, world=(${worldX},${worldY}), deviceW=${devWidth}, deviceH=${devHeight}`
    );
  }, [x, y, direction, isMoving, isDashing, worldX, worldY, devWidth, devHeight]);

  // If isMoving, cycle frames every 150 ms; else revert to frame 0
  useEffect(() => {
    if (isMoving) {
      const interval = setInterval(() => {
        setFrameIndex((prev) => (prev + 1) % frames.length);
      }, 150);
      return () => clearInterval(interval);
    } else {
      setFrameIndex(0);
    }
  }, [isMoving, frames]);

  // Decide how big the sprite is
  const SPRITE_SIZE = 64;

  // Place sprite at device center
  const spriteLeft = devWidth / 2 - SPRITE_SIZE / 2;
  const spriteTop  = devHeight / 2 - SPRITE_SIZE / 2;

  return (
    <View
      style={[
        styles.playerContainer,
        {
          left: spriteLeft,
          top: spriteTop,
        },
      ]}
    >
      <Image
        source={frames[frameIndex]}
        style={styles.spriteImage}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  playerContainer: {
    position: 'absolute',
    zIndex: 9999, // ensure on top of map/polygons
  },
  spriteImage: {
    width: 64,
    height: 64,
  },
});
