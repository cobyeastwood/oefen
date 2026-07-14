import { getUser, isUserSyncEnabled, markSummarySmsSent } from '@oefen/database';
import { sendSummarySms } from '@oefen/utils/notify';

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
    return;
  }

  try {
    const user = await getUser();
    if (!isUserSyncEnabled(user.status)) {
      console.warn(`User status is ${user.status}; skipping summary SMS`);
      return;
    }
    if (!user.phoneE164) {
      console.warn('User phone not set; skipping summary SMS');
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
    }
  } catch (error) {
    console.warn('Summary SMS failed:', error);
  }
}
