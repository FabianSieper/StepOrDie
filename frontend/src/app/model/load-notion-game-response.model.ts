export type TileType = 'WALL' | 'FLOOR' | 'GOAL' | 'UNKNOWN';

export type GameStatus = 'PLAYING' | 'WON' | 'GAME_OVER';

export interface Position {
  x: number;
  y: number;
}

export interface Player {
  position: Position;
  hp: number;
}

export interface Monster {
  id: string;
  position: Position;
  type: string;
  isDead: boolean;
}

export interface LoadNotionGameResponse {
  pageId: string;
}
