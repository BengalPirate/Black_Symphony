import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');
const PLAYER_SIZE = 50;
const STEP = 10;

export interface Position {
  x: number;
  y: number;
}

export function movePlayer(currentPosition: Position, dx: number, dy: number): Position {
  return {
    x: Math.min(Math.max(currentPosition.x + dx, 0), width - PLAYER_SIZE),
    y: Math.min(Math.max(currentPosition.y + dy, 0), height - PLAYER_SIZE),
  };
}
