// createMageFrames.ts
import { ImageSourcePropType } from 'react-native';

/** Each run/idle frame is identified by x,y plus optional yOffset. */
interface Frame {
  x: number;
  y: number;
  yOffset?: number;
}

/** The final object for each direction: which sheet, run frames, idle frame, etc. */
interface DirectionInfo {
  sheet: ImageSourcePropType;  // the require('mage1.png') or import
  frames: Frame[];
  idle?: Frame;
  sheetWidth: number;
  sheetHeight: number;
}

/**
 * Make an array of frames in a single row (rowIndex),
 * each 32 wide x 40 tall, with an optional rowYoffset.
 */
function makeRowFrames(
  rowIndex: number,
  frameCount = 8,
  rowYoffset = 0
): Frame[] {
  const arr: Frame[] = [];
  for (let i = 0; i < frameCount; i++) {
    arr.push({
      x: i * 32,
      y: rowIndex * 40,
      yOffset: rowYoffset,
    });
  }
  return arr;
}

/**
 * A single function to build the same run/idle directions,
 * referencing any two sheets (mage1, mage2).
 *
 * By default: 
 * - mage1 has rows [0..4] for run, row=5 for idleDown..idleUp
 * - mage2 has rows [0..2] for run, row=3 for idleSW..idleNW
 */
export function createMageFrames(
  mage1: ImageSourcePropType,
  mage2: ImageSourcePropType,
  mage1Width = 256,
  mage1Height = 256,
  mage2Width = 256,
  mage2Height = 256
): Record<string, DirectionInfo> {
  // Row=5 => idle frames in sheet1
  const idleDown      = { x: 0 * 32, y: 5 * 40 };
  const idleSoutheast = { x: 1 * 32, y: 5 * 40 };
  const idleRight     = { x: 2 * 32, y: 5 * 40 };
  const idleNortheast = { x: 3 * 32, y: 5 * 40 };
  const idleUp        = { x: 4 * 32, y: 5 * 40 };

  // Row=3 => idle frames in sheet2
  const idleSouthwest = { x: 0 * 32, y: 3 * 40 };
  const idleLeft      = { x: 1 * 32, y: 3 * 40 };
  const idleNorthwest = { x: 2 * 32, y: 3 * 40 };

  return {
    // sheet1 directions
    down: {
      sheet: mage1,
      frames: makeRowFrames(0), // row0 => y=0..39
      idle: idleDown,
      sheetWidth: mage1Width,
      sheetHeight: mage1Height,
    },
    southeast: {
      sheet: mage1,
      frames: makeRowFrames(1),
      idle: idleSoutheast,
      sheetWidth: mage1Width,
      sheetHeight: mage1Height,
    },
    right: {
      sheet: mage1,
      frames: makeRowFrames(2),
      idle: idleRight,
      sheetWidth: mage1Width,
      sheetHeight: mage1Height,
    },
    northeast: {
      sheet: mage1,
      frames: makeRowFrames(3),
      idle: idleNortheast,
      sheetWidth: mage1Width,
      sheetHeight: mage1Height,
    },
    up: {
      sheet: mage1,
      frames: makeRowFrames(4),
      idle: idleUp,
      sheetWidth: mage1Width,
      sheetHeight: mage1Height,
    },

    // sheet2 directions
    southwest: {
      sheet: mage2,
      frames: makeRowFrames(0),
      idle: idleSouthwest,
      sheetWidth: mage2Width,
      sheetHeight: mage2Height,
    },
    left: {
      sheet: mage2,
      frames: makeRowFrames(1),
      idle: idleLeft,
      sheetWidth: mage2Width,
      sheetHeight: mage2Height,
    },
    northwest: {
      sheet: mage2,
      frames: makeRowFrames(2),
      idle: idleNorthwest,
      sheetWidth: mage2Width,
      sheetHeight: mage2Height,
    },
  };
}
