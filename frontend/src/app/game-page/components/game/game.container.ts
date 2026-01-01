import {
  AfterViewInit,
  Component,
  effect,
  inject,
  OnDestroy,
  output,
  signal,
  viewChild,
  WritableSignal,
} from '@angular/core';
import { NGXLogger } from 'ngx-logger';
import { GameStatus } from '../../model/game.model';
import { GameService } from '../../services/game.service';
import { GameComponent } from './game.component';

@Component({
  selector: 'app-game-container',
  providers: [GameComponent],
  imports: [GameComponent],
  template: ` <app-game-component [gameStatus]="gameService.status()" /> `,
})
export class GameContainer implements OnDestroy, AfterViewInit {
  readonly gameService = inject(GameService);
  private readonly logger = inject(NGXLogger);

  readonly gameWon = output<void>();
  readonly gameLost = output<void>();

  // The request Animation Frame Id to stop animating
  private rafId: number | undefined = undefined;

  // The amount of time the loosing or wining playfield should be displayed until the user is prompted to
  // replay or go back to menu
  private winOrLooseDelayMs = 2500;

  // The context for rendering on the canvas
  private readonly ctx: WritableSignal<CanvasRenderingContext2D | undefined> = signal(undefined);

  private readonly gameComponent = viewChild(GameComponent);

  ngAfterViewInit(): void {
    const gameComponent = this.gameComponent();
    if (!gameComponent) return;

    this.ctx.set(gameComponent.playfield?.getContext('2d') ?? undefined);
  }

  private readonly stopAnimationLoopEffect = effect(() => {
    const rafId = this.rafId;
    const status = this.gameService.status();
    if (!rafId) return;

    if (GameStatus.LOST === status) {
      this.logger.info('Stopping animation loop because game was lost.');

      setTimeout(() => {
        // Stop animation/computation loop
        cancelAnimationFrame(rafId);

        this.rafId = undefined;

        // Reset game state and related variables
        this.gameService.reset();

        // Trigger display of lost dialog
        this.gameLost.emit();
      }, this.winOrLooseDelayMs);
    } else if (GameStatus.WON === status) {
      this.logger.info('Stopping animation loop because game was won.');

      setTimeout(() => {
        // Stop animatino/computation loop
        cancelAnimationFrame(rafId);

        this.rafId = undefined;

        // Reset game state and related variables
        this.gameService.reset();

        // Trigger display of lost dialog
        this.gameWon.emit();
      }, this.winOrLooseDelayMs);
    }
  });

  private readonly startAnimationLoopEffect = effect(() => {
    if (!this.ctx() || !this.gameService.isGameDefined()) return;
    this.logger.info('Starting animation loop');
    this.startAnimationLoop();
  });

  private startAnimationLoop() {
    const loop = () => {
      this.gameService.computationStep(this.ctx());
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
