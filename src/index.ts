import fetch from 'node-fetch';
import { createTransport, Transporter } from 'nodemailer';
import Mail from 'nodemailer/lib/mailer';
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

type EmailInfo = TransactionalMailOptions['to'];

type MandrillAttachment = {
  type: string;
  name: string;
  content: string;
};

type MandrillOption = {
  mandrillOptions: {
    template_name: string;
    template_content: [];
    message: {
      global_merge_vars: { name: string; content: unknown }[];
      attachments?: MandrillAttachment[];
    };
  };
};

export interface SendimMandrillProviderConfig {
  apiKey: string;
}
export class SendimMandrillProvider implements SendimTransportInterface {
  private smtpTransport: Transporter;

  providerName = 'mandrill';

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
    const response = await fetch('https://mandrillapp.com/api/1.0/users/ping', {
      headers: { key: this.config.apiKey },
    });

    return response.status === 200;
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
      rawAttachments?.map((item) => ({
        contentType: item.contentType,
        content: item.content,
        filename: item.name,
      })) || [];

    const send = await this.smtpTransport.sendMail({
      ...options,
      from: rawSender.email,
      to: this.parseMultipleEmail(rawTo),
      cc: this.parseMultipleEmail(rawCc),
      bcc: this.parseMultipleEmail(rawBcc),
      attachments,
    });

    if (send?.body?.messageId) {
      throw new Error(send.response.statusMessage);
    }
  }

  async sendTransactionalMail({
    attachments: rawAttachments,
    templateId,
    sender,
    to,
    bcc,
    cc,
    reply,
    ...options
  }: TransactionalMailOptions) {
    const attachments: MandrillAttachment[] =
      rawAttachments?.map((item) => ({
        content: item.content,
        name: item.name,
        type: item.contentType,
      })) || [];

    const mailOptions: Mail.Options & MandrillOption = {
      ...options,
      from: sender.email,
      to: this.parseMultipleEmail(to),
      bcc: this.parseMultipleEmail(bcc),
      cc: this.parseMultipleEmail(cc),
      replyTo: reply?.email,
      mandrillOptions: {
        template_name: templateId,
        template_content: [],
        message: {
          global_merge_vars: this.formatMandrillParam(options.params || {}),
          attachments,
        },
      },
    };
    delete mailOptions.attachments;

    const send = await this.smtpTransport.sendMail(mailOptions);

    if (send?.body?.messageId) {
      throw new Error(send.response.statusMessage);
    }
  }

  private parseMultipleEmail = (emailInfo?: EmailInfo) =>
    emailInfo?.map((info) => info.email)?.join(',');

  private formatMandrillParam = (object: Record<string, unknown>) => {
    return Object.entries(object).map((e) => {
      return {
        name: e[0],
        content: e[1],
      };
    });
  };
}
