import { Component, ElementRef, input, output, ViewChild } from '@angular/core';

@Component({
  selector: 'app-unified-dialog-component',
  imports: [],
  template: `
    <dialog #loadingDialog class="nes-dialog is-dark">
      <form method="dialog">
        <div class="dialog-content">
          <ng-content></ng-content>
        </div>
        @if (addOkButtonForClosing()) {
        <div class="dialog-actions">
          <button class="nes-btn" type="submit" (click)="resetActiveDialogType.emit()">Ok</button>
        </div>
        }
      </form>
    </dialog>
  `,
  styleUrl: './unified-dialog.component.scss',
})
export class UnifiedDialogComponent {
  readonly addOkButtonForClosing = input<boolean>(false);
  readonly resetActiveDialogType = output();

  readonly overwriteGame = output<void>();
  readonly loadGame = output<void>();

  @ViewChild('loadingDialog')
  private loadingDialog?: ElementRef<HTMLDialogElement>;

  get dialog(): HTMLDialogElement | undefined {
    return this.loadingDialog?.nativeElement;
  }
}
