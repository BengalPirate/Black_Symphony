import React, { useState } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Player from '../../components/Player';
import GameController from '../../components/GameController';
import { movePlayer, Position } from '../../controllers/playerController';

export default function StoryMode() {
  const [playerPosition, setPlayerPosition] = useState<Position>({
    x: Dimensions.get('window').width / 2 - 25,
    y: Dimensions.get('window').height / 2 - 25,
  });

  const handleMove = (dx: number, dy: number) => {
    setPlayerPosition((current) => movePlayer(current, dx * 5, dy * 5));
  };

  const handleShoot = () => console.log('Shoot action in StoryMode');
  const handleMelee = () => console.log('Melee action in StoryMode');
  const handleDash = () => console.log('Dash action in StoryMode');

  return (
    <View style={styles.container}>
      {/* Player */}
      <Player x={playerPosition.x} y={playerPosition.y} />

      {/* Game Controller */}
      <GameController
        onMove={handleMove}
        onShoot={handleShoot}
        onMelee={handleMelee}
        onDash={handleDash}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'blue',
  },
});
