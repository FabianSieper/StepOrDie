import { Component } from '@angular/core';
import { FeedbackPageComponent } from './feedback-page.component';

@Component({
  selector: 'app-feedback-page-container',
  imports: [FeedbackPageComponent],
  template: ` <app-feedback-page-component />`,
})
export class FeedbackPageContainer {}
