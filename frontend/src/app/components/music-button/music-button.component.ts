import { Component, input, output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-music-button-component',
  imports: [MatIconModule],
  template: `
    <div class="button-row">
      <button type="button" class="nes-btn" (click)="quieter.emit()">
        <mat-icon>remove</mat-icon>
      </button>
      <button type="button" class="nes-btn" (click)="louder.emit()">
        <mat-icon>add</mat-icon>
      </button>
      <button type="button" class="nes-btn" (click)="toggleMusic.emit()">
        @if(isMusicPlaying()){
        <mat-icon>volume_up</mat-icon>
        } @else {
        <mat-icon>volume_off</mat-icon>
        }
      </button>
    </div>
    <div class="volume-display-area">
      <span>{{ volume() }}</span>
      <progress class="nes-progress is-dark is-primary" [value]="volume()" max="100"></progress>
    </div>
  `,
  styleUrl: './music-button.component.scss',
})
export class MusicButtonComponent {
  readonly isMusicPlaying = input.required<boolean>();
  readonly volume = input.required<number>();
  readonly toggleMusic = output();
  readonly louder = output();
  readonly quieter = output();
}
