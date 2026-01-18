import { Component, input, output } from '@angular/core';
import { SmartSplitButtonConfig } from '../../model/smart-split-button-config.model';
import { SmartButtonComponent } from '../smart-button/smart-button.component';
import { SmartButtonState } from '../../model/smart-button-state.model';

@Component({
  selector: 'app-smart-split-button-component',
  imports: [SmartButtonComponent],
  template: `
    <div class="button-row">
      @if (!displaySplitButtons()) {
        <app-smart-button-component
          [state]="defaultButton().state"
          [buttonVariant]="defaultButton().variant"
          (verifiedButtonClick)="defaultButtonClick.emit()"
        />
      } @else {
        @for (splitButton of splitButtons(); track $index) {
          <app-smart-button-component
            [state]="splitButton.state"
            [buttonVariant]="splitButton.variant"
            (verifiedButtonClick)="splitButtonClick.emit(splitButton.state)"
          />
        }
      }
    </div>
  `,
  styleUrl: './smart-split-button.component.scss',
})
export class SmartSplitButtonComponent {
  readonly defaultButton = input.required<SmartSplitButtonConfig>();
  readonly splitButtons = input.required<SmartSplitButtonConfig[]>();
  readonly displaySplitButtons = input(false);

  readonly defaultButtonClick = output();
  readonly splitButtonClick = output<SmartButtonState>();
}
