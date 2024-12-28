import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Modal,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import Svg, { G, Polygon } from 'react-native-svg';
import Player from '../../components/Player';
import GameController from '../../components/GameController';
import { Direction } from '../../constants/types';
import { HellscapeMap } from '../../assets/maps/HellscapeMap';
import { movePlayer, Position } from '../../controllers/playerController';
import TiledMap from '../../components/TiledMap';
import mapFullImage from '../../assets/maps/map_full.png';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;

const MOVE_SPEED = 20;
const TILE_SIZE = 32;

export default function ArcadeScreen() {
  // Size of TiledMap in "world coordinates"
  const mapWidthPx = HellscapeMap.width * TILE_SIZE;
  const mapHeightPx = HellscapeMap.height * TILE_SIZE;

  // Player's world position
  const [playerWorldPos, setPlayerWorldPos] = useState<Position>({
    x: mapWidthPx / 2,
    y: mapHeightPx / 2,
  });

  const [direction, setDirection] = useState<Direction>('down');
  const [isMoving, setIsMoving] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [joystickDirection, setJoystickDirection] = useState({ dx: 0, dy: 0 });

  const frameRequestRef = useRef<number | null>(null);

  // Extract barrier polygons
  const [barriers] = useState(() => {
    const polygons: { x: number; y: number }[][] = [];
    for (const layer of HellscapeMap.layers) {
      if (layer.type === 'objectgroup') {
        for (const obj of layer.objects) {
          const isBarrierType = obj.type === 'barrier';
          const hasBarrierProp = obj.properties?.some(
            (p) => p.name === 'barrier' && p.value === true
          );
          if (obj.polygon && (isBarrierType || hasBarrierProp)) {
            const poly = obj.polygon.map((pt) => ({
              x: obj.x + pt.x,
              y: obj.y + pt.y,
            }));
            polygons.push(poly);
          }
        }
      }
    }
    return polygons;
  });

  /**
   * Handle immediate movement events from joystick (onMove).
   * dx, dy ∈ [-1..1], newDirection is 'up','down','left','right', etc.
   */
  const handleMove = (dx: number, dy: number, newDirection: Direction) => {
    if (dx === 0 && dy === 0) {
      setIsMoving(false);
      return;
    }
    setIsMoving(true);
    setDirection(newDirection);

    // We move the player once per "handleMove" call
    // (which fires continuously while the user drags).
    const newX = playerWorldPos.x + dx * MOVE_SPEED;
    const newY = playerWorldPos.y + dy * MOVE_SPEED;

    setPlayerWorldPos((curPos) =>
      movePlayer(
        {
          x: Math.max(0, Math.min(mapWidthPx, newX)),
          y: Math.max(0, Math.min(mapHeightPx, newY)),
        },
        dx * MOVE_SPEED,
        dy * MOVE_SPEED,
        barriers
      )
    );
  };

  // Shooting
  const handleShoot = (dx: number, dy: number) => {
    // dx, dy ∈ [-1..1]. If they're both 0, user isn't dragging the shoot joystick.
    if (dx === 0 && dy === 0) return;
    console.log(`Shoot in direction: dx=${dx}, dy=${dy}`);
  };

  // If you also have continuous movement logic in an animation frame:
  const animate = () => {
    const { dx, dy } = joystickDirection;
    if (dx !== 0 || dy !== 0) {
      // Move a small step each frame
      const length = Math.sqrt(dx * dx + dy * dy);
      const ndx = dx / length;
      const ndy = dy / length;

      setPlayerWorldPos((curPos) =>
        movePlayer(curPos, ndx * MOVE_SPEED, ndy * MOVE_SPEED, barriers)
      );
    }
    frameRequestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    frameRequestRef.current = requestAnimationFrame(animate);
    return () => {
      if (frameRequestRef.current) cancelAnimationFrame(frameRequestRef.current);
    };
  }, [joystickDirection, barriers]);

  // Shift map so player stays in center
  const offsetX = SCREEN_WIDTH / 2 - playerWorldPos.x;
  const offsetY = SCREEN_HEIGHT / 2 - playerWorldPos.y;

  return (
    <View style={styles.container}>
      {/* Map */}
      <View style={[styles.mapContainer, { zIndex: 1 }]}>
        <View style={{ transform: [{ translateX: offsetX }, { translateY: offsetY }] }}>
          <TiledMap
            mapWidth={HellscapeMap.width}
            mapHeight={HellscapeMap.height}
            tileSize={TILE_SIZE}
            mapImage={mapFullImage}
          />
        </View>
      </View>

      {/* Barriers */}
      <Svg style={[StyleSheet.absoluteFill, { zIndex: 2 }]}>
        <G transform={`translate(${offsetX}, ${offsetY})`}>
          {barriers.map((poly, idx) => {
            const pointsStr = poly.map((p) => `${p.x},${p.y}`).join(' ');
            return (
              <Polygon
                key={idx}
                points={pointsStr}
                fill="rgba(255,0,0,0.3)"
                stroke="red"
                strokeWidth={2}
              />
            );
          })}
        </G>
      </Svg>

      {/* Player (always drawn at screen center) */}
      <Player
        x={0}
        y={0}
        direction={direction}
        isMoving={isMoving}
        isDashing={false}
      />

      {/* GameControls */}
      <GameController
        onMove={(dx, dy, dir) => {
          handleMove(dx, dy, dir);
          // Also save dx, dy so animate() can do continuous movement
          setJoystickDirection({ dx, dy });
        }}
        onShoot={handleShoot}
        onDash={() => console.log('Dash!')}
        onSpecial={() => console.log('Special!')}
        onUseItem={() => console.log('Use Item!')}
      />

      {/* Pause Button */}
      <TouchableOpacity
        onPress={() => setIsPaused(true)}
        style={styles.pauseButton}
      >
        <Text style={styles.pauseText}>Pause</Text>
      </TouchableOpacity>

      {/* Pause Menu */}
      <Modal visible={isPaused} transparent animationType="fade">
        <View style={styles.pauseMenu}>
          <Text style={styles.pauseText}>Game Paused</Text>
          <TouchableOpacity
            onPress={() => setIsPaused(false)}
            style={styles.menuButton}
          >
            <Text style={styles.pauseText}>Resume</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

// ——————————————————————————————————
// Styles
// ——————————————————————————————————
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  mapContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
  },
  pauseButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: 10,
    borderRadius: 5,
    zIndex: 9999,
  },
  pauseText: {
    color: 'white',
    fontSize: 16,
  },
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
