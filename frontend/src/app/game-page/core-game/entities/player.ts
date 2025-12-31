import { GameElement } from '../../model/game.model';
import { Actor } from './Actor';
import { Enemy } from './enemy';

export class Player extends Actor {
  constructor(player: GameElement) {
    super(player);
  }

  isTouchingEnemy(enemies: Enemy[]): boolean {
    return enemies
      .map(
        (enemy) =>
          this.isTouchingDiagnally(enemy) ||
          this.isTouchingHorizontally(enemy) ||
          this.isTouchingVertically(enemy)
      )
      .some(Boolean);
  }

  private isTouchingVertically(enemy: Actor): boolean {
    if (this.gameElement.position.x !== enemy.getPosition().x) return false;
    if (this.getPositionDiffY(enemy) === 1) return true;
    return false;
  }

  private isTouchingHorizontally(enemy: Actor): boolean {
    if (this.gameElement.position.y !== enemy.getPosition().y) return false;
    if (this.getPositionDiffX(enemy) === 1) return true;
    return false;
  }

  private isTouchingDiagnally(enemy: Actor): boolean {
    const diffX = this.getPositionDiffX(enemy);
    const diffY = this.getPositionDiffY(enemy);
    if (diffX === 1 && diffY === 1) return true;
    return false;
  }

  private getPositionDiffX(enemy: Actor): number {
    return Math.abs(this.gameElement.position.x - enemy.getPosition().x);
  }

  private getPositionDiffY(enemy: Actor): number {
    return Math.abs(this.gameElement.position.y - enemy.getPosition().y);
  }
}
