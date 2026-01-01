import { Game, PlayingBoard } from '../model/game.model';
import { Entity } from './entities/entity';

export class Drawer {
  private lastTimeGameDrawed = 0;
  private readonly gameDrawInterval = 1000 / 30; // Draw game at 3 FPS

  public drawGame(ctx: CanvasRenderingContext2D, game: Game | undefined) {
    if (!this.shouldUpdateDrawing(Date.now())) return;
    if (!game) return;

    this.clearDrawingBoard(ctx);
    this.drawTiles(ctx, game.tiles, game.playingBoard);
    this.drawEnemies(ctx, game.enemies, game.playingBoard);

    // Draw player
    game.player.draw(ctx, game.playingBoard);
  }

  private shouldUpdateDrawing(timestamp: number): boolean {
    const shouldUpdate = timestamp - this.lastTimeGameDrawed >= this.gameDrawInterval;
    if (shouldUpdate) {
      this.lastTimeGameDrawed = timestamp;
      return true;
    }
    return false;
  }

  private drawTiles(ctx: CanvasRenderingContext2D, tiles: Entity[][], playingBoard: PlayingBoard) {
    tiles?.forEach((tileCol) => this.drawTileCol(ctx, tileCol, playingBoard));
  }

  private drawTileCol(ctx: CanvasRenderingContext2D, tiles: Entity[], playingBoard: PlayingBoard) {
    tiles?.filter(Boolean).forEach((tile) => tile.draw(ctx, playingBoard));
  }

  private drawEnemies(
    ctx: CanvasRenderingContext2D,
    enemies: Entity[],
    playingBoard: PlayingBoard
  ) {
    enemies?.forEach((enemy) => enemy.draw(ctx, playingBoard));
  }

  private clearDrawingBoard(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = '#333';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  }
}
