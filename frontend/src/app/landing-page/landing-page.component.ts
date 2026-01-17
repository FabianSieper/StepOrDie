import { Component, input, model, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InfoDialogComponent } from '../components/info-dialog/info-dialog.component';
import { MusicButtonContainer } from '../components/music-button/music-button.container';
import { SmartSplitButtonComponent } from '../components/smart-split-button/smart-split-button.component';
import { VersionContainer } from '../components/version/version.container';
import { DialogType } from '../model/dialog-type.model';
import { SmartButtonState } from '../model/nes-button-state.model';

@Component({
  selector: 'app-landing-page-component',
  imports: [
    InfoDialogComponent,
    MusicButtonContainer,
    VersionContainer,
    FormsModule,
    SmartSplitButtonComponent,
  ],
  template: `
    @if (!displayDialogType()) {
    <section class="nes-container is-rounded landing-shell is-dark">
      <h1>Step or Die!</h1>
      <label for="game-id-input" class="space-above">Game ID</label>
      <input id="game-id-input" class="nes-input game-id-input" [(ngModel)]="gameId" />
      <label for="playing-field" class="space-above">Playing Field</label>
      <textarea
        id="playing-field"
        (input)="handleGameFieldChanged($event)"
        [value]="gameField()"
      ></textarea>
      <app-smart-split-button-component
        [defaultButton]="SmartButtonState.PLAY"
        [splitButtons]="[
          SmartButtonState.CANCEL,
          SmartButtonState.OVERWRITE,
          SmartButtonState.LOAD
        ]"
        [displaySplitButtons]="duplicateFound()"
        (defaultButtonClick)="playClicked.emit()"
        (splitButtonClick)="handlePlaySplitButtonClick($event)"
      />
    </section>
    <div>
      <button class="nes-btn feedback-button" (click)="openFeedbackPackge.emit()">Feedback</button>
    </div>

    <app-version-container />
    <app-music-button-container />
    }

    <app-info-dialog-component
      [displayDialogType]="displayDialogType()"
      (resetActiveDialogType)="resetActiveDialogType.emit()"
      (loadGame)="loadGame.emit()"
      (overwriteGame)="overwriteGame.emit()"
    />
  `,
  styleUrl: './landing-page.component.scss',
})
export class LandingPageComponent {
  readonly displayDialogType = input.required<DialogType | undefined>();

  readonly gameField = input.required<string>();
  readonly gameId = model.required<string>();
  readonly duplicateFound = input.required<boolean>();

  readonly playClicked = output();
  readonly resetPlayButtonState = output();
  readonly changedGameField = output<string>();

  readonly submitQuest = output<void>();
  readonly overwriteGame = output<void>();
  readonly loadGame = output<void>();
  readonly resetActiveDialogType = output();
  readonly openFeedbackPackge = output();

  protected readonly showInputError = signal(false);

  protected handleGameFieldChanged(event: Event) {
    const target = event.target as HTMLTextAreaElement;
    const value = target.value;

    this.changedGameField.emit(value);
  }

  protected handlePlaySplitButtonClick(buttonState: SmartButtonState) {
    if (buttonState === SmartButtonState.OVERWRITE) {
      this.overwriteGame.emit();
    } else if (buttonState === SmartButtonState.LOAD) {
      this.loadGame.emit();
    } else if (buttonState === SmartButtonState.CANCEL) {
      this.resetPlayButtonState.emit();
    } else {
      throw Error(`Split button for playing encountered unknown button state: ${buttonState}}`);
    }
  }

  protected SmartButtonState = SmartButtonState;
}
