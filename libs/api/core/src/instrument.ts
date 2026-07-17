import * as Sentry from '@sentry/hono/node';

Sentry.init({
  dsn: process.env['SENTRY_API_DSN'],
  environment: process.env['VERCEL_ENV'] ?? 'development',
  sendDefaultPii: true,
  tracesSampleRate: 1.0,
});
