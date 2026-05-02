import { Module, Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { PrismaService } from '../../prisma/prisma.service';

@ApiTags('shops')
@Controller('shops')
class ShopsController {
  constructor(private readonly prisma: PrismaService) {}

  @Public()
  @Get()
  async list(@Query('page') page = 1, @Query('limit') limit = 20) {
    const take = Math.min(Number(limit), 100);
    const skip = (Number(page) - 1) * take;
    return this.prisma.shop.findMany({
      where: { status: 'ACTIVE', deletedAt: null },
      take,
      skip,
      orderBy: { totalSalesXaf: 'desc' },
    });
  }

  @Public()
  @Get(':slug')
  async bySlug(@Param('slug') slug: string) {
    return this.prisma.shop.findUnique({ where: { slug } });
  }
}

@Module({ controllers: [ShopsController] })
export class ShopsModule {}
