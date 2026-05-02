import { Module, Controller, Get, Put, Param, Body, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { Public } from '../../common/decorators/public.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { TwoFactorGuard } from '../../common/guards/two-factor.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('cms')
@Controller('cms')
class CmsController {
  constructor(private readonly prisma: PrismaService) {}

  // ─── PUBLIC : lecture (storefront) ───
  @Public()
  @Get('settings/public')
  async publicSettings() {
    return this.prisma.siteSetting.findMany({
      where: { isPublic: true },
      select: { key: true, value: true },
    });
  }

  @Public()
  @Get('banners/:position')
  async banners(@Param('position') position: string) {
    return this.prisma.banner.findMany({
      where: {
        position: position as 'HOME_HERO' | 'HOME_MIDDLE' | 'CATEGORY_TOP' | 'CART',
        isActive: true,
        OR: [{ endsAt: null }, { endsAt: { gt: new Date() } }],
      },
      orderBy: { displayOrder: 'asc' },
    });
  }

  @Public()
  @Get('legal/:slug')
  async legal(@Param('slug') slug: string) {
    return this.prisma.legalDocument.findFirst({
      where: { slug, language: 'fr', isCurrent: true },
    });
  }

  @Public()
  @Get('footer')
  async footer() {
    return this.prisma.footerLink.findMany({
      where: { isActive: true },
      orderBy: [{ columnKey: 'asc' }, { displayOrder: 'asc' }],
    });
  }

  @Public()
  @Get('homepage')
  async homepage() {
    return this.prisma.homepageSection.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: 'asc' },
    });
  }

  // ─── ADMIN : écriture ───
  @Put('settings/:key')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard, TwoFactorGuard)
  @Roles(UserRole.ADMIN)
  async updateSetting(@Param('key') key: string, @Body('value') value: unknown) {
    return this.prisma.siteSetting.update({
      where: { key },
      data: { value: value as never },
    });
  }
}

@Module({ controllers: [CmsController] })
export class CmsModule {}
