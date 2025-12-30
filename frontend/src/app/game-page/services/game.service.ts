import { computed, inject, Injectable, signal } from '@angular/core';
import { NGXLogger } from 'ngx-logger';
import { GameState } from '../../model/load-game-state-response.model';
import { Animator } from '../core-game/animator';
import { Drawer } from '../core-game/drawer';
import { mapToGame } from '../mapper/game.mapper';
import { Game } from '../model/game.model';
import { KeyInputService } from './key-input.service';

/**
 * This service manages the overall game state, including updating the game logic and rendering.
 */
@Injectable({ providedIn: 'root' })
export class GameService {
  private readonly logger = inject(NGXLogger);
  private readonly keyInputService = inject(KeyInputService);

  private readonly _game = signal<Game | undefined>(undefined);
  readonly game = computed(() => this._game());
  readonly isGameDefined = computed(() => !!this._game());

  private drawer = new Drawer();

  async setGameState(gameState: GameState) {
    this._game.set(await mapToGame(gameState));
  }

  async computationStep(ctx: CanvasRenderingContext2D | undefined) {
    if (!ctx) return;
    // Alters the game state
    Animator.animateGame(this._game);
    this.keyInputService.reactOnUserInput(this._game);

    // Uses game state
    this.drawGame(ctx);
  }

  private async drawGame(ctx: CanvasRenderingContext2D) {
    try {
      this.drawer.drawGame(ctx, this._game());
    } catch (error) {
      this.logger.error('Error while drawing game:', error);
    }
  }
}
