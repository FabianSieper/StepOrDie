import { Game, GameElement } from '../../model/game.model';
import { Actor } from './Actor';

enum Direction {
  UP = 'UP',
  DOWN = 'DOWN',
  LEFT = 'LEFT',
  RIGHT = 'RIGHT',
}

export class Enemy extends Actor {
  constructor(enemy: GameElement) {
    super(enemy);
  }

  moveRandomly(game: Game, blockedDirections: Direction[] = []): boolean {
    if (blockedDirections.length === 4) {
      return false; // No possible moves
    }

    const allDirections = Object.values(Direction);
    const possibleDirections = allDirections.filter(
      (direction) => !blockedDirections.includes(direction)
    );
    const randomDirection =
      possibleDirections[Math.floor(Math.random() * possibleDirections.length)];

    const movemementWasSuccessful = this.moveInDirection(randomDirection, game);

    if (!movemementWasSuccessful) {
      return this.moveRandomly(game, [...blockedDirections, randomDirection]);
    }
    return true;
  }

  private moveInDirection(direction: Direction, game: Game): boolean {
    switch (direction) {
      case Direction.UP:
        return this.moveUp(game);
      case Direction.DOWN:
        return this.moveDown(game);
      case Direction.LEFT:
        return this.moveLeft(game);
      case Direction.RIGHT:
        return this.moveRight(game);
      default:
        return false;
    }
  }
}
