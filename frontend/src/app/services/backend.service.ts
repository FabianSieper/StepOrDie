import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { GameState } from '../model/response/load-game-state.model';

@Injectable({ providedIn: 'root' })
export class BackendService {
  private httpClient = inject(HttpClient);

  storeGameState(gameId: string, playingBoard: string, overwrite: boolean) {
    return firstValueFrom(
      this.httpClient.post<void>(this.getstoreGameStateUrl(), {
        gameId,
        playingBoard,
        overwrite,
      })
    );
  }

  loadGameStateFromCache(gameId: string): Promise<GameState> {
    return firstValueFrom(
      this.httpClient.get<GameState>(this.getLoadGameStateFromCacheUrl() + gameId)
    );
  }

  sendFeedback(name: string, feedback: string): Promise<void> {
    return firstValueFrom(
      this.httpClient.post<void>(this.getSendFeedbackUrl(), { name, feedback })
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
}
