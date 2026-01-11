import { Component, input, output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-music-button-component',
  imports: [MatIconModule],
  template: `
    <div>
      <button
        type="button"
        class="nes-btn"
        [class.is-disabled]="!isMusicPlaying()"
        [disabled]="!isMusicPlaying()"
        (click)="quieter.emit()"
      >
        <mat-icon>remove</mat-icon>
      </button>
      <button
        type="button"
        class="nes-btn"
        [class.is-disabled]="!isMusicPlaying()"
        [disabled]="!isMusicPlaying()"
        (click)="louder.emit()"
      >
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
      <span class="music-volume-readout">{{ volume() }}</span>
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
