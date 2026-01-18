import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Game, GameState } from '../model/game.model';

@Injectable({ providedIn: 'root' })
export class BackendService {
  private httpClient = inject(HttpClient);

  storeGameStateFromString(gameId: string, playingBoard: string, overwrite: boolean) {
    return firstValueFrom(
      this.httpClient.post<void>(this.getstoreGameStateFromStringUrl(), {
        gameId,
        playingBoard,
        overwrite,
      }),
    );
  }

  storeGameState(gameId: string, state: GameState) {
    return firstValueFrom(
      this.httpClient.post<void>(this.getstoreGameStateUrl(), {
        gameId,
        state,
      }),
    );
  }

  loadGameStateFromCache(gameId: string): Promise<Game> {
    return firstValueFrom(this.httpClient.get<Game>(this.getLoadGameStateFromCacheUrl() + gameId));
  }

  sendFeedback(name: string, feedback: string): Promise<void> {
    return firstValueFrom(
      this.httpClient.post<void>(this.getSendFeedbackUrl(), { name, feedback }),
    );
  }

  getProjectVersion(): Promise<string> {
    return firstValueFrom(this.httpClient.get<string>(this.getVersionUrl()));
  }

  protected getLoadGameStateFromCacheUrl() {
    return `/api/loadGameStateFromCache/`;
  }

  protected getVersionUrl() {
    return `/api/version`;
  }

  protected getSendFeedbackUrl() {
    return `/api/sendFeedback`;
  }

  protected getstoreGameStateUrl() {
    return `/api/storeGameState`;
  }

  protected getstoreGameStateFromStringUrl() {
    return `/api/storeGameStateFromString`;
  }
}
