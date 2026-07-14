import { getTwilioClient, twilioSmsConfigured } from './twilio-client';

export type SendSummarySmsInput = {
  checkpointType: string;
  periodStart: Date;
  periodEnd: Date;
  content: string;
  to: string;
};

function formatCheckpointLabel(type: string) {
  return type
    .split('_')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function formatPeriod(start: Date, end: Date) {
  const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
  return `${start.toLocaleDateString(undefined, opts)} – ${end.toLocaleDateString(undefined, opts)}`;
}

function formatSmsBody(input: SendSummarySmsInput) {
  const header = `${formatCheckpointLabel(input.checkpointType)} (${formatPeriod(input.periodStart, input.periodEnd)})`;
  return `${header}\n\n${input.content.trim()}`;
}

export async function sendSummarySms(input: SendSummarySmsInput) {
  const client = twilioSmsConfigured() ? getTwilioClient() : null;
  if (!client) {
    console.warn('Twilio not configured; skipping summary SMS');
    return { skipped: true as const, reason: 'not_configured' as const };
  }

  await client.messages.create({
    body: formatSmsBody(input),
    from: process.env['TWILIO_FROM_NUMBER']!,
    to: input.to,
  });

  return { skipped: false as const };
}
