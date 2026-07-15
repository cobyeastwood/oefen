import { LambdaClient, InvokeCommand } from '@aws-sdk/client-lambda';

import { invokeSummarizer as invokeSummarizerLocal } from '@oefen/tracker-sync';

const lambda = new LambdaClient({});

/** Prefer async summary Lambda; fall back to in-process for local runs. */
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

  return invokeSummarizerLocal(checkpointId);
}
