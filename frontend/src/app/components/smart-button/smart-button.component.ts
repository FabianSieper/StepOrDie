import { Component, computed, input, output, signal } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { SmartButtonConfig } from '../../model/nes-button-config.model';
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
      <div class="button-content">
        @if (currentButtonConfig().label) {
        <div>
          {{ currentButtonConfig().label }}
        </div>
        } @if (currentButtonConfig().icon) {
        <mat-icon>{{ currentButtonConfig().icon }}</mat-icon>
        }
      </div>
    </button>
  `,
  styleUrl: './smart-button.component.scss',
})
export class SmartButtonComponent {
  readonly state = input.required<SmartButtonState>();
  readonly buttonVariant = input<NesButtonVariant | ''>('');
  readonly verifiedButtonClick = output();

  private readonly BACK_TO_NORMAL_BUTTON_STATE_DELAY = 2500;
  private lastButtonPress = 0; // Timestamp of last button press
  private buttonResetTimeoutId = 0;

  /**
   * The currently utilized configuration from the current SmartButtonState. If the current button state is the last one in the list, the click emits the "verifiedButtonClick"
   */
  private readonly currentButtonStateIndex = signal(0);

  private readonly BUTTON_STATE_BEHAVIOURS = new Map<SmartButtonState, SmartButtonConfig[]>([
    [SmartButtonState.SUCCESS, [{ icon: 'check_circle' }]],
    [SmartButtonState.COPY, [{ icon: 'content_copy' }]],
    [SmartButtonState.SAVE, [{ icon: 'save' }]],
    [SmartButtonState.ERROR, [{ icon: 'dangerous' }]],
    [SmartButtonState.LOADING, [{ icon: 'autorenew' }]],
    [SmartButtonState.PLAY, [{ icon: 'play_arrow' }]],
    [SmartButtonState.OVERWRITE, [{ icon: 'save_as' }]],
    [SmartButtonState.LOAD, [{ icon: 'file_open' }]],
    [SmartButtonState.CANCEL, [{ icon: 'cancel' }]],
    [SmartButtonState.BACK, [{ icon: 'arrow_back' }, { label: 'Sure?' }, { label: 'Sure!' }]],
  ]);

  protected readonly isButtonDisabled = computed(
    () =>
      this.state() === SmartButtonState.SUCCESS ||
      this.state() === SmartButtonState.ERROR ||
      this.state() === SmartButtonState.LOADING
  );

  protected readonly currentButtonConfig = computed(() => {
    return this.currentButtonConfigList()[this.currentButtonStateIndex()];
  });

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

  private readonly currentButtonConfigList = computed(() => {
    const buttonConfig = this.BUTTON_STATE_BEHAVIOURS.get(this.state());
    if (!buttonConfig) {
      throw Error('Loaded button config for state is undefined. Should always be defined!');
    }
    return buttonConfig;
  });

  private resetButtonStateAfterTime() {
    const now = Date.now();
    if (now - this.lastButtonPress <= this.BACK_TO_NORMAL_BUTTON_STATE_DELAY) {
      // Refresh timeout when button pressed within time range
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
    return this.currentButtonConfigList().length - 1 === this.currentButtonStateIndex();
  }

  protected SmartButtonState = SmartButtonState;
}
