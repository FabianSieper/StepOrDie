import { Component, input, model, output, signal, viewChild } from '@angular/core';
import { InfoDialogComponent } from '../components/info-dialog/info-dialog.component';
import { MessageDialogComponent } from '../components/message-dialog/message-dialog.component';
import { MusicButtonContainer } from '../components/music-button/music-button.container';
import { DialogType } from '../model/dialog-type.model';

@Component({
  selector: 'app-landing-page-component',
  imports: [InfoDialogComponent, MusicButtonContainer],
  template: `
    @if (!displayDialogType()) {
    <section class="nes-container is-rounded landing-shell is-dark">
      <h1>Welcome to NotionQuest!</h1>

      <div class="nes-field">
        <label for="quest-input" class="label-input">Pitch your quest</label>
        <div class="input-line">
          <input
            id="quest-input"
            type="text"
            class="nes-input"
            [class.input-error]="showInputError()"
            placeholder="Enter public Notion Page URL"
            [value]="notionUrl()"
            (input)="onNotionUrlInput($event)"
          />
          <button type="button" (click)="onSubmitClicked()" class="nes-btn is-primary">Go!</button>
        </div>
      </div>
    </section>
    <div>
      <button class="nes-btn feedback-button" (click)="openFeedbackPackge.emit()">Feedback</button>
    </div>

    @if(version()) {
    <span class="nes-text is-disabled version-text">Version {{ version() }}</span>
    }

    <app-music-button-container />
    }

    <app-info-dialog-component
      [displayDialogType]="displayDialogType()"
      loadingHeaderAppendix="from Notion"
      (resetActiveDialogType)="resetActiveDialogType.emit()"
      (loadGame)="loadGame.emit()"
      (overwriteGame)="overwriteGame.emit()"
    />
  `,
  styleUrl: './landing-page.component.scss',
})
export class LandingPageComponent {
  readonly displayDialogType = input.required<DialogType | undefined>();
  readonly version = input<string | undefined>(undefined);
  readonly notionUrl = model.required<string>();
  readonly submitQuest = output<void>();
  readonly overwriteGame = output<void>();
  readonly loadGame = output<void>();
  readonly resetActiveDialogType = output();
  readonly openFeedbackPackge = output();
  protected readonly showInputError = signal(false);

  private readonly messageDialogRef = viewChild(MessageDialogComponent);

  get messageDialog(): MessageDialogComponent | undefined {
    return this.messageDialogRef();
  }

  protected onNotionUrlInput(event: Event): void {
    const value = (event.target as HTMLInputElement | null)?.value ?? '';
    this.notionUrl.set(value);
    if (value.trim().length > 0 && this.showInputError()) {
      this.showInputError.set(false);
    }
  }

  protected onSubmitClicked(): void {
    if (!this.notionUrl().trim()) {
      this.showInputError.set(true);
      return;
    }

    this.showInputError.set(false);
    this.submitQuest.emit();
  }
}
