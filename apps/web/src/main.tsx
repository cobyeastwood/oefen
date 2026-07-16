import './instrument';

import { reactErrorHandler } from '@sentry/react';
import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';
import App from './app/app';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement,
  {
    onUncaughtError: reactErrorHandler(),
    onCaughtError: reactErrorHandler(),
    onRecoverableError: reactErrorHandler(),
  }
);

root.render(
  <StrictMode>
    <App/>
  </StrictMode>
);
