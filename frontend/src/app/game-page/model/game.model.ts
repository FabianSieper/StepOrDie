export interface Game {
  player: GameElement;
  enemies: GameElement[];
  tiles: (GameElement | undefined)[][]; // THe ground of the playing Board; first dimension is x, second y, from top to bottom
  playingBoard: PlayingBoard;
}

export enum SpriteTypes {
  PLAYER = 'PLAYER',
}

// Convention: Animations always exist within a row
export interface Visuals {
  spriteDetails: SpriteDetails;
  animationDetails: AnimationDetails;
}

export interface SpriteDetails {
  image: HTMLImageElement;
  frameWidth: number; // The width of one element within the sprite
  frameHeight: number; // The height of one element within the sprite
  amountCols: number;
  amountRows: number;
}

export interface AnimationDetails {
  nextCol: number; // The next column to be animated
  nextRow: number; // The next row to be animated
}

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface PlayingBoard {
  amountFieldsX: number;
  amountFieldsY: number;
}

export interface Position {
  x: number; // Tile number from left to right, starting from 0
  y: number; // Tile number from top to bottom, starting from 0
}

export interface GameElement {
  visuals: Visuals;
  position: Position;
}
