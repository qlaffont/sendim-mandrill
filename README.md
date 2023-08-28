[![Test Coverage](https://api.codeclimate.com/v1/badges/68fe8b1922c656a71095/test_coverage)](https://codeclimate.com/github/qlaffont/sendim-mandrill/test_coverage) [![Maintainability](https://api.codeclimate.com/v1/badges/68fe8b1922c656a71095/maintainability)](https://codeclimate.com/github/qlaffont/sendim-mandrill/maintainability) ![npm](https://img.shields.io/npm/v/sendim-mandrill) ![npm](https://img.shields.io/npm/dm/sendim-mandrill) ![Snyk Vulnerabilities for npm package](https://img.shields.io/snyk/vulnerabilities/npm/sendim-mandrill) ![NPM](https://img.shields.io/npm/l/sendim-mandrill)

# sendim-mandrill

A simple library to send email with Sendim for Mandrill. Old Owner: [@flexper](https://github.com/flexper)

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
