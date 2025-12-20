import { Component, effect, input, OnInit, output, ViewChild } from '@angular/core';
import { DialogType } from '../../game-page/game-page.component';
import { DuplicateDialogComponent } from '../../landing-page/components/duplicate-dialog/duplicate-dialog.component';
import { MessageDialogComponent } from '../message-dialog/message-dialog.component';

// TODO: transfer to own model file
interface MessageDialogInformation {
  paragraphs?: string[];
  switchParagraphsAfterMs?: number;
  addOkButtonForClosing?: boolean;
  header: string;
}

@Component({
  selector: 'app-info-dialog-component',
  imports: [MessageDialogComponent, DuplicateDialogComponent],
  template: `
    <app-duplicate-dialog-component
      #duplicateDialog
      (resetActiveDialogType)="resetActiveDialogType.emit()"
      (overwriteGame)="overwriteGame.emit()"
      (loadGame)="loadGame.emit()"
    />
    <app-message-dialog-component
      [header]="getTitleForDialogType()"
      [paragraphs]="getMessageForDialogType()"
      [addOkButtonForClosing]="shallDisplayOkButtonForClosing()"
      [switchParagraphsAfterMs]="switchParagraphsAfterMs()"
      (resetActiveDialogType)="resetActiveDialogType.emit()"
    />
  `,
})
export class InfoDialogComponent implements OnInit {
  readonly displayDialogType = input.required<DialogType | undefined>();
  readonly addOkButtonForClosing = input<boolean>(false);
  readonly loadGame = output();
  readonly overwriteGame = output();
  readonly resetActiveDialogType = output();

  @ViewChild(MessageDialogComponent)
  private messageDialogComponent?: MessageDialogComponent;

  @ViewChild(DuplicateDialogComponent)
  private duplicateDialogComponent?: DuplicateDialogComponent;

  private dialogMessageBasedOnType = new Map<DialogType, MessageDialogInformation | undefined>([
    [
      DialogType.NOT_FOUND,
      {
        paragraphs: ['The game ID used does not seem to exist.'],
        header: 'Upsi Daisy',
        addOkButtonForClosing: true,
      },
    ],
    [
      DialogType.BACKEND_ERROR,
      {
        paragraphs: [
          'Something went wrong in the background.',
          'Please verify your Notion URL is correct. If so and the error still persists, please try again later, or go sacrifice a goat to tame the gods.',
        ],
        header: 'Sorry',
        addOkButtonForClosing: true,
      },
    ],
    // TODO: for loading, it should be possible to after some seconds dynamically switch the paragraphs
    [
      DialogType.LOADING,
      {
        paragraphs: [
          'Please practice being patient',
          'Just a few more seconds',
          'How is your mom doing?',
        ],
        header: 'Loading',
        switchParagraphsAfterMs: 2000,
      },
    ],
    [DialogType.SUCCESS, { paragraphs: undefined, header: 'Success!' }],
    [
      DialogType.NOTION_URL_EMPTY,
      {
        paragraphs: ['It seems you have not entered anything.'],
        header: 'Thats not how things work',
        addOkButtonForClosing: true,
      },
    ],
    [
      DialogType.INVALID_NOTION_URL,
      {
        paragraphs: ['The URL you entered does not seem to be a valid Notion URL.'],
        header: 'Na aaah',
        addOkButtonForClosing: true,
      },
    ],
    [DialogType.DUPLICATE_FOUND, undefined], // Is handled via duplicate-dialog.component.ts
  ]);

  displayWarning = effect(() => {
    // TODO: remove
    console.log(`Updated dialogType to ${this.displayDialogType()}`);
    if (!this.displayDialogType()) {
      this.messageDialogComponent?.dialog?.close();
      return;
    }

    if (this.displayDialogType() == DialogType.DUPLICATE_FOUND) {
      this.duplicateDialogComponent?.dialog?.showModal();
    } else {
      this.messageDialogComponent?.dialog?.showModal();
    }
  });

  protected getTitleForDialogType() {
    const type = this.displayDialogType();
    if (!type) return;
    return this.dialogMessageBasedOnType.get(type)?.header;
  }

  protected getMessageForDialogType() {
    const type = this.displayDialogType();
    if (!type) return;
    return this.dialogMessageBasedOnType.get(type)?.paragraphs;
  }

  protected shallDisplayOkButtonForClosing() {
    const type = this.displayDialogType();
    if (!type) return false;
    return this.dialogMessageBasedOnType.get(type)?.addOkButtonForClosing ?? false;
  }

  protected switchParagraphsAfterMs() {
    const type = this.displayDialogType();
    if (!type) return;
    return this.dialogMessageBasedOnType.get(type)?.switchParagraphsAfterMs;
  }

  ngOnInit(): void {
    // Make sure the map dialogMessageBasedOnType is defined for all DialogType values
    const allDialogTypes = Object.values(DialogType);
    const missingDialogTypes = allDialogTypes.filter(
      (type) => !this.dialogMessageBasedOnType.has(type)
    );

    if (missingDialogTypes.length > 0) {
      throw new Error(
        `Missing dialog messages for: ${missingDialogTypes
          .map((type) => type.toString())
          .join(', ')}`
      );
    }
  }

  protected DialogType = DialogType;
}
