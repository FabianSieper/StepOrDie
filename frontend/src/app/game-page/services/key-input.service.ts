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

    const movementDelta = this.getMovementDelta(this.lastKeyPressed);
    this.lastKeyPressed = undefined;
    if (!movementDelta) return;

    game.update((game) => {
      if (!game) return game;

      const currentPosition = game.player.position;
      const playingBoard = game.playingBoard;
      const clampedX = this.clamp(
        currentPosition.x + movementDelta.x,
        0,
        playingBoard.amountFieldsX - 1
      );
      const clampedY = this.clamp(
        currentPosition.y + movementDelta.y,
        0,
        playingBoard.amountFieldsY - 1
      );

      if (clampedX === currentPosition.x && clampedY === currentPosition.y) {
        return game;
      }

      return {
        ...game,
        player: {
          ...game.player,
          position: { x: clampedX, y: clampedY },
        },
      };
    });
  }

  private getMovementDelta(key: string): { x: number; y: number } | undefined {
    switch (key) {
      case 'ArrowUp':
      case 'w':
      case 'W':
        return { x: 0, y: -1 };
      case 'ArrowDown':
      case 's':
      case 'S':
        return { x: 0, y: 1 };
      case 'ArrowLeft':
      case 'a':
      case 'A':
        return { x: -1, y: 0 };
      case 'ArrowRight':
      case 'd':
      case 'D':
        return { x: 1, y: 0 };
      default:
        return undefined;
    }
  }

  private clamp(value: number, min: number, max: number): number {
    if (value < min) return min;
    if (value > max) return max;
    return value;
  }
}
