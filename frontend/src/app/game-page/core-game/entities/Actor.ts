import { Game, GameElement } from '../../model/game.model';
import { Entity } from './entity';

/**
 * An actor is a an entity which can perform actions in the game, like a player or a NPC.
 */
export abstract class Actor extends Entity {
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
    return game.tiles[y][x].isWalkable() && !this.isEnemyAtPosition(game, x, y);
  }

  private isEnemyAtPosition(game: Game, x: number, y: number): boolean {
    return game.enemies.some((enemy) => enemy.getPosition().x === x && enemy.getPosition().y === y);
  }
}
