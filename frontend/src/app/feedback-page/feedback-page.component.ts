import { Component, input, model, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InfoDialogComponent } from '../components/info-dialog/info-dialog.component';
import { MusicButtonContainer } from '../components/music-button/music-button.container';
import { SmartButtonComponent } from '../components/smart-button/smart-button.component';
import { VersionContainer } from '../components/version/version.container';
import { DialogType } from '../model/dialog-type.model';
import { SmartButtonState } from '../model/smart-button-state.model';
import { NesButtonVariant } from '../model/nes-button-variant.model';

@Component({
  selector: 'app-feedback-page-component',
  imports: [
    InfoDialogComponent,
    FormsModule,
    MusicButtonContainer,
    VersionContainer,
    SmartButtonComponent,
  ],
  template: `
    @if (!displaDialogType()) {
      <div class="nes-container with-title is-rounded landing-shell is-dark">
        <p class="title">Feedback</p>
        <div class="input-section">
          <div>
            <label for="name">Your Name</label>
            <input
              #nameInput
              id="name"
              class="nes-input"
              (input)="name.set(nameInput.value)"
              [class.is-error]="wasSubmitted() && !name()"
            />
          </div>
          <div>
            <label for="feedback">Your Feedback</label>
            <textarea
              #feedbackInput
              id="feedback"
              class="nes-textarea"
              rows="5"
              [class.is-error]="wasSubmitted() && !feedback()"
              (input)="feedback.set(feedbackInput.value)"
            ></textarea>
          </div>
        </div>
        <div class="button-section">
          <app-smart-button-component
            [state]="SmartButtonState.BACK"
            (verifiedButtonClick)="back.emit()"
          />
          <app-smart-button-component
            [state]="SmartButtonState.SEND"
            [buttonVariant]="NesButtonVariant.PRIMARY"
            (verifiedButtonClick)="send.emit()"
          />
        </div>
      </div>
      <app-music-button-container />
      <app-version-container />
    }

    <app-info-dialog-component
      [displayDialogType]="displaDialogType()"
      (resetActiveDialogType)="resetActiveDialogType.emit()"
    />
  `,
  styleUrl: './feedback-page.component.scss',
})
export class FeedbackPageComponent {
  readonly displaDialogType = input.required<DialogType | undefined>();
  readonly back = output();
  readonly send = output();
  readonly resetActiveDialogType = output();
  readonly name = model.required<string>();
  readonly feedback = model.required<string>();
  readonly wasSubmitted = model.required<boolean>();

  protected readonly SmartButtonState = SmartButtonState;
  protected readonly NesButtonVariant = NesButtonVariant;
}
