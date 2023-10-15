import { Module } from '@nestjs/common';
import { DelegationsService } from './delegations.service';
import { DelegationsController } from './delegations.controller';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule.forRoot()],
  controllers: [DelegationsController],
  providers: [DelegationsService],
})
export class DelegationsModule {}
