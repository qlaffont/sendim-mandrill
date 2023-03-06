[![Test Coverage](https://api.codeclimate.com/v1/badges/1cba2b8c3c1a4b96782c/test_coverage)](https://codeclimate.com/github/flexper/sendim-mandrill/test_coverage) [![Maintainability](https://api.codeclimate.com/v1/badges/1cba2b8c3c1a4b96782c/maintainability)](https://codeclimate.com/github/flexper/sendim-mandrill/maintainability) ![npm](https://img.shields.io/npm/v/sendim-mandrill) ![npm](https://img.shields.io/npm/dm/sendim-mandrill) ![Snyk Vulnerabilities for npm package](https://img.shields.io/snyk/vulnerabilities/npm/sendim-mandrill) ![NPM](https://img.shields.io/npm/l/sendim-mandrill)

# sendim-mandrill

A simple library to send email with Sendim for Mandrill.

## Usage

```typescript
import { Sendim } from 'sendim';
import { SendimMandrillProviderConfig, SendimMandrillProvider } from 'sendim-mandrill';

const sendim = new Sendim();

await sendim.addTransport<SendimMandrillProviderConfig>(
  SendimMandrillProvider,
  { apiKey: process.env.MANDRILL_APIKEY! },
);

await sendim.sendTransactionalMail({
  templateId: '6',
  to: [
    {
      email: 'test@test.fr',
    },
  ],
  sender: {
    email: 'test@test.fr',
  },
});
```

## Tests

To execute jest tests (all errors, type integrity test)

```
pnpm test
```

## Maintain

This package use [TSdx](https://github.com/jaredpalmer/tsdx). Please check documentation to update this package.
