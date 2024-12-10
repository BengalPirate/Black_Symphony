import React from 'react';
import { View, StyleSheet } from 'react-native';

const PLAYER_SIZE = 32; // Smaller so it fits better with the tile size

interface PlayerProps {
  x: number;
  y: number;
}

export default function Player({ x, y }: PlayerProps) {
  return <View style={[styles.player, { left: x, top: y }]} />;
}

const styles = StyleSheet.create({
  player: {
    position: 'absolute',
    width: PLAYER_SIZE,
    height: PLAYER_SIZE,
    backgroundColor: 'black',
  },
});

export { PLAYER_SIZE };
