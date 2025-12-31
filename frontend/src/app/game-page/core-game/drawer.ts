import { Game, PlayingBoard, Position, Rect, Visuals } from '../model/game.model';
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
    this.drawGameElement(ctx, game.player, game.playingBoard);
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
    tiles?.filter(Boolean).forEach((tile) => this.drawGameElement(ctx, tile, playingBoard));
  }

  private drawEnemies(
    ctx: CanvasRenderingContext2D,
    enemies: Entity[],
    playingBoard: PlayingBoard
  ) {
    enemies?.forEach((enemy) => this.drawGameElement(ctx, enemy, playingBoard));
  }

  private drawGameElement(
    ctx: CanvasRenderingContext2D,
    gameEntity: Entity,
    playingBoard: PlayingBoard
  ) {
    const visuals = gameEntity.getVisuals();

    const source = this.calculateSpriteSection(visuals);
    const target = this.calculateBoardTarget(ctx, gameEntity.getPosition(), playingBoard);

    this.drawSprite(ctx, visuals.spriteDetails.image, source, target);
  }

  private calculateBoardTarget(
    ctx: CanvasRenderingContext2D,
    elementPosition: Position,
    playingBoard: PlayingBoard
  ): Rect {
    return {
      x: (elementPosition.x * ctx.canvas.width) / playingBoard.amountFieldsX,
      y: (elementPosition.y * ctx.canvas.height) / playingBoard.amountFieldsY,
      w: ctx.canvas.width / playingBoard.amountFieldsX,
      h: ctx.canvas.height / playingBoard.amountFieldsY,
    };
  }

  // Returns x, y, width and height within a sprite which is to be rendered
  private calculateSpriteSection(spriteDetail: Visuals): Rect {
    const x = spriteDetail.spriteDetails.frameWidth * spriteDetail.animationDetails.nextCol;
    const y = spriteDetail.spriteDetails.frameHeight * spriteDetail.animationDetails.nextRow;

    return {
      x,
      y,
      w: spriteDetail.spriteDetails.frameWidth,
      h: spriteDetail.spriteDetails.frameHeight,
    };
  }

  private drawSprite(
    ctx: CanvasRenderingContext2D,
    image: HTMLImageElement,
    source: Rect,
    target: Rect
  ) {
    ctx.drawImage(
      image,
      source.x,
      source.y,
      source.w,
      source.h,
      target.x,
      target.y,
      target.w,
      target.h
    );
  }

  private clearDrawingBoard(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = '#333';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  }
}
