import { Component, computed, effect, input, output, signal, untracked } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { SmartButtonFeedbackState } from '../../model/nes-button-feedback-state.model';
import { SmartButtonState } from '../../model/nes-button-state.model';
import { NesButtonVariant } from '../../model/nes-button-variant.model';

// Each state consists of a label and an icon
// Each click on the button transferes the state back to the next one.
// At the end of the list, a click event is emitted

@Component({
  selector: 'app-smart-button-component',
  imports: [MatIcon],
  template: `
    <button
      [class]="buttonClass()"
      (click)="handleBackButtonClick()"
      [disabled]="isButtonDisabled()"
    >
      @switch (currentFeedbackState()) { @case (SmartButtonFeedbackState.LOADING) {
      <mat-icon class="loading-icon">autorenew</mat-icon>
      } @case (SmartButtonFeedbackState.SUCCESS) {
      <mat-icon>check_circle</mat-icon>
      } @case (SmartButtonFeedbackState.ERROR) {
      <mat-icon>dangerous</mat-icon>
      } @case (SmartButtonFeedbackState.NONE) {

      <div class="button-content">
        @if (currentButtonState().label) {
        <div>
          {{ currentButtonState().label }}
        </div>
        } @if (currentButtonState().icon) {
        <mat-icon>{{ currentButtonState().icon }}</mat-icon>
        }
      </div>
      } }
    </button>
  `,
  styleUrl: './smart-button.component.scss',
})
export class SmartButtonComponent {
  /**
   * Each state consists of a label and an icon
   * Each click on the button transferes the state back to the next one.
   * At the end of the list, a click event is emitted.
   *
   * List should at least have one element
   */
  readonly buttonStates = input.required<SmartButtonState[]>();
  readonly feedbackStateChange = input<SmartButtonFeedbackState>(SmartButtonFeedbackState.NONE);
  readonly buttonVariant = input<NesButtonVariant | ''>('');
  readonly verifiedButtonClick = output();

  private readonly BACK_TO_NORMAL_BUTTON_STATE_DELAY = 2500;
  private lastButtonPress = 0; // Timestamp of last button press

  private feedbackTimeoutId = 0;
  private buttonResetTimeoutId = 0;

  private readonly currentButtonStateIndex = signal(0);
  protected readonly currentFeedbackState = signal(SmartButtonFeedbackState.NONE);

  // Some states only live for some time and then are resetted
  private readonly updateCurrentFeedbackState = effect(() => {
    const feedbackStateChange = this.feedbackStateChange();
    untracked(() => {
      this.currentFeedbackState.set(feedbackStateChange);

      // Reset state after some time for some feedback states
      if (
        this.currentFeedbackState() === SmartButtonFeedbackState.SUCCESS ||
        this.currentFeedbackState() === SmartButtonFeedbackState.ERROR
      ) {
        if (this.feedbackTimeoutId) clearTimeout(this.feedbackTimeoutId);
        this.feedbackTimeoutId = setTimeout(() => {
          this.currentFeedbackState.set(SmartButtonFeedbackState.NONE);
        }, this.BACK_TO_NORMAL_BUTTON_STATE_DELAY);
      }
    });
  });

  protected readonly isButtonDisabled = computed(
    () =>
      this.currentFeedbackState() === SmartButtonFeedbackState.SUCCESS ||
      this.currentFeedbackState() === SmartButtonFeedbackState.ERROR ||
      this.currentFeedbackState() === SmartButtonFeedbackState.LOADING
  );

  protected readonly currentButtonState = computed(
    () => this.buttonStates()[this.currentButtonStateIndex()]
  );

  protected readonly buttonClass = computed(() => {
    const variant = this.buttonVariant();
    return variant ? `nes-btn ${variant}` : 'nes-btn';
  });

  protected handleBackButtonClick() {
    if (this.lastButtonStateIsReached()) {
      this.verifiedButtonClick.emit();
    } else {
      this.currentButtonStateIndex.set(this.currentButtonStateIndex() + 1);
    }

    this.resetButtonStateAfterTime();
  }

  private resetButtonStateAfterTime() {
    const now = Date.now();
    if (now - this.lastButtonPress <= this.BACK_TO_NORMAL_BUTTON_STATE_DELAY) {
      // Reset timeout
      if (this.buttonResetTimeoutId) clearTimeout(this.buttonResetTimeoutId);
      this.buttonResetTimeoutId = setTimeout(() => {
        this.currentButtonStateIndex.set(0);
      }, this.BACK_TO_NORMAL_BUTTON_STATE_DELAY);
    } else {
      // Set timeout initially
      this.lastButtonPress = now;
      this.buttonResetTimeoutId = setTimeout(() => {
        this.currentButtonStateIndex.set(0);
      }, this.BACK_TO_NORMAL_BUTTON_STATE_DELAY);
    }
  }

  private lastButtonStateIsReached() {
    return this.buttonStates().length - 1 === this.currentButtonStateIndex();
  }

  protected SmartButtonFeedbackState = SmartButtonFeedbackState;
}
