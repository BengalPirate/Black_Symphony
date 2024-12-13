/*import React, { useState, useEffect, useRef } from 'react';
import { View, Modal, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import Svg from 'react-native-svg';
import Player from '../../components/Player';
import GameController from '../../components/GameController';
import HealthBar from '../../components/HealthBar';
import StaminaBar from '../../components/StaminaBar';
import ActionButtons from '../../components/ActionButtons';
import { HellscapeMap } from '../../assets/maps/HellscapeMap';
import { movePlayer, Position } from '../../controllers/playerController';
import TiledMap from '../../components/TiledMap';
import mapFullImage from '../../assets/maps/map_full.png';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;

const MOVE_SPEED = 20;
const DASH_SPEED = 30; // Increased speed for dashing
const TILE_SIZE = 32;

export default function ArcadeScreen() {
  const mapWidthPx = HellscapeMap.width * TILE_SIZE;
  const mapHeightPx = HellscapeMap.height * TILE_SIZE;

  const [playerWorldPos, setPlayerWorldPos] = useState<Position>({
    x: mapWidthPx / 2,
    y: mapHeightPx / 2,
  });

  const [direction, setDirection] = useState("down"); // Default direction
  const [isMoving, setIsMoving] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const [health, setHealth] = useState(100);
  const [maxHealth] = useState(100);

  const [stamina, setStamina] = useState(100);
  const [maxStamina] = useState(100);
  const staminaRecoveryRate = 0.05;
  const staminaDashConsumption = 0.2; // per animation frame

  const [isDashing, setIsDashing] = useState(false);

  const frameRequestRef = useRef<number | null>(null);

  // Extract barrier polygons from HellscapeMap
  const [barriers] = useState(() => {
    const polygons: { x: number; y: number }[][] = [];
    for (const layer of HellscapeMap.layers) {
      if (layer.type === 'objectgroup') {
        for (const obj of layer.objects) {
          const isBarrierType = obj.type === 'barrier';
          const hasBarrierProp =
            obj.properties && obj.properties.some((p) => p.name === 'barrier' && p.value === true);
          if (obj.polygon && (isBarrierType || hasBarrierProp)) {
            const poly = obj.polygon.map((pt) => ({ x: obj.x + pt.x, y: obj.y + pt.y }));
            polygons.push(poly);
          }
        }
      }
    }
    return polygons;
  });

  // Joystick movement handler
  const handleMove = (dx: number, dy: number, newDirection: string) => {
    if (dx === 0 && dy === 0) {
      setIsMoving(false);
      return;
    }

    setIsMoving(true);
    setDirection(newDirection);

    const newX = playerWorldPos.x + dx * MOVE_SPEED;
    const newY = playerWorldPos.y + dy * MOVE_SPEED;

    // Clamp to screen or map bounds
    setPlayerWorldPos({
      x: Math.max(0, Math.min(mapWidthPx, newX)),
      y: Math.max(0, Math.min(mapHeightPx, newY)),
    });
  };

  // Animate movement and stamina
  const animate = () => {
    if (isDashing) {
      setStamina((prev) => Math.max(0, prev - staminaDashConsumption));
      if (stamina <= 0) {
        setIsDashing(false);
      }
    } else {
      setStamina((prev) => Math.min(maxStamina, prev + staminaRecoveryRate));
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
  }, [isDashing, stamina]);

  // Action handlers
  const handleDash = () => {
    if (stamina > 0) {
      setIsDashing(true);
    }
  };

  const handleShoot = () => {
    console.log('Shoot action triggered');
  };

  const handleSpecial = () => {
    console.log('Special action triggered');
  };

  const handleUseItem = () => {
    console.log('Use item action triggered');
  };

  // Map centering offset
  const offsetX = SCREEN_WIDTH / 2 - playerWorldPos.x;
  const offsetY = SCREEN_HEIGHT / 2 - playerWorldPos.y;

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
          </View>
        </Svg>
      </View>

      
      <Player
        x={playerWorldPos.x}
        y={playerWorldPos.y}
        direction={direction}
        isMoving={isMoving}
        isDashing={isDashing}
      />

      
      <GameController
        onMove={(dx, dy, dir) => handleMove(dx, dy, dir)}
        onShoot={handleShoot}
        onDash={handleDash}
      />

      
      <ActionButtons onDash={handleDash} onShoot={handleShoot} onSpecial={handleSpecial} onUseItem={handleUseItem} />

      
      <HealthBar currentHealth={health} maxHealth={maxHealth} />
      <StaminaBar currentStamina={stamina} maxStamina={maxStamina} />

      
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
    zIndex: 999,
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
*/
import React, { useState, useEffect, useRef } from 'react';
import { View, Modal, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import Svg, { Polygon } from 'react-native-svg';
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
  const mapWidthPx = HellscapeMap.width * TILE_SIZE;
  const mapHeightPx = HellscapeMap.height * TILE_SIZE;

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
          const hasBarrierProp = obj.properties?.some((p) => p.name === 'barrier' && p.value === true);
          if (obj.polygon && (isBarrierType || hasBarrierProp)) {
            const poly = obj.polygon.map((pt) => ({ x: obj.x + pt.x, y: obj.y + pt.y }));
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
      return;
    }

    setIsMoving(true);
    setDirection(newDirection);

    const newX = playerWorldPos.x + dx * MOVE_SPEED;
    const newY = playerWorldPos.y + dy * MOVE_SPEED;

    setPlayerWorldPos((current) =>
      movePlayer(
        { x: Math.max(0, Math.min(mapWidthPx, newX)), y: Math.max(0, Math.min(mapHeightPx, newY)) },
        dx * MOVE_SPEED,
        dy * MOVE_SPEED,
        barriers
      )
    );
  };

  // Shooting handler
  const handleShoot = (dx: number, dy: number) => {
    if (dx === 0 && dy === 0) return; // Do nothing if joystick is idle
  
    console.log(`Shooting in direction dx: ${dx}, dy: ${dy}`);
    
    // Example projectile creation
    createProjectile(playerWorldPos, { dx, dy });
  };
  
  const createProjectile = (startPos: Position, direction: { dx: number; dy: number }) => {
    console.log(`Projectile created at (${startPos.x}, ${startPos.y}) moving in direction (${direction.dx}, ${direction.dy})`);
    // Add your projectile rendering and movement logic here
  };
  

  const animate = () => {
    const { dx, dy } = joystickDirection;

    if (dx !== 0 || dy !== 0) {
      const length = Math.sqrt(dx * dx + dy * dy);
      const normalizedDX = dx / length;
      const normalizedDY = dy / length;
      setPlayerWorldPos((current) =>
        movePlayer(current, normalizedDX * MOVE_SPEED, normalizedDY * MOVE_SPEED, barriers)
      );
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

  const offsetX = SCREEN_WIDTH / 2 - playerWorldPos.x;
  const offsetY = SCREEN_HEIGHT / 2 - playerWorldPos.y;

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
            {barriers.map((poly, index) => {
              const pointsStr = poly.map((p) => `${p.x},${p.y}`).join(' ');
              return (
                <Polygon key={index} points={pointsStr} fill="rgba(255,0,0,0.3)" stroke="red" strokeWidth={2} />
              );
            })}
          </View>
        </Svg>
      </View>

      <Player
        x={playerWorldPos.x}
        y={playerWorldPos.y}
        direction={direction}
        isMoving={isMoving}
        isDashing={false}
      />

      <GameController
        onMove={(dx, dy, dir) => {
          handleMove(dx, dy, dir);
          setJoystickDirection({ dx, dy }); // For movement
        }}
        onShoot={(dx, dy) => handleShoot(dx, dy)} // For shooting
        onDash={() => console.log('Dash action triggered')}
        onSpecial={() => console.log('Special action triggered')}
        onUseItem={() => console.log('Use item action triggered')}
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
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: 10,
    borderRadius: 5,
    zIndex: 999,
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
