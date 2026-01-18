import { Component, computed, input, model, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InfoDialogComponent } from '../components/info-dialog/info-dialog.component';
import { MusicButtonContainer } from '../components/music-button/music-button.container';
import { SmartButtonComponent } from '../components/smart-button/smart-button.component';
import { SmartSplitButtonComponent } from '../components/smart-split-button/smart-split-button.component';
import { VersionContainer } from '../components/version/version.container';
import { DialogType } from '../model/dialog-type.model';
import { NesButtonVariant } from '../model/nes-button-variant.model';
import { SmartButtonState } from '../model/smart-button-state.model';

@Component({
  selector: 'app-landing-page-component',
  imports: [
    InfoDialogComponent,
    MusicButtonContainer,
    VersionContainer,
    FormsModule,
    SmartSplitButtonComponent,
    SmartButtonComponent,
  ],
  template: `
    @if (!displayDialogType()) {
      <section class="nes-container is-rounded landing-shell is-dark">
        <h1>Step or Die!</h1>
        <label for="game-id-input" class="space-above">Game ID</label>
        <div class="label-input-row">
          <input
            id="game-id-input"
            class="nes-input game-id-input"
            [(ngModel)]="gameId"
            [disabled]="shallUserInteractionsBeDisabled()"
          />
          <app-smart-button-component
          class="copy-button"
            [state]="copyButtonState()"
            [buttonVariant]="getNormalButtonVariant()"
            (verifiedButtonClick)="copyGameIdClicked.emit()"
          />
        </div>
        <label for="playing-field" class="space-above">Playing Field</label>
        <!-- TODO: i have to maek sure that the font is exactly so big that 15 chars are fitting in height and width -->
        <textarea
          [disabled]="shallUserInteractionsBeDisabled()"
          id="playing-field"
          (input)="handleGameFieldChanged($event)"
          [value]="gameField()"
        ></textarea>
        <div class="button-row">
          <app-smart-split-button-component
            [defaultButton]="{ state: playButtonState(), variant: NesButtonVariant.PRIMARY }"
            [splitButtons]="[
              {
                state: handleLoadingState(SmartButtonState.CANCEL),
                variant: NesButtonVariant.NORMAL,
              },
              {
                state: handleLoadingState(SmartButtonState.OVERWRITE),
                variant: NesButtonVariant.NORMAL,
              },
              {
                state: handleLoadingState(SmartButtonState.LOAD),
                variant: NesButtonVariant.PRIMARY,
              },
            ]"
            [displaySplitButtons]="duplicateFound()"
            (defaultButtonClick)="playClicked.emit()"
            (splitButtonClick)="handlePlaySplitButtonClick($event)"
          />
          <app-smart-button-component
            [buttonVariant]="getNormalButtonVariant()"
            [state]="SmartButtonState.FEEDBACK"
            (verifiedButtonClick)="openFeedbackPackge.emit()"
          />
        </div>
      </section>

      <app-version-container />
      <app-music-button-container />

      <app-info-dialog-component
        [displayDialogType]="displayDialogType()"
        (resetActiveDialogType)="resetActiveDialogType.emit()"
        (loadGame)="loadGame.emit()"
        (overwriteGame)="overwriteGame.emit()"
      />
    }
  `,
  styleUrl: './landing-page.component.scss',
})
export class LandingPageComponent {
  readonly displayDialogType = input.required<DialogType | undefined>();

  readonly gameField = input.required<string>();
  readonly gameId = model.required<string>();
  readonly duplicateFound = input.required<boolean>();
  readonly playButtonState = input.required<SmartButtonState>();
  readonly copyButtonState = input.required<SmartButtonState>();

  readonly playClicked = output();
  readonly resetPlayButtonState = output();
  readonly changedGameField = output<string>();

  readonly submitQuest = output<void>();
  readonly overwriteGame = output<void>();
  readonly loadGame = output<void>();
  readonly resetActiveDialogType = output();
  readonly openFeedbackPackge = output();
  readonly copyGameIdClicked = output();

  protected readonly showInputError = signal(false);

  protected readonly getNormalButtonVariant = computed(() =>
    this.shallUserInteractionsBeDisabled() ? NesButtonVariant.DISABLED : NesButtonVariant.NORMAL,
  );

  protected readonly getNormalDuplicateButtonVariant = computed(() =>
    this.shallDuplicateFoundButtonsBeDisabled()
      ? NesButtonVariant.DISABLED
      : NesButtonVariant.NORMAL,
  );

  protected readonly shallUserInteractionsBeDisabled = computed(
    () =>
      this.playButtonState() === SmartButtonState.SUCCESS ||
      this.playButtonState() === SmartButtonState.LOADING ||
      this.duplicateFound(),
  );

  protected readonly shallDuplicateFoundButtonsBeDisabled = computed(
    () =>
      this.playButtonState() === SmartButtonState.SUCCESS ||
      this.playButtonState() === SmartButtonState.LOADING,
  );

  protected handleGameFieldChanged(event: Event) {
    const target = event.target as HTMLTextAreaElement;
    const value = target.value;

    this.changedGameField.emit(value);
  }

  protected handleLoadingState(defaultState: SmartButtonState) {
    return this.shallDuplicateFoundButtonsBeDisabled() ? SmartButtonState.LOADING : defaultState;
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
  protected NesButtonVariant = NesButtonVariant;
}
