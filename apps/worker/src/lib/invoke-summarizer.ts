import { LambdaClient, InvokeCommand } from '@aws-sdk/client-lambda';

import {
  invokeSummarizer as invokeSummarizerLocal,
  type SummarizerInvokeResult,
} from '@oefen/tracker/sync';

const lambda = new LambdaClient({});

async function invokeSummarizerLambda(
  functionName: string,
  checkpointId: string,
): Promise<SummarizerInvokeResult> {
  console.log('[worker] Invoking summary Lambda', {
    functionName,
    checkpointId,
    invocationType: 'Event',
  });

  await lambda.send(
    new InvokeCommand({
      FunctionName: functionName,
      InvocationType: 'Event',
      Payload: Buffer.from(JSON.stringify({ checkpointId })),
    }),
  );

  console.log('[worker] Summary Lambda invoke accepted', { checkpointId });
  return { invoked: 'lambda', checkpointId };
}

async function invokeSummarizerInProcess(
  checkpointId: string,
): Promise<SummarizerInvokeResult> {
  console.log(
    '[worker] No SUMMARIZER_FUNCTION_NAME — running local summarizer',
    {
      checkpointId,
    },
  );
  const result = await invokeSummarizerLocal(checkpointId);
  console.log('[worker] Local summarizer finished', result);
  return result;
}

/** Prefer async summary Lambda; fall back to in-process for local runs. */
export async function invokeSummarizer(
  checkpointId: string,
): Promise<SummarizerInvokeResult> {
  const functionName = process.env['SUMMARIZER_FUNCTION_NAME'];
  if (functionName) {
    return invokeSummarizerLambda(functionName, checkpointId);
  }
  return invokeSummarizerInProcess(checkpointId);
}
