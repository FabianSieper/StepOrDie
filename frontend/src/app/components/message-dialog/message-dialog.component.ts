import { Component, effect, input, output, signal, ViewChild } from '@angular/core';
import { interval } from 'rxjs';
import { UnifiedDialogComponent } from '../unified-dialog/unified-dialog.component';

@Component({
  selector: 'app-message-dialog-component',
  imports: [UnifiedDialogComponent],
  template: `
    <app-unified-dialog-component
      [addOkButtonForClosing]="addOkButtonForClosing()"
      (resetActiveDialogType)="resetActiveDialogType.emit()"
    >
      <div class="text-div">
        @if (header()) {
        <h1>
          {{ header() }}
        </h1>
        } @if(paragraphs(); as paragraphs) { @if(switchParagraphsAfterMs()) {

        <p>{{ paragraphs[currentDialogIndex()] }}</p>
        } @else { @for(paragraph of paragraphs; track paragraph) {
        <p>{{ paragraph }}</p>
        } } }
      </div>
    </app-unified-dialog-component>
  `,
})
export class MessageDialogComponent {
  readonly header = input.required<string | undefined>();
  readonly paragraphs = input.required<string[] | undefined>();
  readonly addOkButtonForClosing = input<boolean>(false);
  readonly switchParagraphsAfterMs = input<number>();
  readonly resetActiveDialogType = output();

  @ViewChild(UnifiedDialogComponent)
  private _dialog?: UnifiedDialogComponent;

  get dialog(): HTMLDialogElement | undefined {
    return this._dialog?.dialog;
  }

  // Describes which paragraph is currently displayed if switchParagraphsAfterMs is defined.
  protected currentDialogIndex = signal(0);

  private rotateParagraphEffect = effect(
    (onCleanup) => {
      const ms = this.switchParagraphsAfterMs();
      const paragraphs = this.paragraphs();

      this.currentDialogIndex.set(0);

      if (!ms || !paragraphs || paragraphs.length === 0) {
        return;
      }

      const subscription = interval(ms).subscribe(() => {
        this.currentDialogIndex.set((this.currentDialogIndex() + 1) % paragraphs.length);
      });

      onCleanup(() => subscription.unsubscribe());
    },
    { allowSignalWrites: true }
  );
}
