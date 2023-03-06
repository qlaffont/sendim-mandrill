import {
  RawMailOptions,
  SendimTransportInterface,
  TransactionalMailOptions,
} from 'sendim';
import * as SendInBlue from 'sib-api-v3-typescript';
import { AccountApiApiKeys } from 'sib-api-v3-typescript/api/accountApi';
import { TransactionalEmailsApiApiKeys } from 'sib-api-v3-typescript/api/transactionalEmailsApi';

export interface SendimMandrillProviderConfig {
  apiKey: string;
}
export class SendimMandrillProvider implements SendimTransportInterface {
  private accountApi: SendInBlue.AccountApi;
  private smtpTransactionalApi: SendInBlue.TransactionalEmailsApi;

  providerName = 'Mandrill';

  constructor(public config: SendimMandrillProviderConfig) {
    this.accountApi = new SendInBlue.AccountApi();
    this.smtpTransactionalApi = new SendInBlue.TransactionalEmailsApi();

    this.accountApi.setApiKey(AccountApiApiKeys.apiKey, config.apiKey);
    this.smtpTransactionalApi.setApiKey(
      TransactionalEmailsApiApiKeys.apiKey,
      config.apiKey,
    );
  }

  async isHealthy() {
    const account = await this.accountApi.getAccount();
    return account?.response?.statusCode === 200;
  }

  async sendRawMail({ attachments, ...options }: RawMailOptions) {
    const send = await this.smtpTransactionalApi.sendTransacEmail({
      ...options,
      attachment: attachments,
    });

    if (send?.body?.messageId) {
      throw new Error(send.response.statusMessage);
    }
  }

  async sendTransactionalMail({
    attachments,
    ...options
  }: TransactionalMailOptions) {
    const templateId = parseInt(options?.templateId, 10);

    const send = await this.smtpTransactionalApi.sendTransacEmail({
      ...options,
      templateId,
      attachment: attachments,
    });

    if (send?.body?.messageId) {
      throw new Error(send.response.statusMessage);
    }
  }
}
