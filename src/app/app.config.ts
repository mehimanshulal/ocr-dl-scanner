// import { ApplicationConfig, provideZoneChangeDetection, APP_INITIALIZER, ErrorHandler  } from '@angular/core';
// import { provideRouter } from '@angular/router';
// import { routes } from './app.routes';
// import { provideClientHydration } from '@angular/platform-browser';

// import { Router } from '@angular/router';
// import * as Sentry from "@sentry/angular";

// export const appConfig: ApplicationConfig = {
//   providers: [
//     provideZoneChangeDetection({ eventCoalescing: true }),
//     provideRouter(routes),
//     provideClientHydration(),
//     {
//       provide: ErrorHandler,
//       useValue: Sentry.createErrorHandler(),
//     },
//     {
//       provide: Sentry.TraceService,
//       deps: [Router],
//     },
//     {
//       provide: APP_INITIALIZER,
//       useFactory: () => () => {},
//       deps: [Sentry.TraceService],
//       multi: true,
//     },
//   ]
// };

import {
  ApplicationConfig,
  provideZoneChangeDetection,
  APP_INITIALIZER,
  ErrorHandler,
} from "@angular/core";
import { provideRouter } from "@angular/router";
import { routes } from "./app.routes";
import { provideClientHydration } from "@angular/platform-browser";

import { Router } from "@angular/router";
import * as Sentry from "@sentry/angular";

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideClientHydration(),
    {
      provide: ErrorHandler,
      useValue: Sentry.createErrorHandler(), // Attaches Sentry's error handler
    },
    {
      provide: Sentry.TraceService,
      deps: [Router],
    },
    {
      provide: APP_INITIALIZER,
      useFactory: () => () => {},
      deps: [Sentry.TraceService],
      multi: true,
    },
  ],
};
