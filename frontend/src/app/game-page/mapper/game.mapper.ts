import { EnemyDto, EnemyType, GameState, Game as DtoGame, TileType } from '../../model/game.model';
import { Enemy } from '../core-game/entities/enemy';
import { Player } from '../core-game/entities/player';
import { Tile } from '../core-game/entities/tile';
import { Game as DomainGame, PlayingBoard, Visuals } from '../model/game.model';

export async function mapToDomainGame(Game: DtoGame): Promise<DomainGame> {
  return {
    player: await extractPlayer(Game.state),
    enemies: await extractEnemies(Game.state),
    tiles: await extractTiles(Game),
    playingBoard: extractPlayingBoard(Game),
  };
}

export function mapToDtoGame(game: DomainGame): DtoGame {
  return {
    width: game.playingBoard.amountFieldsX,
    height: game.playingBoard.amountFieldsY,
    grid: mapTilesToGrid(game.tiles),
    state: mapDomainState(game),
  };
}

async function extractTiles(Game: DtoGame): Promise<Tile[][]> {
  return await mapToTiles(Game);
}

async function mapToTiles(Game: DtoGame): Promise<Tile[][]> {
  const floorVisuals = await mapFloorVisuals();
  const mountainsVisuals = await mapMountainsVisuals();
  const castleVisuals = await mapCastleVisuals();

  const tiles = Array.from({ length: Game.grid.length }, () =>
    Array(Game.grid[0].length).fill(undefined)
  );

  // For each tile, compute the corresponding Game Elements based on the tile type
  for (let row = 0; row < tiles.length; row++) {
    for (let col = 0; col < tiles[0].length; col++) {
      switch (Game.grid[row][col]) {
        case TileType.FLOOR: {
          tiles[row][col] = createTileGameElement(TileType.FLOOR, floorVisuals, col, row);
          break;
        }
        case TileType.WALL: {
          tiles[row][col] = createTileGameElement(TileType.WALL, mountainsVisuals, col, row);
          break;
        }
        case TileType.GOAL: {
          tiles[row][col] = createTileGameElement(TileType.GOAL, castleVisuals, col, row);
          break;
        }
        case TileType.UNKNOWN: {
          tiles[row][col] = undefined;
          break;
        }
      }
    }
  }
  return tiles;
}

function createTileGameElement(tileType: TileType, visuals: Visuals, x: number, y: number): Tile {
  return new Tile(tileType, {
    visuals,
    position: {
      x,
      y,
    },
  });
}

async function mapCastleVisuals(): Promise<Visuals> {
  const floorImage = await loadAssetAsImage('assets/sprites/castle.png');
  return createSpriteDetails(
    floorImage,
    1, // cols
    1, // rows
    // Start at animation frame col 0 and row 4
    0,
    0
  );
}

async function mapFloorVisuals(): Promise<Visuals> {
  const floorImage = await loadAssetAsImage('assets/sprites/floor.png');
  return createSpriteDetails(
    floorImage,
    1, // cols
    1, // rows
    // Start at animation frame col 0 and row 4
    0,
    0
  );
}

async function mapMountainsVisuals(): Promise<Visuals> {
  const floorImage = await loadAssetAsImage('assets/sprites/mountains.png');
  return createSpriteDetails(
    floorImage,
    1, // cols
    1, // rows
    // Start at animation frame col 0 and row 4
    0,
    0
  );
}

function extractPlayingBoard(Game: DtoGame): PlayingBoard {
  return {
    amountFieldsX: Game.width,
    amountFieldsY: Game.height,
  };
}

async function extractEnemies(gameState: GameState): Promise<Enemy[]> {
  const enemyImage = await loadAssetAsImage('assets/sprites/enemy.png');
  return gameState.enemies.map((enemy) => mapEnemy(enemy, enemyImage));
}

function mapEnemy(enemy: EnemyDto, enemyImage: HTMLImageElement): Enemy {
  const spriteDetails: Visuals = createSpriteDetails(
    enemyImage,
    3, // cols
    6, // rows
    // Start at animation frame col 0 and row 1
    0,
    1
  );
  return new Enemy({
    visuals: spriteDetails,
    position: { ...enemy.position },
  });
}

async function extractPlayer(gameState: GameState): Promise<Player> {
  const playerImage = await loadAssetAsImage('assets/sprites/player.png');
  const spriteDetails = createSpriteDetails(
    playerImage,
    3, // cols
    6, // rows
    // Start at animation frame col 0 and row 1
    0,
    1
  );
  return new Player({
    visuals: spriteDetails,
    position: { x: gameState.player.position.x, y: gameState.player.position.y },
  });
}

async function loadAssetAsImage(path: string) {
  const image = new Image();
  image.src = path;
  await image.decode();
  return image;
}

function mapDomainState(game: DomainGame): GameState {
  return {
    player: {
      position: { ...game.player.getPosition() },
    },
    enemies: mapDomainEnemies(game.enemies),
  };
}

function mapDomainEnemies(enemies: Enemy[]): EnemyDto[] {
  return enemies.map((enemy, index) => ({
    id: `enemy_${index + 1}`,
    position: { ...enemy.getPosition() },
    type: EnemyType.MONSTER,
  }));
}

function mapTilesToGrid(tiles: Tile[][]): TileType[][] {
  return tiles.map((row) =>
    row.map((tile) => {
      if (!tile) {
        return TileType.UNKNOWN;
      }
      if (tile.isGoal()) {
        return TileType.GOAL;
      }
      if (tile.isWalkable()) {
        return TileType.FLOOR;
      }
      return TileType.WALL;
    })
  );
}

function createSpriteDetails(
  image: HTMLImageElement,
  spriteCols: number,
  spriteRows: number,
  nextAnimationCol: number,
  nextAnimationRow: number
): Visuals {
  return {
    spriteDetails: {
      image,
      amountCols: spriteCols,
      amountRows: spriteRows,
      frameWidth: Math.floor(image.naturalWidth / spriteCols),
      frameHeight: Math.floor(image.naturalHeight / spriteRows),
    },
    animationDetails: {
      nextCol: nextAnimationCol,
      nextRow: nextAnimationRow,
    },
  };
}
