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

export interface PlayerDto {
  position: Position;
}

export enum EnemyType {
  MONSTER = 'MONSTER',
}

export interface EnemyDto {
  id: string;
  position: Position;
  type: EnemyType;
}

export interface GameState {
  player: PlayerDto;
  enemies: EnemyDto[];
}

export interface Game {
  width: number;
  height: number;
  grid: TileType[][];
  state: GameState;
}
