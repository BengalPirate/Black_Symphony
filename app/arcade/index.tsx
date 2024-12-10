import React, { useState, useEffect, useRef } from 'react';
import { View, Modal, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import Svg, { Polygon } from 'react-native-svg'; // Import Polygon to draw barriers
import Player from '../../components/Player';
import GameController from '../../components/GameController';
import { HellscapeMap } from '../../assets/maps/HellscapeMap';
import { movePlayer, Position } from '../../controllers/playerController';
import TiledMap from '../../components/TiledMap';
import mapFullImage from '../../assets/maps/map_full.png';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;

const MOVE_SPEED = 20;
const PLAYER_SIZE = 32;
const TILE_SIZE = 32;

export default function ArcadeScreen() {
  const mapWidthPx = HellscapeMap.width * TILE_SIZE;
  const mapHeightPx = HellscapeMap.height * TILE_SIZE;

  // Player starts at center of map
  const [playerWorldPos, setPlayerWorldPos] = useState<Position>({
    x: mapWidthPx / 2,
    y: mapHeightPx / 2,
  });

  const [isPaused, setIsPaused] = useState(false);

  // Just joystick input here
  const [joystickDirection, setJoystickDirection] = useState<{ dx: number; dy: number }>({ dx: 0, dy: 0 });

  const frameRequestRef = useRef<number | null>(null);

  // Extract barrier polygons
  // Objects either have obj.type === 'barrier' or a property barrier=true
  const [barriers] = useState(() => {
    const polygons: { x: number; y: number }[][] = [];
    for (const layer of HellscapeMap.layers) {
      if (layer.type === 'objectgroup') {
        for (const obj of layer.objects) {
          const isBarrierType = obj.type === 'barrier';
          const hasBarrierProp = obj.properties && obj.properties.some(p => p.name === 'barrier' && p.value === true);
          if (obj.polygon && (isBarrierType || hasBarrierProp)) {
            const poly = obj.polygon.map(pt => ({ x: obj.x + pt.x, y: obj.y + pt.y }));
            polygons.push(poly);
          }
        }
      }
    }
    return polygons;
  });

  const handleMove = (dx: number, dy: number) => {
    const length = Math.sqrt(dx * dx + dy * dy);
    if (length > 0) {
      setJoystickDirection({ dx: dx / length, dy: dy / length });
    } else {
      setJoystickDirection({ dx: 0, dy: 0 });
    }
  };

  const handleShoot = () => console.log('Shoot');
  const handleMelee = () => console.log('Melee');
  const handleDash = () => console.log('Dash');

  const offsetX = SCREEN_WIDTH / 2 - playerWorldPos.x;
  const offsetY = SCREEN_HEIGHT / 2 - playerWorldPos.y;

  const animate = () => {
    let dx = joystickDirection.dx;
    let dy = joystickDirection.dy;

    if (dx !== 0 || dy !== 0) {
      const length = Math.sqrt(dx * dx + dy * dy);
      const ndx = dx / length;
      const ndy = dy / length;
      setPlayerWorldPos((current) => movePlayer(current, ndx * MOVE_SPEED, ndy * MOVE_SPEED, barriers));
    }

    frameRequestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    frameRequestRef.current = requestAnimationFrame(animate);
    return () => {
      if (frameRequestRef.current) {
        cancelAnimationFrame(frameRequestRef.current);
      }
    };
  }, [joystickDirection, barriers]);

  return (
    <View style={styles.container}>
      <View style={styles.mapContainer}>
        <Svg width="100%" height="100%">
          <View style={{ transform: [{ translateX: offsetX }, { translateY: offsetY }] }}>
            <TiledMap
              mapWidth={HellscapeMap.width}
              mapHeight={HellscapeMap.height}
              tileSize={TILE_SIZE}
              mapImage={mapFullImage}
            />

            {/* Render barriers as polygons for debugging */}
            {barriers.map((poly, index) => {
              const pointsStr = poly.map(p => `${p.x},${p.y}`).join(' ');
              return (
                <Polygon
                  key={index}
                  points={pointsStr}
                  fill="rgba(255,0,0,0.3)"
                  stroke="red"
                  strokeWidth={2}
                />
              );
            })}
          </View>
        </Svg>
      </View>

      <Player
        x={SCREEN_WIDTH / 2 - PLAYER_SIZE / 2}
        y={SCREEN_HEIGHT / 2 - PLAYER_SIZE / 2}
      />

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
  mapContainer: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    overflow: 'hidden'
  },
  pauseButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: 10,
    borderRadius: 5,
    zIndex: 999
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
