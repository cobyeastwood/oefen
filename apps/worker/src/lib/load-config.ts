import {
  GetParametersCommand,
  PutParameterCommand,
  SSMClient,
} from '@aws-sdk/client-ssm';

const SECURE_PARAM_ENV: Record<string, string> = {
  'database-url': 'DATABASE_URL',
  'garmin-username': 'GARMIN_USERNAME',
  'garmin-password': 'GARMIN_PASSWORD',
  'garmin-tokens': 'GARMIN_TOKENS',
};

const OPTIONAL_PARAMS = new Set(['garmin-tokens']);

/**
 * Loads required secrets from SSM. `garmin-tokens` is optional: the Lambda
 * creates/updates it only after a successful password login.
 */
export async function loadWorkerConfig(): Promise<void> {
  const prefix = process.env.SSM_PREFIX;

  if (!prefix) {
    return;
  }

  const names = Object.keys(SECURE_PARAM_ENV)
    .filter((key) => !process.env[SECURE_PARAM_ENV[key]])
    .map((key) => `${prefix}/${key}`);

  if (names.length === 0) {
    return;
  }

  const client = new SSMClient({});
  const response = await client.send(
    new GetParametersCommand({
      Names: names,
      WithDecryption: true,
    })
  );

  for (const parameter of response.Parameters ?? []) {
    if (!parameter.Name || !parameter.Value) {
      continue;
    }

    const suffix = parameter.Name.slice(prefix.length + 1);
    const envKey = SECURE_PARAM_ENV[suffix];

    if (envKey) {
      process.env[envKey] = parameter.Value;
    }
  }

  const missing = (response.InvalidParameters ?? []).filter(
    (name) => !OPTIONAL_PARAMS.has(name.slice(prefix.length + 1))
  );

  if (missing.length > 0) {
    throw new Error(`Missing SSM parameters: ${missing.join(', ')}`);
  }
}

export async function persistGarminTokens(tokensJson: string): Promise<void> {
  const prefix = process.env.SSM_PREFIX;

  if (!prefix) {
    return;
  }

  const client = new SSMClient({});

  await client.send(
    new PutParameterCommand({
      Name: `${prefix}/garmin-tokens`,
      Value: tokensJson,
      Type: 'SecureString',
      Overwrite: true,
    })
  );
}
