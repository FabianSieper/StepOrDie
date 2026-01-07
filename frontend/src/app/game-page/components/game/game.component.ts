import { Component, ElementRef, input, output, viewChild } from '@angular/core';
import { GameStatus } from '../../model/game.model';

@Component({
  selector: 'app-game-component',
  imports: [],
  template: ` <canvas #playfield [width]="canvasWidth()" [height]="canvasHeight()"></canvas> `,
  styleUrl: './game.component.scss',
})
export class GameComponent {
  readonly gameStatus = input.required<GameStatus>();
  readonly backToMenu = output<void>();
  readonly restartGame = output<void>();

  protected readonly canvasWidth = input(640);
  protected readonly canvasHeight = input(640);

  private readonly canvasRef = viewChild<ElementRef<HTMLCanvasElement>>('playfield');

  // Exposed for embedding components, as presentational components should not contain business logic
  get playfield(): HTMLCanvasElement | undefined {
    return this.canvasRef()?.nativeElement;
  }
}
