import { Component, ElementRef, output, ViewChild } from '@angular/core';

@Component({
  selector: 'app-duplicate-dialog-component',
  imports: [],
  template: `
    <dialog #duplicateDialog class="nes-dialog is-dark">
      <form method="dialog">
        <p class="title">Attention!</p>
        <p>The to be loaded game was already loaded in the past</p>
        <p>Do you want do you want to do?</p>
        <menu class="dialog-menu">
          <button class="nes-btn">Cancel</button>
          <button class="nes-btn" (click)="overwriteGame.emit()">Overwrite</button>
          <button class="nes-btn is-primary" (click)="loadGame.emit()">Load</button>
        </menu>
      </form>
    </dialog>
  `,
  styleUrl: './duplicate-dialog.component.scss',
})
export class DuplicateDialogComponent {
  readonly overwriteGame = output<void>();
  readonly loadGame = output<void>();

  @ViewChild('duplicateDialog')
  private duplicateDialog?: ElementRef<HTMLDialogElement>;

  get dialog(): HTMLDialogElement | undefined {
    return this.duplicateDialog?.nativeElement;
  }
}
