import { computed, inject, Injectable, signal } from '@angular/core';
import { NGXLogger } from 'ngx-logger';
import { GameState } from '../../model/load-game-state-response.model';
import { Animator } from '../core-game/animator';
import { Drawer } from '../core-game/drawer';
import { UserInputHandler } from '../core-game/user-input-handler';
import { mapToGame } from '../mapper/game.mapper';
import { Game } from '../model/game.model';

@Injectable({ providedIn: 'root' })
export class GameService {
  private readonly logger = inject(NGXLogger);

  private readonly _game = signal<Game | undefined>(undefined);
  readonly game = computed(() => this._game());
  readonly isGameDefined = computed(() => !!this._game());

  private userInputHandler = new UserInputHandler();
  private drawer = new Drawer();

  async setGameState(gameState: GameState) {
    this._game.set(await mapToGame(gameState));
  }

  async computationStep(ctx: CanvasRenderingContext2D | undefined) {
    if (!ctx) return;
    // TODO: add try catch here and log thrown error; continue afterwards
    this.drawGame(ctx);
    // Update sprites if required for the next drawing time
    Animator.animateGame(this._game());

    this.userInputHandler.triggerOnUserInput();
  }

  private async drawGame(ctx: CanvasRenderingContext2D) {
    try {
      this.drawer.drawGame(ctx, this._game());
    } catch (error) {
      this.logger.error('Error while drawing game:', error);
    }
  }
}
