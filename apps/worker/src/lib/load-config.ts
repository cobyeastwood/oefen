import {
  GetParametersCommand,
  PutParameterCommand,
  SSMClient,
  type GetParametersCommandOutput,
} from '@aws-sdk/client-ssm';

const SECURE_PARAM_ENV: Record<string, string> = {
  'database-url': 'DATABASE_URL',
  'garmin-username': 'GARMIN_USERNAME',
  'garmin-password': 'GARMIN_PASSWORD',
  'garmin-tokens': 'GARMIN_TOKENS',
};

/** Always required in Lambda — password SSO is blocked by Cloudflare. */
const REQUIRED_PARAMS = new Set([
  'database-url',
  'garmin-username',
  'garmin-password',
  'garmin-tokens',
]);

function paramSuffix(name: string, prefix: string): string {
  return name.slice(prefix.length + 1);
}

function ssmNamesToFetch(prefix: string): string[] {
  return Object.keys(SECURE_PARAM_ENV)
    .filter((key) => !process.env[SECURE_PARAM_ENV[key]])
    .map((key) => `${prefix}/${key}`);
}

function applySsmParameters(
  prefix: string,
  response: GetParametersCommandOutput,
): string[] {
  const loaded: string[] = [];

  for (const parameter of response.Parameters ?? []) {
    if (!parameter.Name || !parameter.Value) {
      continue;
    }

    const suffix = paramSuffix(parameter.Name, prefix);
    const envKey = SECURE_PARAM_ENV[suffix];
    if (!envKey) {
      continue;
    }

    process.env[envKey] = parameter.Value;
    loaded.push(suffix);
  }

  return loaded;
}

function assertRequiredSsmParams(
  prefix: string,
  response: GetParametersCommandOutput,
): void {
  const missing = (response.InvalidParameters ?? [])
    .map((name) => paramSuffix(name, prefix))
    .filter((suffix) => REQUIRED_PARAMS.has(suffix));

  if (missing.length > 0) {
    throw new Error(
      `Missing SSM parameters: ${missing.map((s) => `${prefix}/${s}`).join(', ')}`,
    );
  }
}

/**
 * Loads secrets from SSM into process.env.
 * `garmin-tokens` is required when `SSM_PREFIX` is set (Lambda).
 */
export async function loadWorkerConfig(): Promise<void> {
  const prefix = process.env.SSM_PREFIX;

  if (!prefix) {
    console.log('[worker] SSM_PREFIX unset — using process env as-is');
    return;
  }

  const names = ssmNamesToFetch(prefix);
  if (names.length === 0) {
    console.log('[worker] All SSM-backed env vars already set — skip fetch');
    return;
  }

  console.log('[worker] Fetching SSM parameters', {
    count: names.length,
    names,
  });

  const client = new SSMClient({});
  const response = await client.send(
    new GetParametersCommand({
      Names: names,
      WithDecryption: true,
    }),
  );

  const loaded = applySsmParameters(prefix, response);
  console.log('[worker] SSM parameters loaded', { loaded });
  assertRequiredSsmParams(prefix, response);
}

export async function persistGarminTokens(tokensJson: string): Promise<void> {
  const prefix = process.env.SSM_PREFIX;

  if (!prefix) {
    console.log('[worker] SSM_PREFIX unset — skip garmin-tokens persist');
    return;
  }

  const client = new SSMClient({});
  const name = `${prefix}/garmin-tokens`;

  await client.send(
    new PutParameterCommand({
      Name: name,
      Value: tokensJson,
      Type: 'SecureString',
      Overwrite: true,
    }),
  );

  console.log('[worker] Wrote SSM parameter', { name });
}

/** Fail fast before sync if oauth tokens never loaded. */
export function assertTokensLoaded(): void {
  if (process.env['GARMIN_TOKENS']?.trim()) {
    return;
  }

  throw new Error(
    'GARMIN_TOKENS missing. Daily worker cannot password-login from Lambda (Cloudflare 429). Put oauth tokens in /oefen/worker/garmin-tokens.',
  );
}

export function logWorkerConfigReady(): void {
  console.log('[worker] Config ready', {
    hasDatabaseUrl: Boolean(process.env['DATABASE_URL']),
    hasGarminUsername: Boolean(process.env['GARMIN_USERNAME']),
    hasGarminPassword: Boolean(process.env['GARMIN_PASSWORD']),
    hasGarminTokens: Boolean(process.env['GARMIN_TOKENS']?.trim()),
  });
}
