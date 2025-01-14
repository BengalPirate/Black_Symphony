import React, { useState, useEffect, useRef } from 'react';
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
  const [pos, setPos] = useState({ x: startX, y: startY });
  const lastDebugTime = useRef(0);
  const DEBUG_INTERVAL = 1000; // Log every 1 second if needed

  useEffect(() => {
    const interval = setInterval(() => {
      setPos((prev) => {
        const newPos = {
          x: prev.x + velocityX * speed,
          y: prev.y + velocityY * speed,
        };

        // Only log position occasionally in development
        if (__DEV__) {
          const now = Date.now();
          if (now - lastDebugTime.current > DEBUG_INTERVAL) {
            lastDebugTime.current = now;
            console.warn('Projectile position:', {
              pos: newPos,
              velocity: { x: velocityX, y: velocityY }
            });
          }
        }

        return newPos;
      });
    }, 16);

    return () => clearInterval(interval);
  }, [velocityX, velocityY, speed]);

  useEffect(() => {
    if (pos.x < 0 || pos.x > mapWidth || pos.y < 0 || pos.y > mapHeight) {
      onRemove();
    }
  }, [pos, onRemove, mapWidth, mapHeight]);

  const BOX_SIZE = 10;

  return (
    <View style={styles.container}>
      {/* Actual Projectile */}
      <View
        style={[
          styles.projectile,
          {
            left: pos.x + offsetX,
            top: pos.y + offsetY,
            width: BOX_SIZE,
            height: BOX_SIZE,
          },
        ]}
      />
      
      {/* Debug Hitbox - only shown in development */}
      {__DEV__ && (
        <View
          style={[
            styles.hitbox,
            {
              left: pos.x + offsetX,
              top: pos.y + offsetY,
              width: BOX_SIZE,
              height: BOX_SIZE,
            },
          ]}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    zIndex: 100,
  },
  projectile: {
    position: 'absolute',
    backgroundColor: 'yellow',
    borderRadius: 5,
    zIndex: 101,
  },
  hitbox: {
    position: 'absolute',
    borderWidth: 1,
    borderColor: '#FF0000', 
    backgroundColor: 'rgba(255, 0, 0, 0.2)',
    zIndex: 100,
  },
});