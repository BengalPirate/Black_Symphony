import React, { useState, useEffect, useRef } from 'react';
import PlayerSwordSlash from '@/components/PlayerSwordSlash';

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

import { useRouter } from 'expo-router';

import Player from '../../components/Player';
import EnemyDragon from '../../components/EnemyDragon';
import GameController from '../../components/GameController';
import Sprite from '@/components/Sprite';
import GameCollisionsHandler from '@/components/GameCollisionsHandler';

// Multiple sprite sheets
import spriteSheet from '../../assets/sprites/stat_sprites/stats.png';   // For "low" special
import spriteSheet2 from '../../assets/sprites/stat_sprites/stats2.png';
import spriteSheet3 from '../../assets/sprites/stat_sprites/stats3.png'; // For charged + super

import { Direction } from '../../constants/types';
import { HellscapeMap } from '../../assets/maps/HellscapeMap';
import { movePlayer, Position } from '../../controllers/playerController';
import TiledMap from '../../components/TiledMap';
import mapFullImage from '../../assets/maps/map_full.png';

// Bars/components
import ShieldBar from '@/components/playerstats/ShieldBar';
import StaminaBar from '@/components/playerstats/StaminaBar';
import HealthBar from '@/components/playerstats/HealthBar';
import SpecialAttackBar from '@/components/playerstats/SpecialAttackBar';
import RageMeterBar from '@/components/playerstats/RageMeterBar';
import TimerBar from '@/components/playerstats/TimerBar';
import BossHealthBar from '@/components/enemystats/BossHealthBar';
import PlayerProjectile from '@/components/attacks/PlayerProjectile';

// Redux
import { useSelector } from 'react-redux';
import { RootState } from '@/store';

// All mage frames
import { fireMageFrames } from '@/assets/sprites/player_sprites/fire_mage/fireMageFrames';
import { earthMageFrames } from '@/assets/sprites/player_sprites/earth_mage/earthMageFrames';
import { iceMageFrames } from '@/assets/sprites/player_sprites/ice_mage/iceMageFrames';
import { lightMageFrames } from '@/assets/sprites/player_sprites/light_mage/lightMageFrames';
import { windMageFrames } from '@/assets/sprites/player_sprites/wind_mage/windMageFrames';
import { timeMageFrames } from '@/assets/sprites/player_sprites/time_mage/timeMageFrames';
import { lightiningMageFrames } from '@/assets/sprites/player_sprites/lightning_mage/lightningMageFrames';
import { darkMageFrames } from '@/assets/sprites/player_sprites/dark_mage/darkMageFrames';

const initialWidth = Dimensions.get('window').width;
const initialHeight = Dimensions.get('window').height;

// Game constants
const MOVE_SPEED = 7;
const TILE_SIZE = 32;
const SPRITE_DISPLAY_WIDTH = 64;
const SPRITE_DISPLAY_HEIGHT = 80;
const PROJECTILE_SPEED = 5;

interface DimensionsChangePayload {
  window: ScaledSize;
  screen: ScaledSize;
}
interface ProjectileData {
  id: number;
  x: number;      // Starting X position
  y: number;      // Starting Y position
  vx: number;     // Velocity X
  vy: number;     // Velocity Y
}

// Define props interface for PlayerProjectile component
interface PlayerProjectileProps {
  x: number;
  y: number;
  vx: number;
  vy: number;
  onHit: () => void;
  onDestroy: () => void;
}

const PROJECTILE_ANCHOR_X = 64;
const PROJECTILE_ANCHOR_Y = 80;

const SHIFT_X = 310;
const SHIFT_Y = -175;

export default function ArcadeScreen() {
  const router = useRouter();

  // 1) Mage selection
  const selectedMage = useSelector((state: RootState) => state.mage.selectedMage);

  // 2) Choose frame set
  let frames;
  switch (selectedMage) {
    case 'earth':
      frames = earthMageFrames;
      break;
    case 'ice':
      frames = iceMageFrames;
      break;
    case 'light':
      frames = lightMageFrames;
      break;
    case 'wind':
      frames = windMageFrames;
      break;
    case 'time':
      frames = timeMageFrames;
      break;
    case 'lightning':
      frames = lightiningMageFrames;
      break;
    case 'dark':
      frames = darkMageFrames;
      break;
    default:
      frames = fireMageFrames;
      break;
  }

  // Device dims
  const [deviceWidth, setDeviceWidth] = useState<number>(initialWidth);
  const [deviceHeight, setDeviceHeight] = useState<number>(initialHeight);
 
  useEffect(() => {
    const handleDimChange = ({ window, screen }: DimensionsChangePayload) => {
      setDeviceWidth(window.width);
      setDeviceHeight(window.height);
    };
    const subscription = Dimensions.addEventListener('change', handleDimChange);
    return () => subscription.remove();
  }, []);

  // Map size
  const mapWidthPx = HellscapeMap.width * TILE_SIZE;
  const mapHeightPx = HellscapeMap.height * TILE_SIZE;

  // Player position
  const [playerWorldPos, setPlayerWorldPos] = useState<Position>({
    x: mapWidthPx / 2,
    y: mapHeightPx / 2,
  });

  

  const playerPosRef = useRef<Position>(playerWorldPos);

  function updatePlayerPos(x: number, y: number) {
    setPlayerWorldPos({ x, y });
    playerPosRef.current = { x, y };
  }

  const [direction, setDirection] = useState<Direction>('down');
  const [isMoving, setIsMoving] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [joystickDirection, setJoystickDirection] = useState({ dx: 0, dy: 0 });
  const frameRequestRef = useRef<number | null>(null);

  // Collision polygons
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

  
  function handleMove(dx: number, dy: number, newDirection: Direction) {
    if (dx === 0 && dy === 0) {
      setIsMoving(false);
    } else {
      setIsMoving(true);
      setDirection(newDirection);

      const length = Math.sqrt(dx * dx + dy * dy);
      if (length > 0.0001) {
        dx /= length;
        dy /= length;
      }

      setPlayerWorldPos((prevPos) => {
        const stepX = prevPos.x + dx * MOVE_SPEED;
        const stepY = prevPos.y + dy * MOVE_SPEED;
        const newPos = movePlayer(
          { x: stepX, y: stepY },
          dx * MOVE_SPEED,
          dy * MOVE_SPEED,
          barriers
        );
        playerPosRef.current = newPos;
        return newPos;
      });
    }
    setJoystickDirection({ dx, dy });
  }

  function animate() {
    if (!isPaused) {
      const { dx, dy } = joystickDirection;
      if (dx !== 0 || dy !== 0) {
        const length = Math.sqrt(dx * dx + dy * dy);
        if (length > 0.001) {
          const ndx = (dx / length) * MOVE_SPEED;
          const ndy = (dy / length) * MOVE_SPEED;
          setPlayerWorldPos((prevPos) => {
            const nextPos = movePlayer(
              { x: prevPos.x + ndx, y: prevPos.y + ndy },
              ndx,
              ndy,
              barriers
            );
            playerPosRef.current = nextPos;
            return nextPos;
          });
        }
      }
    }
    frameRequestRef.current = requestAnimationFrame(animate);
  }

  useEffect(() => {
    frameRequestRef.current = requestAnimationFrame(animate);
    return () => {
      if (frameRequestRef.current) cancelAnimationFrame(frameRequestRef.current);
    };
  }, [joystickDirection, barriers, isPaused]);


  

  // Camera offset
  const offsetX = deviceWidth / 2 - playerWorldPos.x;
  const offsetY = deviceHeight / 2 - playerWorldPos.y;

  // Bar animations
  const specialLowFrames = [32, 64, 96, 128, 160];
  const specialMedFrames = [32, 64, 96, 128, 160];
  const specialHighFrames = [32, 64, 96, 128, 160];

  const heartFrames = [32, 64, 96, 128, 160, 192, 160, 128, 96, 64];
  const staminaFrames = [32, 64, 96, 128, 160, 128, 96, 64];
  const shieldFrames = [0, 32, 64, 96, 128, 160, 192, 192, 160, 128, 96, 64, 32, 0];

  const timerMovingFrames = [0, 32, 64, 96, 128, 160];
  const timerResetFrames = [0, 32, 64, 96, 128, 160, 192];
  const combinedTimerFrames = [
    ...timerMovingFrames.map((x) => ({ x, y: 48 })),
    ...timerResetFrames.map((x) => ({ x, y: 96 })),
  ];

  const rageMeterFrames = [0, 32, 64, 96, 128];
  const bossFrames = [0, 32, 64, 96, 128, 160, 192, 192, 160, 128, 96, 64, 32, 0];

  const [heartFrameIndex, setHeartFrameIndex] = useState<number>(0);
  useEffect(() => {
    const intId = setInterval(() => {
      setHeartFrameIndex((prev) => (prev + 1) % heartFrames.length);
    }, 150);
    return () => clearInterval(intId);
  }, []);

  const [staminaFrameIndex, setStaminaFrameIndex] = useState<number>(0);
  useEffect(() => {
    const intId = setInterval(() => {
      setStaminaFrameIndex((prev) => (prev + 1) % staminaFrames.length);
    }, 70);
    return () => clearInterval(intId);
  }, []);

  const [shieldFrameIndex, setShieldFrameIndex] = useState<number>(0);
  useEffect(() => {
    const intId = setInterval(() => {
      setShieldFrameIndex((prev) => (prev + 1) % shieldFrames.length);
    }, 100);
    return () => clearInterval(intId);
  }, []);

  const [timerFrameIndex, setTimerFrameIndex] = useState<number>(0);
  useEffect(() => {
    const intId = setInterval(() => {
      setTimerFrameIndex((prev) => (prev + 1) % combinedTimerFrames.length);
    }, 150);
    return () => clearInterval(intId);
  }, []);
  const currentTimerFrame = combinedTimerFrames[timerFrameIndex];

  const [rageMeterFrameIndex, setRageMeterFrameIndex] = useState<number>(0);
  useEffect(() => {
    const intId = setInterval(() => {
      setRageMeterFrameIndex((prev) => (prev + 1) % rageMeterFrames.length);
    }, 35);
    return () => clearInterval(intId);
  }, []);

  const [bossFrameIndex, setBossFrameIndex] = useState<number>(0);
  useEffect(() => {
    const intId = setInterval(() => {
      setBossFrameIndex((prev) => (prev + 1) % bossFrames.length);
    }, 35);
    return () => clearInterval(intId);
  }, []);

  // Player stats and meters
  const [playerSpecial, setPlayerSpecial] = useState<number>(150);
  const [playerMaxSpecial, setPlayerMaxSpecial] = useState<number>(100);
  const [specialFrameIndex, setSpecialFrameIndex] = useState<number>(0);

  useEffect(() => {
    let intId: NodeJS.Timeout | null = null;
    const ratio = playerSpecial / playerMaxSpecial; 
    if (ratio > 0) {
      intId = setInterval(() => {
        setSpecialFrameIndex((prev) => prev + 1);
      }, 70);
    } else {
      setSpecialFrameIndex(0);
    }
    return () => {
      if (intId) clearInterval(intId);
    };
  }, [playerSpecial, playerMaxSpecial]);

  function renderSpecialSprite() {
    const ratio = playerSpecial / playerMaxSpecial;
    let framesArray: number[];
    let sheet: any;
    let rowY: number;

    if (ratio < 1.0) {
      framesArray = specialLowFrames;
      sheet = spriteSheet;
      rowY = 96; 
    } else if (ratio < 1.5) {
      framesArray = specialMedFrames;
      sheet = spriteSheet3;
      rowY = 0; 
    } else {
      framesArray = specialHighFrames;
      sheet = spriteSheet3;
      rowY = 48; 
    }

    const index = specialFrameIndex % framesArray.length;
    const xPos = framesArray[index];

    return (
      <Sprite
        spriteSheet={sheet}
        x={xPos}
        y={rowY}
        width={32}
        height={48}
        scale={1}
      />
    );
  }


  const [playerHealth, setPlayerHealth] = useState<number>(100);
  const [playerMaxHealth, setPlayerMaxHealth] = useState<number>(100);
  const [playerStamina, setPlayerStamina] = useState<number>(100);
  const [playerMaxStamina, setPlayerMaxStamina] = useState<number>(100);
  const [currentShield, setCurrentShield] = useState<number>(30);
  const [maxShield, setMaxShield] = useState<number>(100);
  const [currentRage, setCurrentRage] = useState<number>(50);
  const [maxRage, setMaxRage] = useState<number>(100);
  const [currentTime, setCurrentTime] = useState<number>(10);
  const [maxTime, setMaxTime] = useState<number>(30);
  const [currentBossHP, setCurrentBossHP] = useState<number>(300);
  const [maxBossHP, setMaxBossHP] = useState<number>(300);
  // is hurt 
  const [isHurt, setIsHurt] = useState(false);

  const handlePlayerDamage = React.useCallback(() => {
    console.log('Damage handler called');
    setPlayerHealth(prev => {
      const newHealth = Math.max(0, prev - 10);
      console.log('Health updated from', prev, 'to', newHealth);
      return newHealth;
    });
    setIsHurt(true);
    setTimeout(() => setIsHurt(false), 200);
  }, []);
  // Slashing
  const [isSlashing, setIsSlashing] = useState<boolean>(false);

  // Projectiles
  interface ProjectileData {
    id: number;
    logicX: number;
    logicY: number;
    x: number;      
    y: number;      
    vx: number;
    vy: number;
    damage: number;
  }
 
  
  const [playerProjectiles, setPlayerProjectiles] = useState<ProjectileData[]>([]);
  const nextProjectileId = useRef<number>(1);
  const PROJECTILE_SPEED = 5;

  function handleShoot(dx: number, dy: number) {
    if (dx === 0 && dy === 0) return;
    
    const length = Math.sqrt(dx * dx + dy * dy);
    if (length < 0.001) return;
    
    const vx = dx / length;
    const vy = dy / length;
    const newId = nextProjectileId.current++;
  
    // Get player's current position
    const { x: currentX, y: currentY } = playerPosRef.current;
  
    // Logic position is raw player position
    const logicX = currentX;
    const logicY = currentY;
  
    setPlayerProjectiles((prev) => [
      ...prev,
      {
        id: newId,
        logicX: logicX,
        logicY: logicY,
        x: logicX,
        y: logicY,
        vx,
        vy,
        damage: 10,  // Added damage property, adjust the value as needed
      },
    ]);
}
  function removePlayerProjectile(projId: number) {
    setPlayerProjectiles((prev) => prev.filter((p) => p.id !== projId));
  }

  function handleMelee() {
    if (isSlashing) {
      console.log('Already slashing, ignoring input.');
      return;
    }
    if (playerStamina < 10) {
      console.log('Not enough stamina to slash!');
      return;
    }
    setPlayerStamina((prev) => prev - 10);
    setIsSlashing(true);
    setTimeout(() => {
      setIsSlashing(false);
    }, 500);
  }

  function handleSwordCollision(box: { x: number; y: number; w: number; h: number }) {
    console.log('Sword slash box:', box);
  }

  // Handle projectile hit on boss
  const handleBossHit = () => {
    setCurrentBossHP(prev => Math.max(0, prev - 100));
  };

  
 
  return (
    <View style={styles.container}>
      {/* MAP */}
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

      {/* Add GameCollisionsHandler */}
      <GameCollisionsHandler
  mapWidth={mapWidthPx}
  mapHeight={mapHeightPx}
  offsetX={offsetX}
  offsetY={offsetY}
  playerX={playerWorldPos.x}
  playerY={playerWorldPos.y}
  playerWidth={32}
  playerHeight={32}
  onPlayerDamage={handlePlayerDamage}
  currentBossHP={currentBossHP}
  setCurrentBossHP={setCurrentBossHP}
  maxBossHP={maxBossHP}
/>

      {/* Update PlayerProjectiles rendering */}
      {playerProjectiles.map((projectile) => (
    <PlayerProjectile
        key={projectile.id}
        startX={projectile.x}
        startY={projectile.y}
        velocityX={projectile.vx}
        velocityY={projectile.vy}
        speed={PROJECTILE_SPEED}
        onRemove={() => removePlayerProjectile(projectile.id)}
        offsetX={offsetX}
        offsetY={offsetY}
        mapWidth={mapWidthPx}
        mapHeight={mapHeightPx}
    />
))}

      {/* Bars */}
      <HealthBar currentHealth={playerHealth} maxHealth={playerMaxHealth} />
    <StaminaBar currentStamina={playerStamina} maxStamina={playerMaxStamina} />
    <SpecialAttackBar currentSpecial={playerSpecial} maxSpecial={playerMaxSpecial} />
    <ShieldBar currentShield={currentShield} maxShield={maxShield} />
    <RageMeterBar currentRage={currentRage} maxRage={maxRage} />
    <TimerBar currentTime={currentTime} maxTime={maxTime} />
    <BossHealthBar currentBossHealth={currentBossHP} maxBossHealth={maxBossHP} />

      {/* HEART ICON */}
      <View style={{ position: 'absolute', top: 0, left: 30 }}>
        <Sprite
          spriteSheet={spriteSheet}
          x={heartFrames[heartFrameIndex]}
          y={0}
          width={48}
          height={72}
          scale={1.5}
        />
      </View>

      {/* STAMINA ICON */}
      <View style={{ position: 'absolute', top: 42, left: 30 }}>
        <Sprite
          spriteSheet={spriteSheet}
          x={staminaFrames[staminaFrameIndex]}
          y={144}
          width={48}
          height={72}
          scale={1.5}
        />
      </View>

      {/* SHIELD ICON */}
      <View style={{ position: 'absolute', top: 294, left: 180 }}>
        <Sprite
          spriteSheet={spriteSheet}
          x={shieldFrames[shieldFrameIndex]}
          y={192}
          width={32}
          height={48}
          scale={1}
        />
      </View>

      {/* TIMER ICON */}
      <View style={{ position: 'absolute', top: 282, left: 620 }}>
        <Sprite
          spriteSheet={spriteSheet2}
          x={currentTimerFrame.x}
          y={currentTimerFrame.y}
          width={48}
          height={72}
          scale={1.5}
        />
      </View>

      {/* RAGE ICON */}
      <View style={{ position: 'absolute', top: 328, left: 620 }}>
        <Sprite
          spriteSheet={spriteSheet2}
          x={rageMeterFrames[rageMeterFrameIndex]}
          y={0}
          width={48}
          height={72}
          scale={1.5}
        />
      </View>

      {/* BOSS ICON */}
      <View style={{ position: 'absolute', top: 4, left: 744 }}>
        <Sprite
          spriteSheet={spriteSheet2}
          x={bossFrames[bossFrameIndex]}
          y={144}
          width={48}
          height={72}
          scale={1.5}
        />
      </View>

      {/* SPECIAL ICON */}
      <View style={{ position: 'absolute', top: 340, left: 180 }}>
        {renderSpecialSprite()}
      </View>

      {/* Collision debug */}
      <Svg style={StyleSheet.absoluteFill}>
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

      {/* PLAYER */}
      <Player
        frames={frames}
        x={0}
        y={0}
        direction={direction}
        isMoving={isMoving}
        isDashing={false}
        worldX={playerWorldPos.x}
        worldY={playerWorldPos.y}
        style={isHurt ? { opacity: 0.5, backgroundColor: 'red' } : undefined}
      />

      <PlayerSwordSlash
        direction={direction}
        playerWorldPos={playerWorldPos}
        offsetX={offsetX}
        offsetY={offsetY}
        isSlashing={isSlashing}
        onEndSlash={() => setIsSlashing(false)}
        onCheckCollision={handleSwordCollision}
      />

      <GameController
        onMove={(dx, dy, dir) => handleMove(dx, dy, dir)}
        onShoot={handleShoot}
        onDash={() => console.log('Dash!')}
        onSpecial={() => console.log('Special!')}
        onUseItem={() => console.log('Use item!')}
        onMelee={handleMelee}
      />

      {/* Pause Button */}
      <TouchableOpacity
        style={styles.pauseButton}
        onPress={() => {
          setIsPaused(true);
        }}
      >
        <Text style={styles.pauseText}>Pause</Text>
      </TouchableOpacity>

      {/* Pause Overlay */}
      <Modal
        visible={isPaused}
        transparent
        animationType="fade"
        presentationStyle="overFullScreen"
        supportedOrientations={['portrait', 'landscape']}
      >
        <View style={styles.pauseMenu}>
          <Text style={{ color: '#fff', fontSize: 24, marginBottom: 20 }}>
            Game Paused
          </Text>

          <TouchableOpacity
            style={styles.menuButton}
            onPress={() => setIsPaused(false)}
          >
            <Text style={{ color: '#fff', fontSize: 16 }}>Resume</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuButton}
            onPress={() => {
              router.replace('/menu');
            }}
          >
            <Text style={{ color: '#fff', fontSize: 16 }}>Main Menu</Text>
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