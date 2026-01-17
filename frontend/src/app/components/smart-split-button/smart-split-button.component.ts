import { Component, input, output } from '@angular/core';
import { SmartButtonState } from '../../model/nes-button-state.model';
import { SmartButtonComponent } from '../smart-button/smart-button.component';

@Component({
  selector: 'app-smart-split-button-component',
  imports: [SmartButtonComponent],
  template: `
    <div class="button-row">
      @if(!displaySplitButtons()) {
      <app-smart-button-component
        [state]="defaultButton()"
        (verifiedButtonClick)="defaultButtonClick.emit()"
      />
      } @else { @for (splitButton of splitButtons(); track $index) {
      <app-smart-button-component
        [state]="splitButton"
        (verifiedButtonClick)="splitButtonClick.emit(splitButton)"
      />
      } }
    </div>
  `,
})
export class SmartSplitButtonComponent {
  // TODO: add variant settings possibility
  readonly defaultButton = input.required<SmartButtonState>();
  readonly splitButtons = input.required<SmartButtonState[]>();
  readonly displaySplitButtons = input(false);

  readonly defaultButtonClick = output();
  readonly splitButtonClick = output<SmartButtonState>();
}
