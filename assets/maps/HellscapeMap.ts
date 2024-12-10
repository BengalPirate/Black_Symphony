import arcadeData from './arcade.json';
import otherProps from '../tilesets/other_props.png';
import decorativeProps from '../tilesets/decorative_props.png';
import mainLevelBuild from '../tilesets/mainlevbuild.png';
import trees from '../tilesets/Trees.png';
import tiles from '../tilesets/Tiles.png';
import volcBubble1 from '../tilesets/volc_bubble1.png';
import volcBubble2 from '../tilesets/volc_bubble2.png';
import rockSmoke1 from '../tilesets/rocksmoke1.png';
import rockSmoke2 from '../tilesets/rocksmoke2.png';
import rockSmoke3 from '../tilesets/rocksmoke3.png';
import rockSmoke4 from '../tilesets/rocksmoke4.png';

interface BaseLayer {
  id: number;
  name: string;
  opacity: number;
  type: string;
  visible: boolean;
  x: number;
  y: number;
}

interface TileLayer extends BaseLayer {
  type: 'tilelayer';
  data: number[];
  height: number;
  width: number;
}

interface TiledObject {
  id: number;
  name: string;
  type: string;
  visible: boolean;
  x: number;
  y: number;
  width?: number;
  height?: number;
  polygon?: { x: number; y: number }[];
  properties?: { name: string; type: string; value: any }[];
}

interface ObjectLayer extends BaseLayer {
  type: 'objectgroup';
  draworder: string;
  objects: TiledObject[];
}

type AnyLayer = TileLayer | ObjectLayer;

export interface TilesetInfo {
  firstgid: number;
  source: string;
  image: any;    // The imported image
  imageWidth: number;
  imageHeight: number;
  tilewidth: number;
  tileheight: number;
}

export interface HellscapeMap {
  compressionLevel: number;
  height: number;
  width: number;
  infinite: boolean;
  layers: AnyLayer[];
  tilesets: TilesetInfo[];
}

export const parseMap = (mapData: any): HellscapeMap => {
  if (
    typeof mapData !== 'object' ||
    typeof mapData.height !== 'number' ||
    typeof mapData.width !== 'number' ||
    !Array.isArray(mapData.layers) ||
    !Array.isArray(mapData.tilesets)
  ) {
    throw new Error('Invalid map data format');
  }

  // Map from tileset source file to image and dimensions
  const tilesetAssets: Record<string, { image: any; width: number; height: number }> = {
    'hell.tsx': { image: mainLevelBuild, width: 1760, height: 1024 },
    'hell_items.tsx': { image: decorativeProps, width: 512, height: 512 },
    'hell props.tsx': { image: otherProps, width: 256, height: 64 },
    'hell_assets.tsx': { image: tiles, width: 400, height: 400 }, // assuming tiles = hell_assets
    'MockUp-02.tsx': { image: tiles, width: 400, height: 400 }, // Adjust if different
    'MockUp-03.tsx': { image: tiles, width: 400, height: 400 }, // Adjust if different
    'Hell_Trees.tsx': { image: trees, width: 400, height: 400 },
    // Add other mappings if needed
  };

  const parsedLayers: AnyLayer[] = mapData.layers.map((layer: any) => {
    if (
      typeof layer.id !== 'number' ||
      typeof layer.name !== 'string' ||
      typeof layer.opacity !== 'number' ||
      typeof layer.type !== 'string' ||
      typeof layer.visible !== 'boolean' ||
      typeof layer.x !== 'number' ||
      typeof layer.y !== 'number'
    ) {
      throw new Error(`Invalid layer data: ${JSON.stringify(layer)}`);
    }

    switch (layer.type) {
      case 'tilelayer':
        if (!Array.isArray(layer.data) || typeof layer.height !== 'number' || typeof layer.width !== 'number') {
          throw new Error(`Invalid tile layer data: ${JSON.stringify(layer)}`);
        }
        return {
          id: layer.id,
          name: layer.name,
          opacity: layer.opacity,
          type: 'tilelayer' as const,
          visible: layer.visible,
          x: layer.x,
          y: layer.y,
          data: layer.data,
          height: layer.height,
          width: layer.width,
        };

      case 'objectgroup':
        if (!Array.isArray(layer.objects) || typeof layer.draworder !== 'string') {
          throw new Error(`Invalid object layer data: ${JSON.stringify(layer)}`);
        }
        return {
          id: layer.id,
          name: layer.name,
          opacity: layer.opacity,
          type: 'objectgroup' as const,
          visible: layer.visible,
          x: layer.x,
          y: layer.y,
          draworder: layer.draworder,
          objects: layer.objects.map((obj: any) => {
            if (
              typeof obj.id !== 'number' ||
              typeof obj.name !== 'string' ||
              typeof obj.type !== 'string' ||
              typeof obj.visible !== 'boolean' ||
              typeof obj.x !== 'number' ||
              typeof obj.y !== 'number'
            ) {
              throw new Error(`Invalid object data: ${JSON.stringify(obj)}`);
            }
            return {
              id: obj.id,
              name: obj.name,
              type: obj.type,
              visible: obj.visible,
              x: obj.x,
              y: obj.y,
              width: obj.width,
              height: obj.height,
              polygon: obj.polygon,
              properties: obj.properties,
            } as TiledObject;
          })
        };

      default:
        throw new Error(`Unsupported layer type: ${layer.type}`);
    }
  });

  // Parse tilesets
  const parsedTilesets: TilesetInfo[] = mapData.tilesets.map((ts: any) => {
    if (typeof ts.firstgid !== 'number' || typeof ts.source !== 'string') {
      throw new Error(`Invalid tileset data: ${JSON.stringify(ts)}`);
    }

    const sourceKey = ts.source.split('/').pop(); // e.g. "hell.tsx"
    const asset = tilesetAssets[sourceKey!];
    if (!asset) {
      throw new Error(`No tileset asset found for ${ts.source}`);
    }

    // You may need to load the .tsx to get tilewidth/tileheight if not given in JSON.
    // For simplicity, assume tilewidth and tileheight are 32 (as stated).
    const tilewidth = 32;
    const tileheight = 32;

    return {
      firstgid: ts.firstgid,
      source: sourceKey!,
      image: asset.image,
      imageWidth: asset.width,
      imageHeight: asset.height,
      tilewidth,
      tileheight,
    };
  });

  return {
    compressionLevel: mapData.compressionlevel ?? -1,
    height: mapData.height,
    width: mapData.width,
    infinite: !!mapData.infinite,
    layers: parsedLayers,
    tilesets: parsedTilesets,
  };
};

export const HellscapeMap = parseMap(arcadeData);
