import type { GarminConnect } from 'garmin-connect';

export type GarminTokens = ReturnType<GarminConnect['exportToken']>;
