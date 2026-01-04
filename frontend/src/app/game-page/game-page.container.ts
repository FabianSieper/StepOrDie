import { HttpErrorResponse } from '@angular/common/http';
import { Component, effect, inject, Signal, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { NGXLogger } from 'ngx-logger';
import { map } from 'rxjs';
import { DialogType } from '../model/dialog-type.model';
import { GamePageComponent } from './game-page.component';
import { GameService } from './services/game.service';

@Component({
  selector: 'app-game-page-container',
  imports: [GamePageComponent],
  template: `
    <app-game-page-component
      [displayDialogType]="displayDialogType()"
      (resetActiveDialogType)="this.displayDialogType.set(undefined)"
      (backClicked)="displayDialogType.set(DialogType.ARE_YOU_SURE)"
      (noClicked)="displayDialogType.set(undefined)"
      (backToMenu)="router.navigate(['/'])"
      (reloadGame)="loadGame(gameId())"
      (gameLost)="displayDialogType.set(DialogType.LOST)"
      (gameWon)="displayDialogType.set(DialogType.WON)"
    />
  `,
})
export class GamePageContainer {
  readonly router = inject(Router);
  private readonly logger = inject(NGXLogger);
  private readonly route = inject(ActivatedRoute);
  private readonly gameService = inject(GameService);

  protected readonly displayDialogType = signal<DialogType | undefined>(undefined);

  protected readonly gameId: Signal<string | undefined> = toSignal(
    this.route.paramMap.pipe(map((map) => map.get('gameId') ?? undefined))
  );

  loadGameOnGameIdChange = effect(async () => {
    const gameId = this.gameId();
    this.loadGame(gameId);
  });

  protected loadGame(gameId: string | undefined) {
    if (!gameId) {
      this.logger.warn('Game id is undefined; Not loading game.');
      return;
    }

    // TODO: while loading, no loading circle or anything is displayed
    this.displayDialogType.set(DialogType.LOADING);

    try {
      this.gameService.loadGameState(gameId);
      // Only set to undefined if success, else error states are set via error handling
      this.displayDialogType.set(undefined);
    } catch (error) {
      // TODO: on http 404, no error is displayed
      if (error instanceof HttpErrorResponse) {
        this.handleHttpErrorResponse(error, gameId);
      } else {
        this.handleGenericError(error, gameId);
      }
    }
  }

  private handleGenericError(error: unknown, gameId: string) {
    this.logger.error(
      `Failed to load game with game id ${gameId}. Received error: ${JSON.stringify(error)}`
    );
    this.displayDialogType.set(DialogType.BACKEND_ERROR);
  }

  private handleHttpErrorResponse(error: HttpErrorResponse, gameId: string) {
    if (error.status == 404) {
      this.logger.error(`Game with gameId ${gameId} was not found.`);
      this.displayDialogType.set(DialogType.NOT_FOUND);
    } else {
      this.logger.error(
        `Error laoding game with gameId ${gameId}. Received error: ${JSON.stringify(error)}`
      );
      this.displayDialogType.set(DialogType.BACKEND_ERROR);
    }
  }
  protected DialogType = DialogType;
}
