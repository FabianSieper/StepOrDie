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
    if (!this.lastKeyPressed || !game()) return;

    // TODO: changes to character should be displayed directly
    switch (this.lastKeyPressed) {
      case 'ArrowUp':
        // Move player up
        game()?.player.lookUp();
        break;
      case 'ArrowDown':
        // Move player down
        game()?.player.lookDown();
        break;
      case 'ArrowLeft':
        game()?.player.lookLeft();
        // Move player left
        break;
      case 'ArrowRight':
        game()?.player.lookRight();
        // Move player right
        break;
      default:
        break;
    }
  }
}
