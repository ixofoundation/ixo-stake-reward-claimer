import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  get(): string {
    return 'Hello from Ixo Stake Rewards Claimer!';
  }
}
