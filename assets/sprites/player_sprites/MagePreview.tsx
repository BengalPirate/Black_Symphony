// MagePreview.tsx
import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import Sprite from '@/components/Sprite';
import { createMageFrames } from './createMageFrames';

// Suppose we only do 1 frame per direction in the preview 
// or we cycle through the run frames. Let's do run frames for each direction.
const directions = ['down','southeast','right','northeast','up','northwest','left','southwest'];

interface MagePreviewProps {
  mage1: any;
  mage2: any;
  width?: number;  // how big to show
  height?: number;
}

export default function MagePreview({
  mage1,
  mage2,
  width=64,
  height=80,
}: MagePreviewProps) {
  const framesObj = createMageFrames(mage1, mage2);
  
  // We'll cycle over directions[] every 600ms
  const [dirIndex, setDirIndex] = useState(0);
  useEffect(() => {
    const intervalId = setInterval(() => {
      setDirIndex(prev => (prev+1) % directions.length);
    }, 600);
    return () => clearInterval(intervalId);
  }, []);
  
  // Show the run frames for that direction
  const direction = directions[dirIndex];
  const def = framesObj[direction];
  const runFrames = def.frames;
  const [frameIndex, setFrameIndex] = useState(0);

  // Animate the run frames
  useEffect(() => {
    const id = setInterval(() => {
      setFrameIndex(prev => (prev+1) % runFrames.length);
    }, 100);
    return () => clearInterval(id);
  }, [direction]);

  const frame = runFrames[frameIndex];

  return (
    <View style={[styles.container, {width, height}]}>
      <Sprite
        spriteSheet={def.sheet}
        x={frame.x}
        y={frame.y + (frame.yOffset||0)}
        width={width}
        height={height}
        sheetWidth={def.sheetWidth}
        sheetHeight={def.sheetHeight}
        scale={2}  // 32×40 → 64×80
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
});
