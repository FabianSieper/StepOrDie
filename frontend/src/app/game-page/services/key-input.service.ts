import { Injectable, WritableSignal } from '@angular/core';
import { Game } from '../model/game.model';

/**
 * This service handles user keyboard input for controlling the game.
 */
@Injectable({ providedIn: 'root' })
export class KeyInputService {
  private lastKeyPressed: string | undefined = undefined;

  private constructor() {
    document.addEventListener('keydown', this.handleKeyDown.bind(this));
  }

  handleKeyDown(event: KeyboardEvent) {
    this.lastKeyPressed = event.key;
  }

  /**
   * Reacting on user input should be instant. This also includes moving the player character.
   */
  public reactOnUserInput(game: WritableSignal<Game | undefined>) {
    // Keep in mind: Changes to objects within the signal which are not applied via .update or .set do not trigger the notify mechanism.
    const gameValue = game();
    if (!this.lastKeyPressed || !gameValue) return;

    switch (this.lastKeyPressed) {
      case 'ArrowUp':
        gameValue.player.moveUp(gameValue);
        break;
      case 'ArrowDown':
        gameValue.player.moveDown(gameValue);
        break;
      case 'ArrowLeft':
        gameValue.player.moveLeft(gameValue);
        break;
      case 'ArrowRight':
        gameValue.player.moveRight(gameValue);
        break;
      default:
        break;
    }

    this.moveEnemies(gameValue);
    this.lastKeyPressed = undefined;
  }

  private moveEnemies(game: Game) {
    if (this.shallLastPressedKeyTriggerEnemyMovement())
      game.enemies.forEach((enemy) => {
        // Simple AI: move randomly
        enemy.moveRandomly(game);
      });
  }

  private shallLastPressedKeyTriggerEnemyMovement() {
    return ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(this.lastKeyPressed ?? '');
  }
}
