import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NGXLogger } from 'ngx-logger';

@Component({
  selector: 'app-game-page-container',
  imports: [],
  template: ``,
})
export class GamePageContainer {
  private logger = inject(NGXLogger);
  private route = inject(ActivatedRoute);
}
