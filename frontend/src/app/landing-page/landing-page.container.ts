import { Component, inject, signal, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { NGXLogger } from 'ngx-logger';
import { BackendService } from '../services/backend.service';
import { LandingPageComponent } from './landing-page.component';
import { Criticality, InfoMessageDetail } from './model/info-message.model';

@Component({
  selector: 'app-landing-page-container',
  imports: [LandingPageComponent],
  template: `
    <app-landing-page-component
      [(notionUrl)]="notionUrl"
      [loadedSuccessfully]="loadedSuccessfully()"
      [infoMessageDetails]="infoMessageDetails()"
      (submitQuest)="handleEnterClick()"
      (loadGame)="loadExistingGame()"
      (overwriteGame)="requestLoadingInitialPlayingBoard(true)"
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

  protected readonly loadedSuccessfully = signal<boolean>(false);
  protected readonly infoMessageDetails = signal<InfoMessageDetail | undefined>(undefined);

  private lastDuplicateNotionPageId: string | undefined = undefined;

  @ViewChild(LandingPageComponent)
  private landingPageComponent?: LandingPageComponent;

  protected async handleEnterClick() {
    this.infoMessageDetails.set(undefined);
    this.loadedSuccessfully.set(false);
    this.lastDuplicateNotionPageId = undefined;

    this.logger.info('Notion URL submitted:', this.notionUrl());

    if (this.isNotionUrlEmpty()) {
      this.logger.warn('Provided Notion URL is empty:', this.notionUrl());
      this.setNotionUrlEmptyInfo();
      return;
    }

    if (!this.isNotionUrlValid()) {
      this.logger.warn('Provided Notion URL is not valid:', this.notionUrl());
      this.setInvalidUrlInfo();
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
    this.forwardUserToGamePage(existingGameId);
  }

  protected async requestLoadingInitialPlayingBoard(overwrite = false) {
    try {
      this.landingPageComponent?.loadingDialog?.dialog?.showModal();

      this.logger.info('Sending request to load initial playing board...');
      const response = await this.backendService.loadGameStateFromNotion(
        this.notionUrl(),
        overwrite
      );

      this.logger.info('Successfully loaded initial playing board. Received Response: ', response);
      this.loadedSuccessfully.set(true);
      this.forwardUserToGamePage(response.pageId, 2500);
    } catch (error) {
      this.handleError(error as Error);
    }
  }

  private forwardUserToGamePage(gameId: string, timeout = 0) {
    setTimeout(() => {
      this.router.navigate(['/game', gameId]);
    }, timeout);
  }

  private handleError(error: Error) {
    this.logger.warn('Error loading initial playing board:', error);

    // HTTP 409 indicates that there is already a game for the provided Notion page
    if (error.message.includes('409')) {
      this.landingPageComponent?.duplicateDialog?.dialog?.showModal();
      // Store notion URL for later
      this.lastDuplicateNotionPageId = this.extractNotionPageId(this.notionUrl());
    } else {
      // TODO: display error via thingy
      this.setErrorRequestInfo();
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

  private setErrorRequestInfo() {
    this.infoMessageDetails.set({
      ...this.getBaseInfoMessageDetails(),
      message: 'An error occurred while loading your quest. Did you enter a valid Notion URL?',
      criticality: Criticality.ERROR,
    });
  }

  private isNotionUrlEmpty(): boolean {
    return this.notionUrl().trim().length === 0;
  }

  private setNotionUrlEmptyInfo() {
    this.infoMessageDetails.set({
      ...this.getBaseInfoMessageDetails(),
      message: 'The Notion URL cannot be empty.',
      criticality: Criticality.ERROR,
    });
  }

  private isNotionUrlValid(): boolean {
    return this.notionUrl().includes('.notion.site/');
  }

  private setInvalidUrlInfo() {
    this.infoMessageDetails.set({
      ...this.getBaseInfoMessageDetails(),
      message: 'The provided URL does not seem to be a valid public Notion page URL.',
      criticality: Criticality.ERROR,
    });
  }

  private getBaseInfoMessageDetails(): InfoMessageDetail {
    return {
      header: 'Watch out!',
      message: '',
      criticality: Criticality.WARNING,
    };
  }
}
