import { GameElement } from '../../model/game.model';
import { Actor } from './Actor';

export class Player extends Actor {
  constructor(player: GameElement) {
    super(player);
  }
}
