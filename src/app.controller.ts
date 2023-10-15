import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';

@Controller()
@ApiTags('Default')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  get(): string {
    return this.appService.get();
  }
}
