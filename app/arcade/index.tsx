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

const MOVE_SPEED = 20;   // Speed per joystick "step"
const TILE_SIZE = 32;    // Size of each tile in the Tiled map

export default function ArcadeScreen() {
  // 1) Calculate total map size in “world coordinates.”
  const mapWidthPx = HellscapeMap.width * TILE_SIZE;
  const mapHeightPx = HellscapeMap.height * TILE_SIZE;

  // 2) Player’s “world” position
  const [playerWorldPos, setPlayerWorldPos] = useState<Position>({
    x: mapWidthPx / 2,
    y: mapHeightPx / 2,
  });

  // 3) Player state: direction & movement flags
  const [direction, setDirection] = useState<Direction>('down');
  const [isMoving, setIsMoving] = useState(false);

  // 4) Pause modal
  const [isPaused, setIsPaused] = useState(false);

  // 5) Joystick-based movement
  const [joystickDirection, setJoystickDirection] = useState({ dx: 0, dy: 0 });

  // requestAnimationFrame reference
  const frameRequestRef = useRef<number | null>(null);

  // 6) Extract collision polygons from Tiled
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
   * handleMove:
   * Called when the movement joystick changes (dx, dy, direction).
   * We do a single immediate step to avoid the sprite not appearing on first move,
   * then rely on the animate() loop for continuous motion.
   */
  const handleMove = (dx: number, dy: number, newDirection: Direction) => {
    if (dx === 0 && dy === 0) {
      setIsMoving(false);
    } else {
      setIsMoving(true);
      setDirection(newDirection);

      // Immediate single-step movement for visual responsiveness
      setPlayerWorldPos((prevPos) => {
        const stepX = prevPos.x + dx * MOVE_SPEED;
        const stepY = prevPos.y + dy * MOVE_SPEED;
        return movePlayer(
          {
            x: Math.max(0, Math.min(mapWidthPx, stepX)),
            y: Math.max(0, Math.min(mapHeightPx, stepY)),
          },
          dx * MOVE_SPEED,
          dy * MOVE_SPEED,
          barriers
        );
      });
    }

    // Store the joystick direction for animate() to do continuous movement
    setJoystickDirection({ dx, dy });
  };

  /**
   * handleShoot:
   * Called when shooting joystick changes (dx, dy).
   */
  const handleShoot = (dx: number, dy: number) => {
    if (dx === 0 && dy === 0) return;
    console.log(`Shooting dx=${dx}, dy=${dy}`);
    // Could spawn projectile, etc.
  };

  /**
   * animate:
   * Each frame, if joystickDirection != (0,0), move the player a small step.
   */
  const animate = () => {
    const { dx, dy } = joystickDirection;
    if (dx !== 0 || dy !== 0) {
      const length = Math.sqrt(dx * dx + dy * dy);
      if (length > 0.001) {
        const ndx = (dx / length) * MOVE_SPEED;
        const ndy = (dy / length) * MOVE_SPEED;

        setPlayerWorldPos((curPos) =>
          movePlayer(
            {
              x: curPos.x + ndx,
              y: curPos.y + ndy,
            },
            ndx,
            ndy,
            barriers
          )
        );
      }
    }
    frameRequestRef.current = requestAnimationFrame(animate);
  };

  // Start the animation loop
  useEffect(() => {
    frameRequestRef.current = requestAnimationFrame(animate);
    return () => {
      if (frameRequestRef.current) cancelAnimationFrame(frameRequestRef.current);
    };
  }, [joystickDirection, barriers]);

  // 7) Offset so the player is at screen center
  const offsetX = SCREEN_WIDTH / 2 - playerWorldPos.x;
  const offsetY = SCREEN_HEIGHT / 2 - playerWorldPos.y;

  return (
    <View style={styles.container}>
      {/* 1) Tiled Map behind everything, offset for center */}
      <View style={styles.mapContainer}>
        <View style={{ transform: [{ translateX: offsetX }, { translateY: offsetY }] }}>
          <TiledMap
            mapWidth={HellscapeMap.width}
            mapHeight={HellscapeMap.height}
            tileSize={TILE_SIZE}
            mapImage={mapFullImage}
          />
        </View>
      </View>

      {/* 2) Barriers in Svg, same offset */}
      <Svg style={StyleSheet.absoluteFill}>
        <G transform={`translate(${offsetX}, ${offsetY})`}>
          {barriers.map((poly, idx) => {
            const points = poly.map((p) => `${p.x},${p.y}`).join(' ');
            return (
              <Polygon
                key={idx}
                points={points}
                fill="rgba(255,0,0,0.3)"
                stroke="red"
                strokeWidth={2}
              />
            );
          })}
        </G>
      </Svg>

      {/* 3) Player always drawn at screen center (via Player.tsx logic) */}
      <Player
        x={0}
        y={0}
        direction={direction}
        isMoving={isMoving}
        isDashing={false}
      />

      {/* 4) Dual joysticks for movement + shooting */}
      <GameController
        onMove={(dx, dy, dir) => handleMove(dx, dy, dir)}
        onShoot={handleShoot}
        onDash={() => console.log('Dash!')}
        onSpecial={() => console.log('Special!')}
        onUseItem={() => console.log('Use item!')}
      />

      {/* 5) Pause button */}
      <TouchableOpacity
        onPress={() => setIsPaused(true)}
        style={styles.pauseButton}
      >
        <Text style={styles.pauseText}>Pause</Text>
      </TouchableOpacity>

      {/* 6) Pause modal */}
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

/* ----------------------------------------------------------------
   Styles
---------------------------------------------------------------- */
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
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 10,
    borderRadius: 5,
    zIndex: 9999,
  },
  pauseText: {
    color: '#fff',
    fontSize: 16,
  },
  pauseMenu: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  menuButton: {
    marginTop: 20,
    padding: 15,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 5,
    width: '50%',
    alignItems: 'center',
  },
});
