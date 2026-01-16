import { computed, inject, Injectable, signal } from '@angular/core';
import { NGXLogger } from 'ngx-logger';
import { BackendService } from '../../services/backend.service';
import { Animator } from '../core-game/animator';
import { Drawer } from '../core-game/drawer';
import { mapToDomainGame, mapToDtoGame } from '../mapper/game.mapper';
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

  private readonly drawer = new Drawer();

  // The delay until the user is prompted
  private readonly lostOrWonDelay = 3000;

  // The delay until the dying animation of the user is displayed
  private readonly dyingDelayMs = 750;

  // The delay until the enemies start dancing after the death animatino of the player
  private readonly enemyDancingDelay = 1000;

  // The delay until the the enemies die after the player reached the goal
  private readonly enemiesDyingDelay = 500;

  // The delay until the player starts dancing after the enemies died after the player reached the goal
  private readonly playerDancingDelay = 1000;

  reset() {
    this._game.set(undefined);
    this._status.set(GameStatus.ONGOING);
  }

  async saveGameState(gameId: string) {
    const game = this._game();

    if (!game) {
      this.logger.warn('Failed to save game state, as game object is undefined');
      return;
    }

    this.logger.info(`Mapping domain game object to dto game object`);
    const dtoGame = mapToDtoGame(game);
    this.logger.info(`Sending game state to backend`);
    await this.backendService.storeGameState(gameId, dtoGame);
    this.logger.info(`Successfully saved game state`);
  }

  async loadGameState(gameId: string) {
    this.logger.info(`Loading game with game id ${gameId}`);
    const loadedGame = await this.backendService.loadGameStateFromCache(gameId);
    this._game.set(await mapToDomainGame(loadedGame));
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
      this._status.set(GameStatus.LOOSING);
      this.passThroughLoosingAnimationPhases();
    } else if (this._game()?.player.isOnGoal(this._game())) {
      this._status.set(GameStatus.WINNING);
      this.passThroughWinningAnimationPhases();
    }
  }

  private passThroughWinningAnimationPhases() {
    setTimeout(() => {
      this._game()?.enemies.forEach((enemy) => enemy.die());

      setTimeout(() => {
        this._game()?.player.dance();

        setTimeout(() => {
          this._status.set(GameStatus.WON);
        }, this.lostOrWonDelay);
      }, this.playerDancingDelay);
    }, this.enemiesDyingDelay);
  }

  private passThroughLoosingAnimationPhases() {
    // After some time, display dying animation of player
    setTimeout(() => {
      this._game()?.player.die();

      // After death, let enemies dance
      setTimeout(() => {
        this._game()?.enemies.forEach((enemy) => enemy.dance());

        // Ater some time, set state LOST
        setTimeout(() => {
          this._status.set(GameStatus.LOST);
        }, this.lostOrWonDelay);
      }, this.enemyDancingDelay);
    }, this.dyingDelayMs);
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
