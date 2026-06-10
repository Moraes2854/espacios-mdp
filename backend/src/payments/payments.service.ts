import { Injectable } from '@nestjs/common';
import { PaymentMethod, PaymentStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PaymentsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.payment.findMany({
      orderBy: { createdAt: 'desc' },
      include: { booking: { include: { space: true } }, user: true },
    });
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
