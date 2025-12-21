import { Component, output, viewChild } from '@angular/core';
import { UnifiedDialogComponent } from '../../../components/unified-dialog/unified-dialog.component';

@Component({
  selector: 'app-duplicate-dialog-component',
  imports: [UnifiedDialogComponent],
  providers: [UnifiedDialogComponent],
  template: `
    <app-unified-dialog-component>
      <div>
        <p class="title">Attention!</p>
        <p>The to be loaded game was already loaded in the past.</p>
        <p>Do you want do you want to do?</p>
        <menu class="dialog-menu">
          <button class="nes-btn" (click)="resetActiveDialogType.emit()">Cancel</button>
          <button class="nes-btn" (click)="overwriteGame.emit()">Overwrite</button>
          <button class="nes-btn is-primary" (click)="loadGame.emit()">Load</button>
        </menu>
      </div>
    </app-unified-dialog-component>
  `,
  styleUrl: './duplicate-dialog.component.scss',
})
export class DuplicateDialogComponent {
  readonly overwriteGame = output<void>();
  readonly loadGame = output<void>();
  readonly resetActiveDialogType = output();

  private readonly unifiedDialogComponent = viewChild(UnifiedDialogComponent);

  get dialog(): HTMLDialogElement | undefined {
    return this.unifiedDialogComponent()?.dialog;
  }
}
