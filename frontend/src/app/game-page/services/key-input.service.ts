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

  public reactOnUserInput(game: WritableSignal<Game | undefined>) {
    if (!this.lastKeyPressed) return;
    // TODO
  }
}
