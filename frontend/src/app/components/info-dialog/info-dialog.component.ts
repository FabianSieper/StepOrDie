import { Component, effect, input, OnInit, output, viewChild } from '@angular/core';
import { LostOrWonDialogComponent } from '../../game-page/components/lost-or-won-dialog/lost-or-won-dialog.component';
import { DuplicateDialogComponent } from '../../landing-page/components/duplicate-dialog/duplicate-dialog.component';
import { DialogType } from '../../model/dialog-type.model';
import { MessageDialogInformation } from '../../model/message-dialog-information.model';
import { AreYouSureDialogComponent } from '../are-you-sure-dialog/are-you-sure-dialog.component';
import { MessageDialogComponent } from '../message-dialog/message-dialog.component';

@Component({
  selector: 'app-info-dialog-component',
  imports: [
    MessageDialogComponent,
    AreYouSureDialogComponent,
    DuplicateDialogComponent,
    LostOrWonDialogComponent,
  ],
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
      [addReturnToLandingPageButton]="shallDisplayReturnToLandingPageButton()"
      [switchParagraphsAfterMs]="switchParagraphsAfterMs()"
      (resetActiveDialogType)="resetActiveDialogType.emit()"
      (returnToLandingPage)="backToMenu.emit()"
    />

    <app-are-you-sure-dialog-component
      (yesClicked)="yesClicked.emit()"
      (noClicked)="noClicked.emit()"
    />

    <app-lost-or-won-dialog-component
      [gameWon]="displayDialogType() == DialogType.WON"
      (restartClicked)="reloadGame.emit()"
      (backToMenuClicked)="backToMenu.emit()"
    />
  `,
})
export class InfoDialogComponent implements OnInit {
  readonly displayDialogType = input.required<DialogType | undefined>();
  readonly loadingHeaderAppendix = input<string>();
  readonly loadGame = output();
  readonly overwriteGame = output();
  readonly resetActiveDialogType = output();
  readonly yesClicked = output();
  readonly noClicked = output();
  readonly reloadGame = output();
  readonly backToMenu = output();

  private readonly messageDialogComponent = viewChild(MessageDialogComponent);
  private readonly duplicateDialogComponent = viewChild(DuplicateDialogComponent);
  private readonly areYouSureDialogComponent = viewChild(AreYouSureDialogComponent);
  private readonly lostOrWonDialogComponent = viewChild(LostOrWonDialogComponent);

  private dialogMessageBasedOnType = new Map<DialogType, MessageDialogInformation | undefined>([
    [
      DialogType.NOT_FOUND,
      {
        paragraphs: [
          'The game ID used does not seem to exist. Please return to the landing page of the game.',
        ],
        header: 'Upsi Daisy',
        addOkButtonForClosing: false,
        addReturnToLandingPageButton: true,
      },
    ],
    [
      DialogType.BACKEND_ERROR,
      {
        paragraphs: [
          'Something went wrong in the background.',
          'If the error persists for a longer period, please leave feedback and go sacrifice a goat to tame the gods.',
        ],
        header: 'Sorry',
        addOkButtonForClosing: true,
      },
    ],
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
    [
      DialogType.USER_INPUT_ERROR,
      {
        paragraphs: [
          'Information you entered seems to be incorrect.',
          'Please verify that a gameId is set and the playing board is valid.',
          'A valid playing board has the same amount of rows and columns, each of equal length and only consists of the following characters: #, S, ., Z and M. Also only one character S is allowed.',
        ],
        addOkButtonForClosing: true,
        header: 'All your fault',
      },
    ],
    [DialogType.SUCCESS, { paragraphs: undefined, header: 'Success!' }],
    [DialogType.ARE_YOU_SURE, undefined], // Is handled via are-you-sure-dialog.component.ts
    [DialogType.DUPLICATE_FOUND, undefined], // Is handled via are-you-sure-dialog.component.ts
    [DialogType.WON, undefined], // Is handled via app-lost-or-won-dialog-component.component.ts
    [DialogType.LOST, undefined], // Is handled via app-lost-or-won-dialog-component.component.ts
  ]);

  displayWarning = effect(() => {
    this.computeIfAndWhichDialogShouldBeShown(this.displayDialogType());
  });

  protected getTitleForDialogType() {
    const type = this.displayDialogType();
    if (!type) return;

    if (this.displayDialogType() === DialogType.LOADING && this.loadingHeaderAppendix()) {
      return this.dialogMessageBasedOnType.get(type)?.header + ' ' + this.loadingHeaderAppendix();
    } else {
      return this.dialogMessageBasedOnType.get(type)?.header;
    }
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

  protected shallDisplayReturnToLandingPageButton() {
    const type = this.displayDialogType();
    if (!type) return false;
    return this.dialogMessageBasedOnType.get(type)?.addReturnToLandingPageButton ?? false;
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

    // Initialy check if a dialog should be displayed; Required, as the effect only triggers on a change
    this.computeIfAndWhichDialogShouldBeShown(this.displayDialogType());
  }

  private computeIfAndWhichDialogShouldBeShown(dialogType: DialogType | undefined) {
    if (!dialogType) {
      this.messageDialogComponent()?.dialog?.close();
      this.duplicateDialogComponent()?.dialog?.close();
      this.areYouSureDialogComponent()?.dialog?.close();
      this.lostOrWonDialogComponent()?.dialog?.close();
      return;
    }

    if (dialogType === DialogType.DUPLICATE_FOUND) {
      this.duplicateDialogComponent()?.dialog?.showModal();
    } else if (dialogType === DialogType.ARE_YOU_SURE) {
      this.areYouSureDialogComponent()?.dialog?.showModal();
    } else if (dialogType === DialogType.LOST || dialogType === DialogType.WON) {
      this.lostOrWonDialogComponent()?.dialog?.showModal();
    } else {
      this.messageDialogComponent()?.dialog?.showModal();
    }
  }

  protected DialogType = DialogType;
}
