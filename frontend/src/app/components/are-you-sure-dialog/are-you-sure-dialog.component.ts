import { Component, output, viewChild } from '@angular/core';
import { UnifiedDialogComponent } from '../unified-dialog/unified-dialog.component';

@Component({
  selector: 'app-are-you-sure-dialog-component',
  imports: [UnifiedDialogComponent],
  providers: [UnifiedDialogComponent],
  template: `
    <app-unified-dialog-component>
      <div>
        <p class="title">Are you sure about that?</p>
        <menu class="dialog-menu">
          <button class="nes-btn" (click)="yesClicked.emit()">Yes</button>
          <button class="nes-btn is-primary" (click)="noClicked.emit()">No</button>
        </menu>
      </div>
    </app-unified-dialog-component>
  `,
  styleUrl: './are-you-sure-dialog.component.scss',
})
export class AreYouSureDialogComponent {
  readonly yesClicked = output<void>();
  readonly noClicked = output<void>();
  readonly resetActiveDialogType = output();

  private readonly unifiedDialogComponent = viewChild(UnifiedDialogComponent);

  get dialog(): HTMLDialogElement | undefined {
    return this.unifiedDialogComponent()?.dialog;
  }
}
