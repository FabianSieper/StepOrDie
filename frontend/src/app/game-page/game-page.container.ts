import { HttpErrorResponse } from '@angular/common/http';
import { Component, effect, inject, OnInit, Signal, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { NGXLogger } from 'ngx-logger';
import { map } from 'rxjs';
import { DialogType } from '../model/dialog-type.model';
import { MusicService } from '../services/music.service';
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
      (saveGameState)="saveGameState()"
    />
  `,
})
export class GamePageContainer implements OnInit {
  readonly router = inject(Router);
  private readonly logger = inject(NGXLogger);
  private readonly route = inject(ActivatedRoute);
  private readonly gameService = inject(GameService);
  private readonly musicService = inject(MusicService);

  private readonly DISPLAY_SUCCESS_TIME = 1500;

  protected readonly displayDialogType = signal<DialogType | undefined>(undefined);

  protected readonly gameId: Signal<string | undefined> = toSignal(
    this.route.paramMap.pipe(map((map) => map.get('gameId') ?? undefined))
  );

  loadGameOnGameIdChange = effect(async () => {
    const gameId = this.gameId();
    this.loadGame(gameId);
  });

  ngOnInit(): void {
    this.initMusicService();
  }

  protected async saveGameState() {
    const gameId = this.gameId();
    if (!gameId) {
      throw Error('Game id is undefined. Failed to save game.');
    }

    this.displayDialogType.set(DialogType.LOADING);

    try {
      await this.gameService.saveGameState(gameId);
      this.displayDialogType.set(DialogType.SUCCESS);

      // Clear success message after some time
      setTimeout(() => {
        this.displayDialogType.set(undefined);
      }, this.DISPLAY_SUCCESS_TIME);
    } catch (error) {
      this.handleSavingError(error, gameId);
    }
  }

  protected async loadGame(gameId: string | undefined) {
    if (!gameId) {
      throw Error('Game id is undefined; Not loading game.');
    }

    this.displayDialogType.set(DialogType.LOADING);

    try {
      await this.gameService.loadGameState(gameId);
      // Only set to undefined if success, else error states are set via error handling
      this.displayDialogType.set(undefined);
    } catch (error) {
      this.handleLoadingError(error, gameId);
    }
  }

  private initMusicService() {
    // Only set audio src if game initis the first time and not, for example,
    // when the player returns back to the main page. That transition is handled
    // differently to allow for transitions between music.
    if (!this.musicService.isMusicDefined()) {
      this.musicService.setAudioSrc('assets/audio/landing-page.mp3', true);
    }
  }

  private handleSavingError(error: unknown, gameId: string) {
    if (error instanceof HttpErrorResponse) {
      this.handleSavingHttpErrorResponse(error, gameId);
    } else {
      this.handleGenericError(error, gameId);
    }
  }

  private handleLoadingError(error: unknown, gameId: string) {
    if (error instanceof HttpErrorResponse) {
      this.handleLoadingHttpErrorResponse(error, gameId);
    } else {
      this.handleGenericError(error, gameId);
    }
  }

  private handleGenericError(error: unknown, gameId: string) {
    this.logger.error(
      `Failed to complete task for game id ${gameId}. Received error: ${JSON.stringify(error)}`
    );
    this.displayDialogType.set(DialogType.BACKEND_ERROR);
  }

  private handleLoadingHttpErrorResponse(error: HttpErrorResponse, gameId: string) {
    if (error.status == 404) {
      this.logger.error(`Game with gameId ${gameId} was not found.`);
      this.displayDialogType.set(DialogType.NOT_FOUND);
    } else {
      this.logger.error(
        `Error loading game with gameId ${gameId}. Received error: ${JSON.stringify(error)}`
      );
      this.displayDialogType.set(DialogType.BACKEND_ERROR);
    }
  }

  private handleSavingHttpErrorResponse(error: HttpErrorResponse, gameId: string) {
    this.logger.error(
      `Error saving game with gameId ${gameId}. Received error: ${JSON.stringify(error)}`
    );
    // TODO: use a dialog type for saving
    this.displayDialogType.set(DialogType.BACKEND_ERROR);
  }

  protected DialogType = DialogType;
}
