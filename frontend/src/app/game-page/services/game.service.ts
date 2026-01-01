import { computed, inject, Injectable, signal } from '@angular/core';
import { NGXLogger } from 'ngx-logger';
import { BackendService } from '../../services/backend.service';
import { Animator } from '../core-game/animator';
import { Drawer } from '../core-game/drawer';
import { Entity } from '../core-game/entities/entity';
import { mapToGame } from '../mapper/game.mapper';
import { Game, GameStatus } from '../model/game.model';
import { KeyInputService } from './key-input.service';

/**
 * This service manages the overall game state, including updating the game logic and rendering.
 */
@Injectable({ providedIn: 'root' })
export class GameService {
  private readonly logger = inject(NGXLogger);
  private readonly keyInputService = inject(KeyInputService);
  private readonly backendService = inject(BackendService);

  private readonly _game = signal<Game | undefined>(undefined);
  private readonly _status = signal<GameStatus>(GameStatus.ONGOING);

  readonly game = computed(() => this._game());
  readonly status = computed(() => this._status());
  readonly isGameDefined = computed(() => !!this._game());

  private drawer = new Drawer();

  reset() {
    this._game.set(undefined);
    this._status.set(GameStatus.ONGOING);
  }

  async loadGameState(gameId: string) {
    this.logger.info(`Loading game with game id ${gameId}`);
    const loadedGame = await this.backendService.loadGameStateFromCache(gameId);
    this._game.set(await mapToGame(loadedGame));

    this.logger.info(`Successfully loaded game with ${gameId}`);
  }

  async computationStep(ctx: CanvasRenderingContext2D | undefined) {
    if (!ctx || !this._game()) return;

    Animator.animateGame(this._game);

    this.reactOnUserInput();

    this.drawGame(ctx);

    this.checkOnGameStatus();
  }

  private reactOnUserInput() {
    // If the game is lost or won, no more user inputs should be registered
    if (this._status() == GameStatus.ONGOING) {
      this.keyInputService.reactOnUserInput(this._game);
    }
  }

  private checkOnGameStatus() {
    // Only check game status if still on going
    if (this._status() != GameStatus.ONGOING) return;

    const enemiesTouched =
      this._game()?.player.getEnemiesTouching(this._game()?.enemies ?? []) ?? [];

    if (enemiesTouched.length > 0) {
      this._status.set(GameStatus.LOST);
      // TODO: increase contrast of all sprites
      const touchingActors = [...enemiesTouched, this.game()?.player].filter((actor) => !!actor);
      this.increaseContrast(touchingActors);
    } else if (this._game()?.player.isOnGoal(this._game())) {
      this._status.set(GameStatus.WON);
    }
  }

  private increaseContrast(entities: Entity[]) {
    entities.forEach((entity) => entity.setIncreaseContrast(200));
  }

  private async drawGame(ctx: CanvasRenderingContext2D) {
    try {
      // TODO: drawing should be in responsibilty of entity class
      this.drawer.drawGame(ctx, this._game());
    } catch (error) {
      this.logger.error('Error while drawing game:', error);
    }
  }
}
