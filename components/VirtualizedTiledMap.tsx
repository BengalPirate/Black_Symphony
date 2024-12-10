import React from 'react';
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

  // These are required to determine which tiles are in view
  playerX: number;      // Player's world x-coordinate
  playerY: number;      // Player's world y-coordinate
  screenWidth: number;  // Width of the device screen
  screenHeight: number; // Height of the device screen
}

export default function VirtualizedTiledMap({
  map,
  tileSize,
  playerX,
  playerY,
  screenWidth,
  screenHeight,
}: VirtualizedTiledMapProps) {

  // Extract only tile layers
  const tileLayers = map.layers.filter(
    (layer) => layer.type === 'tilelayer' && layer.data && layer.width && layer.height
  ) as Required<TileLayer>[];

  // Helper to find the correct tileset for a given GID
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

    // Adjust tileIndex by subtracting tileset.firstgid to get the tile index local to that tileset
    const localIndex = tileIndex - tileset.firstgid;
    const row = Math.floor(localIndex / tilesPerRow);
    const col = localIndex % tilesPerRow;
    const sourceX = col * tilewidth;
    const sourceY = row * tileheight;
    return { sourceX, sourceY };
  };

  // Determine the range of tiles to render based on the player's position
  // Convert screen size to number of tiles visible
  const tilesVisibleX = Math.ceil(screenWidth / tileSize);
  const tilesVisibleY = Math.ceil(screenHeight / tileSize);

  // Center the view around the player
  const playerTileX = Math.floor(playerX / tileSize);
  const playerTileY = Math.floor(playerY / tileSize);

  // Add a margin of a few tiles to avoid pop-in at edges
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

          // Calculate the tile's x,y in tile coordinates
          const x = (i % layer.width!) ;
          const y = Math.floor(i / layer.width!);

          // Skip tiles outside the visible range
          if (x < startX || x > endX || y < startY || y > endY) {
            return null;
          }

          const tileset = findTileset(tileIndex);
          if (!tileset) return null;

          const { sourceX, sourceY } = getTilePosition(tileIndex, tileset);

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
    backgroundColor: 'white', // Just to confirm rendering area (optional)
  },
});
