import { GetParametersCommand, SSMClient } from '@aws-sdk/client-ssm';

const SECURE_PARAM_ENV: Record<string, string> = {
  'database-url': 'DATABASE_URL',
  'google-generative-ai-api-key': 'GOOGLE_GENERATIVE_AI_API_KEY',
  'twilio-account-sid': 'TWILIO_ACCOUNT_SID',
  'twilio-auth-token': 'TWILIO_AUTH_TOKEN',
  'twilio-from-number': 'TWILIO_FROM_NUMBER',
};

export async function loadSummaryConfig(): Promise<void> {
  const prefix = process.env['SSM_PREFIX'];

  if (!prefix) {
    return;
  }

  const names = Object.keys(SECURE_PARAM_ENV)
    .filter((key) => !process.env[SECURE_PARAM_ENV[key]!])
    .map((key) => `${prefix}/${key}`);

  if (names.length === 0) {
    return;
  }

  const client = new SSMClient({});
  const response = await client.send(
    new GetParametersCommand({
      Names: names,
      WithDecryption: true,
    }),
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

  const missing = response.InvalidParameters ?? [];
  if (missing.length > 0) {
    throw new Error(`Missing SSM parameters: ${missing.join(', ')}`);
  }
}
