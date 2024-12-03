import { DirectSecp256k1HdWallet } from '@cosmjs/proto-signing';
import { fromNumber } from 'long';
import {
  createQueryClient,
  createSigningClient,
  utils,
} from '@ixo/impactxclient-sdk';
import { GasPrice, StdFee, assertIsDeliverTxSuccess } from '@cosmjs/stargate';
import {
  TRX_TYPES,
  generateExecTrx,
  generateRevokeAuthTrx,
  generateWithdrawRewardTrx,
} from './transactions';
import { chunkArray } from './general';
require('dotenv').config();
const store = require('store');

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
  async listAuthzForDelegationClaims(granter?: string) {
    await this.checkInitiated();

    const address = (await this.wallet.getAccounts())[0].address;
    const authz = await this.getGrants(address, granter);
    // console.dir(authz, { depth: null });

    const validAuthz = authz.filter(
      (a) =>
        a?.authorization?.typeUrl === TRX_TYPES.GenericAuthorization &&
        a?.authorization?.value?.msg === TRX_TYPES.MsgWithdrawDelegatorReward &&
        a?.expiration > Date.now(),
    );

    return validAuthz;
  }

  // async revokeAuthzForDelegationClaims(addressRemove: string) {
  //   await this.checkInitiated();

  //   const address = (await this.wallet.getAccounts())[0].address;
  //   const authzs = await this.listAuthzForDelegationClaims(addressRemove);
  //   if (!authzs.length) return 'No active Authz found for address';

  //   const messages = [
  //     generateRevokeAuthTrx({
  //       grantee: address,
  //       granter: addressRemove,
  //       msgTypeUrl: TRX_TYPES.MsgWithdrawDelegatorReward,
  //     }),
  //   ];

  //   const txRes = await this.signingClient.signAndBroadcast(
  //     address,
  //     messages,
  //     'auto',
  //     'Revoke reclaim authz through ixo worker',
  //   );
  //   // @ts-ignore
  //   assertIsDeliverTxSuccess(txRes);
  //   return 'success';
  // }

  async claimDelegationRewards() {
    await this.checkInitiated();

    const address = (await this.wallet.getAccounts())[0].address;
    const authzs = await this.listAuthzForDelegationClaims();
    if (!authzs.length) return 'No Authz found';

    // chunk all authzs up into 10 users per chunk
    for (const chunk of chunkArray(authzs, 10)) {
      // delegations per user
      let delegations = await Promise.all(
        chunk.map(async (a) => ({
          ...(await this.getDelegationTotalRewards(a.granter)),
          granter: a.granter,
        })),
      );

      // filter out delegtions with no rewards or total rewards less than 1ixo
      delegations = delegations.filter(
        (d) => d.total && Number(d.total[0].amount) > 1000000,
      );
      if (!delegations) continue;

      const messages = delegations.map((userDelegations) =>
        generateExecTrx({
          grantee: address,
          msgs: userDelegations.rewards.map((d, i) =>
            generateWithdrawRewardTrx(
              {
                delegatorAddress: userDelegations.granter,
                validatorAddress: d.validatorAddress,
              },
              true,
            ),
          ),
        }),
      );

      const txRes = await this.signingClient.signAndBroadcast(
        address,
        messages,
        'auto',
        'Reclaim through ixo worker',
      );
      // @ts-ignore
      assertIsDeliverTxSuccess(txRes);
    }

    return 'Success';
  }

  // ====================================
  //  QUERIES
  // ====================================
  async getGrants(grantee: string, granter?: string) {
    await this.checkInitiated();

    let grants: any[] = [];
    const query = async (key?: Uint8Array) =>
      granter
        ? await this.queryClient.cosmos.authz.v1beta1.grants({
            grantee,
            granter,
            msgTypeUrl: '',
            pagination: {
              // @ts-ignore
              key: key || [],
              limit: fromNumber(1000),
              offset: fromNumber(0),
            },
          })
        : await this.queryClient.cosmos.authz.v1beta1.granteeGrants({
            grantee,
            pagination: {
              // @ts-ignore
              key: key || [],
              limit: fromNumber(1000),
              offset: fromNumber(0),
            },
          });

    let key: Uint8Array | undefined;
    while (true) {
      const res = await query(key);
      grants = [...grants, ...(res.grants ?? [])];
      key = res.pagination?.nextKey || undefined;
      if (!key?.length) break;
    }

    return (grants ?? [])?.map((g) => ({
      granter: g.granter || granter,
      grantee: grantee,
      expiration: !g.expiration
        ? undefined
        : utils.proto.fromTimestamp(g.expiration)?.getTime(),
      authorization: {
        ...g.authorization,
        value: this.signingClient.registry.decode(g.authorization),
      },
    }));
  }

  getDelegationTotalRewards = async (address: string) => {
    await this.checkInitiated();

    const response =
      await this.queryClient.cosmos.distribution.v1beta1.delegationTotalRewards(
        {
          delegatorAddress: address,
        },
      );

    console.log(response);

    return {
      ...response,
      total: response.total.length
        ? response.total.map((t) => ({
            denom: t.denom,
            amount: t.amount.slice(0, t.amount.length - 18),
          }))
        : undefined,
    };
  };
}
