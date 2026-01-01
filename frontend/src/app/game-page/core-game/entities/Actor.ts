import { Game, GameElement } from '../../model/game.model';
import { Enemy } from './enemy';
import { Entity } from './entity';
import { Player } from './player';

/**
 * An actor is a an entity which can perform actions in the game, like a player or a NPC.
 */
export abstract class Actor extends Entity {
  private died = false;

  constructor(gameElement: GameElement) {
    super(gameElement);
  }

  // TODO: convert all to booleans whicih return true if move was possible
  moveUp(game: Game): boolean {
    // Should always still at least look at into the direction
    this.lookUp();

    if (
      this.gameElement.position.y > 0 &&
      this.isPositionWalkable(game, this.gameElement.position.x, this.gameElement.position.y - 1)
    ) {
      this.gameElement.position.y -= 1;
      return true;
    }

    return false;
  }

  moveDown(game: Game): boolean {
    // Should always still at least look at into the direction
    this.lookDown();

    if (
      this.gameElement.position.y < game.playingBoard.amountFieldsY + 1 &&
      this.isPositionWalkable(game, this.gameElement.position.x, this.gameElement.position.y + 1)
    ) {
      this.gameElement.position.y += 1;
      return true;
    }

    return false;
  }

  moveLeft(game: Game): boolean {
    // Should always still at least look at into the direction
    this.lookLeft();

    if (
      this.gameElement.position.x > 0 &&
      this.isPositionWalkable(game, this.gameElement.position.x - 1, this.gameElement.position.y)
    ) {
      this.gameElement.position.x -= 1;
      return true;
    }

    return false;
  }

  moveRight(game: Game): boolean {
    // Should always still at least look at into the direction
    this.lookRight();

    if (
      this.gameElement.position.x < game.playingBoard.amountFieldsX + 1 &&
      this.isPositionWalkable(game, this.gameElement.position.x + 1, this.gameElement.position.y)
    ) {
      this.gameElement.position.x += 1;
      return true;
    }

    return false;
  }

  die() {
    this.died = true;
    this.gameElement.visuals.animationDetails.nextCol = 0; // Dying should always start from col 0
    this.gameElement.visuals.animationDetails.nextRow = 4;
  }

  cheer() {
    // TODO: set corresponding sprite row + animate only once
  }

  override animate() {
    if (this.died) {
      this.animateOnce();
    } else {
      this.animateContinuously();
    }
  }

  private animateOnce() {
    if (
      this.gameElement.visuals.animationDetails.nextCol + 1 <
      this.gameElement.visuals.spriteDetails.amountCols
    ) {
      this.gameElement.visuals.animationDetails.nextCol += 1;
    }
  }

  private animateContinuously() {
    this.gameElement.visuals.animationDetails.nextCol += 1;
    this.gameElement.visuals.animationDetails.nextCol %=
      this.gameElement.visuals.spriteDetails.amountCols;
  }
  protected lookUp() {
    this.gameElement.visuals.animationDetails.nextRow = 0;
  }

  protected lookDown() {
    this.gameElement.visuals.animationDetails.nextRow = 1;
  }

  protected lookRight() {
    this.gameElement.visuals.animationDetails.nextRow = 2;
  }

  protected lookLeft() {
    this.gameElement.visuals.animationDetails.nextRow = 3;
  }

  protected setIdleAnimation() {
    this.gameElement.visuals.animationDetails.nextCol = 4;
  }

  private isPositionWalkable(game: Game, x: number, y: number): boolean {
    return (
      game.tiles[y][x].isWalkable() &&
      !this.isEnemyAtPosition(game.enemies, x, y) &&
      !this.isPlayerAtPosition(game.player, x, y)
    );
  }

  private isEnemyAtPosition(enemies: Enemy[], x: number, y: number): boolean {
    return enemies.some((enemy) => enemy.getPosition().x === x && enemy.getPosition().y === y);
  }

  private isPlayerAtPosition(player: Player, x: number, y: number): boolean {
    const playerPos = player.getPosition();
    return playerPos.x === x && playerPos.y === y;
  }
}
