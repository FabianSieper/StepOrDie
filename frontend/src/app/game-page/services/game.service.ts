import { computed, inject, Injectable, signal } from '@angular/core';
import { NGXLogger } from 'ngx-logger';
import { GameState } from '../../model/load-game-state-response.model';
import { mapToGame } from '../mapper/game.mapper';
import { Game, GameElement, PlayingBoard, Rect, SpriteDetails } from '../model/game.model';

@Injectable({ providedIn: 'root' })
export class GameService {
  private readonly logger = inject(NGXLogger);

  private readonly _game = signal<Game | undefined>(undefined);
  readonly game = computed(() => this._game());
  readonly isGameDefined = computed(() => !!this._game());

  async setGameState(gameState: GameState) {
    this._game.set(await mapToGame(gameState));
  }

  async computationStep(ctx: CanvasRenderingContext2D | undefined) {
    if (!ctx) return;
    this.clearDrawingBoard(ctx);
    this.drawGame(ctx);
    this.animateGame();
  }

  private animateGame() {
    this.animatePlayer();
    this.animateEnemies();

    // TODO: animate playing board?
  }

  private animatePlayer() {
    const game = this.verifyGameIsDefined();
    this.animateGameElement(game.player);
  }

  private animateEnemies() {
    const game = this.verifyGameIsDefined();
    game.enemies.forEach((enemy) => this.animateGameElement(enemy));
  }

  private animateGameElement(gameElement: GameElement) {
    // Move from left to right and back within a sprite row
    gameElement.spriteDetails.nextAnimationCol =
      (gameElement.spriteDetails.nextAnimationCol + 1) % gameElement.spriteDetails.amountCols;
  }

  private drawGame(ctx: CanvasRenderingContext2D) {
    // TODO: draw board
    this.drawEnemies(ctx, this._game()?.enemies, this._game()?.playingBoard);
    // Draw player
    this.drawGameElement(ctx, this._game()?.player, this._game()?.playingBoard);
  }

  private drawEnemies(
    ctx: CanvasRenderingContext2D,
    enemies?: GameElement[],
    playingBoard?: PlayingBoard
  ) {
    enemies?.forEach((enemy) => this.drawGameElement(ctx, enemy, playingBoard));
  }

  private drawGameElement(
    ctx: CanvasRenderingContext2D,
    gameElement?: GameElement,
    playingBoard?: PlayingBoard
  ) {
    const spriteDetails = gameElement?.spriteDetails;

    if (!spriteDetails) {
      this.logger.warn('Not drawing sprite because details are undefined');
      return;
    }

    if (!playingBoard) {
      this.logger.warn('Not drawing sprite because playing board is undefined');
      return;
    }

    const source = this.calculateSpriteSection(spriteDetails);
    const target = this.calculateBoardTarget(gameElement, playingBoard);

    this.drawSprite(ctx, spriteDetails.image, source, target);
  }

  private calculateBoardTarget(gameElement: GameElement, playingBoard: PlayingBoard): Rect {
    // TODO: compute once and keep in playingBoard?
    const tileWidth = playingBoard.width / playingBoard.amountFieldsX;
    const tileHeight = playingBoard.height / playingBoard.amountFieldsY;

    return {
      x: gameElement.position.x * tileWidth,
      y: gameElement.position.y * tileHeight,
      w: tileWidth,
      h: tileHeight,
    };
  }

  // Returns x, y, width and height within a sprite which is to be rendered
  private calculateSpriteSection(spriteDetail: SpriteDetails): Rect {
    const x = spriteDetail.frameWidth * spriteDetail.nextAnimationCol;
    const y = spriteDetail.frameHeight * spriteDetail.nextAnimationRow;

    return { x, y, w: spriteDetail.frameWidth, h: spriteDetail.frameHeight };
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

  private verifyGameIsDefined() {
    const game = this._game();

    if (!game) {
      throw new Error('Cannot animate player, as game is undefined');
    }
    return game;
  }
}
