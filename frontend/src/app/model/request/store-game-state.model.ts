import { Game } from '../game.model';

export interface StoreGameStateRequest {
  gameId: string;
  game: Game;
}
