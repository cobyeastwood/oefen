import { LambdaClient, InvokeCommand } from '@aws-sdk/client-lambda';

import {
  invokeSummary as invokeSummaryLocal,
  type SummaryInvokeResult,
} from '@oefen/tracker/sync';

const lambda = new LambdaClient({});

async function invokeSummaryLambda(
  functionName: string,
  checkpointId: string,
): Promise<SummaryInvokeResult> {
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

async function invokeSummaryInProcess(
  checkpointId: string,
): Promise<SummaryInvokeResult> {
  console.log(
    '[worker] No SUMMARY_FUNCTION_NAME — generating summary locally',
    {
      checkpointId,
    },
  );
  const result = await invokeSummaryLocal(checkpointId);
  console.log('[worker] Local summary generation finished', result);
  return result;
}

/** Prefer async summary Lambda; fall back to in-process for local runs. */
export async function invokeSummary(
  checkpointId: string,
): Promise<SummaryInvokeResult> {
  const functionName = process.env['SUMMARY_FUNCTION_NAME'];
  if (functionName) {
    return invokeSummaryLambda(functionName, checkpointId);
  }
  return invokeSummaryInProcess(checkpointId);
}
