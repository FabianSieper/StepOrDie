export interface Position {
  x: number;
  y: number;
}

export enum TileType {
  WALL = 'WALL',
  FLOOR = 'FLOOR',
  GOAL = 'GOAL',
  UNKNOWN = 'UNKNOWN',
}

export interface Player {
  position: Position;
}

export enum EnemyType {
  MONSTER = 'MONSTER',
}

export interface Enemy {
  id: string;
  position: Position;
  type: EnemyType;
}

export interface GameState {
  width: number;
  height: number;
  grid: TileType[][];
  player: Player;
  enemies: Enemy[];
}
