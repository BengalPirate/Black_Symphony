import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import Sprite from '@/components/Sprite';

interface EnemyDragonProps {
  worldX: number;
  worldY: number;
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

const normalFrames = [
  { x: 0, y: 128 },
  { x: 64, y: 128 },
  { x: 128, y: 128 },
  { x: 192, y: 128 },
];

const woundedFrames = [
  { x: 0, y: 128 },
  { x: 64, y: 128 },
  { x: 128, y: 128 },
  { x: 192, y: 128 },
];

const enragedFrames = [
  { x: 0, y: 128 },
  { x: 64, y: 128 },
  { x: 128, y: 128 },
  { x: 192, y: 128 },
];

export default function EnemyDragon({
  worldX,
  worldY,
  offsetX,
  offsetY,
  onUpdateHitbox,
  currentBossHealth,
}: EnemyDragonProps) {
  const [frameIndex, setFrameIndex] = useState(0);
  const [isHurt, setIsHurt] = useState(false);
  const prevHealth = useRef(currentBossHealth);
  const flashAnim = useRef(new Animated.Value(0)).current;
  const SPRITE_SIZE = 80;
  const HITBOX_SIZE = SPRITE_SIZE * 0.8; // Slightly smaller hitbox than sprite

  // Animation for damage flash
  const flashSequence = () => {
    return Animated.sequence([
      Animated.timing(flashAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: false,
      }),
      Animated.timing(flashAnim, {
        toValue: 0,
        duration: 100,
        useNativeDriver: false,
      }),
    ]);
  };

  // Handle frame animation
  useEffect(() => {
    const intervalId = setInterval(() => {
      setFrameIndex(prev => (prev + 1) % normalFrames.length);
    }, 300);
    return () => clearInterval(intervalId);
  }, []);

  // Handle damage animation
  useEffect(() => {
    if (currentBossHealth !== undefined && 
        prevHealth.current !== undefined && 
        currentBossHealth < prevHealth.current) {
      setIsHurt(true);
      
      console.warn('Dragon took damage:', {
        previous: prevHealth.current,
        current: currentBossHealth,
        difference: prevHealth.current - currentBossHealth
      });

      flashSequence().start(() => {
        setIsHurt(false);
      });
    }
    prevHealth.current = currentBossHealth;
  }, [currentBossHealth, flashAnim]);

  // Calculate positions
  const dragonLeft = offsetX + worldX - SPRITE_SIZE / 2;
  const dragonTop = offsetY + worldY - SPRITE_SIZE / 2;
  
  // Update hitbox
  useEffect(() => {
    const hitbox = {
      x: dragonLeft + (SPRITE_SIZE - HITBOX_SIZE) / 2,
      y: dragonTop + (SPRITE_SIZE - HITBOX_SIZE) / 2,
      width: HITBOX_SIZE,
      height: HITBOX_SIZE,
    };

    console.warn('Dragon hitbox updated:', {
      position: { dragonLeft, dragonTop },
      hitbox,
      worldPos: { worldX, worldY },
      offset: { offsetX, offsetY }
    });

    onUpdateHitbox?.(hitbox);
  }, [dragonLeft, dragonTop, onUpdateHitbox, worldX, worldY, offsetX, offsetY]);

  // Get current frame set based on health
  const getCurrentFrames = () => {
    if (!currentBossHealth) return normalFrames;
    if (currentBossHealth <= 100) return enragedFrames;
    if (currentBossHealth <= 200) return woundedFrames;
    return normalFrames;
  };

  const currentFrames = getCurrentFrames();
  const currentFrame = currentFrames[frameIndex];

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
      {/* Damage flash effect */}
      <Animated.View
        style={[
          styles.flashOverlay,
          {
            opacity: flashAnim,
            backgroundColor: isHurt ? 'rgba(255, 0, 0, 0.5)' : 'transparent',
          },
        ]}
      />
      
      {/* Debug hitbox visualization */}
      {__DEV__ && (
        <View style={[
          styles.hitboxDebug,
          {
            left: (SPRITE_SIZE - HITBOX_SIZE) / 2,
            top: (SPRITE_SIZE - HITBOX_SIZE) / 2,
            width: HITBOX_SIZE,
            height: HITBOX_SIZE,
          }
        ]} />
      )}

      {/* Dragon sprite */}
      <Sprite
        spriteSheet={require('@/assets/sprites/enemy_sprites/dragon/red_dragon/DRAGON-Sheet.png')}
        x={currentFrame.x}
        y={currentFrame.y}
        width={128}
        height={128}
        sheetWidth={256}
        sheetHeight={512}
        scale={2}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  enemyContainer: {
    position: 'absolute',
    zIndex: 9999,
  },
  flashOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10000,
  },
  hitboxDebug: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: 'rgba(255, 0, 0, 0.5)',
    backgroundColor: 'rgba(255, 0, 0, 0.2)',
    zIndex: 9998,
  }
});