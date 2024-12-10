export interface Position {
  x: number;
  y: number;
}

export function pointInPolygon(px: number, py: number, polygon: { x: number; y: number }[]): boolean {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].x, yi = polygon[i].y;
    const xj = polygon[j].x, yj = polygon[j].y;
    const intersect = ((yi > py) !== (yj > py)) &&
                      (px < (xj - xi) * (py - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

export function movePlayer(currentPosition: Position, dx: number, dy: number, barriers: { x: number; y: number }[][]): Position {
  const proposed = { x: currentPosition.x + dx, y: currentPosition.y + dy };

  // Check collision: If player center is inside any barrier polygon, don't move
  for (const poly of barriers) {
    if (pointInPolygon(proposed.x, proposed.y, poly)) {
      // Colliding, return original position
      return currentPosition;
    }
  }

  return proposed;
}
