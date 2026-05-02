import { Module, Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { PrismaService } from '../../prisma/prisma.service';

@ApiTags('health')
@Controller('health')
class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Public()
  @Get()
  async check() {
    const [{ ok }] = await this.prisma.$queryRaw<{ ok: number }[]>`SELECT 1 AS ok`;
    return { status: 'healthy', database: ok === 1 ? 'connected' : 'error', uptime: process.uptime() };
  }
}

@Module({ controllers: [HealthController] })
export class HealthModule {}
