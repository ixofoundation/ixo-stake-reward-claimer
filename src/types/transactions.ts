export type TrxMsgWithTypeUrl = {
  typeUrl: string;
  value: any;
};

export type TrxMsgWithType = {
  type: string;
  value: any;
};

export type EncodedTrxMsgWithType = {
  type: string;
  value: Uint8Array;
};

export type EncodedTrxMsgWithTypeUrl = {
  typeUrl: string;
  value: Uint8Array;
};

export type TrxMsg = TrxMsgWithType | TrxMsgWithTypeUrl;
