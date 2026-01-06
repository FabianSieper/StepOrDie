import { Component } from '@angular/core';

@Component({
  selector: 'app-feedback-page-component',
  imports: [],
  providers: [],
  template: `
    <div class="nes-container with-title is-rounded landing-shell is-dark">
      <p class="title">Feedback</p>
      <div>
        <label for="name">Name</label>
        <input id="name" class="nes-input" />
      </div>
      <div>
        <label for="feedback">Feedback</label>
        <input id="feedback" class="nes-input" />
      </div>
      <div class="button-section">
        <button type="button" class="nes-btn">Back</button>
        <button type="button" class="nes-btn is-primary">Send</button>
      </div>
    </div>
  `,
  styleUrl: './feedback-page.component.scss',
})
export class FeedbackPageComponent {}
