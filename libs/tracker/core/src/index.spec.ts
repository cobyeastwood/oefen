import { describe, expect, it } from 'vitest';

import * as trackerCore from './index';

describe('@oefen/tracker/core', () => {
  it('does not export syncGarmin', () => {
    expect(trackerCore).not.toHaveProperty('syncGarmin');
  });
});
