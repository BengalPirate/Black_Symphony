import React, { useState, useEffect, useRef, useContext } from 'react';
import {
  View,
  Modal,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ScaledSize,
} from 'react-native';
import Svg, { G, Polygon } from 'react-native-svg';
import Player from '../../components/Player';
import GameController from '../../components/GameController';
import { Direction } from '../../constants/types';
import { HellscapeMap } from '../../assets/maps/HellscapeMap';
import { movePlayer, Position } from '../../controllers/playerController';
import TiledMap from '../../components/TiledMap';
import mapFullImage from '../../assets/maps/map_full.png';
import { BgVideoContext } from '../_layout'; // Import context
import { useRouter } from 'expo-router'; // Import router
import ShieldBar from '@/components/playerstats/ShieldBar';
import StaminaBar from '@/components/playerstats/StaminaBar';
import HealthBar from '@/components/playerstats/HealthBar';
import SpecialAttackBar from '@/components/playerstats/SpecialAttackBar';

const initialWidth = Dimensions.get('window').width;
const initialHeight = Dimensions.get('window').height;

const MOVE_SPEED = 20;
const TILE_SIZE = 32;

export default function ArcadeScreen() {
  const [deviceWidth, setDeviceWidth] = useState(initialWidth);
  const [deviceHeight, setDeviceHeight] = useState(initialHeight);
  const [playerWorldPos, setPlayerWorldPos] = useState<Position>({
    x: (HellscapeMap.width * TILE_SIZE) / 2,
    y: (HellscapeMap.height * TILE_SIZE) / 2,
  });
  const [direction, setDirection] = useState<Direction>('down');
  const [isMoving, setIsMoving] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [joystickDirection, setJoystickDirection] = useState({ dx: 0, dy: 0 });

  const frameRequestRef = useRef<number | null>(null);
  const { fadeOutMusicAndStop } = useContext(BgVideoContext); // Access context
  const router = useRouter(); // Initialize router

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

  const handlePausePress = (destination: '/menu') => {
    fadeOutMusicAndStop(); // Fade out music
    router.push(destination); // Navigate to the specified destination
  };

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
            x: Math.max(0, Math.min(HellscapeMap.width * TILE_SIZE, stepX)),
            y: Math.max(0, Math.min(HellscapeMap.height * TILE_SIZE, stepY)),
          },
          dx * MOVE_SPEED,
          dy * MOVE_SPEED,
          barriers
        );
      });
    }
    setJoystickDirection({ dx, dy });
  };

  const animate = () => {
    if (isPaused) return;

    const { dx, dy } = joystickDirection;
    if (dx !== 0 || dy !== 0) {
      const length = Math.sqrt(dx * dx + dy * dy);
      if (length > 0.001) {
        const ndx = (dx / length) * MOVE_SPEED;
        const ndy = (dy / length) * MOVE_SPEED;

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

  const offsetX = deviceWidth / 2 - playerWorldPos.x;
  const offsetY = deviceHeight / 2 - playerWorldPos.y;

  // ----- DEFINE THE MISSING STATS HERE! -----
  const [playerHealth, setPlayerHealth] = useState(80);
  const [playerMaxHealth, setPlayerMaxHealth] = useState(100);

  const [playerStamina, setPlayerStamina] = useState(50);
  const [playerMaxStamina, setPlayerMaxStamina] = useState(100);

  const [playerSpecial, setPlayerSpecial] = useState(25);
  const [playerMaxSpecial, setPlayerMaxSpecial] = useState(100);

  // Shield bar example
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

      {/* Health bar */}
      <HealthBar currentHealth={playerHealth} maxHealth={playerMaxHealth} />

      {/* Stamina bar */}
      <StaminaBar currentStamina={playerStamina} maxStamina={playerMaxStamina} />

      {/* Special Attack bar */}
      <SpecialAttackBar currentSpecial={playerSpecial} maxSpecial={playerMaxSpecial} />

      {/* New Shield bar (positioned below the others in the example) */}
      <ShieldBar currentShield={currentShield} maxShield={maxShield} />

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

      {/* SHIELD ICON (2nd row, unique speed) */}
      <View style={{ position: 'absolute', top: 270, left: 200 }}>
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
          {barriers.map((poly, idx) => (
            <Polygon
              key={idx}
              points={poly.map((p) => `${p.x},${p.y}`).join(' ')}
              fill="rgba(255,0,0,0.3)"
              stroke="red"
              strokeWidth={2}
            />
          ))}
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
        onShoot={() => {
          if (!isPaused) console.log('Shoot!');
        }}
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
    <Text style={styles.pauseText}>Game Paused</Text>

    {/* Resume Button */}
    <TouchableOpacity
      onPress={() => setIsPaused(false)}
      style={styles.menuButton}
    >
      <Text style={styles.pauseText}>Resume</Text>
    </TouchableOpacity>

    {/* Quit Button */}
    <TouchableOpacity
      onPress={() => handlePausePress('/menu')}
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
    backgroundColor: '#3a3a3a', // Updated to darkish grey
    padding: 10,
    borderRadius: 5,
    zIndex: 9999,
  },
  pauseMenu: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)', // Semi-transparent black background
  },
  menuButton: {
    marginVertical: 10, // Add spacing between buttons
    padding: 15,
    backgroundColor: 'rgba(255,255,255,0.3)', // Semi-transparent white button background
    borderRadius: 5,
    width: '50%',
    alignItems: 'center',
  },
  pauseText: {
    color: '#fff',
    fontSize: 20, // Larger font size for better readability
    fontWeight: 'bold', // Bold text for emphasis
  },
});
