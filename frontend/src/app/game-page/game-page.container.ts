import { HttpErrorResponse } from '@angular/common/http';
import { Component, effect, inject, Signal, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { NGXLogger } from 'ngx-logger';
import { map } from 'rxjs';
import { BackendService } from '../services/backend.service';
import { DialogType, GamePageComponent } from './game-page.component';
import { GameService } from './services/game.service';

@Component({
  selector: 'app-game-page-container',
  imports: [GamePageComponent],
  template: ` <app-game-page-component
    [isInitialGameStateLoading]="isInitialGameStateLoading()"
    [displayDialogType]="displayDialogType()"
    (resetActiveDialogType)="this.displayDialogType.set(undefined)"
  />`,
})
export class GamePageContainer {
  private readonly logger = inject(NGXLogger);
  private readonly route = inject(ActivatedRoute);
  private readonly backendService = inject(BackendService);
  private readonly gameService = inject(GameService);

  protected readonly isInitialGameStateLoading = signal(false);
  protected readonly displayDialogType = signal<DialogType | undefined>(undefined);

  private readonly gameId: Signal<string | undefined> = toSignal(
    this.route.paramMap.pipe(map((map) => map.get('gameId') ?? undefined))
  );

  loadGameOnGameIdChange = effect(async () => {
    const gameId = this.gameId();

    if (!gameId) {
      this.logger.warn('Game id is undefined; Not loading game.');
      return;
    }

    this.displayDialogType.set(DialogType.LOADING);

    try {
      this.logger.info(`Loading game with game id ${gameId}`);
      const loadedGame = await this.backendService.loadGameStateFromCache(gameId);
      await this.gameService.setGameState(loadedGame);
      this.logger.info(`Successfully loaded game with ${gameId}`);

      // Only set to undefined if success, else error states are set
      this.displayDialogType.set(undefined);
    } catch (error) {
      if (error instanceof HttpErrorResponse) {
        if (error.status == 404) {
          this.logger.error(`Game with gameId ${gameId} was not found.`);
          this.displayDialogType.set(DialogType.NOT_FOUND);
        } else {
          this.logger.error(
            `Error laoding game with gameId ${gameId}. Received error: ${JSON.stringify(error)}`
          );
          this.displayDialogType.set(DialogType.BACKEND_ERROR);
        }
      } else {
        this.logger.error(
          `Failed to load game with game id ${gameId}. Received error: ${JSON.stringify(error)}`
        );
        this.displayDialogType.set(DialogType.BACKEND_ERROR);
      }
    }

    this.isInitialGameStateLoading.set(false);
  });
}
