import { Enemy, GameState } from '../../model/load-game-state-response.model';
import { Game, GameElement, PlayingBoard, SpriteDetails } from '../model/game.model';

var playingBoardPixelsX = 1000;
var playingBoardPixelsY = 1000;

export async function mapToGame(gameState: GameState): Promise<Game> {
  return {
    player: await extractPlayer(gameState),
    enemies: await extractEnemies(gameState),
    playingBoard: extractPlayingBoard(gameState),
  };
}

function extractPlayingBoard(gameState: GameState): PlayingBoard {
  return {
    width: playingBoardPixelsX,
    height: playingBoardPixelsY,
    amountFieldsX: gameState.width,
    amountFieldsY: gameState.height,
  };
}

async function extractEnemies(gameState: GameState): Promise<GameElement[]> {
  const enemyImage = await loadAssetAsImage('assets/sprites/enemy.png');
  return Promise.all(gameState.enemies.map((enemy) => mapEnemy(enemy, enemyImage)));
}

async function mapEnemy(enemy: Enemy, enemyImage: HTMLImageElement): Promise<GameElement> {
  const spriteDetails: SpriteDetails = createSpriteDetails(
    enemyImage,
    3, // cols
    5, // rows
    // Start at animation frame col 0 and row 4
    0,
    4
  );
  return {
    spriteDetails,
    position: { ...enemy.position },
  };
}

async function extractPlayer(gameState: GameState): Promise<GameElement> {
  const playerImage = await loadAssetAsImage('assets/sprites/player.png');
  const spriteDetails = createSpriteDetails(
    playerImage,
    3, // cols
    5, // rows
    // Start at animation frame col 0 and row 4
    0,
    4
  );
  return {
    spriteDetails,
    position: { x: gameState.player.position.x, y: gameState.player.position.y },
  };
}

async function loadAssetAsImage(path: string) {
  const image = new Image();
  image.src = path;
  await image.decode();
  return image;
}

function createSpriteDetails(
  image: HTMLImageElement,
  spriteCols: number,
  spriteRows: number,
  nextAnimationCol: number,
  nextAnimationRow: number
): SpriteDetails {
  return {
    image,
    amountCols: spriteCols,
    amountRows: spriteRows,
    frameWidth: Math.floor(image.naturalWidth / spriteCols),
    frameHeight: Math.floor(image.naturalHeight / spriteRows),
    nextAnimationCol,
    nextAnimationRow,
  };
}
