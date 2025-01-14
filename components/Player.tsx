// Player.tsx
import React, { useEffect, useState, useRef } from 'react';
import { View, Dimensions, StyleSheet, ScaledSize, ViewStyle } from 'react-native';
import { Direction } from '../constants/types';
import Sprite from '@/components/Sprite';

// Here's the type for each direction's info
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
  frames: Record<string, DirectionInfo>;
  x: number;
  y: number;
  direction: Direction;
  isMoving: boolean;
  isDashing: boolean;
  worldX: number;
  worldY: number;
  style?: ViewStyle;
  
  // Optional health-related props
  currentHealth?: number;
  maxHealth?: number;
  onHealthChange?: (newHealth: number) => void;
  lastDamagedTime?: number;

  onUpdateHitbox?: (hitbox: {
    x: number;
    y: number;
    width: number;
    height: number;
  }) => void; 
}

interface DimensionsChangePayload {
  window: ScaledSize;
  screen: ScaledSize;
}

const styles = StyleSheet.create({
  playerContainer: {
    position: 'absolute',
    zIndex: 9999, // on top
  },
  hitbox: {
    position: 'absolute',
    left: 0,
    top: 0,
    borderColor: 'green',
    borderWidth: 2,
    opacity: 0.5,
  }
});

export default function Player({
  frames,
  x,
  y,
  direction,
  isMoving,
  isDashing,
  worldX,
  worldY,
  style,
  currentHealth = 100,
  maxHealth = 100,
  onHealthChange = () => {},
  lastDamagedTime = 0,
  onUpdateHitbox,
}: PlayerProps) {
  // Keep track of device dimension, in case it changes
  const [devWidth, setDevWidth] = useState(Dimensions.get('window').width);
  const [devHeight, setDevHeight] = useState(Dimensions.get('window').height);

  // Keep track of last direction so we can idle in that direction
  const [lastDirection, setLastDirection] = useState<Direction>('down');

  // Health regeneration configuration
  const HEALTH_REGEN_DELAY = 5000;   // 5 seconds after taking damage
  const HEALTH_REGEN_RATE = 1;       // 1 health per second
  const HEALTH_REGEN_INTERVAL = 1000; // Check every second

  // Use a ref to track the health regen interval
  const healthRegenIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Device dimensions effect
  useEffect(() => {
    const onChange = ({ window, screen }: DimensionsChangePayload) => {
      setDevWidth(window.width);
      setDevHeight(window.height);
    };
    const subscription = Dimensions.addEventListener('change', onChange);
    return () => subscription.remove();
  }, []);

  // Health regeneration logic
  useEffect(() => {
    // Clear any existing interval
    if (healthRegenIntervalRef.current) {
      clearInterval(healthRegenIntervalRef.current);
    }

    // Check if enough time has passed since last damage and health is not full
    const currentTime = Date.now();
    if (
      currentHealth < maxHealth && 
      currentTime - lastDamagedTime > HEALTH_REGEN_DELAY
    ) {
      // Start regeneration interval
      healthRegenIntervalRef.current = setInterval(() => {
        // Regenerate health, but don't exceed max
        const newHealth = Math.min(
          maxHealth, 
          currentHealth + HEALTH_REGEN_RATE
        );

        // Only update if health has changed
        if (newHealth !== currentHealth) {
          onHealthChange(newHealth);
        }
      }, HEALTH_REGEN_INTERVAL);

      // Cleanup interval on unmount or when health is full
      return () => {
        if (healthRegenIntervalRef.current) {
          clearInterval(healthRegenIntervalRef.current);
        }
      };
    }
  }, [currentHealth, maxHealth, lastDamagedTime, onHealthChange]);

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
    // Use world coordinates for the hitbox
    onUpdateHitbox?.({
      x: worldX,  // Use world coordinates instead of screen coordinates
      y: worldY,
      width: SPRITE_DISPLAY_WIDTH,
      height: SPRITE_DISPLAY_HEIGHT,
    });
  }, [worldX, worldY, onUpdateHitbox]);

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
        style
      ]}
    >
      {/* Hitbox visualization */}
      <View
        style={[
          styles.hitbox,
          {
            width: SPRITE_DISPLAY_WIDTH,
            height: SPRITE_DISPLAY_HEIGHT,
          }
        ]}
      />
      {/* Sprite */}
      <Sprite
        spriteSheet={def.sheet}
        x={frameToShow.x}
        y={frameToShow.y + (frameToShow.yOffset || 0)}
        width={SPRITE_DISPLAY_WIDTH}
        height={SPRITE_DISPLAY_HEIGHT}
        sheetWidth={def.sheetWidth}
        sheetHeight={def.sheetHeight}
        scale={2} // scale=2 => each 32×40 tile becomes 64×80
      />
    </View>
  );
}