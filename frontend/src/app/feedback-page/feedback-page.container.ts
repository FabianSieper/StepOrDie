import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { BackendService } from '../services/backend.service';
import { FeedbackPageComponent } from './feedback-page.component';

@Component({
  selector: 'app-feedback-page-container',
  imports: [FeedbackPageComponent],
  template: ` <app-feedback-page-component
    [loading]="loading()"
    (back)="router.navigate(['/'])"
    (send)="sendFeedback()"
    [(name)]="name"
    [(feedback)]="feedback"
    [(wasSubmitted)]="wasSubmitted"
  />`,
})
export class FeedbackPageContainer {
  protected readonly router = inject(Router);
  private readonly backenService = inject(BackendService);

  protected readonly loading = signal(false);

  protected name = signal('');
  protected feedback = signal('');
  protected wasSubmitted = signal(false);

  protected async sendFeedback() {
    this.wasSubmitted.set(true);

    if (!this.name() || !this.feedback()) {
      return;
    }

    this.loading.set(true);
    try {
      await this.backenService.sendFeedback(this.name(), this.feedback());

      // Reset everything
      this.name.set('');
      this.feedback.set('');
      this.wasSubmitted.set(false);
    } catch (error) {
      // TODO
    } finally {
      this.loading.set(false);
    }
  }
}
