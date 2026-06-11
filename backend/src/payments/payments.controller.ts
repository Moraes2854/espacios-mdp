import { Body, Controller, Get, Post } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreateMercadoPagoPreferenceDto } from './dto/create-mercado-pago-preference.dto';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get()
  findAll() {
    return this.paymentsService.findAll();
  }

  @Post('mercado-pago/preference')
  createMercadoPagoPreference(@Body() body: CreateMercadoPagoPreferenceDto) {
    return this.paymentsService.createMercadoPagoPreference(body);
  }

  @Post()
  create(@Body() body: any) {
    return this.paymentsService.create(body);
  }
}
