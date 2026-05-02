import { Module, Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { TwoFactorGuard } from '../../common/guards/two-factor.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('admin')
@ApiBearerAuth()
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard, TwoFactorGuard)
@Roles(UserRole.ADMIN)
class AdminController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('stats')
  async stats() {
    const [users, vendors, shops, orders] = await Promise.all([
      this.prisma.user.count({ where: { deletedAt: null } }),
      this.prisma.user.count({ where: { role: 'VENDOR', deletedAt: null } }),
      this.prisma.shop.count({ where: { status: 'ACTIVE' } }),
      this.prisma.order.count(),
    ]);
    return { users, vendors, shops, orders };
  }

  @Get('users')
  async listUsers() {
    return this.prisma.user.findMany({
      take: 100,
      orderBy: { createdAt: 'desc' },
      select: { id: true, email: true, role: true, status: true, createdAt: true, isKycVerified: true },
    });
  }
}

@Module({ controllers: [AdminController] })
export class AdminModule {}
