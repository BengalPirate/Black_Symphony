// PlayerProjectile.tsx
import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';

interface PlayerProjectileProps {
  startX: number;
  startY: number;
  velocityX: number;
  velocityY: number;
  speed: number;
  onRemove: () => void;
  offsetX: number;
  offsetY: number;
  // NEW PROPS: The map's real boundaries
  mapWidth: number;
  mapHeight: number;
}

export default function PlayerProjectile({
  startX,
  startY,
  velocityX,
  velocityY,
  speed,
  onRemove,
  offsetX,
  offsetY,
  mapWidth,
  mapHeight,
}: PlayerProjectileProps) {
  // Store position in world coords
  const [pos, setPos] = useState({ x: startX, y: startY });

  // Move the projectile in world space
  useEffect(() => {
    const interval = setInterval(() => {
      setPos((prev) => ({
        x: prev.x + velocityX * speed,
        y: prev.y + velocityY * speed,
      }));
    }, 16); // ~60FPS
    return () => clearInterval(interval);
  }, [velocityX, velocityY, speed]);

  // Remove if out of the map boundaries
  useEffect(() => {
    // If projectile is outside the map, remove it
    if (pos.x < 0 || pos.x > mapWidth || pos.y < 0 || pos.y > mapHeight) {
      onRemove();
    }
  }, [pos, onRemove, mapWidth, mapHeight]);

  // Convert world -> screen by applying offset
  const screenX = pos.x + offsetX;
  const screenY = pos.y + offsetY;

  // Example bounding box
  const BOX_SIZE = 10;

  return (
    <View
      style={[
        styles.projectile,
        {
          left: screenX,
          top: screenY,
          width: BOX_SIZE,
          height: BOX_SIZE,
        },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  projectile: {
    position: 'absolute',
    backgroundColor: 'yellow',
  },
});
