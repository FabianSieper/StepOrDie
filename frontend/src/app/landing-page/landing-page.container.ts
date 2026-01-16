import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { NGXLogger } from 'ngx-logger';
import { DialogType } from '../model/dialog-type.model';
import { BackendService } from '../services/backend.service';
import { MusicService } from '../services/music.service';
import { LandingPageComponent } from './landing-page.component';

@Component({
  selector: 'app-landing-page-container',
  imports: [LandingPageComponent],
  template: `
    <app-landing-page-component
      [(gameId)]="gameId"
      [gameField]="gameField()"
      [displayDialogType]="displayDialogType()"
      (changedGameField)="handleGameFieldChange($event)"
      (playClicked)="storeGameState()"
      (overwriteGame)="overwriteGameState()"
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

  private readonly DISPLAY_SUCCESS_TIME = 1500;

  protected readonly gameId = signal<string>('');
  protected readonly gameField = signal<string>('');

  protected readonly displayDialogType = signal<DialogType | undefined>(undefined);
  protected readonly version = signal<string | undefined>(undefined);

  async ngOnInit(): Promise<void> {
    this.setInitGameField();
    this.setRandomGameId();
    this.initMusicService();
  }

  protected async storeGameState(overwrite = false) {
    this.displayDialogType.set(DialogType.LOADING);

    try {
      await this.backendService.storeGameStateFromString(
        this.gameId(),
        this.gameField(),
        overwrite
      );
      this.displayDialogType.set(DialogType.SUCCESS);

      // Open game page after some time
      setTimeout(() => {
        this.loadExistingGame();
      }, this.DISPLAY_SUCCESS_TIME);
    } catch (error) {
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
        String.fromCharCode(97 + Math.floor(Math.random() * 26))
      ).join('')
    );
  }

  private handleRequestError(error: unknown) {
    if (error instanceof HttpErrorResponse) {
      if (error.status === 400) {
        this.logger.warn(
          `Failed to parse playing board or request body. Received error: ${error.message}`
        );
        // TODO: parsing seems to work even though there are invalid characters contained
        this.displayDialogType.set(DialogType.USER_INPUT_ERROR);
      } else if (error.status === 409) {
        this.logger.warn(`Game state for game id already stored.`);
        this.displayDialogType.set(DialogType.DUPLICATE_FOUND);
      } else {
        this.logger.error(`Failed to store game state. Received error: ${error.message}`);
        this.displayDialogType.set(DialogType.BACKEND_ERROR);
      }
    } else {
      this.logger.error(`Failed to store game state. Received generic error: ${error}`);
      this.displayDialogType.set(DialogType.BACKEND_ERROR);
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
