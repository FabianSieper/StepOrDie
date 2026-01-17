import { Component, input, output } from '@angular/core';
import { InfoDialogComponent } from '../components/info-dialog/info-dialog.component';
import { MusicButtonContainer } from '../components/music-button/music-button.container';
import { SmartButtonComponent } from '../components/smart-button/smart-button.component';
import { VersionContainer } from '../components/version/version.container';
import { DialogType } from '../model/dialog-type.model';
import { SmartButtonFeedbackState } from '../model/nes-button-feedback-state.model';
import { NesButtonVariant } from '../model/nes-button-variant.model';
import { GameContainer } from './components/game/game.container';

@Component({
  selector: 'app-game-page-component',
  styleUrl: 'game-page.component.scss',
  imports: [
    GameContainer,
    InfoDialogComponent,
    MusicButtonContainer,
    VersionContainer,
    SmartButtonComponent,
  ],
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
      <div class="button-row">
        <app-smart-button-component
          [buttonStates]="[{ icon: 'arrow_back' }, { label: 'Sure?' }, { label: 'Sure!' }]"
          (verifiedButtonClick)="backToMenu.emit()"
        />
        <app-smart-button-component
          [buttonStates]="[{ icon: 'content_copy' }]"
          [feedbackStateChange]="copyGameIdButtonFeedbackState()"
          (verifiedButtonClick)="copyGameId.emit()"
        />
        <app-smart-button-component
          [buttonStates]="[{ icon: 'save' }]"
          [buttonVariant]="NesButtonVariant.PRIMARY"
          [feedbackStateChange]="saveGameButtonFeedbackState()"
          (verifiedButtonClick)="saveGameState.emit()"
        />
      </div>
      <app-music-button-container />
      <app-version-container />
    </div>
    }
  `,
})
export class GamePageComponent {
  readonly displayDialogType = input.required<DialogType | undefined>();
  readonly saveGameButtonFeedbackState = input.required<SmartButtonFeedbackState>();
  readonly copyGameIdButtonFeedbackState = input.required<SmartButtonFeedbackState>();
  readonly resetActiveDialogType = output();
  readonly noClicked = output();
  readonly reloadGame = output();
  readonly backToMenu = output();
  readonly gameWon = output();
  readonly gameLost = output();
  readonly saveGameState = output();
  readonly copyGameId = output();

  readonly NesButtonVariant = NesButtonVariant;
}
