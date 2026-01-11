import { Component, inject } from '@angular/core';
import { MusicService } from '../../services/music.service';
import { MusicButtonComponent } from './music-button.component';

@Component({
  selector: 'app-music-button-container',
  imports: [MusicButtonComponent],
  styleUrl: './music-button.container.scss',
  template: `
    <app-music-button-component
      [isMusicPlaying]="musicService.isMusicPlaying()"
      [volume]="musicService.getVolume()"
      (toggleMusic)="musicService.toggleMusic()"
      (louder)="musicService.louder()"
      (quieter)="musicService.quieter()"
    />
  `,
})
export class MusicButtonContainer {
  protected readonly musicService = inject(MusicService);
}
