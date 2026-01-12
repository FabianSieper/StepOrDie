import { Component, inject, OnInit, signal } from '@angular/core';
import { NGXLogger } from 'ngx-logger';
import { BackendService } from '../../services/backend.service';
import { VersionComponent } from './version.component';

@Component({
  selector: 'app-version-container',
  imports: [VersionComponent],
  template: ` <app-version-component [version]="version()" /> `,
})
export class VersionContainer implements OnInit {
  private readonly backendService = inject(BackendService);
  private readonly logger = inject(NGXLogger);

  protected readonly version = signal<undefined | string>(undefined);
  ngOnInit(): void {
    this.loadVersion();
  }

  private async loadVersion() {
    try {
      const version = await this.backendService.getProjectVersion();
      this.version.set(version);
    } catch (error) {
      this.logger.warn(`Failed to load version. Received error: ${error}`);
    }
  }
}
