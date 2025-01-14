import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import EnemyDragon from './EnemyDragon';
import PlayerProjectile from './attacks/PlayerProjectile';

interface GameCollisionsHandlerProps {
  mapWidth: number;
  mapHeight: number;
  offsetX: number;
  offsetY: number;
  playerX: number;
  playerY: number;
  playerWidth: number;
  playerHeight: number;
  onPlayerDamage?: () => void;
  currentBossHP: number;
  setCurrentBossHP: React.Dispatch<React.SetStateAction<number>>;
  maxBossHP: number;
}

interface Projectile {
  id: string;
  pos: {
    x: number;
    y: number;
  };
  velocityX: number;
  velocityY: number;
  speed: number;
  damage: number;
  onRemove: () => void;
}

const GameCollisionsHandler: React.FC<GameCollisionsHandlerProps> = ({
  mapWidth,
  mapHeight,
  offsetX,
  offsetY,
  playerX,
  playerY,
  playerWidth,
  playerHeight,
  onPlayerDamage,
  currentBossHP,
  setCurrentBossHP,
  maxBossHP,
}) => {
  const [projectiles, setProjectiles] = useState<Projectile[]>([]);
  const [dragonHitbox, setDragonHitbox] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);

  const DRAGON_WORLD_X = 1000;
  const DRAGON_WORLD_Y = 1000;
  const PROJECTILE_SIZE = 10;

  const handleUpdateDragonHitbox = useCallback((hitbox: {
    x: number;
    y: number;
    width: number;
    height: number;
  }) => {
    const screenHitbox = {
      x: DRAGON_WORLD_X + offsetX,
      y: DRAGON_WORLD_Y + offsetY,
      width: hitbox.width,
      height: hitbox.height
    };
    setDragonHitbox(screenHitbox);
    console.warn('Dragon hitbox updated:', screenHitbox);
  }, [offsetX, offsetY]);

  const handleDragonDamage = useCallback((damage: number) => {
    setCurrentBossHP((prevHealth) => {
      const newHealth = Math.max(0, prevHealth - damage);
      
      console.warn('Dragon Health Update:', {
        previousHealth: prevHealth,
        damageDealt: damage,
        newHealth: newHealth,
        maxHealth: maxBossHP
      });

      // Calculate which stage the dragon is in
      const stageHealth = maxBossHP / 3;
      let currentStage;
      if (newHealth > stageHealth * 2) {
        currentStage = 1;
      } else if (newHealth > stageHealth) {
        currentStage = 2;
      } else {
        currentStage = 3;
      }

      console.warn('Dragon Stage:', {
        stage: currentStage,
        stageHealth: stageHealth,
        remainingHealthInStage: newHealth % stageHealth
      });

      if (newHealth === 0) {
        console.warn('Dragon Defeated!');
      }

      return newHealth;
    });
  }, [maxBossHP]);

  const removeProjectile = useCallback((projectileId: string) => {
    setProjectiles((prev) => prev.filter((p) => p.id !== projectileId));
    console.warn('Removing projectile:', projectileId);
  }, []);

  const checkCollisions = useCallback(() => {
    if (!dragonHitbox) {
      console.warn('No dragon hitbox available');
      return;
    }

    // Convert player position to screen coordinates
    const playerScreenX = playerX + offsetX;
    const playerScreenY = playerY + offsetY;

    // Player bounds in screen coordinates
    const playerBounds = {
      left: playerScreenX,
      right: playerScreenX + playerWidth,
      top: playerScreenY,
      bottom: playerScreenY + playerHeight
    };

    // Dragon bounds in screen coordinates
    const dragonBounds = {
      left: dragonHitbox.x,
      right: dragonHitbox.x + dragonHitbox.width,
      top: dragonHitbox.y,
      bottom: dragonHitbox.y + dragonHitbox.height
    };

    if (__DEV__) {
      console.warn('Collision Check:', {
        player: {
          world: { x: playerX, y: playerY },
          screen: playerBounds
        },
        dragon: {
          world: { x: DRAGON_WORLD_X, y: DRAGON_WORLD_Y },
          screen: dragonBounds
        }
      });
    }

    // Check player-dragon collision
    const isPlayerColliding = !(
      playerBounds.left > dragonBounds.right ||
      playerBounds.right < dragonBounds.left ||
      playerBounds.top > dragonBounds.bottom ||
      playerBounds.bottom < dragonBounds.top
    );

    if (isPlayerColliding) {
      console.warn('Player-Dragon Collision!');
      onPlayerDamage?.();
    }

    // Projectile collision checks
    projectiles.forEach((projectile) => {
      // Convert projectile to screen coordinates
      const projectileScreenX = projectile.pos.x + offsetX;
      const projectileScreenY = projectile.pos.y + offsetY;

      const projectileBounds = {
        left: projectileScreenX,
        right: projectileScreenX + PROJECTILE_SIZE,
        top: projectileScreenY,
        bottom: projectileScreenY + PROJECTILE_SIZE
      };

      const isProjectileColliding = !(
        projectileBounds.left > dragonBounds.right ||
        projectileBounds.right < dragonBounds.left ||
        projectileBounds.top > dragonBounds.bottom ||
        projectileBounds.bottom < dragonBounds.top
      );

      if (isProjectileColliding) {
        console.warn('Projectile Hit:', {
          projectile: {
            id: projectile.id,
            screen: projectileBounds,
            world: projectile.pos
          },
          damage: projectile.damage
        });
        
        handleDragonDamage(projectile.damage);
        removeProjectile(projectile.id);
      }
    });
  }, [
    dragonHitbox,
    playerX,
    playerY,
    offsetX,
    offsetY,
    playerWidth,
    playerHeight,
    onPlayerDamage,
    projectiles,
    handleDragonDamage,
    removeProjectile
  ]);

  useEffect(() => {
    let frameId: number;
    
    const animate = () => {
      checkCollisions();
      frameId = requestAnimationFrame(animate);
    };

    frameId = requestAnimationFrame(animate);
    
    return () => {
      cancelAnimationFrame(frameId);
    };
  }, [checkCollisions]);

  return (
    <View style={styles.container}>
      <EnemyDragon
        worldX={DRAGON_WORLD_X}
        worldY={DRAGON_WORLD_Y}
        offsetX={offsetX}
        offsetY={offsetY}
        onUpdateHitbox={handleUpdateDragonHitbox}
        currentBossHealth={currentBossHP}
      />
      {projectiles.map((projectile) => (
        <PlayerProjectile
          key={projectile.id}
          startX={projectile.pos.x}
          startY={projectile.pos.y}
          velocityX={projectile.velocityX}
          velocityY={projectile.velocityY}
          speed={projectile.speed}
          onRemove={projectile.onRemove}
          offsetX={offsetX}
          offsetY={offsetY}
          mapWidth={mapWidth}
          mapHeight={mapHeight}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
});

export default GameCollisionsHandler;