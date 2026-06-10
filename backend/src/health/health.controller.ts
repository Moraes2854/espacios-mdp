import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class HealthController {
  @Get()
  check() {
    return {
      status: 'ok',
      service: 'espacios-mdp-api',
      timestamp: new Date().toISOString(),
    };
  }
}
