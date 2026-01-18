import { Clipboard } from '@angular/cdk/clipboard';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { NGXLogger } from 'ngx-logger';
import { DialogType } from '../model/dialog-type.model';
import { SmartButtonState } from '../model/smart-button-state.model';
import { BackendService } from '../services/backend.service';
import { MusicService } from '../services/music.service';
import { setAndResetSignalWithDelay } from '../utils/set-and-reset-signal-with-delay';
import { LandingPageComponent } from './landing-page.component';

@Component({
  selector: 'app-landing-page-container',
  imports: [LandingPageComponent],
  template: `
    <app-landing-page-component
      [(gameId)]="gameId"
      [gameField]="gameField()"
      [displayDialogType]="displayDialogType()"
      [playButtonState]="playButtonState()"
      [copyButtonState]="copyButtonState()"
      [duplicateFound]="duplicateFound()"
      (changedGameField)="handleGameFieldChange($event)"
      (playClicked)="storeGameState()"
      (overwriteGame)="overwriteGameState()"
      (resetPlayButtonState)="duplicateFound.set(false)"
      (copyGameIdClicked)="handleCopyGameIdClicked()"
      (loadGame)="loadExistingGame()"
      (resetActiveDialogType)="this.displayDialogType.set(undefined)"
      (openFeedbackPackge)="router.navigate(['/feedback'])"
    />
  `,
})
export class LandingPageContainer implements OnInit {
  private logger = inject(NGXLogger);
  protected router = inject(Router);
  protected musicService = inject(MusicService);
  protected backendService = inject(BackendService);
  protected clipboard = inject(Clipboard);

  private readonly USER_FEEDBACK_DISPLAY_TIME = 1500;

  protected readonly gameId = signal<string>('');
  protected readonly gameField = signal<string>('');

  protected readonly duplicateFound = signal(false);
  protected readonly playButtonState = signal(SmartButtonState.PLAY);
  protected readonly copyButtonState = signal(SmartButtonState.COPY);

  protected readonly displayDialogType = signal<DialogType | undefined>(undefined);
  protected readonly version = signal<string | undefined>(undefined);

  async ngOnInit(): Promise<void> {
    this.setInitGameField();
    this.setRandomGameId();
    this.initMusicService();
  }

  protected handleCopyGameIdClicked() {
    const wasCopied = this.clipboard.copy(this.gameId());
    const nextState = wasCopied ? SmartButtonState.SUCCESS : SmartButtonState.ERROR;
    setAndResetSignalWithDelay(
      this.copyButtonState,
      nextState,
      SmartButtonState.COPY,
      this.USER_FEEDBACK_DISPLAY_TIME,
    );
  }

  protected async storeGameState(overwrite = false) {
    this.playButtonState.set(SmartButtonState.LOADING);

    try {
      await this.backendService.storeGameStateFromString(
        this.gameId(),
        this.gameField(),
        overwrite,
      );

      this.playButtonState.set(SmartButtonState.SUCCESS);

      // Open game page after some time
      setTimeout(() => {
        this.loadExistingGame();
        this.playButtonState.set(SmartButtonState.PLAY);
      }, this.USER_FEEDBACK_DISPLAY_TIME);
    } catch (error) {
      this.displayDialogType.set(undefined);

      this.handleRequestError(error);
    }
  }
  protected async overwriteGameState() {
    await this.storeGameState(true);
  }

  protected loadExistingGame() {
    this.logger.info('Loading existing game');
    this.router.navigate(['/game', this.gameId()]);
  }

  protected handleGameFieldChange(gameField: string) {
    this.gameField.set(gameField);
  }

  private setInitGameField() {
    this.gameField.set(`###############
#S............#
#...####...M..#
#...#......##.#
#...#..M......#
#.............#
#...####......#
#...#..Z......#
#...#.....M...#
#.............#
#.......####..#
#....M..#..#..#
#.......#..#..#
#.......####..#
###############`);
  }

  private setRandomGameId() {
    this.gameId.set(
      Array.from({ length: 12 }, () =>
        String.fromCharCode(97 + Math.floor(Math.random() * 26)),
      ).join(''),
    );
  }

  private handleRequestError(error: unknown) {
    if (error instanceof HttpErrorResponse) {
      if (error.status === 400) {
        setAndResetSignalWithDelay(
          this.playButtonState,
          SmartButtonState.ERROR,
          SmartButtonState.PLAY,
          this.USER_FEEDBACK_DISPLAY_TIME,
        );
        this.logger.warn(
          `Failed to parse playing board or request body. Received error: ${error.message}`,
        );
      } else if (error.status === 409) {
        this.logger.warn(`Game state for game id already stored.`);
        this.playButtonState.set(SmartButtonState.PLAY);
        this.duplicateFound.set(true);
      } else {
        this.logger.error(`Failed to store game state. Received error: ${error.message}`);
        setAndResetSignalWithDelay(
          this.playButtonState,
          SmartButtonState.ERROR,
          SmartButtonState.PLAY,
          this.USER_FEEDBACK_DISPLAY_TIME,
        );
      }
    } else {
      setAndResetSignalWithDelay(
        this.playButtonState,
        SmartButtonState.ERROR,
        SmartButtonState.PLAY,
        this.USER_FEEDBACK_DISPLAY_TIME,
      );
      this.logger.error(`Failed to store game state. Received generic error: ${error}`);
    }
  }

  private initMusicService() {
    // Only set audio src if game initis the first time and not, for example,
    // when the player returns back to the main page. That transition is handled
    // differently to allow for transitions between music.
    if (!this.musicService.isMusicDefined()) {
      // Music from https://pixabay.com/music/video-games-i-love-my-8-bit-game-console-301272/
      this.musicService.setAudioSrc('assets/audio/landing-page.mp3', true);
    }
  }
}
