import { computed, inject, Injectable, signal } from '@angular/core';
import { NGXLogger } from 'ngx-logger';

@Injectable({ providedIn: 'root' })
export class MusicService {
  private readonly logger = inject(NGXLogger);

  private readonly VOLUME_CHANGE_AMOUNT = 0.1;
  private readonly DEFAULT_VOLUME = 0.5;

  private _isMusicPlaying = signal(false);
  private audio: HTMLAudioElement | undefined;

  // Separate signal required to allow components to listen on changes
  private readonly volume = signal(this.DEFAULT_VOLUME);

  readonly getVolume = computed(() => Math.round(this.volume() * 100));

  isMusicDefined() {
    return !!this.audio;
  }

  isMusicPlaying() {
    return this._isMusicPlaying();
  }

  setAudioSrc(src: string, loop = false, loudness = 0.5) {
    this.audio = new Audio(src);
    this.audio.loop = loop;
    this.audio.volume = loudness;
  }

  louder() {
    if (!this.audio) return;
    this.audio.volume += this.VOLUME_CHANGE_AMOUNT;
    this.volume.set(this.audio.volume);
  }

  quieter() {
    if (!this.audio) return;
    this.audio.volume -= this.VOLUME_CHANGE_AMOUNT;
    this.volume.set(this.audio.volume);
  }

  async toggleMusic() {
    if (this._isMusicPlaying()) {
      this.pauseMusic();
    } else {
      this.playMusic();
    }
  }

  private async playMusic() {
    try {
      await this.audio?.play();
      this._isMusicPlaying.set(true);
    } catch (error) {
      this.logger.warn('Failed to start music.');
    }
  }

  private async pauseMusic() {
    try {
      await this.audio?.pause();
      this._isMusicPlaying.set(false);
    } catch (error) {
      this.logger.warn('Failed to stop music.');
    }
  }
}
