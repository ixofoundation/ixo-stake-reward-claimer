import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { RevokeDelegationDto } from './dto/delegations.dto';
import { IxoClient } from 'src/helpers/ixoClient';

@Injectable()
export class DelegationsService {
  constructor() {}

  async claimDelegationRewards() {
    const res = await IxoClient.instance.claimDelegationRewards();
    return res;
  }

  async revokeAuthzForDelegationClaims(dto: RevokeDelegationDto) {
    const res = await IxoClient.instance.revokeAuthzForDelegationClaims(
      dto.address,
    );
    return res;
  }

  async listAuthzForDelegationClaims() {
    const res = await IxoClient.instance.listAuthzForDelegationClaims();
    return res;
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async clearReservation() {
    await this.claimDelegationRewards();
  }
}
