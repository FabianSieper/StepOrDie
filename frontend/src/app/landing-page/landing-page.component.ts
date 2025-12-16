import { Component, input, model, output, ViewChild } from '@angular/core';
import { InfoMessageComponent } from '../components/info-message/info-message.component';
import { DuplicateDialogComponent } from './components/duplicate-dialog/duplicate-dialog.component';
import { LoadingDialogComponent } from './components/loading-dialog/loading-dialog.component';
import { InfoMessageDetail } from './model/info-message.model';

@Component({
  selector: 'app-landing-page-component',
  imports: [InfoMessageComponent, DuplicateDialogComponent, LoadingDialogComponent],
  template: `
    <section class="nes-container is-rounded landing-shell is-dark">
      <h1>Welcome to NotionQuest!</h1>

      <div class="nes-field">
        <label for="quest-input" class="label-input">Pitch your quest</label>
        <div class="input-line">
          <input
            id="quest-input"
            type="text"
            class="nes-input"
            placeholder="Enter public Notion Page URL"
            [value]="notionUrl()"
            (input)="onNotionUrlInput($event)"
          />
          <button type="button" (click)="submitQuest.emit()" class="nes-btn is-primary">Go!</button>
        </div>
      </div>
      @if (infoMessageDetails(); as details) {
      <app-info-message [infoMessageDetails]="details" />
      }
    </section>
    <app-loading-dialog-component #loadingDialog [success]="loadedSuccessfully()" />
    <app-duplicate-dialog-component
      #duplicateDialog
      (overwriteGame)="overwriteGame.emit()"
      (loadGame)="loadGame.emit()"
    />
  `,
  styleUrl: './landing-page.component.scss',
})
export class LandingPageComponent {
  readonly loadedSuccessfully = input.required<boolean>();
  readonly infoMessageDetails = input<InfoMessageDetail | undefined>(undefined);
  readonly notionUrl = model.required<string>();
  readonly submitQuest = output<void>();
  readonly overwriteGame = output<void>();
  readonly loadGame = output<void>();

  @ViewChild(DuplicateDialogComponent)
  private dupDialog?: DuplicateDialogComponent;

  get duplicateDialog(): DuplicateDialogComponent | undefined {
    return this.dupDialog;
  }

  @ViewChild(LoadingDialogComponent)
  private loaDialog?: LoadingDialogComponent;

  get loadingDialog(): LoadingDialogComponent | undefined {
    return this.loaDialog;
  }

  protected onNotionUrlInput(event: Event): void {
    const value = (event.target as HTMLInputElement | null)?.value ?? '';
    this.notionUrl.set(value);
  }
}
