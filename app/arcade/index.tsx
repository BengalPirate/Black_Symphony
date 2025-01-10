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

import Player from '../../components/Player';
import EnemyDragon from '../../components/EnemyDragon'; // or wherever you put it
import GameController from '../../components/GameController';
import Sprite from '@/components/Sprite';

// Multiple sprite sheets
import spriteSheet from '../../assets/sprites/stat_sprites/stats.png';   // For “low” special
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
import EnemyProjectile from '@/components/attacks/EnemyProjectile';

// Redux
import { useSelector } from 'react-redux';
import { RootState } from '@/store'; // your store

// All mage frames
import { fireMageFrames } from '@/assets/sprites/player_sprites/fire_mage/fireMageFrames';
import { earthMageFrames } from '@/assets/sprites/player_sprites/earth_mage/earthMageFrames';
import { iceMageFrames } from '@/assets/sprites/player_sprites/ice_mage/iceMageFrames';
import { lightMageFrames } from '@/assets/sprites/player_sprites/light_mage/lightMageFrames';
import { windMageFrames } from '@/assets/sprites/player_sprites/wind_mage/windMageFrames';
import { timeMageFrames } from '@/assets/sprites/player_sprites/time_mage/timeMageFrames';
import { lightiningMageFrames } from '@/assets/sprites/player_sprites/lightning_mage/lightningMageFrames'; // fix spelling if needed
import { darkMageFrames } from '@/assets/sprites/player_sprites/dark_mage/darkMageFrames';


const initialWidth = Dimensions.get('window').width;
const initialHeight = Dimensions.get('window').height;

interface DimensionsChangePayload {
  window: ScaledSize;
  screen: ScaledSize;
}

const MOVE_SPEED = 3;
const TILE_SIZE = 32;

export default function ArcadeScreen() {
  // 1) Read selected mage from Redux
  const selectedMage = useSelector((state: RootState) => state.mage.selectedMage);

  // 2) Decide which frames object to use
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
  // Track device dims
  const [deviceWidth, setDeviceWidth] = useState(initialWidth);
  const [deviceHeight, setDeviceHeight] = useState(initialHeight);

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

  // Player’s “world” position
  const [playerWorldPos, setPlayerWorldPos] = useState<Position>({
    x: mapWidthPx / 2,
    y: mapHeightPx / 2,
  });

  // Player direction & movement
  const [direction, setDirection] = useState<Direction>('down');
  const [isMoving, setIsMoving] = useState(false);

  // Pause
  const [isPaused, setIsPaused] = useState(false);

  // Joystick
  const [joystickDirection, setJoystickDirection] = useState({ dx: 0, dy: 0 });

  // requestAnimationFrame
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

  // Movement
  const handleMove = (dx: number, dy: number, newDirection: Direction) => {
    // If joystick is at (0,0), not moving
    if (dx === 0 && dy === 0) {
      setIsMoving(false);
    } else {
      setIsMoving(true);
      setDirection(newDirection);

      // --- Normalize here ---
      const length = Math.sqrt(dx * dx + dy * dy);
      if (length > 0.0001) {
        dx = dx / length; 
        dy = dy / length;
      }

      setPlayerWorldPos((prevPos) => {
        const stepX = prevPos.x + dx * MOVE_SPEED;
        const stepY = prevPos.y + dy * MOVE_SPEED;
        return movePlayer(
          { x: stepX, y: stepY },
          dx * MOVE_SPEED,
          dy * MOVE_SPEED,
          barriers
        );
      });
    }
    setJoystickDirection({ dx, dy });
  };

  // Animate loop
  const animate = () => {
    const { dx, dy } = joystickDirection;
    if (dx !== 0 || dy !== 0) {
      const length = Math.sqrt(dx * dx + dy * dy);
      if (length > 0.001) {
        const ndx = (dx / length) * MOVE_SPEED;
        const ndy = (dy / length) * MOVE_SPEED;
        setPlayerWorldPos((prevPos) =>
          movePlayer({ x: prevPos.x + ndx, y: prevPos.y + ndy }, ndx, ndy, barriers)
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

  // Camera offset
  const offsetX = deviceWidth / 2 - playerWorldPos.x;
  const offsetY = deviceHeight / 2 - playerWorldPos.y;

  // This callback can be used if you want the enemy’s bounding box for collision
  // This callback can be used for collision or debugging
  const handleDragonHitboxUpdate = (box: {
    x: number;
    y: number;
    width: number;
    height: number;
  }) => {
    console.log('Dragon bounding box is', box);
  };

  // ------------------ FRAME ARRAYS ------------------
  // For normal, charged, super-charged special
  const specialLowFrames = [32, 64, 96, 128, 160];  // row=96 in stats.png
  const specialMedFrames = [32, 64, 96, 128, 160];  // row=0 in stats3
  const specialHighFrames = [32, 64, 96, 128, 160]; // row=48 in stats3

  // We’ll define other frames too
  const heartFrames = [32, 64, 96, 128, 160, 192, 160, 128, 96, 64];
  const staminaFrames = [32, 64, 96, 128, 160, 128, 96, 64];
  const shieldFrames = [0, 32, 64, 96, 128, 160, 192, 192, 160, 128, 96, 64, 32, 0];

  // Timer (from sheet2, partial example)
  const timerMovingFrames = [0, 32, 64, 96, 128, 160];
  const timerResetFrames = [0, 32, 64, 96, 128, 160, 192];
  const combinedTimerFrames = [
    ...timerMovingFrames.map(x => ({ x, y: 48 })),
    ...timerResetFrames.map(x => ({ x, y: 96 })),
  ];

  const rageMeterFrames = [0, 32, 64, 96, 128];
  const bossFrames = [0, 32, 64, 96, 128, 160, 192, 192, 160, 128, 96, 64, 32, 0];

  // Row offsets
  const HEART_Y = 0;     
  const SPECIAL_LOW_Y = 96;    // row=96 in sheet.png
  const SPECIAL_MED_Y = 0;     // row=0 in sheet3
  const SPECIAL_HIGH_Y = 48;   // row=48 in sheet3

  const STAMINA_Y = 144;
  const SHIELD_Y = 192;
  const RAGE_Y = 0;   // in sheet2
  const BOSS_Y = 144; // in sheet2

  // Suppose you want the dragon to be at (400, 500) in map/world space
  const DRAGON_X = 400;
  const DRAGON_Y = 500;

  // --------------- HEART ANIMATION ---------------
  const [heartFrameIndex, setHeartFrameIndex] = useState(0);
  useEffect(() => {
    const intId = setInterval(() => {
      setHeartFrameIndex(prev => (prev + 1) % heartFrames.length);
    }, 150);
    return () => clearInterval(intId);
  }, []);

  // --------------- STAMINA ANIMATION ---------------
  const [staminaFrameIndex, setStaminaFrameIndex] = useState(0);
  useEffect(() => {
    const intId = setInterval(() => {
      setStaminaFrameIndex(prev => (prev + 1) % staminaFrames.length);
    }, 70);
    return () => clearInterval(intId);
  }, []);

  // --------------- SHIELD ANIMATION ---------------
  const [shieldFrameIndex, setShieldFrameIndex] = useState(0);
  useEffect(() => {
    const intId = setInterval(() => {
      setShieldFrameIndex(prev => (prev + 1) % shieldFrames.length);
    }, 100);
    return () => clearInterval(intId);
  }, []);

  // --------------- TIMER ANIMATION ---------------
  const [timerFrameIndex, setTimerFrameIndex] = useState(0);
  useEffect(() => {
    const intId = setInterval(() => {
      setTimerFrameIndex(prev => (prev + 1) % combinedTimerFrames.length);
    }, 150);
    return () => clearInterval(intId);
  }, []);
  const currentTimerFrame = combinedTimerFrames[timerFrameIndex];

  // --------------- RAGE ANIMATION ---------------
  const [rageMeterFrameIndex, setRageMeterFrameIndex] = useState(0);
  useEffect(() => {
    const intId = setInterval(() => {
      setRageMeterFrameIndex(prev => (prev + 1) % rageMeterFrames.length);
    }, 35);
    return () => clearInterval(intId);
  }, []);

  // --------------- BOSS ANIMATION ---------------
  const [bossFrameIndex, setBossFrameIndex] = useState(0);
  useEffect(() => {
    const intId = setInterval(() => {
      setBossFrameIndex(prev => (prev + 1) % bossFrames.length);
    }, 35);
    return () => clearInterval(intId);
  }, []);

  // --------------- SPECIAL ATTACK ANIMATION ---------------
  // We allow up to 200% (2.0 ratio)
  const [playerSpecial, setPlayerSpecial] = useState(150);
  const [playerMaxSpecial, setPlayerMaxSpecial] = useState(100);

  // We'll manage a single "specialFrameIndex"
  const [specialFrameIndex, setSpecialFrameIndex] = useState(0);

  useEffect(() => {
    // Clear any prior interval
    let intId: NodeJS.Timeout | null = null;

    const ratio = playerSpecial / playerMaxSpecial; // up to 2.0
    if (ratio > 0) {
      // If we want to animate special whenever ratio>0 (or maybe only above 0.0),
      // we start an interval that increments specialFrameIndex every 70ms.
      intId = setInterval(() => {
        setSpecialFrameIndex(prev => prev + 1);
      }, 70);
    } else {
      // If ratio==0, we might reset specialFrameIndex=0 (optional).
      setSpecialFrameIndex(0);
    }

    return () => {
      if (intId) clearInterval(intId);
    };
  }, [playerSpecial, playerMaxSpecial]);

  function renderSpecialSprite() {
    // Decide which "loop" to use based on ratio
    const ratio = playerSpecial / playerMaxSpecial; // 0..2
    let frames: number[];
    let sheet: any;
    let rowY: number;

    if (ratio < 1.0) {
      // Below 100% => "Low" special
      frames = specialLowFrames;
      sheet = spriteSheet;   // first sprite sheet
      rowY = SPECIAL_LOW_Y;  // row=96
    } else if (ratio < 1.5) {
      // 100%..149% => "Charged" special
      frames = specialMedFrames;
      sheet = spriteSheet3;  // third sprite sheet
      rowY = SPECIAL_MED_Y;  // row=0
    } else {
      // ratio >= 1.5 => "Super" special
      frames = specialHighFrames;
      sheet = spriteSheet3;
      rowY = SPECIAL_HIGH_Y; // row=48
    }

    // specialFrameIndex can be any integer, so we mod it by frames.length
    const index = specialFrameIndex % frames.length;
    const xPos = frames[index];

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

  // ----- Other Stats/Bars -----
  const [playerHealth, setPlayerHealth] = useState(100);
  const [playerMaxHealth, setPlayerMaxHealth] = useState(100);

  const [playerStamina, setPlayerStamina] = useState(100);
  const [playerMaxStamina, setPlayerMaxStamina] = useState(100);

  const [currentShield, setCurrentShield] = useState(30);
  const [maxShield, setMaxShield] = useState(100);

  const [currentRage, setCurrentRage] = useState(50);
  const [maxRage, setMaxRage] = useState(100);

  const [currentTime, setCurrentTime] = useState(10);
  const [maxTime, setMaxTime] = useState(30);

  const [currentBossHP, setCurrentBossHP] = useState(7000);
  const [maxBossHP, setMaxBossHP] = useState(10000);

  // We track if we’re slashing:
  const [isSlashing, setIsSlashing] = useState(false);

  // Projectiles
  const [playerProjectiles, setPlayerProjectiles] = useState<
    { id: number; x: number; y: number; vx: number; vy: number }[]
  >([]);
  const nextProjectileId = useRef(1);

  const handleShoot = (dx: number, dy: number) => {
    if (dx === 0 && dy === 0) return;
    const length = Math.sqrt(dx*dx + dy*dy);
    if (length < 0.001) return;
    const speed = 10;
    const vx = dx / length;
    const vy = dy / length;
    const newId = nextProjectileId.current++;
    setPlayerProjectiles(prev => [
      ...prev,
      { id: newId, x: playerWorldPos.x, y: playerWorldPos.y, vx, vy },
    ]);
  };

  const removePlayerProjectile = (projId: number) => {
    setPlayerProjectiles(prev => prev.filter((p) => p.id !== projId));
  };

  // Suppose we press Melee => reduce stamina & start slash
  function handleMelee() {
    console.log('Melee pressed. current isSlashing=', isSlashing);
    if (playerStamina < 10) {
      console.log('Not enough stamina to slash!');
      return;
    }
    setPlayerStamina((prev) => prev - 10);
    setIsSlashing(true);
  }
  

  // If you want collision detection, define a function:
  function handleSwordCollision(box: { x: number; y: number; w: number; h: number }) {
    // For example, if you have an array of enemies with bounding boxes,
    // you can check overlap here. We do a simple log:
    console.log('Sword slash box:', box);

    // Check each enemy bounding box:
    // enemies.forEach((enemy) => {
    //   if (boxOverlap(box, enemy)) {
    //     console.log('Hit enemy', enemy.id);
    //     // reduce HP, etc.
    //   }
    // });
  }

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
          y={HEART_Y}
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
          y={STAMINA_Y}
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
          y={SHIELD_Y}
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
          y={RAGE_Y}
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
          y={BOSS_Y}
          width={48}
          height={72}
          scale={1.5}
        />
      </View>

      {/* SPECIAL ICON: 3 dynamic loops */}
      <View style={{ position: 'absolute', top: 340, left: 180 }}>
        {renderSpecialSprite()}
      </View>

      {/* Player projectiles */}
      {playerProjectiles.map((proj) => (
        <PlayerProjectile
          key={proj.id}
          startX={proj.x}
          startY={proj.y}
          velocityX={proj.vx}
          velocityY={proj.vy}
          speed={10}
          onRemove={() => removePlayerProjectile(proj.id)}
          offsetX={offsetX}
          offsetY={offsetY}
        />
      ))}

      {/* Collision debug, enemy projectiles, etc. */}
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

       {/* PLAYER */}
       <Player
        frames={frames}          // <--- Pass the chosen frames object here!
        x={0}
        y={0}
        direction={direction}
        isMoving={isMoving}
        isDashing={false}
        worldX={playerWorldPos.x}
        worldY={playerWorldPos.y}
      />

      {/* Enemy Dragon in the center */}
      <EnemyDragon
        worldX={DRAGON_X}
        worldY={DRAGON_Y}
        offsetX={offsetX}
        offsetY={offsetY}
        onUpdateHitbox={handleDragonHitboxUpdate}
        currentBossHealth={currentBossHP}
      />

      {/* The slash component */}
      <PlayerSwordSlash
        direction={direction}
        playerX={playerWorldPos.x}
        playerY={playerWorldPos.y}
        offsetX={offsetX}
        offsetY={offsetY}
        isSlashing={isSlashing}
        onEndSlash={() => {
          console.log('[Arcade] onEndSlash -> setIsSlashing(false)');
          setIsSlashing(false);
        }}
        onCheckCollision={handleSwordCollision}
      />


      {/* GAME CONTROLLER */}
      <GameController
        onMove={(dx, dy, dir) => handleMove(dx, dy, dir)}
        onShoot={handleShoot}
        onDash={() => console.log('Dash!')}
        onSpecial={() => console.log('Special!')}
        onUseItem={() => console.log('Use item!')}
        onMelee={handleMelee}
      />

      {/* PAUSE BUTTON */}
      <TouchableOpacity
        style={styles.pauseButton}
        onPress={() => setIsPaused(true)}
      >
        <Text style={styles.pauseText}>Pause</Text>
      </TouchableOpacity>

      {/* PAUSE MENU */}
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

/* ------------------------------------- */
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
