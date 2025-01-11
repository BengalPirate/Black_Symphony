// EnemyProjectile.tsx

import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';

interface EnemyProjectileProps {
  startX: number;
  startY: number;
  velocityX: number;     
  velocityY: number;     
  speed: number;         
  onRemove: () => void;  
}

export default function EnemyProjectile({
  startX,
  startY,
  velocityX,
  velocityY,
  speed,
  onRemove,
}: EnemyProjectileProps) {
  const [pos, setPos] = useState({ x: startX, y: startY });

  useEffect(() => {
    const interval = setInterval(() => {
      setPos((prev) => ({
        x: prev.x + velocityX * speed,
        y: prev.y + velocityY * speed,
      }));
    }, 16);
    return () => clearInterval(interval);
  }, [velocityX, velocityY, speed]);

  useEffect(() => {
    if (pos.x < -200 || pos.x > 2000 || pos.y < -200 || pos.y > 2000) {
      onRemove();
    }
  }, [pos, onRemove]);

  const BOX_SIZE = 10;

  return (
    <View
      style={[
        styles.enemyProjectile,
        {
          left: pos.x,
          top: pos.y,
          width: BOX_SIZE,
          height: BOX_SIZE,
        },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  enemyProjectile: {
    position: 'absolute',
    backgroundColor: 'red',
  },
});
