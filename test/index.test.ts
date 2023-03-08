import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { Sendim } from 'sendim';

import { SendimMandrillProvider, SendimMandrillProviderConfig } from '../src';

const mockSendTransacEmail = jest.fn();

jest.mock('node-fetch', () =>
  jest.fn().mockImplementation(() => ({
    status: process.env.FAILED === 'true' ? 400 : 200,
  })),
);

jest.mock('nodemailer');
const nodemailer = require('nodemailer'); //doesn't work with import. idk why
nodemailer.createTransport.mockReturnValue({ sendMail: mockSendTransacEmail });

describe('Sendim Mandrill', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should be Defined', () => {
    expect(Sendim).toBeDefined();
  });

  it('should be able to define log', () => {
    expect(new Sendim('debug')).toBeDefined();
  });

  it('should be able to add transport', async () => {
    const sendim = new Sendim();

    process.env.FAILED = 'true';
    await sendim.addTransport<SendimMandrillProviderConfig>(
      SendimMandrillProvider,
      { apiKey: '' },
    );

    expect(sendim).toBeDefined();
    expect(sendim.transports).toBeDefined();
    expect(Object.keys(sendim.transports)).toHaveLength(0);

    process.env.FAILED = 'false';
    await sendim.addTransport<SendimMandrillProviderConfig>(
      SendimMandrillProvider,
      { apiKey: process.env.MANDRILL_APIKEY! },
    );

    expect(sendim).toBeDefined();
    expect(sendim.transports).toBeDefined();
    expect(Object.keys(sendim.transports)).toHaveLength(1);
  });

  it('should be able to send raw email', async () => {
    const sendim = new Sendim('debug');

    await sendim.addTransport<SendimMandrillProviderConfig>(
      SendimMandrillProvider,
      { apiKey: process.env.MANDRILL_APIKEY! },
    );

    await sendim.sendRawMail({
      textContent: 'test',
      htmlContent: '<p>test</p>',
      subject: 'test',
      to: [
        {
          email: 'test1@test.fr',
        },
        {
          email: 'test2@test.fr',
        },
      ],
      sender: {
        email: 'test@test.fr',
      },
    });

    expect(mockSendTransacEmail).toBeCalledWith({
      attachments: [],
      htmlContent: '<p>test</p>',
      from: 'test@test.fr',
      subject: 'test',
      textContent: 'test',
      to: 'test1@test.fr,test2@test.fr',
      bcc: undefined,
      cc: undefined,
    });
  });

  it('should be able to send transactional email', async () => {
    const sendim = new Sendim('debug');

    await sendim.addTransport<SendimMandrillProviderConfig>(
      SendimMandrillProvider,
      { apiKey: process.env.MANDRILL_APIKEY! },
    );

    await sendim.sendTransactionalMail({
      templateId: '6',
      to: [
        {
          email: 'test1@test.fr',
        },
        {
          email: 'test2@test.fr',
        },
      ],
      sender: {
        email: 'test@test.fr',
      },
      params: {
        TEST: 'testParam',
      },
    });

    expect(mockSendTransacEmail).toBeCalledWith({
      from: 'test@test.fr',
      to: 'test1@test.fr,test2@test.fr',
      bcc: undefined,
      cc: undefined,
      replyTo: undefined,
      mandrillOptions: {
        template_name: '6',
        template_content: [],
        message: {
          global_merge_vars: [
            {
              name: 'TEST',
              content: 'testParam',
            },
          ],
          attachments: [],
        },
      },
    });
  });
});
