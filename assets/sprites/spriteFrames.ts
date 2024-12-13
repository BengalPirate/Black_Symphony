// src/assets/sprites/spriteFrames.ts
import { Direction } from '../../constants/types'

export const spriteFrames: Record<Direction, any[]> = {
    up: [
      require('./frames/up1.png'),
      require('./frames/up2.png'),
      require('./frames/up3.png'),
      require('./frames/up4.png'),
    ],
    down: [
      require('./frames/down1.png'),
      require('./frames/down2.png'),
      require('./frames/down3.png'),
      require('./frames/down4.png'),
    ],
    left: [
      require('./frames/left1.png'),
      require('./frames/left2.png'),
      require('./frames/left3.png'),
      require('./frames/left4.png'),
    ],
    right: [
      require('./frames/right1.png'),
      require('./frames/right2.png'),
      require('./frames/right3.png'),
      require('./frames/right4.png'),
    ],
    northeast: [
      require('./frames/northeast1.png'),
      require('./frames/northeast2.png'),
      require('./frames/northeast3.png'),
      require('./frames/northeast4.png'),
    ],
    northwest: [
      require('./frames/northwest1.png'),
      require('./frames/northwest2.png'),
      require('./frames/northwest3.png'),
      require('./frames/northwest4.png'),
    ],
    southeast: [
      require('./frames/southeast1.png'),
      require('./frames/southeast2.png'),
      require('./frames/southeast3.png'),
      require('./frames/southeast4.png'),
    ],
    southwest: [
      require('./frames/southwest1.png'),
      require('./frames/southwest2.png'),
      require('./frames/southwest3.png'),
      require('./frames/southwest4.png'),
    ],
  };
  
  