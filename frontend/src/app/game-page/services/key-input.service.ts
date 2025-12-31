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
    const gameValue = game();
    if (!this.lastKeyPressed || !gameValue) return;

    // TODO: user should not be able to move into walls
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

    this.lastKeyPressed = undefined;
  }
}
