import { Component, input } from '@angular/core';

@Component({
  selector: 'app-version-component',
  imports: [],
  template: ` @if(version()) {
    <span class="nes-text is-disabled version-text">Version {{ version() }}</span>
    }`,
  styleUrl: './version.component.scss',
})
export class VersionComponent {
  readonly version = input.required<string | undefined>();
}
