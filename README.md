<div align=center>

![Logo](/logo.png)

# ixo-stake-reward-claimer

![Docker](https://img.shields.io/badge/Docker-2CA5E0?style=for-the-badge&logo=docker&logoColor=white)![NestJS](https://img.shields.io/badge/nestjs-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)![NodeJS](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white)![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)

</div>

The Ixo Stake Rewards Claimer server is developed to run a job daily to execute all authz's for caliming delegation rewards. This way users don't have to do manual claims as the worker will run daily and claim rewards for them. This server allows querying data about authz's granted to the workers address and performing blockchain transactions related to the authz's such as running the claim worker manually.

## How the Server Utilizes authz Messages

When users grant the server account permission to claim rewards on their behalf, an authz message is created on the Ixo network. The server checks for these authz messages daily.

Fetching authz Messages: The server queries the Ixo blockchain to retrieve all authz messages granted to its account.

Filtering Relevant Permissions: Not all authz messages may be for claiming delegation rewards. The server filters out only those permissions relevant to claiming rewards.

Executing Claims: For each relevant authz message, the server sends a claim delegation rewards message to the Ixo network, effectively claiming the rewards on behalf of the user.

Filtering Relevant Executions: For each relevant authz message, the server also filters out any users delegations that totals less than 1ixo.

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
# Clone the repository
$ git clone https://github.com/ixofoundation/ixo-stake-reward-claimer.git
# Navigate to the project directory
$ cd ixo-stake-reward-claimer

# Install dependancies
$ yarn install

# development
$ yarn run start

# watch mode
$ yarn run start:dev

# production mode
$ yarn run start:prod
```

## Docker Usage

If you prefer to run the application inside a Docker container, we've provided a Docker image for convenience. The image is available at `ghcr.io/ixofoundation/ixo-stake-reward-claimer:v0.0.1` and an example docker-compose file is below for reference:

### docker-compose.yaml

```yaml
version: '3'

services:
  ixo-stake-reward-claimer:
    image: ghcr.io/ixofoundation/ixo-stake-reward-claimer:v0.0.1
    container_name: ixo-stake-reward-claimer
    restart: always
    ports:
      - '3000:3000'
    # Add all environment variables below
    environment:
      - SOME_ENV_VARIABLE=value
    # Or optionally use a .env file
    env_file:
      - .env
```

## API Documentation

### GET `/delegations/list`

This endpoint allows users to fetch a list of delegation authorizations (`authz`) that have been granted to the server's account. It provides detailed information about the granters, grantees, expiration times, and the specific type of authorization messages associated with the grant. The server already filters out any authz that has already expired or that is not of type `/cosmos.authz.v1beta1.GenericAuthorization` with a msg of `/cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward`

#### Parameters

- `none`: This endpoint does not require any parameters.

#### Response Body

```json
[
    {
        "granter": "string",
        "grantee": "string",
        "expiration": "number", #ms since epoch
        "authorization": {
            "typeUrl": "/cosmos.authz.v1beta1.GenericAuthorization",
            "value": {
                "msg": "/cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward"
            }
        }
    },
    ...
]
```

#### Properties

- **granter**: The Cosmos address that has granted the `authz` permission.
- **grantee**: The Cosmos address that has received the `authz` permission.
- **expiration**: The expiration time of the `authz` permission.
- **authorization**:
  - **typeUrl**: The URL type of the `authz` authorization.
  - **value**:
    - **msg**: The specific message type indicating the kind of operation the `authz` authorization allows.

#### Usage

```bash
curl -X GET https://[server-address]/delegations/list
```

### POST `/delegations/claim`

This endpoint triggers the server to manually execute the function which the daily cron job runs. It processes the delegation rewards claims on behalf of users based on the authorizations (`authz`) granted to the server's account.

#### Parameters

- `none`: This endpoint does not require any parameters.

#### Response Body

```
'No Authz found' # when there is no authz to execute
'Success' # when everything went successfull
```

#### Properties

- No properties since the response is a simple string message.

#### Usage

```bash
curl -X POST https://[server-address]/delegations/claim
```
