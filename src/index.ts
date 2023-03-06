import { createTransport, Transporter } from 'nodemailer';
import MandrillTransport from 'nodemailer-mandrill-transport';
import {
  RawMailOptions,
  SendimTransportInterface,
  TransactionalMailOptions,
} from 'sendim';

// @see: https://stackoverflow.com/a/51399781
type ArrayElement<ArrayType extends readonly unknown[]> =
  ArrayType extends readonly (infer ElementType)[] ? ElementType : never;

type Attachment = ArrayElement<
  Required<Parameters<Transporter['sendMail']>[0]>['attachments']
>;

export interface SendimMandrillProviderConfig {
  apiKey: string;
}
export class SendimMandrillProvider implements SendimTransportInterface {
  private smtpTransport: Transporter;

  providerName = 'Mandrill';

  constructor(public config: SendimMandrillProviderConfig) {
    this.config = config;

    this.smtpTransport = createTransport(
      MandrillTransport({
        auth: {
          apiKey: config.apiKey,
        },
      }),
    );
  }

  async isHealthy() {
    try {
      const response = await fetch(
        'https://mandrillapp.com/api/1.0/users/ping',
        { method: 'POST', headers: { key: this.config.apiKey } },
      );
      return response.status === 200;
    } catch (e) {
      throw new Error('Mandrill not healthy');
    }
  }

  async sendRawMail({
    attachments: rawAttachments,
    sender: rawSender,
    to: rawTo,
    cc: rawCc,
    bcc: rawBcc,
    ...options
  }: RawMailOptions) {
    const attachments: Attachment[] =
      rawAttachments?.map((item) => {
        const { contentType, content, name } = item;

        return {
          contentType,
          content,
          filename: name,
        };
      }) || [];

    const sender = rawSender.email;
    const to = rawTo.map((infos) => infos.email);
    const cc = rawCc?.map((infos) => infos.email);
    const bcc = rawBcc?.map((infos) => infos.email);

    const send = await this.smtpTransport.sendMail({
      ...options,
      sender,
      to,
      cc,
      bcc,
      attachments,
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

    const send = await this.smtpTransport.sendMail({
      ...options,
      templateId,
      attachment: attachments,
    });

    if (send?.body?.messageId) {
      throw new Error(send.response.statusMessage);
    }
  }
}
