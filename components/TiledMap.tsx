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

interface TiledMapProps {
  map: {
    width: number;
    height: number;
    layers: TileLayer[];
    tilesets: TilesetInfo[];
  };
  tileSize: number;
}

const TiledMap: React.FC<TiledMapProps> = ({ map, tileSize }) => {
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
      // If this is the last tileset or the next tileset's firstgid is greater than gid
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

    // Adjust tileIndex by subtracting tileset.firstgid, so 1-based index within that tileset
    const localIndex = tileIndex - tileset.firstgid;
    const row = Math.floor(localIndex / tilesPerRow);
    const col = localIndex % tilesPerRow;
    const sourceX = col * tilewidth;
    const sourceY = row * tileheight;
    return { sourceX, sourceY };
  };

  return (
    <View style={[styles.container, { width: map.width * tileSize, height: map.height * tileSize }]}>
      {tileLayers.map((layer, layerIndex) => (
        layer.data.map((tileIndex, i) => {
          if (tileIndex === 0) return null; // Empty tile

          // Find the correct tileset for this tileIndex
          const tileset = findTileset(tileIndex);
          if (!tileset) return null;

          const x = (i % layer.width!) * tileSize;
          const y = Math.floor(i / layer.width!) * tileSize;
          const { sourceX, sourceY } = getTilePosition(tileIndex, tileset);

          return (
            <View
              key={`${layerIndex}-${i}`}
              style={{
                position: 'absolute',
                top: y,
                left: x,
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
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
});

export default TiledMap;
