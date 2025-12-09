import { Controller, Get } from '@nestjs/common';

@Controller('hello')
export class HelloController {
  @Get()
  hello(): string {
    return 'Hello World!';
  }
}
