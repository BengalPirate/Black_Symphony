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
  // (Optional) pass a callback to tell the parent about the player's bounding box:
  onUpdateHitbox?: (hitbox: { x: number; y: number; width: number; height: number }) => void;
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
  onUpdateHitbox,
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
  const SPRITE_SIZE = 50;

  // Place sprite at device center
  const spriteLeft = devWidth / 2 - SPRITE_SIZE / 2;
  const spriteTop  = devHeight / 2 - SPRITE_SIZE / 2;

  // Notify the parent about our bounding box if desired:
  useEffect(() => {
    onUpdateHitbox?.({
      x: spriteLeft,
      y: spriteTop,
      width: SPRITE_SIZE,
      height: SPRITE_SIZE,
    });
  }, [spriteLeft, spriteTop, onUpdateHitbox]);

  return (
    <View
      style={[
        styles.playerContainer,
        {
          left: spriteLeft,
          top: spriteTop,
          width: SPRITE_SIZE,
          height: SPRITE_SIZE,
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
    width: 50,
    height: 50,
  },
});
