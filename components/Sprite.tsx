import React from 'react';
import { View, Image, StyleSheet } from 'react-native';

interface SpriteProps {
  spriteSheet: any;   // e.g. require('./path/to/sprite-sheet.png')
  x: number;          // X offset of the frame in the sprite sheet (in original pixels)
  y: number;          // Y offset of the frame in the sprite sheet (in original pixels)
  width: number;      // Final visible width (e.g. 64 for double size of 32)
  height: number;     // Final visible height (e.g. 96 for double size of 48)
  sheetWidth?: number;   // The total width of your sprite sheet (defaults to 256)
  sheetHeight?: number;  // The total height of your sprite sheet (defaults to 256)
  scale?: number;     // How much to scale the entire sheet for pixel-art upscaling (defaults to 1)
}

/**
 * This <Sprite> component “crops” a sub-rectangle from a larger sprite sheet,
 * then optionally scales the sheet by `scale` so you can see a bigger/pixelated version
 * without capturing adjacent frames.
 *
 * The container has `width`×`height` of the final display size.
 * The underlying image is scaled to `sheetWidth*scale`×`sheetHeight*scale`,
 * and its top-left corner is placed at `(-x * scale, -y * scale)`.
 */
const Sprite = ({
  spriteSheet,
  x,
  y,
  width,
  height,
  sheetWidth = 256,
  sheetHeight = 256,
  scale = 2,
}: SpriteProps) => {
  // Scale the entire sheet
  const scaledSheetWidth = sheetWidth * scale;
  const scaledSheetHeight = sheetHeight * scale;

  // Multiply the offsets by `scale` as well, so we only see the intended sub-rectangle
  const offsetLeft = -x * scale;
  const offsetTop = -y * scale;

  return (
    <View style={[styles.spriteContainer, { width, height }]}>
      <Image
        source={spriteSheet}
        style={[
          styles.spriteImage,
          {
            width: scaledSheetWidth,
            height: scaledSheetHeight,
            left: offsetLeft,
            top: offsetTop,
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  spriteContainer: {
    overflow: 'hidden', // Crops anything outside { width, height }
  },
  spriteImage: {
    position: 'absolute',
    // No resizeMode, so we don't force scaling beyond `scale` factor
  },
});

export default Sprite;
