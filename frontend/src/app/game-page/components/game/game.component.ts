import { Component, ElementRef, input, ViewChild } from '@angular/core';

@Component({
  selector: 'app-game-component',
  imports: [],
  template: `
    <section class="nes-container is-rounded">
      <canvas #playfield [width]="canvasWidth()" [height]="canvasHeight()"></canvas>
    </section>
  `,
})
export class GameComponent {
  readonly canvasWidth = input(640);
  readonly canvasHeight = input(640);

  @ViewChild('playfield', { static: true })
  private canvas?: ElementRef<HTMLCanvasElement>;

  // Exposed for embedding components, as presentational components should not contain business logic
  get playfield(): HTMLCanvasElement | undefined {
    return this.canvas?.nativeElement;
  }
}
