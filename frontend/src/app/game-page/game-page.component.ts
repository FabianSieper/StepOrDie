import { Component, inject } from '@angular/core';
import { NGXLogger } from 'ngx-logger';

@Component({
  selector: 'app-game-page-container',
  imports: [],
  template: ``,
})
export class GamePageContainer {
  private logger = inject(NGXLogger);
}
