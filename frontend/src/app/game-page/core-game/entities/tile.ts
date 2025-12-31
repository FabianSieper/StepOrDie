import { GameElement, TileType } from '../../model/game.model';
import { Entity } from './entity';

export class Tile extends Entity {
  constructor(private tileType: TileType, floor: GameElement) {
    super(floor);
  }

  public isWalkable(): boolean {
    console.log(this.tileType);
    return this.tileType == TileType.FLOOR || this.tileType == TileType.GOAL;
  }
}
