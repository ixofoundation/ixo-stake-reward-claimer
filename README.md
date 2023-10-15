<div align=center>

![Logo](/logo.png)

# ixo-stake-reward-claimer

![Docker](https://img.shields.io/badge/Docker-2CA5E0?style=for-the-badge&logo=docker&logoColor=white)![NestJS](https://img.shields.io/badge/nestjs-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)![NodeJS](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white)![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)

</div>

The Ixo Stake Rewards Claimer server is developed to run a job daily to execute all authz's for caliming delegation rewards. This way users don't have to do manual claims as the worker will run daily and claim rewards for them. This server allows querying data about authz's granted to the workers address and performing blockchain transactions related to the authz's such as revoking a specific address or running the claim worker manually.

## Installation

```bash
$ yarn
```

## Environment Variables

Ensuring the secure and efficient operation of the Ixo Stake Rewards Claimer Nest.js server, various environment variables are configured to govern aspects like authorization, mnemonics, feature toggling, querying, and transaction broadcasting. The `.env.example` file illustrates a templated structure of these variables, providing a guideline for environment setup.

Here's an overview of each environment variable and its utility within the application:

- **PORT**: Specifies the port number on which the Nest.js server will run.
- **AUTHORIZATION**: Utilized for authorizing API requests, ensuring they originate from authenticated sources. The Authorization header in API requests must precisely match this value (example: `Bearer u4D81XDt4YsbXo6KSynYFChk`).
- **MNEMONIC**: The mnemonic for the account holding the authorization rights to claim delegation rewards.
- **RPC_URL**: The URL for the RPC endpoint used for broadcasting transactions to the ixo blockchain.
- **SENTRY_DSN**: Sentry DNS for Sentry error logging to catch production issues.

### Security Note

It is paramount that sensitive variables such as AUTHORIZATION and MNEMONIC are secured and not exposed to unauthorized personnel or systems. Employ stringent security practices like utilizing secrets management tools, employing strict access controls, and conducting periodic security audits to ensure the confidentiality and integrity of these critical data points.

### Usage Note

To implement these configurations, developers need to create an `.env` file, using `.env.example` as a template, and supply the appropriate values for each variable, ensuring the secure and tailored operation of the server based on the specific deployment environment and use case.

This environment configuration section can serve as a guide to developers, system administrators, and other stakeholders involved in the deployment and maintenance of the server, providing a structured view of the configurable elements that dictate the server’s functionality and security.

## Running the app

```bash
# development
$ yarn run start

# watch mode
$ yarn run start:dev

# production mode
$ yarn run start:prod
```

## API Documentation
