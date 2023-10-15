import { Body, Controller, Get, HttpException, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { RevokeDelegationDto } from './dto/delegations.dto';
import { DelegationsService } from './delegations.service';

@Controller('delegations')
@ApiTags('Delegations')
export class DelegationsController {
  constructor(private readonly delegationsService: DelegationsService) {}

  @Post('/claim')
  claimDelegationRewards() {
    try {
      return this.delegationsService.claimDelegationRewards();
    } catch (error) {
      throw new HttpException(error.message, 400);
    }
  }

  @Post('/revoke')
  revokeAuthzForDelegationClaims(@Body() dto: RevokeDelegationDto) {
    try {
      return this.delegationsService.revokeAuthzForDelegationClaims(dto);
    } catch (error) {
      throw new HttpException(error.message, 400);
    }
  }

  @Get('/list')
  listAuthzForDelegationClaims() {
    try {
      return this.delegationsService.listAuthzForDelegationClaims();
    } catch (error) {
      throw new HttpException(error.message, 400);
    }
  }
}
