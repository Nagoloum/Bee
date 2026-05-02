import { Module, Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser, CurrentUserPayload } from '../../common/decorators/current-user.decorator';

@ApiTags('wallets')
@ApiBearerAuth()
@Controller('wallets')
@UseGuards(JwtAuthGuard)
class WalletsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('mine')
  async mine(@CurrentUser() user: CurrentUserPayload) {
    const wallet = await this.prisma.wallet.findUnique({ where: { userId: user.sub } });
    return wallet;
  }

  @Get('transactions')
  async transactions(@CurrentUser() user: CurrentUserPayload) {
    const wallet = await this.prisma.wallet.findUnique({ where: { userId: user.sub } });
    if (!wallet) return [];
    return this.prisma.walletTransaction.findMany({
      where: { walletId: wallet.id },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }
}

@Module({ controllers: [WalletsController] })
export class WalletsModule {}
