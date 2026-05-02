import { Module, Controller, Get, Param, Query, NotFoundException } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { PrismaService } from '../../prisma/prisma.service';

@ApiTags('products')
@Controller('products')
class ProductsController {
  constructor(private readonly prisma: PrismaService) {}

  @Public()
  @Get()
  async list(
    @Query('q') q?: string,
    @Query('category') category?: string,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    const take = Math.min(Number(limit), 100);
    const skip = (Number(page) - 1) * take;
    return this.prisma.product.findMany({
      where: {
        status: 'ACTIVE',
        visibility: 'PUBLIC',
        deletedAt: null,
        ...(q ? { name: { contains: q, mode: 'insensitive' } } : {}),
        ...(category ? { categories: { some: { category: { slug: category } } } } : {}),
      },
      include: { shop: { select: { slug: true, name: true } }, images: { take: 1 } },
      take,
      skip,
      orderBy: [{ saleCount: 'desc' }, { ratingAvg: 'desc' }],
    });
  }

  @Public()
  @Get(':slug')
  async bySlug(@Param('slug') slug: string) {
    const product = await this.prisma.product.findFirst({
      where: { slug, deletedAt: null },
      include: { shop: true, variants: true, images: true, categories: { include: { category: true } } },
    });
    if (!product) throw new NotFoundException();
    return product;
  }
}

@Module({ controllers: [ProductsController] })
export class ProductsModule {}
