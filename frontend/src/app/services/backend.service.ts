import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { LoadNotionGameRequest } from '../model/load-notion-game-request.model';
import { LoadNotionGameResponse } from '../model/load-notion-game-response.model';

@Injectable({ providedIn: 'root' })
export class BackendService {
  private baseUrl: string = 'http://localhost:8080';

  private httpClient = inject(HttpClient);

  getInitialPlayingBoard(notionUrl: string): Promise<LoadNotionGameResponse> {
    const body: LoadNotionGameRequest = { notionUrl };
    return firstValueFrom(
      this.httpClient.post<LoadNotionGameResponse>(this.getInitialPlayingBoardUrl(), body)
    );
  }

  getInitialPlayingBoardUrl() {
    return `${this.baseUrl}/api/loadNotionGame`;
  }
}
