import React, { useState } from 'react';
import { View, Modal, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import Svg from 'react-native-svg';
import Player from '../../components/Player';
import GameController from '../../components/GameController';
import TiledMap from '../../components/TiledMap';
import { HellscapeMap } from '../../assets/maps/HellscapeMap';
import { movePlayer, Position } from '../../controllers/playerController';

export default function ArcadeScreen() {
  const [playerPosition, setPlayerPosition] = useState<Position>({
    x: Dimensions.get('window').width / 2 - 25,
    y: Dimensions.get('window').height / 2 - 25,
  });

  const [isPaused, setIsPaused] = useState(false);

  const handleMove = (dx: number, dy: number) => {
    setPlayerPosition((current) => movePlayer(current, dx * 5, dy * 5));
  };

  const handleShoot = () => console.log('Shoot');
  const handleMelee = () => console.log('Melee');
  const handleDash = () => console.log('Dash');

  // Filter tile layers
  const tileLayers = HellscapeMap.layers
    .filter((layer) => layer.type === 'tilelayer')
    .map((layer) => ({
      type: layer.type,
      data: 'data' in layer ? layer.data : [],
      width: 'width' in layer ? layer.width : 0,
      height: 'height' in layer ? layer.height : 0
    }));

  return (
    <View style={styles.container}>
      <Svg width="100%" height="100%" style={styles.mapContainer}>
        <TiledMap
          map={{
            width: HellscapeMap.width,
            height: HellscapeMap.height,
            layers: tileLayers,
            tilesets: HellscapeMap.tilesets // Pass all tilesets
          }}
          tileSize={32}
        />
      </Svg>

      <Player x={playerPosition.x} y={playerPosition.y} />
      <GameController
        onMove={handleMove}
        onShoot={handleShoot}
        onMelee={handleMelee}
        onDash={handleDash}
      />

      <TouchableOpacity onPress={() => setIsPaused(true)} style={styles.pauseButton}>
        <Text style={styles.pauseText}>Pause</Text>
      </TouchableOpacity>

      <Modal visible={isPaused} transparent animationType="fade">
        <View style={styles.pauseMenu}>
          <Text style={styles.pauseText}>Game Paused</Text>
          <TouchableOpacity onPress={() => setIsPaused(false)} style={styles.menuButton}>
            <Text style={styles.pauseText}>Resume</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => console.log('Go to main menu')} style={styles.menuButton}>
            <Text style={styles.pauseText}>Main Menu</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  mapContainer: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  pauseButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: 10,
    borderRadius: 5,
  },
  pauseText: { color: 'white', fontSize: 16 },
  pauseMenu: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  menuButton: {
    padding: 15,
    marginVertical: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 5,
    alignItems: 'center',
    width: '50%',
  },
});
