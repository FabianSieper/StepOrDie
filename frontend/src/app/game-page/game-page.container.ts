import { Clipboard, ClipboardModule } from '@angular/cdk/clipboard';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, effect, inject, OnInit, Signal, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { NGXLogger } from 'ngx-logger';
import { map } from 'rxjs';
import { DialogType } from '../model/dialog-type.model';
import { SmartButtonState } from '../model/smart-button-state.model';
import { MusicService } from '../services/music.service';
import { setAndResetSignalWithDelay } from '../utils/set-and-reset-signal-with-delay';
import { GamePageComponent } from './game-page.component';
import { GameService } from './services/game.service';

@Component({
  selector: 'app-game-page-container',
  standalone: true,
  imports: [GamePageComponent, ClipboardModule],
  template: `
    <app-game-page-component
      [displayDialogType]="displayDialogType()"
      [saveGameButtonState]="saveGameButtonState()"
      [copyGameIdButtonState]="copyGameIdButtonState()"
      [backGameIdButtonState]="backButtonState()"
      (resetActiveDialogType)="this.displayDialogType.set(undefined)"
      (noClicked)="displayDialogType.set(undefined)"
      (backToMenu)="router.navigate(['/'])"
      (reloadGame)="loadGame(gameId())"
      (gameLost)="displayDialogType.set(DialogType.LOST)"
      (gameWon)="displayDialogType.set(DialogType.WON)"
      (saveGameState)="saveGameState()"
      (copyGameId)="copyGameId()"
    />
  `,
})
export class GamePageContainer implements OnInit {
  readonly router = inject(Router);
  private readonly logger = inject(NGXLogger);
  private readonly route = inject(ActivatedRoute);
  private readonly gameService = inject(GameService);
  private readonly musicService = inject(MusicService);
  private readonly clipboard = inject(Clipboard);

  protected readonly displayDialogType = signal<DialogType | undefined>(undefined);
  protected readonly saveGameButtonState = signal(SmartButtonState.SAVE);
  protected readonly copyGameIdButtonState = signal(SmartButtonState.COPY);
  protected readonly backButtonState = signal(SmartButtonState.BACK_WITH_VERIFY);

  protected readonly gameId: Signal<string | undefined> = toSignal(
    this.route.paramMap.pipe(map((map) => map.get('gameId') ?? undefined)),
  );

  private readonly RESET_SMART_BUTTON_STATE_DELAY = 2500;

  loadGameOnGameIdChange = effect(async () => {
    const gameId = this.gameId();
    this.loadGame(gameId);
  });

  ngOnInit(): void {
    this.initMusicService();
  }

  protected copyGameId() {
    const gameId = this.gameId();

    if (!gameId) {
      throw Error('Could nto copy game id, as game id is undefined');
    }
    this.clipboard.copy(gameId);
    this.copyGameIdButtonState.set(SmartButtonState.SUCCESS);
    setTimeout(
      () => this.copyGameIdButtonState.set(SmartButtonState.COPY),
      this.RESET_SMART_BUTTON_STATE_DELAY,
    );
  }

  protected async saveGameState() {
    const gameId = this.gameId();
    if (!gameId) {
      setAndResetSignalWithDelay(
        this.saveGameButtonState,
        SmartButtonState.ERROR,
        SmartButtonState.SAVE,
        this.RESET_SMART_BUTTON_STATE_DELAY,
      );
      throw Error('Game id is undefined. Failed to save game.');
    }

    this.saveGameButtonState.set(SmartButtonState.LOADING);

    try {
      await this.gameService.saveGameState(gameId);
      setAndResetSignalWithDelay(
        this.saveGameButtonState,
        SmartButtonState.SUCCESS,
        SmartButtonState.SAVE,
        this.RESET_SMART_BUTTON_STATE_DELAY,
      );
    } catch (error) {
      this.logger.error('Failed to save game state');
      setAndResetSignalWithDelay(
        this.saveGameButtonState,
        SmartButtonState.ERROR,
        SmartButtonState.SAVE,
        this.RESET_SMART_BUTTON_STATE_DELAY,
      );
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

  private handleLoadingError(error: unknown, gameId: string) {
    if (error instanceof HttpErrorResponse) {
      this.handleLoadingHttpErrorResponse(error, gameId);
    } else {
      this.handleGenericError(error, gameId);
    }
  }

  private handleGenericError(error: unknown, gameId: string) {
    this.logger.error(
      `Failed to complete task for game id ${gameId}. Received error: ${JSON.stringify(error)}`,
    );
    this.displayDialogType.set(DialogType.BACKEND_ERROR);
  }

  private handleLoadingHttpErrorResponse(error: HttpErrorResponse, gameId: string) {
    if (error.status == 404) {
      this.logger.error(`Game with gameId ${gameId} was not found.`);
      this.displayDialogType.set(DialogType.NOT_FOUND);
    } else {
      this.logger.error(
        `Error loading game with gameId ${gameId}. Received error: ${JSON.stringify(error)}`,
      );
      this.displayDialogType.set(DialogType.BACKEND_ERROR);
    }
  }

  protected DialogType = DialogType;
}
