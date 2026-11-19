import * as twilio from 'twilio';
import { env } from '@novu/application-generic';

export class SmsService {
  private provider = env.NODE_ENV === 'test' ? null : twilio(this.SID, this.AUTH_TOKEN);

  constructor(private AUTH_TOKEN: string, private SID: string) {}

  async sendMessage(to: string, from: string, body: string) {
    if (env.NODE_ENV === 'test' || !this.provider) {
      return null;
    }

    return await this.provider.messages.create({
      body,
      to,
      from,
    });
  }
}
