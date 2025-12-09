import { Component, inject, signal } from '@angular/core';
import { NGXLogger } from 'ngx-logger';
import { LandingPageComponent } from './landing-page.component';

@Component({
  selector: 'app-landing-page-container',
  imports: [LandingPageComponent],
  template: `
    <app-landing-page-component [(notionUrl)]="notionUrl" (submitQuest)="handleEnterClick()" />
  `,
})
export class LandingPageContainer {
  private logger = inject(NGXLogger);

  protected readonly notionUrl = signal<string>('');

  protected handleEnterClick() {
    this.logger.info('Notion URL submitted:', this.notionUrl());
  }
}
