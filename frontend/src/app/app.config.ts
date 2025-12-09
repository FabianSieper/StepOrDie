import {
  ApplicationConfig,
  importProvidersFrom,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { INGXLoggerConfig, LoggerModule, NgxLoggerLevel } from 'ngx-logger';
import { routes } from './app.routes';

const loggerConfig: INGXLoggerConfig = {
  level: NgxLoggerLevel.DEBUG,
  disableConsoleLogging: false,
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes),
    importProvidersFrom(LoggerModule.forRoot(loggerConfig)),
  ],
};
