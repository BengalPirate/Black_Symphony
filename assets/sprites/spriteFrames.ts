// src/assets/sprites/spriteFrames.ts
import { Direction } from '../../constants/types';

// You can import each frame explicitly:
import up1 from './frames/up1.png';
import up2 from './frames/up2.png';
import up3 from './frames/up3.png';
import up4 from './frames/up4.png';

import down1 from './frames/down1.png';
import down2 from './frames/down2.png';
import down3 from './frames/down3.png';
import down4 from './frames/down4.png';

import left1 from './frames/left1.png';
import left2 from './frames/left2.png';
import left3 from './frames/left3.png';
import left4 from './frames/left4.png';

import right1 from './frames/right1.png';
import right2 from './frames/right2.png';
import right3 from './frames/right3.png';
import right4 from './frames/right4.png';

import ne1 from './frames/northeast1.png';
import ne2 from './frames/northeast2.png';
import ne3 from './frames/northeast3.png';
import ne4 from './frames/northeast4.png';

import se1 from './frames/southeast1.png';
import se2 from './frames/southeast2.png';
import se3 from './frames/southeast3.png';
import se4 from './frames/southeast4.png';

import nw1 from './frames/northwest1.png';
import nw2 from './frames/northwest2.png';
import nw3 from './frames/northwest3.png';
import nw4 from './frames/northwest4.png';

import sw1 from './frames/southwest1.png';
import sw2 from './frames/southwest2.png';
import sw3 from './frames/southwest3.png';
import sw4 from './frames/southwest4.png';

// ... etc. for northwest, southeast, southwest.

export const spriteFrames: Record<Direction, any[]> = {
  up: [up1, up2, up3, up4],
  down: [down1, down2, down3, down4],
  left: [left1, left2, left3, left4],
  right: [right1, right2, right3, right4],
  northeast: [ne1, ne2, ne3, ne4],
  northwest: [nw1, nw2, nw3, nw4],
  southeast: [se1, se2, se3, se4],
  southwest: [sw1, sw2, sw3, sw4],
};
