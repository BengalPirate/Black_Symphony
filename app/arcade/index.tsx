import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Modal,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ScaledSize,
  Platform,
} from 'react-native';
import Svg, { G, Polygon } from 'react-native-svg';
import Player from '../../components/Player';
import GameController from '../../components/GameController';
import Sprite from '@/components/Sprite';
import spriteSheet from '../../assets/sprites/stat_sprites/stats.png';
import { Direction } from '../../constants/types';
import { HellscapeMap } from '../../assets/maps/HellscapeMap';
import { movePlayer, Position } from '../../controllers/playerController';
import TiledMap from '../../components/TiledMap';
import mapFullImage from '../../assets/maps/map_full.png';

const initialWidth = Dimensions.get('window').width;
const initialHeight = Dimensions.get('window').height;
//console.log(`[ArcadeScreen] initial device width=${initialWidth}, height=${initialHeight}`);

interface DimensionsChangePayload {
  window: ScaledSize;
  screen: ScaledSize;
}

const MOVE_SPEED = 20;
const TILE_SIZE = 32;

export default function ArcadeScreen() {
  // Track actual device width/height state
  const [deviceWidth, setDeviceWidth] = useState(initialWidth);
  const [deviceHeight, setDeviceHeight] = useState(initialHeight);

  useEffect(() => {
    const handleDimChange = ({ window, screen }: DimensionsChangePayload) => {
      // ...
    };
    const subscription = Dimensions.addEventListener('change', handleDimChange);
    return () => subscription.remove();
  }, []);

  // We use deviceWidth/deviceHeight instead of static SCREEN_WIDTH/SCREEN_HEIGHT
  //console.log(`[ArcadeScreen] current deviceWidth=${deviceWidth}, deviceHeight=${deviceHeight}`);

  // Calculate total map size in “world coordinates.”
  const mapWidthPx = HellscapeMap.width * TILE_SIZE;
  const mapHeightPx = HellscapeMap.height * TILE_SIZE;

  // Player’s “world” position
  const [playerWorldPos, setPlayerWorldPos] = useState<Position>({
    x: mapWidthPx / 2,
    y: mapHeightPx / 2,
  });

  // Player state
  const [direction, setDirection] = useState<Direction>('down');
  const [isMoving, setIsMoving] = useState(false);

  // Pause
  const [isPaused, setIsPaused] = useState(false);

  // Joystick-based movement
  const [joystickDirection, setJoystickDirection] = useState({ dx: 0, dy: 0 });

  // requestAnimationFrame
  const frameRequestRef = useRef<number | null>(null);

  // Extract collision polygons
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

  const handleMove = (dx: number, dy: number, newDirection: Direction) => {
    if (dx === 0 && dy === 0) {
      setIsMoving(false);
    } else {
      setIsMoving(true);
      setDirection(newDirection);

      // Single immediate step
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
    setJoystickDirection({ dx, dy });
  };

  const handleShoot = (dx: number, dy: number) => {
    if (dx === 0 && dy === 0) return;
    console.log(`Shooting dx=${dx}, dy=${dy}`);
  };

  // Animate loop
  const animate = () => {
    const { dx, dy } = joystickDirection;
    if (dx !== 0 || dy !== 0) {
      const length = Math.sqrt(dx*dx + dy*dy);
      if (length > 0.001) {
        const ndx = (dx/length)*MOVE_SPEED;
        const ndy = (dy/length)*MOVE_SPEED;
        setPlayerWorldPos((prevPos) => 
          movePlayer(
            { x: prevPos.x + ndx, y: prevPos.y + ndy },
            ndx,
            ndy,
            barriers
          )
        );
      }
    }
    frameRequestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    frameRequestRef.current = requestAnimationFrame(animate);
    return () => {
      if (frameRequestRef.current) cancelAnimationFrame(frameRequestRef.current);
    };
  }, [joystickDirection, barriers]);

  // Instead of static SCREEN_WIDTH, use deviceWidth
  const offsetX = deviceWidth/2 - playerWorldPos.x;
  const offsetY = deviceHeight/2 - playerWorldPos.y;

  const heartFrames = [32, 64, 96, 128, 160, 192, 160, 128, 96, 64];
  const specialFrames = [32, 64, 96, 128, 160];
  const staminaFrames = [32, 64, 96, 128, 160, 128, 96, 64];
  const shieldFrames = [0, 32, 64, 96, 128, 160, 192, 192, 160, 128, 96, 64, 32, 0]
  
  // Row offsets in sprite sheet (for each icon):
  const HEART_Y = 0;     // 1st row
  const SPECIAL_Y = 96;  // 2nd row
  const STAMINA_Y = 144; // 4th row
  const SHIELD_Y =  192; // 5th row

  // ------------------------------------------
  // 1) Heart has its own frame index + speed
  // ------------------------------------------
  const [heartFrameIndex, setHeartFrameIndex] = useState(0);

  useEffect(() => {
    const heartInterval = setInterval(() => {
      setHeartFrameIndex((prev) => (prev + 1) % heartFrames.length);
    }, 150); // Heart: animate every 150ms
    return () => clearInterval(heartInterval);
  }, []);

  // ------------------------------------------
  // 2) Stamina has its own frame index + speed
  // ------------------------------------------
  const [staminaFrameIndex, setStaminaFrameIndex] = useState(0);

  useEffect(() => {
    const staminaInterval = setInterval(() => {
      setStaminaFrameIndex((prev) => (prev + 1) % staminaFrames.length);
    }, 70); // Stamina: animate every 70ms
    return () => clearInterval(staminaInterval);
  }, []);

  // ------------------------------------------
  // 3) Special has its own frame index + speed
  // ------------------------------------------
  const [specialFrameIndex, setSpecialFrameIndex] = useState(0);

  useEffect(() => {
    const specialInterval = setInterval(() => {
      setSpecialFrameIndex((prev) => (prev + 1) % specialFrames.length);
    }, 70); // Special: animate every 70ms
    return () => clearInterval(specialInterval);
  }, []);  

  // ------------------------------------------
  // 4) Shield has its own frame index + speed
  // ------------------------------------------
  const [shieldFrameIndex, setShieldFrameIndex] = useState(0);

  useEffect(() => {
    const shieldInterval = setInterval(() => {
      setShieldFrameIndex((prev) => (prev + 1) % shieldFrames.length);
    }, 100); // Special: animate every 300ms
    return () => clearInterval(shieldInterval);
  }, []);  

  return (
    <View style={styles.container}>
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

      {/* HEART ICON (1st row, unique speed) */}
      <View style={{ position: 'absolute', top: 0, left: 30 }}>
        <Sprite
          spriteSheet={spriteSheet}
          x={heartFrames[heartFrameIndex]}
          y={HEART_Y}
          width={64}  // double 32
          height={96} // double 48
          scale={2}   // upscales the sheet
        />
      </View>

      {/* STAMINA ICON (4th row, unique speed) */}
      <View style={{ position: 'absolute', top: 45, left: 30 }}>
        <Sprite
          spriteSheet={spriteSheet}
          x={staminaFrames[staminaFrameIndex]}
          y={STAMINA_Y}
          width={64}
          height={96}
          scale={2}
        />
      </View>

      {/* SPECIAL ICON (2nd row, unique speed) */}
      <View style={{ position: 'absolute', top: 350, left: 200 }}>
        <Sprite
          spriteSheet={spriteSheet}
          x={specialFrames[specialFrameIndex]}
          y={SPECIAL_Y}
          width={32}
          height={48}
          scale={1}
        />
      </View>

      {/* SHIELD ICON (2nd row, unique speed) */}
      <View style={{ position: 'absolute', top: 300, left: 200 }}>
        <Sprite
          spriteSheet={spriteSheet}
          x={shieldFrames[shieldFrameIndex]}
          y={SHIELD_Y}
          width={32}
          height={48}
          scale={1}
        />
      </View>

      <Svg style={StyleSheet.absoluteFill}>
        <G transform={`translate(${offsetX}, ${offsetY})`}>
          {barriers.map((poly, idx) => {
            const pointsStr = poly.map(p => `${p.x},${p.y}`).join(' ');
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

      <Player
        x={0}
        y={0}
        direction={direction}
        isMoving={isMoving}
        isDashing={false}
        worldX={playerWorldPos.x}
        worldY={playerWorldPos.y}
      />

      <GameController
        onMove={(dx, dy, dir) => handleMove(dx, dy, dir)}
        onShoot={handleShoot}
        onDash={() => console.log('Dash!')}
        onSpecial={() => console.log('Special!')}
        onUseItem={() => console.log('Use item!')}
      />

      <TouchableOpacity
        style={styles.pauseButton}
        onPress={() => setIsPaused(true)}
      >
        <Text style={styles.pauseText}>Pause</Text>
      </TouchableOpacity>

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

/* ---------------------------------------------------------- */
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
    alignItems: 'center',
    justifyContent: 'center',
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
