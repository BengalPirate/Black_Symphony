// Player.tsx
import React, { useEffect, useState } from 'react';
import { View, Dimensions, StyleSheet, ScaledSize } from 'react-native';
import { Direction } from '../constants/types';
import Sprite from '@/components/Sprite';

// Here’s the type for each direction’s info
interface Frame {
  x: number;
  y: number;
  yOffset?: number;
}
interface DirectionInfo {
  sheet: any;              // e.g. require('mage1.png')
  frames: Frame[];         // run frames
  idle?: Frame;            // optional idle frame
  sheetWidth: number;
  sheetHeight: number;
}
// So frames is a dictionary: { 'down': DirectionInfo, 'up': DirectionInfo, ... }
type FramesDictionary = Record<string, DirectionInfo>;

interface PlayerProps {
  frames: FramesDictionary;  // <--- We now accept the full frames object
  x: number;
  y: number;
  direction: Direction;
  isMoving: boolean;
  isDashing: boolean;
  worldX?: number;
  worldY?: number;
  onUpdateHitbox?: (hitbox: { x: number; y: number; width: number; height: number }) => void;
}

interface DimensionsChangePayload {
  window: ScaledSize;
  screen: ScaledSize;
}

export default function Player({
  frames,
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

  // Keep track of last direction so we can idle in that direction
  const [lastDirection, setLastDirection] = useState<Direction>('down');

  useEffect(() => {
    const onChange = ({ window, screen }: DimensionsChangePayload) => {
      setDevWidth(window.width);
      setDevHeight(window.height);
    };
    const subscription = Dimensions.addEventListener('change', onChange);
    return () => subscription.remove();
  }, []);

  // If moving, update last direction
  useEffect(() => {
    if (isMoving) {
      setLastDirection(direction);
    }
  }, [direction, isMoving]);

  // Actual direction is lastDirection if not moving
  const actualDirection = isMoving ? direction : lastDirection;

  // Lookup frames for that direction
  const def = frames[actualDirection] || frames['down'];
  const runFrames = def.frames;
  const idleFrame = def.idle;

  // Simple animation index
  const [frameIndex, setFrameIndex] = useState(0);

  useEffect(() => {
    if (isMoving && runFrames.length > 1) {
      const intId = setInterval(() => {
        setFrameIndex((prev) => (prev + 1) % runFrames.length);
      }, 120);
      return () => clearInterval(intId);
    } else {
      setFrameIndex(0);
    }
  }, [isMoving, runFrames]);

  // Decide how big the sprite is on-screen
  const SPRITE_DISPLAY_WIDTH = 64;
  const SPRITE_DISPLAY_HEIGHT = 80;

  // Position the sprite at device center
  const spriteLeft = devWidth / 2 - SPRITE_DISPLAY_WIDTH / 2;
  const spriteTop  = devHeight / 2 - SPRITE_DISPLAY_HEIGHT / 2;

  // Provide bounding box if needed
  useEffect(() => {
    onUpdateHitbox?.({
      x: spriteLeft,
      y: spriteTop,
      width: SPRITE_DISPLAY_WIDTH,
      height: SPRITE_DISPLAY_HEIGHT,
    });
  }, [spriteLeft, spriteTop, onUpdateHitbox]);

  // If idle, show idleFrame; otherwise pick runFrames[frameIndex]
  let frameToShow: Frame;
  if (!isMoving && idleFrame) {
    frameToShow = idleFrame;
  } else if (!isMoving) {
    frameToShow = runFrames[0];
  } else {
    frameToShow = runFrames[frameIndex];
  }

  return (
    <View
      style={[
        styles.playerContainer,
        {
          left: spriteLeft,
          top: spriteTop,
          width: SPRITE_DISPLAY_WIDTH,
          height: SPRITE_DISPLAY_HEIGHT,
        },
      ]}
    >
      <Sprite
        spriteSheet={def.sheet}
        x={frameToShow.x}
        y={frameToShow.y + (frameToShow.yOffset || 0)}
        width={SPRITE_DISPLAY_WIDTH}
        height={SPRITE_DISPLAY_HEIGHT}
        sheetWidth={def.sheetWidth}
        sheetHeight={def.sheetHeight}
        // scale=2 => each 32×40 tile becomes 64×80
        scale={2}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  playerContainer: {
    position: 'absolute',
    zIndex: 9999, // on top
  },
});
