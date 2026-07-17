import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: import.meta.env.SENTRY_WEB_DSN,
  environment: import.meta.env.VERCEL_ENV ?? 'development',

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
