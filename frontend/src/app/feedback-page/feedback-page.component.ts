import { Component, input, model, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InfoDialogComponent } from '../components/info-dialog/info-dialog.component';
import { DialogType } from '../model/dialog-type.model';

@Component({
  selector: 'app-feedback-page-component',
  imports: [InfoDialogComponent, FormsModule],
  template: `
    @if(!loading()) {
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
        <button type="button" class="nes-btn" (click)="back.emit()">Back</button>
        <button type="button" class="nes-btn is-primary" (click)="send.emit()">Send</button>
      </div>
    </div>
    }

    <app-info-dialog-component [displayDialogType]="loading() ? DialogType.LOADING : undefined" />
  `,
  styleUrl: './feedback-page.component.scss',
})
export class FeedbackPageComponent {
  readonly loading = input.required();
  readonly back = output();
  readonly send = output();
  readonly name = model.required<string>();
  readonly feedback = model.required<string>();
  readonly wasSubmitted = model.required<boolean>();

  protected DialogType = DialogType;
}
