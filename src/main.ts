import { bootstrapApplication } from "@angular/platform-browser";
import * as Sentry from "@sentry/angular";

import { appConfig } from "./app/app.config";
import { AppComponent } from "./app/app.component";

Sentry.init({
  dsn: "https://cb4065c34d8f4e22e526fe1566f6d71b@o4508211009290240.ingest.us.sentry.io/4508211013615616",
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration(),
  ],
  // Tracing
  tracesSampleRate: 1.0, //  Capture 100% of the transactions
  // Set 'tracePropagationTargets' to control for which URLs distributed tracing should be enabled
  tracePropagationTargets: ["localhost", /^https:\/\/yourserver\.io\/api/],
  // Session Replay
  replaysSessionSampleRate: 0.1, // This sets the sample rate at 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.
  replaysOnErrorSampleRate: 1.0, // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.
});

bootstrapApplication(AppComponent, appConfig).catch((err) =>
  Sentry.captureException(err)
); // Send initialization errors to Sentry
