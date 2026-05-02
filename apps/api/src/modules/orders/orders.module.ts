import { Module, Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser, CurrentUserPayload } from '../../common/decorators/current-user.decorator';

@ApiTags('orders')
@ApiBearerAuth()
@Controller('orders')
@UseGuards(JwtAuthGuard)
class OrdersController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('mine')
  async mine(@CurrentUser() user: CurrentUserPayload) {
    return this.prisma.order.findMany({
      where: { clientId: user.sub },
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: { items: { include: { variant: { include: { product: true } } } } },
    });
  }
}

@Module({ controllers: [OrdersController] })
export class OrdersModule {}
