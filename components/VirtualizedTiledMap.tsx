import React, { useState, useEffect } from 'react';
import { View, Image, StyleSheet } from 'react-native';

interface TileLayer {
  type: string;
  data?: number[];
  width?: number;
  height?: number;
}

interface TilesetInfo {
  firstgid: number;
  source: string;
  image: any;
  imageWidth: number;
  imageHeight: number;
  tilewidth: number;
  tileheight: number;
}

interface VirtualizedTiledMapProps {
  map: {
    width: number;
    height: number;
    layers: TileLayer[];
    tilesets: TilesetInfo[];
  };
  tileSize: number;

  playerX: number;
  playerY: number;
  screenWidth: number;
  screenHeight: number;
}

// Define these constants for your sprite's size
const SPRITE_DISPLAY_WIDTH = 64;  // Adjust based on your sprite size
const SPRITE_DISPLAY_HEIGHT = 80; // Adjust based on your sprite size

interface Hitbox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export default function VirtualizedTiledMap({
  map,
  tileSize,
  playerX,
  playerY,
  screenWidth,
  screenHeight,
}: VirtualizedTiledMapProps) {

  const playerHitbox: Hitbox = {
    x: playerX,
    y: playerY,
    width: SPRITE_DISPLAY_WIDTH,
    height: SPRITE_DISPLAY_HEIGHT,
  };

  // Collision detection function
  const isCollision = (playerHitbox: Hitbox, tileHitbox: Hitbox) => {
    return !(
      playerHitbox.x + playerHitbox.width <= tileHitbox.x || 
      playerHitbox.x >= tileHitbox.x + tileHitbox.width ||
      playerHitbox.y + playerHitbox.height <= tileHitbox.y || 
      playerHitbox.y >= tileHitbox.y + tileHitbox.height
    );
  };

  const tileLayers = map.layers.filter(
    (layer) => layer.type === 'tilelayer' && layer.data && layer.width && layer.height
  ) as Required<TileLayer>[];

  const findTileset = (gid: number): TilesetInfo | null => {
    let chosen: TilesetInfo | null = null;
    for (let i = 0; i < map.tilesets.length; i++) {
      const ts = map.tilesets[i];
      const nextTs = map.tilesets[i + 1];
      if (!nextTs || gid < nextTs.firstgid) {
        if (gid >= ts.firstgid) {
          chosen = ts;
          break;
        }
      }
    }
    return chosen;
  };

  const getTilePosition = (tileIndex: number, tileset: TilesetInfo): { sourceX: number; sourceY: number } => {
    const { tilewidth, tileheight, imageWidth } = tileset;
    const tilesPerRow = Math.floor(imageWidth / tilewidth);
    const localIndex = tileIndex - tileset.firstgid;
    const row = Math.floor(localIndex / tilesPerRow);
    const col = localIndex % tilesPerRow;
    const sourceX = col * tilewidth;
    const sourceY = row * tileheight;
    return { sourceX, sourceY };
  };

  const tilesVisibleX = Math.ceil(screenWidth / tileSize);
  const tilesVisibleY = Math.ceil(screenHeight / tileSize);
  const playerTileX = Math.floor(playerX / tileSize);
  const playerTileY = Math.floor(playerY / tileSize);

  const margin = 2;
  const startX = Math.max(playerTileX - Math.floor(tilesVisibleX / 2) - margin, 0);
  const startY = Math.max(playerTileY - Math.floor(tilesVisibleY / 2) - margin, 0);
  const endX = Math.min(playerTileX + Math.floor(tilesVisibleX / 2) + margin, map.width - 1);
  const endY = Math.min(playerTileY + Math.floor(tilesVisibleY / 2) + margin, map.height - 1);

  return (
    <View style={[styles.container, { width: map.width * tileSize, height: map.height * tileSize }]}>
      {tileLayers.map((layer, layerIndex) =>
        layer.data.map((tileIndex, i) => {
          if (tileIndex === 0) return null; // Empty tile
          
          const x = i % layer.width!;
          const y = Math.floor(i / layer.width!);

          if (x < startX || x > endX || y < startY || y > endY) {
            return null;
          }

          const tileset = findTileset(tileIndex);
          if (!tileset) return null;

          const { sourceX, sourceY } = getTilePosition(tileIndex, tileset);

          const tileHitbox: Hitbox = {
            x: x * tileSize,
            y: y * tileSize,
            width: tileSize,
            height: tileSize,
          };

          // Check for collision before rendering the tile
          if (isCollision(playerHitbox, tileHitbox)) {
            console.log('Collision detected at tile:', tileIndex);
            return null;  // Prevent rendering the tile if there's a collision
          }

          return (
            <View
              key={`${layerIndex}-${i}`}
              style={{
                position: 'absolute',
                top: y * tileSize,
                left: x * tileSize,
                width: tileSize,
                height: tileSize,
                overflow: 'hidden',
              }}
            >
              <Image
                source={tileset.image}
                style={{
                  width: tileset.imageWidth,
                  height: tileset.imageHeight,
                  position: 'absolute',
                  top: -sourceY,
                  left: -sourceX,
                }}
              />
            </View>
          );
        })
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    backgroundColor: 'white',
  },
});
