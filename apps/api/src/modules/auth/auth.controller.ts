import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { TokensService } from './tokens.service';
import { TwoFactorService } from './two-factor.service';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser, CurrentUserPayload } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import {
  LoginDto,
  RefreshDto,
  RegisterDto,
  TwoFactorEnableDto,
  TwoFactorVerifyDto,
} from './dto/auth.dto';

@ApiTags('auth')
@Controller('auth')
@UseGuards(JwtAuthGuard)
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly tokens: TokensService,
    private readonly tfa: TwoFactorService,
  ) {}

  @Public()
  @Post('register')
  @ApiOperation({ summary: "Inscription d'un client, vendeur ou livreur" })
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  register(@Body() dto: RegisterDto) {
    return this.auth.register(dto);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @ApiOperation({ summary: 'Login (admin : renvoie tempToken pour 2FA)' })
  login(@Body() dto: LoginDto) {
    return this.auth.login(dto);
  }

  @Public()
  @Post('2fa/verify')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  verify2FA(@Body() dto: TwoFactorVerifyDto) {
    return this.auth.verifyTwoFactor(dto.tempToken, dto.code);
  }

  @Post('2fa/enable')
  @ApiBearerAuth()
  enable2FA(@CurrentUser() user: CurrentUserPayload, @Body() dto: TwoFactorEnableDto) {
    return this.tfa.enable(user.sub, dto.code);
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  refresh(@Body() dto: RefreshDto) {
    return this.tokens.rotateRefresh(dto.refreshToken);
  }

  @Post('logout')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  logout(@CurrentUser() user: CurrentUserPayload) {
    return this.auth.logout(user.sub);
  }
}
