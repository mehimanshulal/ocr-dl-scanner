import { bootstrapApplication } from "@angular/platform-browser";
import { appConfig } from "./app/app.config";
import { AppComponent } from "./app/app.component";

// Remove the Sentry import and initialization
// import * as Sentry from "@sentry/angular";

// Sentry.init({
//   dsn: "https://cb4065c34d8f4e22e526fe1566f6d71b@o4508211009290240.ingest.us.sentry.io/4508211013615616",
//   integrations: [
//     Sentry.browserTracingIntegration(),
//     Sentry.replayIntegration(),
//   ],
//   tracesSampleRate: 1.0,
//   tracePropagationTargets: ["localhost", /^https:\/\/yourserver\.io\/api/],
//   replaysSessionSampleRate: 0.1,
//   replaysOnErrorSampleRate: 1.0,
// });

bootstrapApplication(AppComponent, appConfig).catch((err) => {
  // Remove the Sentry error capturing
  // Sentry.captureException(err);
});
