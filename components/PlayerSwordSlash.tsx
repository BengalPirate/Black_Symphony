import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import Sprite from '@/components/Sprite';
import { Direction } from '@/constants/types';

import emeraldSwordSlash1left from '@/assets/sprites/weapons_sprites/emerald_sword/Emerald_swing_1_left.png';
import emeraldSwordSlash2left from '@/assets/sprites/weapons_sprites/emerald_sword/Emerald_swing_2_left.png';
import emeraldSwordSlash3left from '@/assets/sprites/weapons_sprites/emerald_sword/Emerald_swing_3_left.png';
import emeraldSwordSlash1right from '@/assets/sprites/weapons_sprites/emerald_sword/Emerald_swing_1_right.png';
import emeraldSwordSlash2right from '@/assets/sprites/weapons_sprites/emerald_sword/Emerald_swing_2_right.png';
import emeraldSwordSlash3right from '@/assets/sprites/weapons_sprites/emerald_sword/Emerald_swing_3_right.png';

// Slash frames configuration
const slashUpFrames = [
  { x: 0, y: 0 },
  { x: 80, y: 0 },
  { x: 160, y: 0 },
];
const slashDownFrames = [
  { x: 0, y: 80 },
  { x: 80, y: 80 },
  { x: 160, y: 80 },
];
const slashLeftFrames = [
  { x: 0, y: 160 },
  { x: 80, y: 160 },
  { x: 160, y: 160 },
];
const slashRightFrames = [
  { x: 0, y: 240 },
  { x: 80, y: 240 },
  { x: 160, y: 240 },
];

// Map direction to frames and sprite sheet
const framesByDirection: Record<Direction, { x: number; y: number }[]> = {
  up: slashUpFrames,
  down: slashDownFrames,
  left: slashLeftFrames,
  right: slashRightFrames,
  northeast: slashRightFrames,
  northwest: slashLeftFrames,
  southeast: slashRightFrames,
  southwest: slashLeftFrames,
};

const sheetByDirection: Record<Direction, any> = {
  up: emeraldSwordSlash1left,
  down: emeraldSwordSlash2left,
  left: emeraldSwordSlash1left,
  right: emeraldSwordSlash3left,
  northeast: emeraldSwordSlash3left,
  northwest: emeraldSwordSlash1left,
  southeast: emeraldSwordSlash2left,
  southwest: emeraldSwordSlash2left,
};

interface PlayerSwordSlashProps {
    direction: Direction;
    isSlashing: boolean;
    onEndSlash: () => void;
    onCheckCollision?: (box: { x: number; y: number; w: number; h: number }) => void;
    playerWorldPos: { x: number; y: number }; // Replace playerX and playerY
    offsetX: number;
    offsetY: number;
  }
  

  export default function PlayerSwordSlash({
    direction,
    isSlashing,
    onEndSlash,
    onCheckCollision,
    playerWorldPos, // Destructure playerWorldPos
    offsetX,
    offsetY,
  }: PlayerSwordSlashProps) {
    const [frameIndex, setFrameIndex] = useState(0);
  
    // Animation logic
    useEffect(() => {
      if (!isSlashing) return;
  
      setFrameIndex(0);
      let frame = 0;
      const frames = framesByDirection[direction] || slashDownFrames;
  
      const intId = setInterval(() => {
        frame++;
        if (frame >= frames.length) {
          clearInterval(intId);
          onEndSlash(); // This resets `isSlashing` to false
        } else {
          setFrameIndex(frame);
        }
      }, 90);
  
      return () => clearInterval(intId);
    }, [isSlashing, onEndSlash, direction]);
  
    // Collision logic
    useEffect(() => {
      if (!isSlashing || !onCheckCollision) return;
  
      const slashBox = {
        x: playerWorldPos.x - 40, // Use playerWorldPos.x
        y: playerWorldPos.y - 40, // Use playerWorldPos.y
        w: 80,
        h: 80,
      };
      onCheckCollision(slashBox);
    }, [isSlashing, onCheckCollision, frameIndex, playerWorldPos]);
  
    if (!isSlashing) return null;
  
    // Position the slash around the player
    let slashLeft = playerWorldPos.x + offsetX - 40; // Use world position with camera offset
    let slashTop = playerWorldPos.y + offsetY - 40;
  
    console.log('Player world position:', playerWorldPos);
    console.log('Camera offset:', { offsetX, offsetY });
    console.log('Calculated slash position:', { slashLeft, slashTop });
  
    // Select frame and sprite sheet
    const frames = framesByDirection[direction] || slashDownFrames;
    const sheet = sheetByDirection[direction] || emeraldSwordSlash2left;
    const current = frames[Math.min(frameIndex, frames.length - 1)];
  
    return (
      <View
        style={{
          position: 'absolute',
          left: slashLeft,
          top: slashTop,
          width: 80,
          height: 80,
          backgroundColor: 'rgba(255, 0, 0, 0.5)', // Debug background
          borderColor: 'yellow',                  // Debug border
          borderWidth: 2,
        }}
      >
        <Sprite
          spriteSheet={sheet}
          x={current.x}
          y={current.y}
          width={80}
          height={80}
          sheetWidth={256}
          sheetHeight={256}
        />
      </View>
    );
  }
  
