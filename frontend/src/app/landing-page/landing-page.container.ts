import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { NGXLogger } from 'ngx-logger';
import { DialogType } from '../model/dialog-type.model';
import { BackendService } from '../services/backend.service';
import { LandingPageComponent } from './landing-page.component';

@Component({
  selector: 'app-landing-page-container',
  imports: [LandingPageComponent],
  template: `
    <app-landing-page-component
      [(notionUrl)]="notionUrl"
      [displayDialogType]="displayDialogType()"
      (submitQuest)="handleEnterClick()"
      (loadGame)="loadExistingGame()"
      (overwriteGame)="requestLoadingInitialPlayingBoard(true)"
      (resetActiveDialogType)="this.displayDialogType.set(undefined)"
    />
  `,
})
export class LandingPageContainer {
  private logger = inject(NGXLogger);
  private backendService = inject(BackendService);
  private router = inject(Router);

  // TODO: set to empty string by default
  protected readonly notionUrl = signal<string>(
    'https://fabiansieper.notion.site/Notion-Quest-2c25e55239fb80f78f9df3fa2c2d65d1?source=copy_link'
  );

  protected readonly displayDialogType = signal<DialogType | undefined>(undefined);

  private lastDuplicateNotionPageId: string | undefined = undefined;

  protected async handleEnterClick() {
    this.displayDialogType.set(undefined);
    this.lastDuplicateNotionPageId = undefined;

    this.logger.info('Notion URL submitted:', this.notionUrl());

    if (this.isNotionUrlEmpty()) {
      this.logger.warn('Provided Notion URL is empty:', this.notionUrl());
      this.displayDialogType.set(DialogType.NOTION_URL_EMPTY);
      return;
    }

    if (!this.isNotionUrlValid()) {
      this.logger.warn('Provided Notion URL is not valid:', this.notionUrl());
      this.displayDialogType.set(DialogType.INVALID_NOTION_URL);
      return;
    }

    await this.requestLoadingInitialPlayingBoard();
  }

  protected loadExistingGame() {
    const existingGameId = this.lastDuplicateNotionPageId;

    if (!existingGameId) {
      this.logger.error('Not able to load existing ame, as the existing game id is undefined');
      return;
    }

    this.logger.info('Loading existing game');
    this.router.navigate(['/game', existingGameId]);
  }

  protected async requestLoadingInitialPlayingBoard(overwrite = false) {
    try {
      this.displayDialogType.set(DialogType.LOADING);
      this.logger.info('Sending request to load initial playing board...');
      const response = await this.backendService.loadGameStateFromNotion(
        this.notionUrl(),
        overwrite
      );
      this.logger.info('Successfully loaded initial playing board. Received Response: ', response);
      this.displayDialogType.set(DialogType.SUCCESS);

      // Open game pager after
      setTimeout(() => {
        this.displayDialogType.set(undefined);
        this.router.navigate(['/game', response.pageId]);
      }, 2500);
    } catch (error) {
      this.handleError(error as Error);
    }
  }

  private handleError(error: Error) {
    this.logger.warn('Error loading initial playing board:', error);

    // HTTP 409 indicates that there is already a game for the provided Notion page
    if (error.message.includes('409')) {
      // TODO: do use displayDialogType instead
      this.displayDialogType.set(DialogType.DUPLICATE_FOUND);
      // Store notion URL for later
      this.lastDuplicateNotionPageId = this.extractNotionPageId(this.notionUrl());
    } else {
      // TODO: display error via thingy
      this.displayDialogType.set(DialogType.BACKEND_ERROR);
    }
  }

  private extractNotionPageId(url: string): string | undefined {
    if (!url) return undefined;
    try {
      const parsed = new URL(url);
      const slug = parsed.pathname.split('/').filter(Boolean).pop();
      if (!slug) return undefined;
      return slug.split('?')[0];
    } catch {
      return undefined;
    }
  }

  private isNotionUrlEmpty(): boolean {
    return this.notionUrl().trim().length === 0;
  }

  private isNotionUrlValid(): boolean {
    return this.notionUrl().includes('.notion.site/');
  }
}
