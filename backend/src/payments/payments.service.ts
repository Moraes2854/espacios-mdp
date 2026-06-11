import { BadRequestException, Injectable, ServiceUnavailableException } from '@nestjs/common';
import { PaymentMethod, PaymentStatus } from '@prisma/client';
import { MercadoPagoConfig, Preference } from 'mercadopago';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMercadoPagoPreferenceDto } from './dto/create-mercado-pago-preference.dto';

@Injectable()
export class PaymentsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.payment.findMany({
      orderBy: { createdAt: 'desc' },
      include: { booking: { include: { space: true } }, user: true },
    });
  }



  async createMercadoPagoPreference(data: CreateMercadoPagoPreferenceDto) {
    const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;

    if (!accessToken || accessToken === 'TEST_ACCESS_TOKEN') {
      throw new ServiceUnavailableException('Mercado Pago no está configurado. Falta MERCADO_PAGO_ACCESS_TOKEN en backend/.env.');
    }

    if (!Number.isFinite(Number(data.amount)) || Number(data.amount) <= 0) {
      throw new BadRequestException('El importe de la preferencia debe ser mayor a cero.');
    }

    const frontendBaseUrl = process.env.FRONTEND_BASE_URL || 'http://localhost:5173';
    const itemId = data.externalReference?.trim() || `espacios-mdp-${Date.now()}`;
    const client = new MercadoPagoConfig({ accessToken, options: { timeout: 5000 } });
    const preferenceClient = new Preference(client);

    const preference = await preferenceClient.create({
      body: {
        purpose: 'wallet_purchase',
        items: [
          {
            id: itemId,
            title: data.title,
            description: data.description,
            quantity: 1,
            currency_id: 'ARS',
            unit_price: Number(data.amount),
          },
        ],
        payer: data.payerEmail ? { email: data.payerEmail } : undefined,
        external_reference: data.externalReference,
        metadata: data.metadata,
        back_urls: {
          success: `${frontendBaseUrl}/panel?payment=success`,
          failure: `${frontendBaseUrl}/?payment=failure`,
          pending: `${frontendBaseUrl}/panel?payment=pending`,
        },
        auto_return: 'approved',
      },
    });

    const response = preference as any;

    return {
      id: response.id,
      initPoint: response.init_point,
      sandboxInitPoint: response.sandbox_init_point,
    };
  }

  create(data: any) {
    return this.prisma.payment.create({
      data: {
        bookingId: data.bookingId,
        userId: data.userId,
        amount: data.amount,
        method: data.method || PaymentMethod.BANK_TRANSFER,
        status: data.status || PaymentStatus.PENDING,
        provider: data.provider,
        providerPaymentId: data.providerPaymentId,
        receiptUrl: data.receiptUrl,
        paidAt: data.paidAt ? new Date(data.paidAt) : undefined,
      },
    });
  }
}
