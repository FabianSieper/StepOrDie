import { WritableSignal } from '@angular/core';
import { Game } from '../model/game.model';

export class Animator {
  private static lastTimeAnimationChanged = 0;
  private static readonly animationInterval = 1000 / 3; // Draw game at 3 FPS

  public static animateGame(gameSignal: WritableSignal<Game | undefined>) {
    if (!Animator.shouldUpdateAnimation(Date.now())) return;

    gameSignal()?.player.animate();
    gameSignal()?.enemies.forEach((enemy) => enemy.animate());
    // TODO: animate playing board?
  }

  private static shouldUpdateAnimation(timestamp: number): boolean {
    const shouldUpdate =
      timestamp - Animator.lastTimeAnimationChanged >= Animator.animationInterval;
    if (shouldUpdate) {
      Animator.lastTimeAnimationChanged = timestamp;
      return true;
    }
    return false;
  }
}
