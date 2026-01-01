import { Game, GameElement } from '../../model/game.model';
import { Actor } from './Actor';
import { Enemy } from './enemy';

export class Player extends Actor {
  constructor(player: GameElement) {
    super(player);
  }

  getEnemiesTouching(enemies: Enemy[]): Enemy[] {
    return enemies.filter((enemy) => this.isTouching(enemy));
  }

  isOnGoal(game: Game | undefined): boolean {
    if (!game) return false;
    const tileBelowPlayer = game.tiles[game.player.getPosition().y][game.player.getPosition().x];

    return tileBelowPlayer.isGoal();
  }

  private isTouching(enemy: Actor): boolean {
    const diffX = this.getPositionDiffX(enemy);
    const diffY = this.getPositionDiffY(enemy);
    if (
      (diffX === 1 && diffY === 1) ||
      (diffX === 1 && diffY === 0) ||
      (diffX === 0 && diffY === 1)
    )
      return true;
    return false;
  }

  private getPositionDiffX(enemy: Actor): number {
    return Math.abs(this.gameElement.position.x - enemy.getPosition().x);
  }

  private getPositionDiffY(enemy: Actor): number {
    return Math.abs(this.gameElement.position.y - enemy.getPosition().y);
  }
}
