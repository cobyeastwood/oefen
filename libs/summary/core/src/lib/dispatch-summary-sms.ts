import { getUser, isUserSyncEnabled, markSummarySmsSent } from '@oefen/shared/database';
import { sendSummarySms } from '@oefen/shared/utils/notify';

type SummaryRow = {
  id: string;
  content: string;
  smsSentAt: Date | null;
};

type CheckpointPeriod = {
  type: string;
  periodStart: Date;
  periodEnd: Date;
};

/** Send summary SMS once when the user has a phone and SMS has not been sent. */
export async function dispatchSummarySms(
  summary: SummaryRow,
  checkpoint: CheckpointPeriod,
) {
  if (summary.smsSentAt) {
    console.log('[summary] SMS already sent — skipping', {
      summaryId: summary.id,
      smsSentAt: summary.smsSentAt.toISOString(),
    });
    return;
  }

  try {
    const user = await getUser();
    if (!isUserSyncEnabled(user.status)) {
      console.warn('[summary] User sync not enabled — skipping summary SMS', {
        status: user.status,
      });
      return;
    }
    if (!user.phoneE164) {
      console.warn('[summary] User phone not set — skipping summary SMS');
      return;
    }

    const sms = await sendSummarySms({
      checkpointType: checkpoint.type,
      periodStart: checkpoint.periodStart,
      periodEnd: checkpoint.periodEnd,
      content: summary.content,
      to: user.phoneE164,
    });

    if (!sms.skipped) {
      await markSummarySmsSent(summary.id);
      console.log('[summary] Summary SMS sent', { summaryId: summary.id });
    }
  } catch (error) {
    console.warn('[summary] Summary SMS failed', { error });
  }
}
