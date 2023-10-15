import { DirectSecp256k1HdWallet } from '@cosmjs/proto-signing';
import store from 'store';
import {
  cosmos,
  createQueryClient,
  createSigningClient,
  utils,
} from '@ixo/impactxclient-sdk';
import { GasPrice } from '@cosmjs/stargate';
import {
  TRX_TYPES,
  generateExecTrx,
  generateTransferEntityTrx,
  generateTransferTokenTrx,
} from './transactions';
require('dotenv').config();

export type SigningClientType = Awaited<ReturnType<typeof createSigningClient>>;
export type QueryClientType = Awaited<ReturnType<typeof createQueryClient>>;

export class IxoClient {
  queryClient: QueryClientType;
  signingClient: SigningClientType;
  wallet: DirectSecp256k1HdWallet;

  constructor() {
    this.checkInitiated();
  }

  public static instance = new IxoClient();

  private mnemonic = process.env.MNEMONIC;
  private rpcUrl = process.env.RPC_URL;

  async checkInitiated() {
    // check if client not initiated yet redo it and await
    if (!this.signingClient || !this.wallet || !this.queryClient)
      await this.init();
  }

  async init() {
    this.wallet = await DirectSecp256k1HdWallet.fromMnemonic(this.mnemonic, {
      prefix: 'ixo',
    });
    this.signingClient = await createSigningClient(
      this.rpcUrl,
      this.wallet,
      false,
      // @ts-ignore
      { gasPrice: GasPrice.fromString('0.025uixo') },
      {
        getLocalData: (k) => store.get(k),
        setLocalData: (k, d) => store.set(k, d),
      },
    );
    this.queryClient = await createQueryClient(this.rpcUrl);
  }

  // ====================================
  //  DELEGATIONS
  // ====================================
  async listAuthzForDelegationClaims() {
    await this.checkInitiated();

    const address = (await this.wallet.getAccounts())[0].address;
    const authz = await this.getGrants(address);

    const validAuthz = authz.filter(
      (a) =>
        a?.authorization?.typeUrl === TRX_TYPES.GenericAuthorization &&
        a?.authorization?.value?.msg === TRX_TYPES.MsgWithdrawDelegatorReward &&
        a?.expiration > Date.now(),
    );

    return validAuthz;
  }

  async revokeAuthzForDelegationClaims(addressRemove: string) {
    await this.checkInitiated();

    const address = (await this.wallet.getAccounts())[0].address;
    const authz = await this.getGrants(address);

    const validAuthz = authz.filter(
      (a) =>
        a?.authorization?.typeUrl === TRX_TYPES.GenericAuthorization &&
        a?.authorization?.value?.msg === TRX_TYPES.MsgWithdrawDelegatorReward &&
        a?.expiration > Date.now(),
    );

    return validAuthz;
  }
  async claimDelegationRewards() {
    await this.checkInitiated();

    const address = (await this.wallet.getAccounts())[0].address;
    const authzs = this.listAuthzForDelegationClaims();

    // TODO fetch delegation amounts for each user to claim
    return authzs;
  }

  // async transferTokens({ data }: TransferTokenDto) {
  //   await this.checkInitiated();

  //   const accounts = await this.wallet.getAccounts();
  //   const address = accounts[0].address;
  //   const authzRequired = data?.owner !== address;

  //   if (authzRequired) await this.canTransferTokens(data?.owner);

  //   const tokens = await this.canTransferTokensAmount(
  //     data?.owner,
  //     data?.amount,
  //   );
  //   const messages = [
  //     !authzRequired
  //       ? generateTransferTokenTrx({
  //           owner: data.owner,
  //           recipient: data.recipient,
  //           tokens,
  //         })
  //       : generateExecTrx({
  //           grantee: address,
  //           msgs: [
  //             generateTransferTokenTrx(
  //               {
  //                 owner: data.owner,
  //                 recipient: data.recipient,
  //                 tokens,
  //               },
  //               true,
  //             ),
  //           ],
  //         }),
  //   ];

  //   return this.signingClient.signAndBroadcast(
  //     address,
  //     messages,
  //     this.calculateGas(messages.length),
  //     data?.memo ? `Transfer tokens - ${data.memo}` : 'Transfer tokens',
  //   );
  // }

  // async transferEntities({ data }: TransferEntityDto) {
  //   await this.checkInitiated();

  //   const accounts = await this.wallet.getAccounts();
  //   const address = accounts[0].address;
  //   const authzRequired = data?.ownerAddress !== address;

  //   console.log({ authzRequired });

  //   if (authzRequired) await this.canTransferEntity(data?.ownerAddress);

  //   const messages = [
  //     !authzRequired
  //       ? generateTransferEntityTrx({
  //           id: data.did,
  //           ownerDid: data.ownerDid,
  //           ownerAddress: data.ownerAddress,
  //           recipientDid: data.recipientDid,
  //         })
  //       : generateExecTrx({
  //           grantee: address,
  //           msgs: [
  //             generateTransferEntityTrx(
  //               {
  //                 id: data.did,
  //                 ownerDid: data.ownerDid,
  //                 ownerAddress: data.ownerAddress,
  //                 recipientDid: data.recipientDid,
  //               },
  //               true,
  //             ),
  //           ],
  //         }),
  //   ];

  //   console.dir({ messages }, { depth: null });
  //   return this.signingClient.signAndBroadcast(
  //     address,
  //     messages,
  //     this.getFee(
  //       messages.length,
  //       await this.signingClient.simulate(address, [message], undefined),
  //     ),
  //     data?.memo ? `Transfer cookstove - ${data.memo}` : 'Transfer cookstoves',
  //   );
  // }

  // ====================================
  //  QUERIES
  // ====================================
  async getGrants(grantee: string, granter?: string) {
    await this.checkInitiated();

    const grants = grantee
      ? await this.queryClient.cosmos.authz.v1beta1.grants({
          grantee,
          granter,
          msgTypeUrl: '',
        })
      : await this.queryClient.cosmos.authz.v1beta1.granteeGrants({
          grantee,
        });

    return (grants.grants ?? [])?.map((g) => ({
      ...g,
      expiration: !g.expiration
        ? undefined
        : utils.proto.fromTimestamp(g.expiration)?.getTime(),
      authorization: {
        ...g.authorization,
        value: this.signingClient.registry.decode(g.authorization),
      },
    }));
  }
}
