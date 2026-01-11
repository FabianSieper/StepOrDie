import { Component, input, output } from '@angular/core';
import { InfoDialogComponent } from '../components/info-dialog/info-dialog.component';
import { MusicButtonContainer } from '../components/music-button/music-button.container';
import { DialogType } from '../model/dialog-type.model';
import { GameContainer } from './components/game/game.container';

@Component({
  selector: 'app-game-page-component',
  styleUrl: 'game-page.component.scss',
  imports: [GameContainer, InfoDialogComponent, MusicButtonContainer],
  template: `
    <app-info-dialog-component
      [displayDialogType]="displayDialogType()"
      loadingHeaderAppendix="Game State"
      (resetActiveDialogType)="resetActiveDialogType.emit()"
      (noClicked)="noClicked.emit()"
      (yesClicked)="backToMenu.emit()"
      (backToMenu)="backToMenu.emit()"
      (reloadGame)="reloadGame.emit()"
    />

    <!-- Display playing field as soon as no dialog status is set, like loading or errors -->
    @if (!displayDialogType()) {
    <div class="playing-board">
      <h1 class="is-dark">You can do it!</h1>
      <app-game-container
        (reloadGame)="reloadGame.emit()"
        (gameLost)="gameLost.emit()"
        (gameWon)="gameWon.emit()"
      />
      <button (click)="backClicked.emit()" class="nes-btn take-me-back-button">Take me back</button>
    </div>
    <app-music-button-container class="small-button" />
    }
  `,
})
export class GamePageComponent {
  readonly displayDialogType = input.required<DialogType | undefined>();
  readonly resetActiveDialogType = output();
  readonly backClicked = output();
  readonly noClicked = output();
  readonly reloadGame = output();
  readonly backToMenu = output();
  readonly gameWon = output();
  readonly gameLost = output();
}
