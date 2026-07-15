import twilio from 'twilio';

export function getTwilioClient() {
  const accountSid = process.env['TWILIO_ACCOUNT_SID'];
  const authToken = process.env['TWILIO_AUTH_TOKEN'];

  if (!accountSid || !authToken) {
    return null;
  }

  return twilio(accountSid, authToken);
}

export function twilioSmsConfigured() {
  return Boolean(
    process.env['TWILIO_ACCOUNT_SID'] &&
      process.env['TWILIO_AUTH_TOKEN'] &&
      process.env['TWILIO_FROM_NUMBER'],
  );
}
