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
  offsetX: number;       // pass from ArcadeScreen
  offsetY: number;       // pass from ArcadeScreen
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

  // Remove if out of some bounding region
  useEffect(() => {
    if (pos.x < -200 || pos.x > 2000 || pos.y < -200 || pos.y > 2000) {
      onRemove();
    }
  }, [pos, onRemove]);

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
