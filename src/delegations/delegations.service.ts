import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { IxoClient } from 'src/helpers/ixoClient';

@Injectable()
export class DelegationsService {
  constructor() {}

  claiming = false;
  async claimDelegationRewards() {
    if (this.claiming) return;
    this.claiming = true;
    try {
      const res = await IxoClient.instance.claimDelegationRewards();
      return res;
    } catch (error) {
      throw error;
    } finally {
      this.claiming = false;
    }
  }

  // async revokeAuthzForDelegationClaims(dto: RevokeDelegationDto) {
  //   const res = await IxoClient.instance.revokeAuthzForDelegationClaims(
  //     dto.address,
  //   );
  //   return res;
  // }

  async listAuthzForDelegationClaims() {
    const res = await IxoClient.instance.listAuthzForDelegationClaims();
    return res;
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async clearReservation() {
    await this.claimDelegationRewards();
  }
}
