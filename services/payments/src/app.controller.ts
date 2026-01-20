import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';

@Controller()
export class AppController {
  @Get('/health')
  @HttpCode(HttpStatus.OK)
  health() {
    return { status: 'ok' };
  }
}
