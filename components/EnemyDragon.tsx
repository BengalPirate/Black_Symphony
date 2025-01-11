import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Sprite from '@/components/Sprite';

interface EnemyDragonProps {
  // The map/world coordinates where the dragon stands
  worldX: number;
  worldY: number;
  // The camera offset from ArcadeScreen (i.e. offsetX, offsetY)
  offsetX: number;
  offsetY: number;

  onUpdateHitbox?: (hitbox: {
    x: number;
    y: number;
    width: number;
    height: number;
  }) => void;
  currentBossHealth?: number;
}

// Each frame in the 3rd row
const frames = [
  { x: 0,   y: 128 },
  { x: 64,  y: 128 },
  { x: 128, y: 128 },
  { x: 192, y: 128 },
];

export default function EnemyDragon({
  worldX,
  worldY,
  offsetX,
  offsetY,
  onUpdateHitbox,
}: EnemyDragonProps) {
  const [frameIndex, setFrameIndex] = useState(0);

  // Animate every 150ms
  useEffect(() => {
    const intervalId = setInterval(() => {
      setFrameIndex(prev => (prev + 1) % frames.length);
    }, 150);
    return () => clearInterval(intervalId);
  }, []);

  // 64×64 frames, let’s display them slightly bigger if you want
  const SPRITE_SIZE = 80;

  // Convert world coordinates into screen coordinates
  const dragonLeft = offsetX + worldX - SPRITE_SIZE / 2;
  const dragonTop  = offsetY + worldY - SPRITE_SIZE / 2;

  // Notify the parent about bounding box
  useEffect(() => {
    onUpdateHitbox?.({
      x: dragonLeft,
      y: dragonTop,
      width: SPRITE_SIZE,
      height: SPRITE_SIZE,
    });
  }, [dragonLeft, dragonTop, onUpdateHitbox]);

  return (
    <View
      style={[
        styles.enemyContainer,
        {
          left: dragonLeft,
          top: dragonTop,
          width: SPRITE_SIZE,
          height: SPRITE_SIZE,
        },
      ]}
    >
      {/* Crop the sub-frame from the sprite sheet */}
      <Sprite
        spriteSheet={require('@/assets/sprites/enemy_sprites/dragon/red_dragon/DRAGON-Sheet.png')}
        x={frames[frameIndex].x}
        y={frames[frameIndex].y}
        width={128}        // Each frame is 64 wide
        height={128}       // Each frame is 64 tall
        sheetWidth={256}
        sheetHeight={512}
        scale={2}         // or 2 for more pixel scaling
      />
    </View>
  );
}

const styles = StyleSheet.create({
  enemyContainer: {
    position: 'absolute',
    zIndex: 9999,
  },
});
