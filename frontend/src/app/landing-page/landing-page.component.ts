import { Component, input, model, output, ViewChild } from '@angular/core';
import { InfoDialogComponent } from '../components/info-dialog/info-dialog.component';
import { MessageDialogComponent } from '../components/message-dialog/message-dialog.component';
import { DialogType } from '../game-page/game-page.component';

@Component({
  selector: 'app-landing-page-component',
  imports: [InfoDialogComponent],
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
    </section>
    <app-info-dialog-component
      [displayDialogType]="displayDialogType()"
      (resetActiveDialogType)="resetActiveDialogType.emit()"
      (loadGame)="loadGame.emit()"
      (overwriteGame)="overwriteGame.emit()"
    />
  `,
  styleUrl: './landing-page.component.scss',
})
export class LandingPageComponent {
  readonly displayDialogType = input.required<DialogType | undefined>();
  readonly notionUrl = model.required<string>();
  readonly submitQuest = output<void>();
  readonly overwriteGame = output<void>();
  readonly loadGame = output<void>();
  readonly resetActiveDialogType = output();

  @ViewChild(MessageDialogComponent)
  private _messageDialog?: MessageDialogComponent;

  get messageDialog(): MessageDialogComponent | undefined {
    return this._messageDialog;
  }

  protected onNotionUrlInput(event: Event): void {
    const value = (event.target as HTMLInputElement | null)?.value ?? '';
    this.notionUrl.set(value);
  }
}
