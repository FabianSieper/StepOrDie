import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { NGXLogger } from 'ngx-logger';
import { DialogType } from '../model/dialog-type.model';
import { BackendService } from '../services/backend.service';
import { FeedbackPageComponent } from './feedback-page.component';

@Component({
  selector: 'app-feedback-page-container',
  imports: [FeedbackPageComponent],
  template: ` <app-feedback-page-component
    [(name)]="name"
    [(feedback)]="feedback"
    [(wasSubmitted)]="wasSubmitted"
    [displaDialogType]="displayDialogType()"
    (back)="router.navigate(['/'])"
    (send)="sendFeedback()"
    (resetActiveDialogType)="displayDialogType.set(undefined)"
  />`,
})
export class FeedbackPageContainer {
  protected readonly router = inject(Router);
  private readonly backenService = inject(BackendService);
  private readonly logger = inject(NGXLogger);

  protected readonly displayDialogType = signal<DialogType | undefined>(undefined);

  protected name = signal('');
  protected feedback = signal('');
  protected wasSubmitted = signal(false);

  private readonly SUCCESS_DISPLAY_TIME = 1000;

  protected async sendFeedback() {
    this.wasSubmitted.set(true);

    if (!this.name() || !this.feedback()) {
      return;
    }

    this.displayDialogType.set(DialogType.LOADING);
    try {
      await this.backenService.sendFeedback(this.name(), this.feedback());

      // Display success dialog
      this.displayDialogType.set(DialogType.SUCCESS);

      // Reset everything after some time
      setTimeout(() => {
        this.name.set('');
        this.feedback.set('');
        this.wasSubmitted.set(false);
        this.displayDialogType.set(undefined);
        this.displayDialogType.set(undefined);
      }, this.SUCCESS_DISPLAY_TIME);
    } catch (error) {
      this.logger.warn(`Failed to send feedback. Received error: ${error}`);
      this.displayDialogType.set(DialogType.BACKEND_ERROR);
    }
  }
}
