import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: import.meta.env.SENTRY_DSN,
  environment: import.meta.env.SENTRY_ENVIRONMENT,

  sendDefaultPii: true,

  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],

  tracesSampleRate: 1.0,

  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});
