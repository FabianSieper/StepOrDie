import { GameElement, PlayingBoard, Position, Rect, Visuals } from '../../model/game.model';

export class Entity {
  constructor(protected gameElement: GameElement) {}

  getVisuals() {
    return this.gameElement.visuals;
  }

  getPosition() {
    return this.gameElement.position;
  }

  animate() {
    this.gameElement.visuals.animationDetails.nextCol =
      (this.gameElement.visuals.animationDetails.nextCol + 1) %
      this.gameElement.visuals.spriteDetails.amountCols;
  }

  draw(ctx: CanvasRenderingContext2D, playingBoard: PlayingBoard) {
    const target = this.calculateBoardTarget(ctx, playingBoard);
    const source = this.calculateSpriteSection();
    ctx.drawImage(
      this.gameElement.visuals.spriteDetails.image,
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

  private calculateBoardTarget(ctx: CanvasRenderingContext2D, playingBoard: PlayingBoard): Rect {
    const position = this.gameElement.position;
    return {
      x: (position.x * ctx.canvas.width) / playingBoard.amountFieldsX,
      y: (position.y * ctx.canvas.height) / playingBoard.amountFieldsY,
      w: ctx.canvas.width / playingBoard.amountFieldsX,
      h: ctx.canvas.height / playingBoard.amountFieldsY,
    };
  }

  // Returns x, y, width and height within a sprite which is to be rendered
  private calculateSpriteSection(): Rect {
    const spriteDetails = this.gameElement.visuals.spriteDetails;
    const animationDetails = this.gameElement.visuals.animationDetails;

    const x = spriteDetails.frameWidth * animationDetails.nextCol;
    const y = spriteDetails.frameHeight * animationDetails.nextRow;

    return {
      x,
      y,
      w: spriteDetails.frameWidth,
      h: spriteDetails.frameHeight,
    };
  }
}
