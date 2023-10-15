import { cosmos, ixo } from '@ixo/impactxclient-sdk';

import { TrxMsg, TrxMsgWithTypeUrl } from '../types/transactions';
import { ImpactToken } from 'src/types/tokens';

export const TRX_TYPES = {
  // ====================================================================================================
  // COSMOS
  // ====================================================================================================
  // bank
  MsgSend: '/cosmos.bank.v1beta1.MsgSend',
  MsgMultiSend: '/cosmos.bank.v1beta1.MsgMultiSend',
  SendAuthorization: '/cosmos.bank.v1beta1.SendAuthorization',
  // staking
  MsgDelegate: '/cosmos.staking.v1beta1.MsgDelegate',
  MsgUndelegate: '/cosmos.staking.v1beta1.MsgUndelegate',
  MsgEditValidator: '/cosmos.staking.v1beta1.MsgEditValidator',
  MsgBeginRedelegate: '/cosmos.staking.v1beta1.MsgBeginRedelegate',
  MsgCreateValidator: '/cosmos.staking.v1beta1.MsgCreateValidator',
  // gov
  MsgVote: '/cosmos.gov.v1beta1.MsgVote',
  MsgDeposit: '/cosmos.gov.v1beta1.MsgDeposit',
  MsgSubmitProposal: '/cosmos.gov.v1beta1.MsgSubmitProposal',
  // distribution
  MsgFundCommunityPool: '/cosmos.distribution.v1beta1.MsgFundCommunityPool',
  MsgSetWithdrawAddress: '/cosmos.distribution.v1beta1.MsgSetWithdrawAddress',
  MsgWithdrawDelegatorReward:
    '/cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward',
  MsgWithdrawValidatorCommission:
    '/cosmos.distribution.v1beta1.MsgWithdrawValidatorCommission',
  // slashing
  MsgUnjail: '/cosmos.slashing.v1beta1.MsgUnjail',
  // authz
  MsgGrant: '/cosmos.authz.v1beta1.MsgGrant',
  MsgExec: '/cosmos.authz.v1beta1.MsgExec',
  MsgRevoke: '/cosmos.authz.v1beta1.MsgRevoke',
  GenericAuthorization: '/cosmos.authz.v1beta1.GenericAuthorization',
  // feegrant
  MsgGrantAllowance: '/cosmos.feegrant.v1beta1.MsgGrantAllowance',
  MsgRevokeAllowance: '/cosmos.feegrant.v1beta1.MsgRevokeAllowance',
  // ====================================================================================================
  // IBC
  // ====================================================================================================
  MsgTransfer: '/ibc.applications.transfer.v1.MsgTransfer',
  // ====================================================================================================
  // IXO
  // ====================================================================================================
  // iid
  MsgCreateIidDocument: '/ixo.iid.v1beta1.MsgCreateIidDocument',
  // entity
  MsgGrantEntityAccountAuthz: '/ixo.entity.v1beta1.MsgGrantEntityAccountAuthz',
  MsgTransferEntity: '/ixo.entity.v1beta1.MsgTransferEntity',
  // token
  MsgMintToken: '/ixo.token.v1beta1.MsgMintToken',
  MsgRetireToken: '/ixo.token.v1beta1.MsgRetireToken',
  MsgTransferToken: '/ixo.token.v1beta1.MsgTransferToken',
};

export const generateExecTrx = ({
  grantee,
  msgs,
}: {
  grantee: string;
  msgs: TrxMsg[];
}) => ({
  typeUrl: TRX_TYPES.MsgExec,
  value: cosmos.authz.v1beta1.MsgExec.fromPartial({
    grantee,
    msgs: msgs as any[],
  }),
});

export const generateTransferEntityTrx = (
  {
    id,
    ownerDid,
    ownerAddress,
    recipientDid,
  }: {
    id: string;
    ownerDid: string;
    ownerAddress: string;
    recipientDid: string;
  },
  encode = false,
): TrxMsgWithTypeUrl => {
  const value = ixo.entity.v1beta1.MsgTransferEntity.fromPartial({
    id,
    ownerDid,
    ownerAddress,
    recipientDid,
  });

  return {
    typeUrl: TRX_TYPES.MsgTransferEntity,
    value: encode
      ? ixo.entity.v1beta1.MsgTransferEntity.encode(value).finish()
      : value,
  };
};

export const generateTransferTokenTrx = (
  {
    owner,
    recipient,
    tokens,
  }: {
    owner: string;
    recipient: string;
    tokens: ImpactToken[];
  },
  encode = false,
) => {
  const value = ixo.token.v1beta1.MsgTransferToken.fromPartial({
    owner,
    recipient,
    tokens: tokens.map((b) =>
      ixo.token.v1beta1.TokenBatch.fromPartial({
        id: b.id,
        amount: (b?.amount ?? 0).toString(),
      }),
    ),
  });

  return {
    typeUrl: TRX_TYPES.MsgTransferToken,
    value: encode
      ? ixo.token.v1beta1.MsgTransferToken.encode(value).finish()
      : value,
  };
};
