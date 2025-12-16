import { Component, ElementRef, output, ViewChild } from '@angular/core';

@Component({
  selector: 'app-unified-dialog-component',
  imports: [],
  template: `
    <dialog #loadingDialog class="nes-dialog is-dark">
      <form method="dialog">
        <ng-content></ng-content>
      </form>
    </dialog>
  `,
  styleUrl: './unified-dialog.component.scss',
})
export class UnifiedDialogComponent {
  readonly overwriteGame = output<void>();
  readonly loadGame = output<void>();

  @ViewChild('loadingDialog')
  private loadingDialog?: ElementRef<HTMLDialogElement>;

  get dialog(): HTMLDialogElement | undefined {
    return this.loadingDialog?.nativeElement;
  }
}
