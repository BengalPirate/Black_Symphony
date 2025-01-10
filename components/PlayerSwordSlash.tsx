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

// -----------------------------------------------------------------------------
// Frame definitions (unchanged):
// -----------------------------------------------------------------------------
const slashUp1Frames = [ // in Emerald_swing_1_left.png
  { x: 0,   y: 0 },
  { x: 80,  y: 0 },
  { x: 160, y: 0 },
];
const slashUp2Frames = [ // in Emerald_swing_1_right.png
  { x: 0,   y: 0 },
  { x: 80,  y: 0 },
  { x: 160, y: 0 },
];
const slashDown1Frames = [ // in Emerald_swing_2_left.png
  { x: 0,   y: 80 },
  { x: 80,  y: 80 },
  { x: 160, y: 80 },
];
const slashDown2Frames = [ // in Emerald_swing_2_right.png
  { x: 0,   y: 80 },
  { x: 80,  y: 80 },
  { x: 160, y: 80 },
];
const slashLeft1Frames = [ // in Emerald_swing_1_left.png
  { x: 0,   y: 160 },
  { x: 80,  y: 160 },
  { x: 160, y: 160 },
];
const slashLeft2Frames = [ // in Emerald_swing_3_right.png
  { x: 0,   y: 0 },
  { x: 80,  y: 0 },
  { x: 160, y: 0 },
];
const slashRight1Frames = [ // in Emerald_swing_3_left.png
  { x: 0,   y: 0 },
  { x: 80,  y: 0 },
  { x: 160, y: 0 },
];
const slashRight2Frames = [ // in Emerald_swing_1_right.png
  { x: 0,   y: 160 },
  { x: 80,  y: 160 },
  { x: 160, y: 160 },
];
const slashNortheast1Frames = [ // in Emerald_swing_3_left.png
  { x: 0,   y: 80 },
  { x: 80,  y: 80 },
  { x: 160, y: 80 },
];
const slashNortheast2Frames = [ // in Emerald_swing_1_right.png
  { x: 0,   y: 80 },
  { x: 80,  y: 80 },
  { x: 160, y: 80 },
];
const slashNorthwest1Frames = [ // in Emerald_swing_1_left.png
  { x: 0,   y: 80 },
  { x: 80,  y: 80 },
  { x: 160, y: 80 },
];
const slashNorthwest2Frames = [ // in Emerald_swing_3_right.png
  { x: 0,   y: 80 },
  { x: 80,  y: 80 },
  { x: 160, y: 80 },
];
const slashSoutheast1Frames = [ // in Emerald_swing_2_left.png
  { x: 0,   y: 160 },
  { x: 80,  y: 160 },
  { x: 160, y: 160 },
];
const slashSoutheast2Frames = [ // in Emerald_swing_2_right.png
  { x: 0,   y: 0 },
  { x: 80,  y: 0 },
  { x: 160, y: 0 },
];
const slashSouthwest1Frames = [ // in Emerald_swing_2_left.png
  { x: 0,   y: 0 },
  { x: 80,  y: 0 },
  { x: 160, y: 0 },
];
const slashSouthwest2Frames = [ // in Emerald_swing_2_right.png
  { x: 0,   y: 160 },
  { x: 80,  y: 160 },
  { x: 160, y: 160 },
];

// -----------------------------------------------------------------------------
// Map directions to the *primary* frames and sprite sheets for that slash.
// You can tweak these mappings if you prefer different combos:
// -----------------------------------------------------------------------------
const framesByDirection: Record<Direction, any> = {
  up: slashUp1Frames,
  down: slashDown1Frames,
  left: slashLeft1Frames,
  right: slashRight1Frames,
  northeast: slashNortheast1Frames,
  northwest: slashNorthwest1Frames,
  southeast: slashSoutheast1Frames,
  southwest: slashSouthwest1Frames,
};

const sheetByDirection: Record<Direction, any> = {
  up: emeraldSwordSlash1left,         // e.g., slashUp1Frames says "in Emerald_swing_1_left.png"
  down: emeraldSwordSlash2left,       // slashDown1Frames says "in Emerald_swing_2_left.png"
  left: emeraldSwordSlash1left,       // slashLeft1Frames says "in Emerald_swing_1_left.png"
  right: emeraldSwordSlash3left,      // slashRight1Frames says "in Emerald_swing_3_left.png"
  northeast: emeraldSwordSlash3left,  // slashNortheast1Frames says "in Emerald_swing_3_left.png"
  northwest: emeraldSwordSlash1left,  // slashNorthwest1Frames says "in Emerald_swing_1_left.png"
  southeast: emeraldSwordSlash2left,  // slashSoutheast1Frames says "in Emerald_swing_2_left.png"
  southwest: emeraldSwordSlash2left,  // slashSouthwest1Frames says "in Emerald_swing_2_left.png"
};

// -----------------------------------------------------------------------------
// Props interface:
// -----------------------------------------------------------------------------
interface PlayerSwordSlashProps {
  direction: Direction;
  playerX: number;
  playerY: number;
  offsetX: number;
  offsetY: number;
  isSlashing: boolean;
  onEndSlash: () => void;
  onCheckCollision?: (box: { x: number; y: number; w: number; h: number }) => void;
}

// -----------------------------------------------------------------------------
// Main component with ADDED logic for all directions:
// -----------------------------------------------------------------------------
export default function PlayerSwordSlash({
  direction,
  playerX,
  playerY,
  offsetX,
  offsetY,
  isSlashing,
  onEndSlash,
  onCheckCollision,
}: PlayerSwordSlashProps) {
  const [frameIndex, setFrameIndex] = useState(0);

  useEffect(() => {
    if (!isSlashing) return;

    console.log('[SwordSlash] Starting slash animation...');
    setFrameIndex(0);
    let frame = 0;

    // We dynamically choose the frames based on direction now:
    const selectedFrames = framesByDirection[direction] || slashDown1Frames;

    const intId = setInterval(() => {
      frame++;
      console.log(`[SwordSlash] frame=${frame}`);
      if (frame >= selectedFrames.length) {
        console.log('[SwordSlash] Finished slash -> call onEndSlash()');
        clearInterval(intId);
        onEndSlash(); // signals parent to setIsSlashing(false)
      } else {
        setFrameIndex(frame);
      }
    }, 90);

    return () => {
      console.log('[SwordSlash] Cleaning up animation interval');
      clearInterval(intId);
    };
  }, [isSlashing, onEndSlash, direction]);

  // ---------------------------------------------------------------------------
  // Collision bounding box logic (OPTIONAL for directions other than 'down')
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!isSlashing) return;
    if (!onCheckCollision) return;

    // Here is a simple bounding box approach:
    // You can refine these as you prefer:
    let slashBox = { x: playerX, y: playerY, w: 80, h: 60 };

    switch (direction) {
      case 'down':
        slashBox = {
          x: playerX,
          y: playerY + 20,
          w: 80,
          h: 60,
        };
        break;
      case 'up':
        slashBox = {
          x: playerX,
          y: playerY - 40,
          w: 80,
          h: 60,
        };
        break;
      case 'left':
        slashBox = {
          x: playerX - 40,
          y: playerY,
          w: 60,
          h: 80,
        };
        break;
      case 'right':
        slashBox = {
          x: playerX + 20,
          y: playerY,
          w: 60,
          h: 80,
        };
        break;
      case 'northeast':
        slashBox = {
          x: playerX + 10,
          y: playerY - 20,
          w: 60,
          h: 60,
        };
        break;
      case 'northwest':
        slashBox = {
          x: playerX - 30,
          y: playerY - 20,
          w: 60,
          h: 60,
        };
        break;
      case 'southeast':
        slashBox = {
          x: playerX + 10,
          y: playerY + 10,
          w: 60,
          h: 60,
        };
        break;
      case 'southwest':
        slashBox = {
          x: playerX - 30,
          y: playerY + 10,
          w: 60,
          h: 60,
        };
        break;
    }
    onCheckCollision(slashBox);
  }, [isSlashing, direction, frameIndex, onCheckCollision, playerX, playerY]);

  // ---------------------------------------------------------------------------
  // Bail out if we're not slashing at all:
  // ---------------------------------------------------------------------------
  if (!isSlashing) {
    return null;
  }

  // Get correct frames/sheet for this direction:
  const selectedFrames = framesByDirection[direction] || slashDown1Frames;
  const selectedSheet = sheetByDirection[direction] || emeraldSwordSlash2left;

  // Make sure we're in range just in case:
  const currentFrame = selectedFrames[Math.min(frameIndex, selectedFrames.length - 1)];

  // Basic offsets for the slash graphic on the screen;
  // you can fine-tune these for each direction:
  let slashLeft = playerX + offsetX - 40;
  let slashTop = playerY + offsetY + 20;

  switch (direction) {
    case 'up':
      slashTop = playerY + offsetY - 40;
      break;
    case 'left':
      slashLeft = playerX + offsetX - 60;
      break;
    case 'right':
      slashLeft = playerX + offsetX;
      break;
    case 'northeast':
      slashLeft = playerX + offsetX;
      slashTop = playerY + offsetY - 20;
      break;
    case 'northwest':
      slashLeft = playerX + offsetX - 60;
      slashTop = playerY + offsetY - 20;
      break;
    case 'southeast':
      slashLeft = playerX + offsetX;
      slashTop = playerY + offsetY;
      break;
    case 'southwest':
      slashLeft = playerX + offsetX - 60;
      slashTop = playerY + offsetY;
      break;
    // 'down' and default:
    default:
      break;
  }

  return (
    <View
      style={{
        position: 'absolute',
        left: slashLeft,
        top: slashTop,
        width: 80,
        height: 80,
      }}
    >
      <Sprite
        spriteSheet={selectedSheet}
        x={currentFrame.x}
        y={currentFrame.y}
        width={80}
        height={80}
        sheetWidth={256}
        sheetHeight={256}
        scale={1}
      />
    </View>
  );
}
