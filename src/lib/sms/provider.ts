import "server-only";

export interface SmsProvider {
  isConfigured(): boolean;
  send(mobile: string, message: string): Promise<void>;
}

class NoopSmsProvider implements SmsProvider {
  isConfigured() {
    return false;
  }
  async send(): Promise<void> {
    throw new Error("SMS provider not configured. Set SMS_PROVIDER and SMS_PROVIDER_API_KEY.");
  }
}

// Swap this for a real provider (MSG91, Twilio, etc.) by implementing
// SmsProvider and selecting it here based on process.env.SMS_PROVIDER.
// No other file needs to change — otp.ts only calls isConfigured()/send().
function resolveProvider(): SmsProvider {
  const configured = process.env.SMS_PROVIDER;
  if (!configured || !process.env.SMS_PROVIDER_API_KEY) {
    return new NoopSmsProvider();
  }
  // TODO: add a case per supported provider, e.g. `msg91` -> new Msg91Provider(...)
  return new NoopSmsProvider();
}

export const smsProvider: SmsProvider = resolveProvider();
