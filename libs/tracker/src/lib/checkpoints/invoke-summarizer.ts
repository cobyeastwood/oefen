import { LambdaClient, InvokeCommand } from '@aws-sdk/client-lambda';

import { generateSummary } from '@oefen/summarizer';

const lambda = new LambdaClient({});

export async function invokeSummarizer(checkpointId: string) {
  const functionName = process.env['SUMMARIZER_FUNCTION_NAME'];

  if (functionName) {
    await lambda.send(
      new InvokeCommand({
        FunctionName: functionName,
        InvocationType: 'Event',
        Payload: Buffer.from(JSON.stringify({ checkpointId })),
      }),
    );
    return { invoked: 'lambda' as const, checkpointId };
  }

  try {
    const result = await generateSummary(checkpointId);
    return { invoked: 'local' as const, ...result };
  } catch (error) {
    console.warn('Local summarizer failed:', error);
    return { invoked: 'local' as const, skipped: true, checkpointId };
  }
}
