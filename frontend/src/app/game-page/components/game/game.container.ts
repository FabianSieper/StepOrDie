import {
  AfterViewInit,
  Component,
  effect,
  inject,
  OnDestroy,
  signal,
  ViewChild,
  WritableSignal,
} from '@angular/core';
import { NGXLogger } from 'ngx-logger';
import { GameService } from '../../services/game.service';
import { GameComponent } from './game.component';

@Component({
  selector: 'app-game-container',
  providers: [GameComponent],
  imports: [GameComponent],
  template: ` <app-game-component /> `,
})
export class GameContainer implements OnDestroy, AfterViewInit {
  private readonly gameService = inject(GameService);
  private readonly logger = inject(NGXLogger);

  // The interval after which new frames are rendered im ms
  private readonly frameInterval = 1000 / 3;

  // Timestamp at which the last drawing was done
  private lastDraw = 0;

  // The request Animation Frame Id to stop animating
  private rafId: number | undefined = undefined;

  // The context for rendering on the canvas
  private readonly ctx: WritableSignal<CanvasRenderingContext2D | undefined> = signal(undefined);

  @ViewChild(GameComponent)
  private gameComponent?: GameComponent;

  ngAfterViewInit(): void {
    const gameComponent = this.gameComponent;
    if (!gameComponent) return;

    this.ctx.set(gameComponent.playfield?.getContext('2d') ?? undefined);
  }

  private readonly startAnimationLoopEffect = effect(() => {
    if (!this.ctx()) return;

    if (this.gameService.isGameDefined()) {
      this.logger.info('Starting animation loop');
      this.startAnimationLoop();
    } else {
      this.logger.info(`Not starting animation loop because game is not defined.`);
    }
  });

  startAnimationLoop() {
    const loop = (timestamp: number) => {
      if (timestamp - this.lastDraw >= this.frameInterval) {
        this.lastDraw = timestamp;
        this.gameService.computationStep(this.ctx());
      }
      this.rafId = requestAnimationFrame(loop);
    };

    this.rafId = requestAnimationFrame(loop);
  }

  ngOnDestroy(): void {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = undefined;
    }
  }
}
