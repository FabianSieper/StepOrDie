import { Component, input, model, output, ViewChild } from '@angular/core';
import { InfoMessageComponent } from '../components/info-message/info-message.component';
import { LoadingYourQuestOverlayComponent } from '../components/loading-your-quest-overlay/loading-your-quest-overlay.component';
import { OverlayComponent } from '../components/overlay/overlay.component';
import { DuplicateDialogComponent } from './components/duplicate-dialog/duplicate-dialog.component';
import { InfoMessageDetail } from './model/info-message.model';

@Component({
  selector: 'app-landing-page-component',
  imports: [
    InfoMessageComponent,
    OverlayComponent,
    LoadingYourQuestOverlayComponent,
    DuplicateDialogComponent,
  ],
  template: `
    <section class="nes-container is-rounded landing-shell">
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

    <!-- TODO: also use dialogs for these -->
    @if (isLoading()) {
    <app-loading-your-quest-overlay-component [translateY]="140" />
    } @else if (loadedSuccessfully()) {
    <app-overlay>
      <h1 class="translateUp" slot="slot">{{ 'Loaded with Success!' }}</h1>
    </app-overlay>
    }

    <app-duplicate-dialog-component
      #duplicateDialog
      (overwriteGame)="overwriteGame.emit()"
      (loadGame)="loadGame.emit()"
    />
  `,
  styleUrl: './landing-page.component.scss',
})
export class LandingPageComponent {
  readonly isLoading = input.required<boolean>();
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

  protected onNotionUrlInput(event: Event): void {
    const value = (event.target as HTMLInputElement | null)?.value ?? '';
    this.notionUrl.set(value);
  }
}
