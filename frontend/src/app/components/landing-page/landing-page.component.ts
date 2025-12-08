import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-landing-page',
  imports: [],
  template: `
    <section class="nes-container is-rounded landing-shell">
      <h1>Welcome to NotionQuest!</h1>

      <div class="nes-field">
        <label for="quest-input" class="label-input">Pitch your quest</label>
        <input
          id="quest-input"
          type="text"
          class="nes-input"
          placeholder="Enter public Notion Page URL"
        />
      </div>
    </section>
  `,
  styleUrl: './landing-page.component.scss',
})
export class LandingPageComponent {
  protected readonly notionUrl = signal<string>('');
}
