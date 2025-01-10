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
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
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
import ShieldBar from '@/components/playerstats/ShieldBar';
import StaminaBar from '@/components/playerstats/StaminaBar';
import HealthBar from '@/components/playerstats/HealthBar';
import SpecialAttackBar from '@/components/playerstats/SpecialAttackBar';
import { useRouter } from 'expo-router';

// Add the missing interface

// Define your navigation parameter list type
type RootStackParamList = {
  menu: undefined;
  arcade: undefined;
  // Add other screen routes as needed
};

// Create a typed navigation prop
type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'arcade'>;

const initialWidth = Dimensions.get('window').width;
const initialHeight = Dimensions.get('window').height;

interface DimensionsChangePayload {
  window: ScaledSize;
  screen: ScaledSize;
}

const initialWidth = Dimensions.get('window').width;
const initialHeight = Dimensions.get('window').height;

const MOVE_SPEED = 20;
const TILE_SIZE = 32;

export default function ArcadeScreen() {

  const router = useRouter();
  const navigation = useNavigation<NavigationProp>();


  const [deviceWidth, setDeviceWidth] = useState(initialWidth);
  const [deviceHeight, setDeviceHeight] = useState(initialHeight);

  useEffect(() => {
    const handleDimChange = ({ window, screen }: DimensionsChangePayload) => {
      // ...
    };
    const subscription = Dimensions.addEventListener('change', handleDimChange);
    return () => subscription.remove();
  }, []);


  // Calculate total map size in "world coordinates."
  const mapWidthPx = HellscapeMap.width * TILE_SIZE;
  const mapHeightPx = HellscapeMap.height * TILE_SIZE;

  // Player's "world" position
  const [playerWorldPos, setPlayerWorldPos] = useState<Position>({
    x: mapWidthPx / 2,
    y: mapHeightPx / 2,
  });

  const [direction, setDirection] = useState<Direction>('down');
  const [isMoving, setIsMoving] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [joystickDirection, setJoystickDirection] = useState({ dx: 0, dy: 0 });

  const frameRequestRef = useRef<number | null>(null);

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
    if (isPaused) return;

    if (dx === 0 && dy === 0) {
      setIsMoving(false);
    } else {
      setIsMoving(true);
      setDirection(newDirection);

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
    if (isPaused || dx === 0 && dy === 0) return;
    console.log(`Shooting dx=${dx}, dy=${dy}`);
  };

  const animate = () => {
    if (isPaused) return;

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
    if (!isPaused) {
      frameRequestRef.current = requestAnimationFrame(animate);
    }
    return () => {
      if (frameRequestRef.current) cancelAnimationFrame(frameRequestRef.current);
    };
  }, [isPaused, joystickDirection, barriers]);

  const offsetX = deviceWidth/2 - playerWorldPos.x;
  const offsetY = deviceHeight/2 - playerWorldPos.y;

  const heartFrames = [32, 64, 96, 128, 160, 192, 160, 128, 96, 64];
  const specialFrames = [32, 64, 96, 128, 160];
  const staminaFrames = [32, 64, 96, 128, 160, 128, 96, 64];
  const shieldFrames = [0, 32, 64, 96, 128, 160, 192, 192, 160, 128, 96, 64, 32, 0];
  
  // Row offsets in sprite sheet (for each icon):
  const HEART_Y = 0;     // 1st row
  const SPECIAL_Y = 96;  // 2nd row
  const STAMINA_Y = 144; // 4th row
  const SHIELD_Y =  192; // 5th row

  // Frame indices and their effects
  const [heartFrameIndex, setHeartFrameIndex] = useState(0);
  const [staminaFrameIndex, setStaminaFrameIndex] = useState(0);
  const [specialFrameIndex, setSpecialFrameIndex] = useState(0);
  const [shieldFrameIndex, setShieldFrameIndex] = useState(0);

  // Animation intervals
  useEffect(() => {
    const heartInterval = setInterval(() => {
      setHeartFrameIndex((prev) => (prev + 1) % heartFrames.length);
    }, 150);
    return () => clearInterval(heartInterval);
  }, []);

  useEffect(() => {
    const staminaInterval = setInterval(() => {
      setStaminaFrameIndex((prev) => (prev + 1) % staminaFrames.length);
    }, 70);
    return () => clearInterval(staminaInterval);
  }, []);

  useEffect(() => {
    const specialInterval = setInterval(() => {
      setSpecialFrameIndex((prev) => (prev + 1) % specialFrames.length);
    }, 70);
    return () => clearInterval(specialInterval);
  }, []);

  useEffect(() => {
    const shieldInterval = setInterval(() => {
      setShieldFrameIndex((prev) => (prev + 1) % shieldFrames.length);
    }, 100);
    return () => clearInterval(shieldInterval);
  }, []);

  // Player stats
  const [playerHealth, setPlayerHealth] = useState(80);
  const [playerMaxHealth, setPlayerMaxHealth] = useState(100);
  const [playerStamina, setPlayerStamina] = useState(50);
  const [playerMaxStamina, setPlayerMaxStamina] = useState(100);
  const [playerSpecial, setPlayerSpecial] = useState(25);
  const [playerMaxSpecial, setPlayerMaxSpecial] = useState(100);
  const [currentShield, setCurrentShield] = useState(30);
  const [maxShield, setMaxShield] = useState(100);

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

      <HealthBar currentHealth={playerHealth} maxHealth={playerMaxHealth} />
      <StaminaBar currentStamina={playerStamina} maxStamina={playerMaxStamina} />
      <SpecialAttackBar currentSpecial={playerSpecial} maxSpecial={playerMaxSpecial} />
      <ShieldBar currentShield={currentShield} maxShield={maxShield} />

      {/* Sprites */}
      <View style={{ position: 'absolute', top: 0, left: 30 }}>
        <Sprite
          spriteSheet={spriteSheet}
          x={heartFrames[heartFrameIndex]}
          y={HEART_Y}
          width={48}
          height={72}
          scale={1.5}
        />
      </View>

      <View style={{ position: 'absolute', top: 42, left: 30 }}>
        <Sprite
          spriteSheet={spriteSheet}
          x={staminaFrames[staminaFrameIndex]}
          y={STAMINA_Y}
          width={48}
          height={72}
          scale={1.5}
        />
      </View>

      <View style={{ position: 'absolute', top: 288, left: 200 }}>
        <Sprite
          spriteSheet={spriteSheet}
          x={shieldFrames[shieldFrameIndex]}
          y={SHIELD_Y}
          width={32}
          height={48}
          scale={1}
        />
      </View>

      <View style={{ position: 'absolute', top: 330, left: 200 }}>
        <Sprite
          spriteSheet={spriteSheet}
          x={specialFrames[specialFrameIndex]}
          y={SPECIAL_Y}
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
        onDash={() => {
          if (!isPaused) console.log('Dash!');
        }}
        onSpecial={() => {
          if (!isPaused) console.log('Special!');
        }}
        onUseItem={() => {
          if (!isPaused) console.log('Use item!');
        }}
      />

      <TouchableOpacity
        style={styles.pauseButton}
        onPress={() => setIsPaused(true)}
      >
        <Text style={styles.pauseText}>Pause</Text>
      </TouchableOpacity>

      <Modal visible={isPaused} transparent={true} animationType="fade">
        <View style={styles.pauseMenu}>
          <TouchableOpacity
            onPress={() => setIsPaused(false)}
            style={styles.menuButton}
          >
            <Text style={styles.pauseText}>Resume</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push('/menu')}
            style={styles.menuButton}
          >
            <Text style={styles.pauseText}>Quit</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

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
    backgroundColor: '#3a3a3a',
    padding: 10,
    borderRadius: 5,
    zIndex: 9999,
  },
  pauseText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  pauseMenu: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  menuButton: {
    marginVertical: 10,
    padding: 15,
    backgroundColor: '#333',
    borderRadius: 5,
    width: '50%',
    alignItems: 'center',
  },
});