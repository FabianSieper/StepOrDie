import { Component, ElementRef, input, viewChild } from '@angular/core';

@Component({
  selector: 'app-game-component',
  imports: [],
  template: ` <canvas #playfield [width]="canvasWidth()" [height]="canvasHeight()"></canvas> `,
})
export class GameComponent {
  readonly canvasWidth = input(640);
  readonly canvasHeight = input(640);

  private readonly canvasRef = viewChild<ElementRef<HTMLCanvasElement>>('playfield');

  // Exposed for embedding components, as presentational components should not contain business logic
  get playfield(): HTMLCanvasElement | undefined {
    return this.canvasRef()?.nativeElement;
  }
}
