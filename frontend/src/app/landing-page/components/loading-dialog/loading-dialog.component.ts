import { Component, input, OnDestroy, OnInit, output, signal, ViewChild } from '@angular/core';
import { UnifiedDialogComponent } from '../unified-dialog/unified-dialog.component';

@Component({
  selector: 'app-loading-dialog-component',
  imports: [UnifiedDialogComponent],
  providers: [UnifiedDialogComponent],
  template: `
    <app-unified-dialog-component>
      <div class="title">
        @if(success()) { Success! } @else { Loading<span class="loading-dots">{{ dots() }}</span>
        }
      </div>
    </app-unified-dialog-component>
  `,
  styleUrl: './loading-dialog.component.scss',
})
export class LoadingDialogComponent implements OnInit, OnDestroy {
  readonly success = input<boolean>(false);
  readonly overwriteGame = output<void>();
  readonly loadGame = output<void>();

  protected dots = signal('');

  private animationChar = '.';
  private maxAnimationLength = 3;
  private increasingAnimation = true;
  private animationIntervalid: number | undefined = undefined;

  @ViewChild(UnifiedDialogComponent)
  private loadingDialog?: UnifiedDialogComponent;

  get dialog(): HTMLDialogElement | undefined {
    return this.loadingDialog?.dialog;
  }

  ngOnInit(): void {
    this.animationIntervalid = setInterval(() => {
      if (this.increasingAnimation) {
        this.dots.update((dots) => dots + this.animationChar);
      } else {
        this.dots.update((dots) => dots.slice(0, -1));
      }

      // If either max length or zero length
      if (this.dots().length % this.maxAnimationLength == 0) {
        this.increasingAnimation = !this.increasingAnimation;
      }
    }, 120);
  }

  ngOnDestroy(): void {
    clearInterval(this.animationIntervalid);
  }
}
