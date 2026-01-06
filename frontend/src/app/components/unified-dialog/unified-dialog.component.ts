import { Component, ElementRef, input, output, viewChild } from '@angular/core';

@Component({
  selector: 'app-unified-dialog-component',
  imports: [],
  template: `
    <dialog #loadingDialog class="nes-dialog is-dark">
      <form method="dialog">
        <div class="dialog-content">
          <ng-content></ng-content>
        </div>
        @if (addOkButtonForClosing() ||addReturnToLandingPageButton()) {
        <div class="dialog-actions">
          @if (addOkButtonForClosing()) {
          <button class="nes-btn is-primary" type="submit" (click)="resetActiveDialogType.emit()">
            Ok
          </button>
          } @if (addReturnToLandingPageButton()) {
          <button class="nes-btn is-primary" type="submit" (click)="returnToLandingPage.emit()">
            Return to Landing page
          </button>
          }
        </div>
        }
      </form>
    </dialog>
  `,
  styleUrl: './unified-dialog.component.scss',
})
export class UnifiedDialogComponent {
  readonly addOkButtonForClosing = input<boolean>(false);
  readonly addReturnToLandingPageButton = input<boolean>(false);
  readonly resetActiveDialogType = output();
  readonly returnToLandingPage = output();

  readonly overwriteGame = output<void>();
  readonly loadGame = output<void>();

  private readonly loadingDialogRef = viewChild<ElementRef<HTMLDialogElement>>('loadingDialog');

  get dialog(): HTMLDialogElement | undefined {
    return this.loadingDialogRef()?.nativeElement;
  }
}
